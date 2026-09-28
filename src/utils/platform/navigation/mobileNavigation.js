import { useEffect, useRef } from 'react';
import { browserIsMobile } from 'src/utils/platform/browser/device';

/**
 * 移动端弹层 history 返回栈管理
 * ---------------------------------
 * 设计目标：
 *   1) 多个嵌套弹层按"栈"顺序响应浏览器返回（栈顶先关）；
 *   2) 调用方只声明 layerId 与 onClose，不需要自己写 popstate / pushState 配对逻辑；
 *   3) 无论开多少层，主动关闭和浏览器返回都只关一层。
 *
 * 实现（基于 history.state 内的 sentinel 序号判定）：
 *   - 每个 push 在 history.state 里写入唯一自增 __layerSeq，并把该序号同步存到栈项；
 *   - popstate 触发时，对比 history.state.__layerSeq 与栈顶的 seq：
 *       · 当前 state 的 seq < 栈顶 seq → 浏览器返回了一帧，调栈顶 onClose；
 *       · 否则（≥ 或不存在）→ 是我们自己 history.go 引起的"消化帧"或非弹层场景，忽略。
 *   - 主动关闭：先把目标层从栈中 splice 掉，然后 history.go(-n) 消化帧；
 *     由于栈已清空到该层之上，监听器不会误关父层。
 *
 * 这样不再依赖事件计数，靠状态做幂等判断，规避并发场景下的计数错位。
 *
 */
const _layerStack = [];
// 标记由弹层历史栈消费的事件，供页面级 popstate 监听区分“关闭弹层”和“页面返回”。
const _historyLayerPopstateEvents = new WeakSet();
let _popstateListenerBound = false;
// 主动关闭会先清理栈再 history.go，使用计数保留该次回退仍属于弹层操作的信息。
let _pendingHistoryLayerPopstates = 0;
let _seqCounter = 0;

