import { useEffect, useRef } from 'react';
import { browserIsMobile } from 'src/utils/common';

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
 * 兼容：handlePushState / handleReplaceState 旧 API 保留，内部转发到新栈实现。
 */
const _layerStack = [];
let _popstateListenerBound = false;
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
  window.addEventListener('popstate', () => {
    if (!_layerStack.length) return;
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
  });
};

/**
 * 把弹层入栈，并 push 一帧 history，state 中带唯一 __layerSeq 用于 popstate 判定。
 * 传入 urlParams 时，仅在明道云 App 内同步显示到 URL，关闭时通过 history.go 自动恢复上一帧 URL。
 * @returns {boolean} 是否成功入栈（非移动端 / 重复入栈返回 false）
 */
export const pushHistoryLayer = (id, onClose, options = {}) => {
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
export const popHistoryLayer = id => {
  if (!browserIsMobile() || !id) return false;
  const idx = _layerStack.findIndex(s => s.id === id);
  if (idx === -1) return false;
  const steps = _layerStack.length - idx;
  // 先清栈，让随后 history.go 触发的 popstate 在监听器中被识别为消化帧
  _layerStack.splice(idx, steps);
  if (steps > 0) history.go(-steps);
  return true;
};

/** 获取当前栈深度（外部判定是否处于嵌套弹层场景时使用） */
export const getHistoryLayerDepth = () => _layerStack.length;

/**
 * 返回栈中是否包含某个 layerId
 * 在 onClose 里需要知道"自己是否还在栈中"时使用
 */
export const hasHistoryLayer = id => _layerStack.some(s => s.id === id);

/**
 * @deprecated 旧 API，保留向后兼容；内部转发到 pushHistoryLayer
 * 由于旧版没有 onClose 参数，popstate 触发时仅做出栈，不回调业务 onClose。
 * 业务侧请改用 useHistoryBackClose / pushHistoryLayer + popHistoryLayer。
 */
export const handlePushState = (queryKey = '', queryValue = '') => {
  if (!browserIsMobile()) return;
  pushHistoryLayer(`${queryKey}=${queryValue}`, null, {
    urlParams: queryKey ? { [queryKey]: queryValue } : undefined,
  });
};

/**
 * @deprecated 旧 API，保留向后兼容
 * 旧语义：当 history.state.popupKey 命中时执行 callback，并 replaceState 清掉标记。
 * 新语义：把对应 layer 从栈中弹出（同时消费 history 帧），并触发 callback。
 */
export const handleReplaceState = (queryKey, queryValue, callback = () => {}) => {
  const id = `${queryKey}=${queryValue}`;
  if (!hasHistoryLayer(id)) return;
  callback();
  popHistoryLayer(id);
};

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

export default useHistoryBackClose;
