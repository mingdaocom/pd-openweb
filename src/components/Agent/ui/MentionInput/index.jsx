import React, { forwardRef, Suspense, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { browserIsMobile } from 'src/utils/common';
import { fetchDefaultApps, readAppCache, searchApps, writeAppCache } from '../../appSource';
import AppMentionPopup from './AppMentionPopup';

const IS_MOBILE = browserIsMobile();

// 富文本输入区，支持 @应用：
//  - 底层是 contenteditable，每个 @应用 渲染成一个 contenteditable="false" 的原子 chip，
//    浏览器天然保证「整体删除 / 光标跳过」，规避裸 contenteditable 的光标地狱。
//  - 对外非受控：内部维护 DOM，通过 onChange 实时上报 { text, mentions }，
//    通过 ref 暴露 focus / clear / setText / getValue / insertAt 等命令式方法。
//  - @ 浮层数据源：走 HomeApp/SearchMyApps（最近访问优先 + 命中优先 + 简拼/拼音）；无关键字的默认列表额外把收藏应用置顶。
//
// 注意：接口返回的应用对象字段未必规整，统一用 normalizeApps 归一化为 { id, name, iconUrl, iconColor }。

const Wrap = styled.div`
  position: relative;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 10px;
  background: var(--color-background-card);
  transition: border-color 0.2s ease;

  &.focused {
    border-color: var(--color-mingo);
  }

  &:not(.focused):hover {
    border-color: var(--color-border-hover);
  }

  .mentionEditor {
    position: relative;
    min-height: 48px;
    max-height: 200px;
    overflow-y: auto;
    padding: 12px;
    font-size: 15px;
    line-height: 24px;
    color: var(--color-text-primary);
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
    cursor: text;

    /* 空内容时显示 placeholder：绝对定位浮层，避免占据行内空间把光标挤到文字后面 */
    &[data-empty='true']::before {
      content: attr(data-placeholder);
      position: absolute;
      left: 12px;
      top: 12px;
      color: var(--color-text-placeholder);
      pointer-events: none;
    }

    /* @应用 chip：紫色加粗文字，无底色（对齐设计稿） */
    .appMention {
      color: var(--color-mingo);
      font-weight: 600;
      white-space: nowrap;
      cursor: default;
      user-select: all;
    }
  }

  &.disabled {
    border-color: var(--color-border-primary);
    background: var(--color-border-secondary);
  }

  &.disabled .mentionEditor {
    cursor: not-allowed;
    color: var(--color-text-tertiary);
  }

  /* 嵌入外壳：去掉自带边框/背景，交给外壳统一处理 */
  &.embedded,
  &.embedded:hover,
  &.embedded.focused {
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  &.embedded.disabled {
    background: transparent;
  }
`;

// 创建一个 @应用 chip 节点
function createMentionNode(app) {
  const span = document.createElement('span');
  span.className = 'appMention';
  span.setAttribute('contenteditable', 'false');
  span.dataset.appId = app.id;
  span.dataset.appName = app.name;
  // @应用名称用应用自身主题色，缺省回退到 CSS 里的 mingo 色
  if (app.iconColor) {
    span.dataset.appColor = app.iconColor;
    span.style.color = app.iconColor;
  }

  span.textContent = '@' + app.name;
  return span;
}

export function applySelectionRange(range) {
  const sel = window.getSelection && window.getSelection();

  if (!sel) return;

  sel.removeAllRanges();
  sel.addRange(range);
}

function MentionInput(
  {
    projectId,
    placeholder = _l('@应用提问或开始搭建一个新应用'),
    disabled = false,
    autoFocus = false,
    enableMention = true,
    // embedded：嵌入 PromptInput 等外壳时去掉自带边框/背景，由外壳负责
    embedded = false,
    // 透传给编辑器 DOM 的 id（附件上传用作拖拽落点 dropElementId）
    inputId,
    onChange,
    onSubmit,
    onFocusChange,
  },
  ref,
) {
  const editorRef = useRef(null);
  const isComposingRef = useRef(false);
  // 失焦延迟关闭浮层的定时器；重新聚焦时需取消，避免点 @ 按钮后浮层被旧定时器关掉
  const blurTimerRef = useRef(null);
  // 最近一次检测到的 @ 上下文：{ node, atIndex, caretOffset }，供插入 chip 时定位
  const mentionCtxRef = useRef(null);

  const [isEmpty, setIsEmpty] = useState(true);
  const [focused, setFocused] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupRect, setPopupRect] = useState(null);
  const [query, setQuery] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // 编辑器里已 @ 的应用 id，浮层需排除（不重复展示已加入的）
  const [mentionedIds, setMentionedIds] = useState([]);

  // 遍历 contenteditable 子节点，序列化成 { text, mentions }
  const serialize = useCallback(() => {
    const root = editorRef.current;
    let text = '';
    const mentions = [];

    const walk = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (node.classList && node.classList.contains('appMention')) {
        const name = node.dataset.appName || '';
        text += '@' + name;
        mentions.push({ type: 'app', id: node.dataset.appId, name });
      } else if (node.tagName === 'BR') {
        text += '\n';
      } else {
        // 回车可能产生 <div> 包裹的行，前面补换行再递归
        if (text && !text.endsWith('\n')) text += '\n';
        node.childNodes.forEach(walk);
      }
    };

    if (root) root.childNodes.forEach(walk);

    // mentions 按 id 去重（同一应用 @ 多次只上报一条）
    return {
      text,
      mentions: _.uniqBy(mentions, 'id'),
    };
  }, []);

  const emitChange = useCallback(() => {
    const value = serialize();
    setIsEmpty(!value.text.trim() && !value.mentions.length);
    setMentionedIds(value.mentions.map(m => m.id));
    onChange && onChange(value);
    return value;
  }, [serialize, onChange]);

  const closePopup = useCallback(() => {
    setPopupOpen(false);
    mentionCtxRef.current = null;
  }, []);

  const openMobilePopup = useCallback(() => {
    const root = editorRef.current;

    if (root) {
      setPopupRect(root.getBoundingClientRect());
      root.blur();
      clearTimeout(blurTimerRef.current);
    }

    setPopupOpen(true);
  }, []);

  // 检测光标前是否处于「@关键字」状态；是则返回上下文，否则 null
  const detectMention = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;

    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;
    if (!editorRef.current || !editorRef.current.contains(node)) return null;

    const before = node.textContent.slice(0, range.startOffset);
    // 匹配光标紧邻的 @关键字（关键字内不含空白与第二个 @）
    const m = /@([^@\s]*)$/.exec(before);
    if (!m) return null;

    return { node, atIndex: m.index, caretOffset: range.startOffset, query: m[1] };
  }, []);

  // 输入 / 光标变化后：上报内容 + 更新 @ 浮层状态
  const syncMentionState = useCallback(() => {
    if (!enableMention) {
      closePopup();
      return;
    }

    if (isComposingRef.current) return;
    const ctx = detectMention();

    if (ctx) {
      mentionCtxRef.current = ctx;
      if (IS_MOBILE) {
        setQuery(ctx.query || '');
        openMobilePopup();
      } else {
        setQuery(ctx.query);
        if (editorRef.current) setPopupRect(editorRef.current.getBoundingClientRect());
        setPopupOpen(true);
      }
    } else {
      closePopup();
    }
  }, [enableMention, detectMention, openMobilePopup, closePopup]);

  const handleInput = useCallback(() => {
    emitChange();
    syncMentionState();
  }, [emitChange, syncMentionState]);

  // 在当前 @ 上下文处，用 chip 替换 @关键字 文本
  const insertApp = useCallback(
    app => {
      const ctx = mentionCtxRef.current;
      const root = editorRef.current;
      if (!root || (!ctx && !IS_MOBILE)) return;

      if (!ctx) {
        const chip = createMentionNode(app);
        const space = document.createTextNode(' ');

        root.append(chip, space);
        closePopup();
        emitChange();
        return;
      }

      const range = document.createRange();
      range.setStart(ctx.node, ctx.atIndex);
      range.setEnd(ctx.node, ctx.caretOffset);
      range.deleteContents();

      const chip = createMentionNode(app);
      range.insertNode(chip);

      // chip 后补一个不间断空格，保证光标能落到 chip 之后并可继续输入
      const space = document.createTextNode(' ');
      chip.after(space);

      const after = document.createRange();
      after.setStart(space, 1);
      after.collapse(true);
      applySelectionRange(after);

      closePopup();
      emitChange();
    },
    [closePopup, emitChange],
  );

  // @ 浮层打开时，按 query 拉取应用列表（防抖 + 缓存）
  useEffect(() => {
    if (!popupOpen) return undefined;
    // projectId 缺省时回退到当前账号第一个组织；仍为空则不请求（接口强校验 ProjectId）
    const pid = projectId || _.get(md, 'global.Account.projects[0].projectId');

    if (!pid) {
      const resetTimer = setTimeout(() => {
        setApps([]);
        setLoading(false);
      }, 0);

      return () => clearTimeout(resetTimer);
    }

    // 命中未过期缓存：直接用，跳过网络与 loading
    const cacheKey = pid + '::' + query;
    const cached = readAppCache(cacheKey);

    if (cached) {
      const cacheTimer = setTimeout(() => {
        setApps(cached);
        setActiveIndex(0);
        setLoading(false);
      }, 0);

      return () => clearTimeout(cacheTimer);
    }

    let cancelled = false;
    // 切换关键字 / 关闭浮层时，既丢弃旧响应（cancelled），也真正 abort 已发出的旧请求，避免弱网下旧请求空占连接
    const abortController = new AbortController();
    // 延迟置 loading：命中快路径时不闪 loading（与 develop 一致），下方 cleanup 会清掉该 timer
    const loadingTimer = setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    const timer = setTimeout(() => {
      // 应用列表共用 appSource：有关键字走 SearchMyApps；无关键字走收藏置顶的默认列表（见 appSource 注释）
      const req = query ? searchApps(pid, query, { abortController }) : fetchDefaultApps(pid, { abortController });

      Promise.resolve(req)
        .then(list => {
          if (cancelled) return;

          writeAppCache(cacheKey, list);
          setApps(list);
          setActiveIndex(0);
          setLoading(false);
        })
        .catch(() => {
          // abort 触发的 reject 与已 cancelled 的旧请求都直接忽略，不动 UI
          if (cancelled) return;
          setApps([]);
          setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
      clearTimeout(timer);
      abortController.abort();
    };
  }, [popupOpen, query, projectId]);

  // 浮层展示与键盘导航统一用过滤后的列表：排除已 @ 进编辑器的应用
  const visibleApps = apps.filter(a => !mentionedIds.includes(a.id));

  const handleKeyDown = useCallback(
    e => {
      // 浮层一旦打开，Esc 始终能关掉（即使列表为空/加载中），避免浮层无法消除
      if (popupOpen && e.key === 'Escape') {
        e.preventDefault();
        closePopup();
        return;
      }

      if (popupOpen && visibleApps.length) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(i => Math.min(i + 1, visibleApps.length - 1));
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(i => Math.max(i - 1, 0));
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (visibleApps[activeIndex]) insertApp(visibleApps[activeIndex]);
          return;
        }
      }

      // 组合输入(拼音)中不响应回车；Shift+Enter 换行；其余 Enter 提交
      if (e.key === 'Enter' && !e.shiftKey) {
        if (isComposingRef.current || e.nativeEvent.isComposing) return;
        e.preventDefault();
        const value = serialize();
        if (!value.text.trim() && !value.mentions.length) return;
        onSubmit && onSubmit(value);
      }
    },
    [popupOpen, visibleApps, activeIndex, insertApp, closePopup, serialize, onSubmit],
  );

  // 命令式 API
  const clear = useCallback(() => {
    if (editorRef.current) editorRef.current.innerHTML = '';
    closePopup();
    emitChange();
  }, [closePopup, emitChange]);

  const focusEnd = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    root.focus();
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    applySelectionRange(range);
  }, []);

  useImperativeHandle(ref, () => ({
    focus: focusEnd,
    blur: () => editorRef.current && editorRef.current.blur(),
    clear,
    getValue: () => serialize(),
    setText: text => {
      if (editorRef.current) editorRef.current.textContent = text || '';
      emitChange();
    },
    // 供底部 @ 按钮调用：插入一个 '@' 并触发浮层
    insertAt: () => {
      if (!enableMention) {
        focusEnd();
        return;
      }

      if (IS_MOBILE) {
        mentionCtxRef.current = null;
        setQuery('');
        openMobilePopup();
        return;
      }

      focusEnd();
      document.execCommand('insertText', false, '@');
      handleInput();
    },
  }));

  useEffect(() => {
    if (autoFocus) focusEnd();
  }, [autoFocus, focusEnd]);

  useEffect(() => () => clearTimeout(blurTimerRef.current), []);

  return (
    <Wrap className={cx('mentionInputWrap', { disabled, focused, embedded })}>
      <div
        ref={editorRef}
        id={inputId}
        className="mentionEditor"
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-empty={isEmpty}
        data-placeholder={placeholder}
        onFocus={() => {
          clearTimeout(blurTimerRef.current);
          setFocused(true);
          onFocusChange && onFocusChange(true);
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={syncMentionState}
        onClick={syncMentionState}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          handleInput();
        }}
        onPaste={e => {
          // 阻止冒泡到全局 paste 监听（如 SheetView「AI 创建记录」、worksheet hooks），
          // 这些监听只豁免 input/textarea，识别不了 contenteditable，会误触发全局弹窗。
          // plupload 的 paste_element 监听在编辑器元素 target 阶段先执行，上传不受影响。
          e.stopPropagation();

          const cd = e.clipboardData || window.clipboardData;
          const hasFile = !!(
            cd &&
            ((cd.files && cd.files.length) || (cd.items && Array.from(cd.items).some(it => it.kind === 'file')))
          );

          // 含图片/文件的粘贴不拦截，交给 plupload 的 paste_element 完成上传；
          // 浏览器若把图片以 base64 <img> 插进编辑器，下一拍清掉，保持纯文本编辑区。
          if (hasFile) {
            setTimeout(() => {
              const root = editorRef.current;

              if (root) root.querySelectorAll('img').forEach(node => node.remove());
              emitChange();
            }, 0);
            return;
          }

          // 纯文本：只保留纯文本，避免粘进带样式的 HTML 破坏编辑器结构
          e.preventDefault();
          document.execCommand('insertText', false, cd ? cd.getData('text/plain') : '');
        }}
        onBlur={() => {
          setFocused(false);
          onFocusChange && onFocusChange(false);
          if (IS_MOBILE && popupOpen) return;
          // 延迟关闭，让浮层的 click 先于 blur 生效；重新聚焦会取消该定时器
          clearTimeout(blurTimerRef.current);
          blurTimerRef.current = setTimeout(closePopup, 150);
        }}
      />
      {popupOpen && (
        <Suspense fallback={null}>
          <AppMentionPopup
            rect={popupRect}
            apps={visibleApps}
            loading={loading}
            activeIndex={activeIndex}
            isMobile={IS_MOBILE}
            onHover={setActiveIndex}
            onSelect={insertApp}
            onClose={closePopup}
            onSearch={setQuery}
          />
        </Suspense>
      )}
    </Wrap>
  );
}

export default forwardRef(MentionInput);