const _getUrlWithParams = urlParams => {
  if (!window.isMingDaoApp || !urlParams || !Object.keys(urlParams).length) return '';

  const url = new URL(window.location.href);

  Object.keys(urlParams).forEach(key => {
    const value = urlParams[key];

    if (value === undefined || value === null || value === '') {
      url.searchParams.delete(key);
      return;
    }

    url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}${url.hash}`;
};

const _readStateSeq = () => {
  const v = history.state && history.state.__layerSeq;
  return typeof v === 'number' ? v : 0;
};

const _bindPopstateOnce = () => {
  if (_popstateListenerBound) return;
  _popstateListenerBound = true;
  window.addEventListener(
    'popstate',
    event => {
      if (_pendingHistoryLayerPopstates > 0) {
        _pendingHistoryLayerPopstates -= 1;
        _historyLayerPopstateEvents.add(event);
        return;
      }

      if (!_layerStack.length) return;
      _historyLayerPopstateEvents.add(event);
      const top = _layerStack[_layerStack.length - 1];
      const currentSeq = _readStateSeq();
      // 当前 history.state 的 seq 小于栈顶的 seq → 用户回退一帧，关栈顶弹层
      // 当前 seq ≥ 栈顶 seq → 自家 history.go 引起的消化帧（pop 中已 splice），忽略
      if (currentSeq >= top.seq) return;
      _layerStack.pop();

      try {
        top.onClose && top.onClose();
      } catch (err) {
        console.error('[mobileNavigation] popstate onClose error', err);
      }
    },
    // 页面级监听可能更早注册；捕获阶段先完成事件标记，确保后续监听能够正确识别。
    true,
  );
};

/** 判断本次 popstate 是否由移动端弹层返回栈消费 */
export const isHistoryLayerPopstate = event => Boolean(event && _historyLayerPopstateEvents.has(event));

/**
 * 把弹层入栈，并 push 一帧 history，state 中带唯一 __layerSeq 用于 popstate 判定。
 * 传入 urlParams 时，仅在明道云 App 内同步显示到 URL，关闭时通过 history.go 自动恢复上一帧 URL。
 * @returns {boolean} 是否成功入栈（非移动端 / 重复入栈返回 false）
 */
const pushHistoryLayer = (id, onClose, options = {}) => {
  if (!browserIsMobile() || !id) return false;
  _bindPopstateOnce();
  // 同 id 已在栈顶 → 视为"刷新 onClose 引用"，不重复 push
  if (_layerStack.length && _layerStack[_layerStack.length - 1].id === id) {
    _layerStack[_layerStack.length - 1].onClose = onClose;
    return false;
  }

  const seq = ++_seqCounter;
  _layerStack.push({ id, onClose, seq });
  const state = { ...(history.state || {}), __layerId: id, __layerSeq: seq };
  const url = _getUrlWithParams(options.urlParams);

  if (url) {
    history.pushState(state, '', url);
  } else {
    history.pushState(state, '');
  }

  return true;
};

/**
 * 把弹层出栈（用户主动关闭时调用），自动调用 history.go(-n) 配对消费 history 帧。
 * 由于在 history.go 之前已 splice 掉对应层，随后触发的 popstate 看到当前栈顶 seq
 * ≤ history.state.__layerSeq，会被判定为"消化帧"忽略，不再误关父层。
 */
const popHistoryLayer = id => {
  if (!browserIsMobile() || !id) return false;
  const idx = _layerStack.findIndex(s => s.id === id);
  if (idx === -1) return false;
  const steps = _layerStack.length - idx;
  // 先清栈，让随后 history.go 触发的 popstate 在监听器中被识别为消化帧
  _layerStack.splice(idx, steps);
  if (steps > 0) {
    _pendingHistoryLayerPopstates += 1;
    history.go(-steps);
  }

  return true;
};

/** 获取当前栈深度（外部判定是否处于嵌套弹层场景时使用） */
export const getHistoryLayerDepth = () => _layerStack.length;

/**
 * Hook：在移动端弹层组件中接管浏览器返回 → 关闭弹层。
 *
 * 用法：
 *   useHistoryBackClose({ visible, layerId, onClose });
 *
 * 行为：
 *   - visible 由 false → true：把 (layerId, onClose) 入栈，并 push 一帧 history；
 *   - visible 由 true → false：把该层从栈中弹出，并消费一帧 history（history.go(-1)）；
 *   - 浏览器返回触发 popstate：栈顶弹层的 onClose 被调用，组件自行 setVisible(false)；
 *     此时由于已被栈管理弹出，visible→false 的副作用不会再触发额外的 history.back，避免重复。
 *   - 组件卸载时若仍在栈中：兜底弹出，避免脏栈。
 *
 * 注意：必须传 layerId（同一时刻同 id 不会重复入栈）。
 */
export const useHistoryBackClose = ({ visible, layerId, onClose, urlParams }) => {
  const onCloseRef = useRef(onClose);
  const urlParamsRef = useRef(urlParams);
  const prevVisibleRef = useRef(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    urlParamsRef.current = urlParams;
  }, [urlParams]);

  useEffect(() => {
    if (!browserIsMobile() || !layerId) return undefined;

    if (visible && !prevVisibleRef.current) {
      // open
      pushedRef.current = pushHistoryLayer(
        layerId,
        () => {
          pushedRef.current = false;
          onCloseRef.current && onCloseRef.current();
        },
        { urlParams: urlParamsRef.current },
      );
    } else if (!visible && prevVisibleRef.current && pushedRef.current) {
      // close（主动关闭）
      pushedRef.current = false;
      popHistoryLayer(layerId);
    }

    prevVisibleRef.current = visible;
    return undefined;
  }, [visible, layerId]);

  // 卸载兜底
  useEffect(() => {
    return () => {
      if (pushedRef.current && layerId) {
        pushedRef.current = false;
        popHistoryLayer(layerId);
      }
    };
  }, [layerId]);
};
