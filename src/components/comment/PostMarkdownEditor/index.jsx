import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, MdMarkdown } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import {
  collapseBlankLines,
  expandBlankLines,
  expandPastedBlankLines,
} from 'src/components/comment/utils/markdownBlankLines';
import {
  buildCategoryMarkdown,
  buildGroupMentionMarkdown,
  buildUserMentionMarkdown,
} from 'src/components/comment/utils/markdownMessageSyntax';
import { useMentionsInput } from 'src/components/MentionsInput';
import createEditorMentionAdapter, {
  findAtomicNodeBeforeCaret,
  markMentionNodes,
  MENTION_NODE_CLASS,
} from './editorMentionAdapter';

/**
 * 动态 / 回复的 Markdown 编辑器。
 *
 * 输入框内即时渲染（Vditor IR 模式），右上角可进入全屏编辑。全屏里渲染的仍是本组件（isFullScreen），
 * 回车、空行、粘贴、@人 / 话题、Cmd + Enter 与输入框内完全一致，不能换成通用的 Markdown 弹窗。
 * @人走按钮 + 选人弹层：Vditor 自带的字符提示要求 @ 前是空格或行首，中文写作里几乎不触发，
 * 且选中后按整行偏移删除触发词，富文本行里会删错内容，因此不使用。
 */

const EditorWrap = styled.div`
  position: relative;

  // 融入原有输入框：去掉描边与灰底，字号由调用方按各自原 textarea 给定
  // （MdMarkdown 自带的灰底与 13px 是工作表表单字段的视觉，动态输入框不适用）
  ${props =>
    props.$isFullScreen
      ? `
    height: 100%;
  `
      : `
    && .vditor {
      border: 0 !important;
      background-color: transparent !important;
    }
  `}

  // vditor 默认给内容区 60px 最小高度，打字机模式还会在编辑区底部追加一段空白，
  // 都会把收起态的发布框撑高；动态输入框按内容自适应，高度统一由编辑区的 minHeight 控制
  && .vditor-content {
    min-height: 0;
  }

  && .vditor-reset::after {
    display: none;
  }

  /* 原 textarea 把占位文字当值存，一聚焦就清空；这里的占位是伪元素，
     默认会一直留到输入第一个字，聚焦即隐藏才与原来的观感一致 */
  && .vditor-reset:focus::before {
    content: '' !important;
  }

  && .vditor-reset {
    /* 展开后首行不该贴着边框：原 textarea 是靠远大于字号的行高留出这段呼吸空间的，
       编辑器的行高要照顾多行间距不能放大，改用上内边距补回来 */
    padding: ${props =>
      props.$isFullScreen ? '10px' : props.$collapsed ? '0' : `${props.$expandedPaddingTop}px 0 0`} !important;
    font-size: ${props => props.$fontSize}px;
    background-color: transparent !important;
    min-height: ${props => props.$currentMinHeight}px !important;
    /* 收起态只有一行，行高撑满整个高度让占位文字垂直居中，与原 textarea 一致；
       展开后恢复默认行高，多行之间才不会被拉开 */
    ${props => (props.$collapsed ? `line-height: ${props.$currentMinHeight}px;` : '')}
  }

  && .vditor-reset[contenteditable='true']:not(:focus) {
    background-color: transparent !important;
  }

  // 段落不额外留下边距，与动态正文的展示保持一致
  && .vditor-reset p {
    margin: 0;
  }

  // 编辑态按原输入框的观感走纯文本：@人（以链接语法承载）不显示成蓝色下划线链接，
  // 发布后的正文仍按 Markdown 渲染成链接
  && .vditor-ir__link {
    color: inherit;
    text-decoration: none;
  }

  /* @人 / 话题是原子内容，任何时候都不该露出 Markdown 源码。
     Vditor IR 只要光标碰到链接节点就加 --expand 把 [文本](链接) 的标记显示出来
     （收起态是 width/height:0，展开态改成 display:inline），这里把展开态的标记压回零尺寸，
     光标进出节点时的盒模型与收起态完全一致，用户始终只看到「@某人」。
     只作用于打了标记的 @人 / 话题；用户手写的普通 Markdown 链接仍按 Vditor 原生方式展开编辑。 */
  && .vditor-ir__node--expand.${MENTION_NODE_CLASS} .vditor-ir__marker {
    display: inline-block;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  // 点击不跳转，光标形态也跟普通文字一致。
  // 带上 .vditor-ir__node 才能盖过 Vditor 的 .vditor-ir__node:not(--expand)[data-type='a']（同特异度靠源序赢）
  && .vditor-ir__node.${MENTION_NODE_CLASS} {
    cursor: default;
  }

  /* 编辑态排版与发布后的正文保持一致，改动需同步 feed 的 postMarkdown.less
     （vditor 默认是 GitHub 风格：标题字号偏大且带下边框） */
  && .vditor-reset {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 14px 0 8px;
      padding: 0;
      border-bottom: 0;
      font-weight: 600;
      line-height: 1.4;
      color: var(--color-text-title);
    }

    h1 {
      font-size: 18px;
    }

    h2 {
      font-size: 16px;
    }

    h3 {
      font-size: 15px;
    }

    h4,
    h5,
    h6 {
      font-size: 14px;
    }

    > :first-child {
      margin-top: 0;
    }

    ul,
    ol {
      margin: 0 0 8px;
      padding-left: 22px;
    }

    blockquote {
      margin: 8px 0;
      padding: 2px 0 2px 12px;
      border-left: 3px solid var(--color-border-primary);
      color: var(--color-text-secondary);
    }

    // vditor 默认用高度 + 背景色画粗分隔线，这里统一成正文的 1px 线
    hr {
      height: 0;
      margin: 12px 0;
      border: 0;
      border-top: 1px solid var(--color-hr);
      background-color: transparent;
    }

    // 全局 prism 主题会给 language-* 代码加黑字和白色文字阴影，暗色主题下文字不可读且有白边
    code[class*='language-'] {
      color: var(--color-text-primary);
      text-shadow: none;
    }

    [data-type='code'] code {
      padding: 1px 4px;
      border-radius: 3px;
      background: var(--color-background-secondary);
      font-family: Menlo, Consolas, monospace;
      font-size: 0.92em;
    }

    table {
      width: fit-content;
      max-width: 100%;
      margin: 8px 0;
    }

    // 正文表格不做斑马纹；需盖过 MdMarkdown 暗色主题里带 !important 的行背景
    tr {
      background-color: transparent !important;
    }

    th,
    td {
      padding: 5px 10px;
      border: 1px solid var(--color-border-primary);
    }

    th {
      background: var(--color-background-secondary);
    }
  }

  && .vditor-ir pre.vditor-reset {
    background-color: transparent !important;
  }

  .postMarkdownFullScreen {
    /* 收起态不占位，聚焦后才出现 */
    display: ${props => (props.$collapsed ? 'none' : 'inline-flex')};
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 20px;
    border: 0;
    padding: 0;
    background: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;

    &:hover {
      color: var(--color-primary);
    }
  }
`;

/** 全屏编辑器的内容在退出时通过 ref 读取，过程中无需向外同步 */
const noop = () => {};

/** 话题的触发符，与 MentionsInput 保持一致 */
const CATEGORY_TRIGGERS = ['#', '＃'];

/** 接管后重新派发的粘贴事件标记，避免被自己再次拦截 */
const REPLAYED_PASTE = '__postMarkdownReplayedPaste';

/** insertValue 内部按 HTML 解析，插入的 Markdown 文本需要先做实体编码 */
const escapeInsertText = text =>
  String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// 渲染函数不能与组件同名：具名函数表达式的名字在函数体内会遮住外层的 PostMarkdownEditor，
// 全屏里递归渲染时拿到的就是裸渲染函数而不是 forwardRef 组件，ref 传不进去
const PostMarkdownEditor = forwardRef(function PostMarkdownEditorRender(props, ref) {
  const {
    value = '',
    placeholder = '',
    minHeight = 24,
    focusedMinHeight,
    // 失焦后仍保持展开：发布框的操作区（附件、投票等）在编辑器下方，失焦即收起会让按钮在点击过程中上移、点不中
    expanded = false,
    maxHeight,
    // 各输入框的原 textarea 字号不同：发布框 14px，回复框继承 12px
    fontSize = 14,
    // 展开后首行与边框的间距，按各输入框原 textarea 的行高留白给定
    expandedPaddingTop = 0,
    disabled = false,
    projectId,
    appId,
    className,
    sourceType,
    showCategory = true,
    isAtAll,
    autoFocus = false,
    // 内部使用：作为全屏编辑器渲染（显示工具栏、撑满弹窗、不再提供全屏入口）
    isFullScreen = false,
    onUploadFiles,
    onChange,
    onFocus,
    onBlur,
    onSubmit,
  } = props;
  const [fullScreenVisible, setFullScreenVisible] = useState(false);
  // 进入全屏时的内容（存储态），全屏编辑器只在挂载时载入一次
  const [fullScreenValue, setFullScreenValue] = useState('');
  const fullScreenEditorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const vditorRef = useRef(null);
  const wrapRef = useRef(null);
  const { open: openMentionsInput, holder: mentionsInputHolder } = useMentionsInput();

  // 用实例拿编辑区：vditor 会同时创建多种模式的容器，DOM 选择器不可靠
  const getEditorElement = useCallback(() => vditorRef.current?.vditor?.ir?.element || null, []);
  const mentionAdapter = useMemo(
    () => createEditorMentionAdapter(getEditorElement, { anchorToCaret: isFullScreen }),
    [getEditorElement, isFullScreen],
  );
  // 与原 textarea 一致：收起时只有一行高，聚焦或有内容时展开
  const currentMinHeight = isFocused || value || expanded ? focusedMinHeight || minHeight : minHeight;
  // 收起态：没聚焦且没内容，此时按原 textarea 的样子只显示一行占位文字。
  // 只有声明了展开高度的输入框才存在收起/展开两态；固定高度的编辑区（发布弹窗、编辑动态）
  // 收起高度本就是多行，撑满行高会把占位文字顶到区域正中
  const collapsed = !!focusedMinHeight && !isFocused && !value && !expanded;
  // Lute 载入内容时会合并连续空行，编辑器内部改用占位段落表示空行（与正文渲染一致）；
  // 对外（value / onChange / getValue 等）始终是存储态，进出编辑器时互转
  const editorValue = useMemo(() => expandBlankLines(value), [value]);
  const handleEditorChange = useCallback(nextValue => onChange(collapseBlankLines(nextValue)), [onChange]);

  const insertText = useCallback(
    text => {
      if (!vditorRef.current || !text) return;

      // 鼠标点选浮层、表情等会让编辑区失焦，插入与重新聚焦期间不应再触发 @ / # 检测
      mentionAdapter.runWithoutFocusDetection(() => {
        vditorRef.current.insertValue(escapeInsertText(text));
        vditorRef.current.focus();
      });
    },
    [mentionAdapter],
  );

  // @人：由调用方在自己的 UI 位置触发，编辑器只负责把选中的人插进正文
  const selectUser = useCallback(() => {
    dialogSelectUser({
      showMoreInvite: false,
      overlayClosable: false,
      SelectUserSettings: {
        projectId: _.find(md.global.Account.projects, { projectId }) ? projectId : undefined,
        selectedAccountIds: [],
        filterAccountIds: [md.global.Account.accountId],
        includeMySelf: false,
        callback: users => {
          insertText(`${users.map(user => buildUserMentionMarkdown(user.fullname, user.accountId)).join(' ')} `);
        },
      },
    });
  }, [projectId, insertText]);

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => (vditorRef.current ? collapseBlankLines(vditorRef.current.getValue()) : ''),
      setValue: nextValue => vditorRef.current && vditorRef.current.setValue(expandBlankLines(nextValue || '')),
      focus: () => vditorRef.current && vditorRef.current.focus(),
      insertText,
      selectUser,
    }),
    [insertText, selectUser],
  );

  // Vditor 是异步创建的，调用方在挂载时拿不到实例，自动聚焦要等就绪
  useEffect(() => {
    if (autoFocus && editorReady) vditorRef.current?.focus();
  }, [autoFocus, editorReady]);

  /**
   * 点浮层 / 选人弹层会让编辑区失焦。Vditor 在失焦时把光标位置存进 ir.range，
   * 这里把它写回文档选区。注意顺序：不能先 focus，focus 会把选区重置到编辑区开头，
   * 之后的删除和插入就全错位了（表现为内容插到 @ 之前、触发符残留）。
   */
  const restoreEditorRange = useCallback(() => {
    const element = getEditorElement();
    const selection = window.getSelection();

    if (!element || !selection) return null;

    // 没失焦就用当前选区
    if (selection.rangeCount && element.contains(selection.getRangeAt(0).startContainer)) {
      return selection.getRangeAt(0);
    }

    const saved = vditorRef.current?.vditor?.ir?.range;

    if (!saved || !element.contains(saved.startContainer)) return null;

    selection.removeAllRanges();
    selection.addRange(saved);

    return selection.getRangeAt(0);
  }, [getEditorElement]);

  /**
   * 选中 @人 / 话题后写回正文。
   *
   * 只改插入点所在的那个块：整篇 getValue → setValue 会走一遍 Markdown 往返，
   * 连续空行等无法在 Markdown 里表达的内容会被规范化掉（表现为「空行全部丢失」）。
   */
  const handleMentionSelected = useCallback(
    (mention, { query, triggerChar } = {}) => {
      const vditor = vditorRef.current;

      if (!vditor) return;

      // 浮层里的「通讯录」入口和 @ 按钮支持多选，回调拿到的是数组
      const mentions = _.isArray(mention) ? mention : [mention];
      const markdown = mentions
        .filter(item => item && item.id)
        .map(item => {
          const name = item.fullname || item.value;

          // 话题由 # 触发，@人与 @群组 由 @ 触发，三者插入的语法各不相同
          if (CATEGORY_TRIGGERS.includes(triggerChar)) return buildCategoryMarkdown(name, item.id);

          return item.type === 'group'
            ? buildGroupMentionMarkdown(name, item.id)
            : buildUserMentionMarkdown(name, item.id);
        })
        .join(' ');

      if (!markdown) return;

      // 恢复选区会让已失焦的编辑区重新聚焦，此时光标还停在触发符之后，不能被当成一次新的 @ / # 输入
      const range = mentionAdapter.runWithoutFocusDetection(restoreEditorRange);
      const trigger = triggerChar || '@';
      const deleteCount = trigger.length + (query || '').length;

      // 抹掉已输入的「触发符 + 搜索词」。取不到完整一段就不删，宁可留下 @ 也不要削掉正文
      if (range && range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset >= deleteCount) {
        range.setStart(range.startContainer, range.startOffset - deleteCount);
        range.deleteContents();
      }

      // insertValue 在光标处插入并只重排当前块，正文其余部分原样保留
      insertText(`${markdown} `);
      handleEditorChange(vditor.getValue());
    },
    [insertText, handleEditorChange, mentionAdapter, restoreEditorRange],
  );

  // Vditor 每次输入都会按 Markdown 重建 DOM，@人 / 话题的标记要跟着重新打
  useEffect(() => {
    if (disabled || !editorReady) return undefined;

    const element = getEditorElement();

    if (!element) return undefined;

    markMentionNodes(element);

    // 只观察结构与文本变化：打标记改的是 class 和 contenteditable，
    // 不观察 attributes 才不会自触发
    const observer = new MutationObserver(() => markMentionNodes(element));

    observer.observe(element, { childList: true, subtree: true, characterData: true });

    // @人 / 话题是原子内容，点它不该有反应；Vditor 默认点链接节点会 window.open 打开地址。
    // 挂在外层容器的捕获阶段，事件下行到编辑区之前就拦掉，普通链接不受影响。
    const container = wrapRef.current;

    const handleClick = event => {
      const from = event.target;
      const node = from && from.closest ? from.closest(`.${MENTION_NODE_CLASS}`) : null;

      // 只挡 Vditor 的跳转，不 preventDefault：浏览器仍按默认行为把光标落到节点旁边
      if (node) event.stopPropagation();
    };

    container?.addEventListener('click', handleClick, true);

    return () => {
      observer.disconnect();
      container?.removeEventListener('click', handleClick, true);
    };
  }, [disabled, editorReady, getEditorElement]);

  /**
   * 提交前把编辑器的实时内容同步给调用方：Vditor 的 input 回调有 800ms 防抖，
   * 刚输入完立即提交时调用方拿到的还是旧内容（表现为最后几个字没发出去）。
   * 调用方会在 onChange 里 setState 或经 effect 记录内容，flushSync 让这些更新在提交前生效。
   */
  const submitLatest = useCallback(() => {
    if (vditorRef.current) {
      const latest = collapseBlankLines(vditorRef.current.getValue());

      flushSync(() => onChange(latest));
    }

    onSubmit();
  }, [onChange, onSubmit]);

  /**
   * Ctrl / Cmd + Enter 提交，与原 textarea 一致（原先由 MentionsInput 按 submitBtn 触发，
   * 输入换成编辑器后那条链路已经断了）。Mac 上按的是 Cmd，metaKey 一并认。
   */
  useEffect(() => {
    if (disabled || !onSubmit) return undefined;

    const container = wrapRef.current;

    if (!container) return undefined;

    const handleSubmitKey = event => {
      if (event.key !== 'Enter' || event.isComposing) return;
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      event.stopPropagation();
      submitLatest();
    };

    // 与下面的 Backspace 同理：挂到外层容器的捕获阶段，抢在 Vditor 自身的 keydown 之前
    container.addEventListener('keydown', handleSubmitKey, true);

    return () => container.removeEventListener('keydown', handleSubmitKey, true);
  }, [disabled, editorReady, onSubmit, submitLatest]);

  /**
   * @人 / 话题以链接语法承载，在 IR 里是一个节点。默认 Backspace 会先把它展开成
   * Markdown 源码再逐字删，这里改为整体删除，与原输入框「一次删掉一个 @人」一致。
   */
  useEffect(() => {
    if (disabled || !editorReady) return undefined;

    const element = getEditorElement();
    const container = wrapRef.current;

    if (!element || !container) return undefined;

    const handleKeyDown = event => {
      if ((event.key !== 'Backspace' && event.keyCode !== 8) || event.isComposing) return;

      const found = findAtomicNodeBeforeCaret(element);
      if (!found) return;

      const { node, spaces } = found;

      event.preventDefault();
      event.stopPropagation();

      // 先抹掉节点与光标之间的空白，再删节点，整个过程不留「光标紧贴节点」的中间态
      spaces.forEach(({ textNode, start, end }) => {
        textNode.nodeValue = textNode.nodeValue.slice(0, start) + textNode.nodeValue.slice(end);

        if (!textNode.nodeValue) textNode.remove();
      });

      // 光标可能就在被删节点内部，先记住它在父节点里的位置，删完把光标放回原处，
      // 否则 Vditor 的 input 处理读不到选区
      const parent = node.parentNode;
      const index = Array.prototype.indexOf.call(parent.childNodes, node);

      node.remove();

      const range = document.createRange();
      range.setStart(parent, Math.min(index, parent.childNodes.length));
      range.collapse(true);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
    };

    // Vditor 把 keydown 绑在编辑区元素自身；同一元素上 capture 不会先于它执行，
    // 因此监听挂到外层容器的捕获阶段，在事件下行到编辑区之前拦截
    container.addEventListener('keydown', handleKeyDown, true);

    return () => container.removeEventListener('keydown', handleKeyDown, true);
  }, [disabled, editorReady, getEditorElement]);

  /**
   * 粘贴同样经过 Lute 转换，纯文本与 HTML 两条分支都会合并连续空行。
   * 剪贴板文本里有空行时接管粘贴：空行展开成占位段落（普通文字之间的每个空行都保留，见 expandPastedBlankLines），
   * 只以纯文本重新派发给 Vditor，
   * 其余情况（无空行、粘贴文件、粘贴进代码）仍走 Vditor 原生处理。
   */
  useEffect(() => {
    if (disabled || !editorReady) return undefined;

    const element = getEditorElement();
    const container = wrapRef.current;

    if (!element || !container) return undefined;

    const handlePaste = event => {
      const data = event.clipboardData;

      if (event[REPLAYED_PASTE] || !data || data.files.length || event.target?.closest?.('code')) return;

      const text = data.getData('text/plain').replace(/\r\n?/g, '\n');
      const expanded = expandPastedBlankLines(text);

      if (!text || expanded === text) return;

      let replay;

      try {
        const transfer = new DataTransfer();

        transfer.setData('text/plain', expanded);
        replay = new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true });
      } catch {
        return;
      }

      // 浏览器不支持构造带剪贴板数据的粘贴事件时，保持原生粘贴
      if (!replay.clipboardData) return;

      event.preventDefault();
      event.stopPropagation();
      replay[REPLAYED_PASTE] = true;
      element.dispatchEvent(replay);
    };

    // 与 keydown 同理，挂在外层容器的捕获阶段，先于 Vditor 绑在编辑区上的 paste 监听
    container.addEventListener('paste', handlePaste, true);

    return () => container.removeEventListener('paste', handlePaste, true);
  }, [disabled, editorReady, getEditorElement]);

  /**
   * 选中回调间接依赖调用方的 onChange，调用方常传内联函数，于是每次输入都会得到一个新的回调。
   * 它若进入下面的挂载依赖，浮层就会被反复重挂；用 ref 取最新实现，挂载时传进去的包装保持稳定。
   */
  const handleMentionSelectedRef = useRef(handleMentionSelected);

  useEffect(() => {
    handleMentionSelectedRef.current = handleMentionSelected;
  }, [handleMentionSelected]);

  // 编辑器就绪后把 @ 浮层挂上去，保留原有的「输入 @ 触发选人」交互
  useEffect(() => {
    if (disabled) return undefined;

    if (!editorReady || !getEditorElement()) return undefined;

    const timer = setTimeout(() => {
      openMentionsInput({
        input: mentionAdapter,
        projectId,
        sourceType,
        showCategory,
        isAtAll,
        getPopupContainer: () => wrapRef.current || document.body,
        onMentionSelected: (...args) => handleMentionSelectedRef.current(...args),
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      // 浮层是挂在 body 上的独立实例，MentionsInput 把销毁入口挂在适配器上。
      // 重挂（如 projectId 变化）和卸载前都要销毁上一个，否则同一个编辑区会累积多个浮层，
      // 每个都在监听输入，一次 @ 会同时弹出好几层
      mentionAdapter.destroy?.();
    };
  }, [
    disabled,
    editorReady,
    getEditorElement,
    mentionAdapter,
    openMentionsInput,
    projectId,
    sourceType,
    showCategory,
    isAtAll,
  ]);

  // 图片不进 Markdown：交回调用方走原有的附件上传
  const handleUpload = useCallback(
    files => {
      onUploadFiles?.(files);
      return null;
    },
    [onUploadFiles],
  );

  /**
   * 进出全屏都以存储态交接，由两边编辑器各自做空行互转。
   * 不能直接交接编辑器源码：编辑态的空行是占位段落，原样交出去会变成看不见的字符行；
   * 取实时内容而不是受控值，因为受控值滞后于正在输入的内容（input 回调有防抖）
   */
  const openFullScreen = () => {
    setFullScreenValue(vditorRef.current ? collapseBlankLines(vditorRef.current.getValue()) : value);
    setFullScreenVisible(true);
  };

  /** 退出全屏：全屏里的内容写回输入框，返回写回后的存储态 */
  const closeFullScreen = () => {
    const nextValue = fullScreenEditorRef.current ? fullScreenEditorRef.current.getValue() : fullScreenValue;

    setFullScreenVisible(false);

    if (nextValue !== fullScreenValue) {
      // MdMarkdown 只在编辑器失焦时用 data 覆盖内容，这里主动写回实例
      vditorRef.current?.setValue(expandBlankLines(nextValue || ''));
      onChange(nextValue);
    }
  };

  /** 全屏里 Cmd + Enter：先退出全屏把内容写回，调用方提交时读到的才是全屏里的内容 */
  const submitFromFullScreen = () => {
    flushSync(closeFullScreen);
    onSubmit();
  };

  const getCommonProps = () => ({
    placeholder,
    data: editorValue,
    disabled,
    projectId,
    appId,
    // 行首缩进不当代码块，与正文渲染一致（见 renderPostMarkdown 的 createLute）
    indentCodeBlock: false,
  });

  return (
    <EditorWrap
      className={className}
      $currentMinHeight={currentMinHeight}
      $fontSize={fontSize}
      $collapsed={collapsed}
      $expandedPaddingTop={expandedPaddingTop}
      $isFullScreen={isFullScreen}
      ref={wrapRef}
    >
      {mentionsInputHolder}
      <MdMarkdown
        {...getCommonProps()}
        mode="ir"
        uploadHandler={onUploadFiles ? handleUpload : undefined}
        minHeight={minHeight}
        maxHeight={maxHeight}
        isFullScreen={isFullScreen}
        hideToolbar={!isFullScreen}
        registerRef={instance => {
          vditorRef.current = instance;
          setEditorReady(true);
        }}
        handleFocus={val => {
          setIsFocused(true);
          onFocus?.(collapseBlankLines(val));
        }}
        handleBlur={val => {
          setIsFocused(false);
          onBlur?.(collapseBlankLines(val));
        }}
        handleChange={handleEditorChange}
      />

      {!disabled && !isFullScreen && (
        <Tooltip title={_l('全屏编辑')}>
          <button
            type="button"
            className="postMarkdownFullScreen"
            aria-label={_l('全屏编辑')}
            // 按钮只在聚焦态出现，按下时若让编辑区失焦，按钮会先消失导致点击落空
            onMouseDown={e => e.preventDefault()}
            onClick={openFullScreen}
          >
            <Icon icon="fullscreen" />
          </button>
        </Tooltip>
      )}

      {fullScreenVisible && (
        <Modal
          open
          type="fixed"
          verticalAlign="bottom"
          className="openMarkdownDialog"
          title={_l('编辑内容')}
          iconButtons={[{ type: 'fullScreen', icon: 'worksheet_narrow', tip: _l('退出'), onClick: closeFullScreen }]}
          closable={false}
          fullScreen
        >
          <PostMarkdownEditor
            ref={fullScreenEditorRef}
            isFullScreen
            autoFocus
            value={fullScreenValue}
            placeholder={placeholder}
            fontSize={fontSize}
            projectId={projectId}
            appId={appId}
            sourceType={sourceType}
            showCategory={showCategory}
            isAtAll={isAtAll}
            onUploadFiles={onUploadFiles}
            onChange={noop}
            onSubmit={onSubmit ? submitFromFullScreen : undefined}
          />
        </Modal>
      )}
    </EditorWrap>
  );
});

PostMarkdownEditor.displayName = 'PostMarkdownEditor';

PostMarkdownEditor.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  minHeight: PropTypes.number,
  focusedMinHeight: PropTypes.number,
  expanded: PropTypes.bool,
  maxHeight: PropTypes.number,
  fontSize: PropTypes.number,
  expandedPaddingTop: PropTypes.number,
  disabled: PropTypes.bool,
  projectId: PropTypes.string,
  appId: PropTypes.string,
  className: PropTypes.string,
  sourceType: PropTypes.number,
  showCategory: PropTypes.bool,
  isAtAll: PropTypes.bool,
  autoFocus: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  onUploadFiles: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  /** Ctrl / Cmd + Enter 触发 */
  onSubmit: PropTypes.func,
};

export default PostMarkdownEditor;
