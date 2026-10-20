import { isMentionUrl } from 'src/components/comment/utils/markdownMessageSyntax';

/**
 * 让 MentionsInput 能挂到 Vditor 的 contenteditable 上。
 *
 * MentionsInput 原本面向原生 textarea：读写 value、按 selectionStart 取光标、并把 val/store 等方法
 * 注入到该元素上。这里提供一个同形状的适配器对象，把这些访问转发到编辑区元素，
 * 于是「输入 @ 弹出选人浮层」的原有交互在 Markdown 编辑器里同样成立。
 *
 * 插入不走 value 改写（contenteditable 无法按字符偏移改写），由 onMentionSelected 交回调用方处理。
 */

/** 光标在编辑区内的字符偏移，与 textContent 同一坐标系 */
function getEditorCaretOffset(element) {
  const selection = window.getSelection();

  if (!element || !selection || !selection.rangeCount) return 0;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.endContainer)) return 0;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.endContainer, range.endOffset);

  return preRange.toString().length;
}

/** 光标所在行的位置；光标不在编辑区或取不到时返回 null */
function getEditorCaretRect(element) {
  const selection = window.getSelection();

  if (!element || !selection || !selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return null;

  const caret = range.cloneRange();
  caret.collapse(true);

  const rect = caret.getClientRects()[0];

  return rect && rect.height ? rect : null;
}

/**
 * @param {Function} getElement 返回编辑区元素（Vditor IR 的 .vditor-reset）
 * @param {Object} [options]
 * @param {boolean} [options.anchorToCaret] 浮层锚在光标所在行而不是整个编辑区。
 *   MentionsInput 把浮层放在锚点的上方或下方；全屏编辑区撑满整屏，上下都没有空间，浮层会被挤出屏幕
 * @returns {Object} 供 MentionsInput 使用的类 input 对象
 */
export default function createEditorMentionAdapter(getElement, { anchorToCaret = false } = {}) {
  // MentionsInput 的事件处理器读的是 event.target.value，因此转发时要把 target 换成适配器本身。
  // 同一个处理函数会绑到多个事件上（MentionsInput 的 handleValueChange 同时用于 focus 和 keyup），
  // 因此按「事件类型 → 处理函数」两级缓存包装结果，解绑其中一个事件不会连带丢掉另一个的包装，
  // 否则那个事件将永远解绑不掉，浮层关掉后仍在响应输入
  const wrappedHandlers = new Map();
  // 大于 0 时处于代码改动选区 / 焦点的过程中，见 runWithoutFocusDetection
  let silentFocusDepth = 0;

  const wrapHandler = (type, handler) => {
    let handlersOfType = wrappedHandlers.get(type);

    if (!handlersOfType) {
      handlersOfType = new Map();
      wrappedHandlers.set(type, handlersOfType);
    }

    if (handlersOfType.has(handler)) return handlersOfType.get(handler);

    const wrapped = event => {
      // 代码恢复选区、插入后重新聚焦时派发的 focus 不交给 MentionsInput：
      // 此刻光标仍在旧位置（如刚输入的 # 之后）或尚未落定，按它判断会误判出触发符，把刚关掉的浮层再次打开
      if (event.type === 'focus' && silentFocusDepth > 0) return;

      handler({
        target: adapter,
        keyCode: event.keyCode,
        which: event.which,
        ctrlKey: event.ctrlKey,
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation(),
      });
    };

    handlersOfType.set(handler, wrapped);
    return wrapped;
  };

  const adapter = {
    // getCaretPosition 依赖它来走 W3C 分支；插入由调用方接管，这里无需真正设置选区
    setSelectionRange: () => {},
    // getCaretPosition 会先调 focus() 再读偏移；contenteditable 重复 focus 会把光标重置到开头，
    // 因此已聚焦时不再调用，避免算出的偏移恒为 0
    focus: () => {
      const element = getElement();

      if (element && document.activeElement !== element) {
        element.focus();
      }
    },
    addEventListener: (type, handler) => getElement()?.addEventListener(type, wrapHandler(type, handler)),
    removeEventListener: (type, handler) => {
      const handlersOfType = wrappedHandlers.get(type);
      const wrapped = handlersOfType && handlersOfType.get(handler);

      if (wrapped) {
        getElement()?.removeEventListener(type, wrapped);
        handlersOfType.delete(handler);
      }
    },
    getBoundingClientRect: () => {
      const element = getElement();

      if (!element) return new DOMRect();

      return (anchorToCaret && getEditorCaretRect(element)) || element.getBoundingClientRect();
    },
    /**
     * 执行一段由代码改动编辑区选区或焦点的逻辑，期间派发的 focus 不触发 @ / # 检测，返回 fn 的结果。
     * 编辑区未聚焦时，把选区设进编辑区（Chrome 会随之聚焦）或调用 focus() 都会同步派发 focus 事件：
     * 鼠标点选浮层会先让编辑区失焦，键盘选择时焦点始终在编辑区，因此只有鼠标点选会走到这里。可嵌套调用。
     */
    runWithoutFocusDetection: fn => {
      silentFocusDepth += 1;

      try {
        return fn();
      } finally {
        silentFocusDepth -= 1;
      }
    },
  };

  Object.defineProperties(adapter, {
    value: {
      get: () => getElement()?.textContent || '',
      // 插入由 onMentionSelected 接管，这里忽略写入，避免 MentionsInput 直接改写 DOM 文本
      set: () => {},
    },
    selectionStart: {
      get: () => getEditorCaretOffset(getElement()),
    },
    clientWidth: {
      get: () => getElement()?.clientWidth || 0,
    },
    parentNode: {
      get: () => getElement()?.parentNode || null,
    },
  });

  return adapter;
}

/** 去掉 Vditor 用于占位的零宽字符后是否还有内容 */
const hasVisibleText = value => !!String(value || '').replace(/\u200B/g, '');

/**
 * @人 / 话题节点的标记类名。
 *
 * Vditor IR 把所有 [文本](链接) 都渲染成 data-type="a" 的节点，CSS 又选不到节点里的地址文本，
 * 因此在每次渲染后按地址给我们自己的三类链接打上这个类名，样式与删除都只认它，
 * 用户手写的普通 Markdown 链接保持 Vditor 原生行为。
 */
export const MENTION_NODE_CLASS = 'postMentionNode';

/** 给编辑区里的 @人 / 话题节点打标记；Vditor 每次输入都会重建 DOM，需要重复调用 */
export function markMentionNodes(element) {
  if (!element) return;

  element.querySelectorAll('[data-type="a"]').forEach(node => {
    const marker = node.querySelector('.vditor-ir__marker--link');
    const isMention = isMentionUrl(marker && marker.textContent);

    node.classList.toggle(MENTION_NODE_CLASS, isMention);

    // 对光标原子化。Markdown 标记只是被样式压成零尺寸，字符仍在光标的移动路径上，
    // 不置为不可编辑的话方向键要按源码一个字符一个字符地走完 [ ] ( 地址 )，
    // 观感就是「光标移到后面再动就消失了，过一会儿才出现」。
    if (isMention) {
      node.setAttribute('contenteditable', 'false');
    } else if (node.getAttribute('contenteditable') === 'false') {
      node.removeAttribute('contenteditable');
    }
  });
}

const isMentionNode = node =>
  !!node && node.nodeType === Node.ELEMENT_NODE && node.classList.contains(MENTION_NODE_CLASS);

/** 光标所在的 @人 / 话题节点 */
function closestMentionNode(node, element) {
  const start = node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement;
  const found = start && start.closest ? start.closest(`.${MENTION_NODE_CLASS}`) : null;

  return found && element.contains(found) ? found : null;
}

/**
 * 找出应当被整体删除的「原子节点」（@人 / 话题）。
 *
 * 它们在 Vditor IR 里是一个链接节点。光标一旦贴上去，Vditor 就把它展开成 Markdown 源码
 * （[@张三](/user_x)），因此删除必须一次到位，中间不能停在「光标紧贴节点」的状态上，
 * 否则观感就是「删一次变成一长串源码，再删一次才没」。覆盖两种位置：
 *   ① 光标已在节点内部（展开态）—— 整体删除
 *   ② 光标在节点之后，中间只隔着空白 —— 空白连同节点一起删除
 *
 * @returns {{ node: Element, spaces: Array<{ textNode: Text, start: number, end: number }> } | null}
 *          node 为待整体删除的节点，spaces 为需要一并抹掉的空白片段
 */
export function findAtomicNodeBeforeCaret(element) {
  const selection = window.getSelection();

  if (!element || !selection || !selection.rangeCount || !selection.isCollapsed) return null;

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return null;

  const { startContainer, startOffset } = range;

  // ① 展开态：光标落在节点内部。位于节点最前面时不算，交给常规删除处理前一个字符
  const mentionNode = closestMentionNode(startContainer, element);

  if (mentionNode) {
    const preRange = range.cloneRange();
    preRange.selectNodeContents(mentionNode);
    preRange.setEnd(startContainer, startOffset);

    if (hasVisibleText(preRange.toString())) return { node: mentionNode, spaces: [] };
  }

  // ② 收起态：从光标往前跳过空白，看紧邻的是不是原子节点
  const spaces = [];
  let node;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const before = (startContainer.nodeValue || '').slice(0, startOffset).replace(/\u200B/g, '');

    // 光标前还有实际字符时按正常逐字删除
    if (before.trim()) return null;

    if (startOffset > 0) spaces.push({ textNode: startContainer, start: 0, end: startOffset });

    node = startContainer.previousSibling;
  } else {
    node = startContainer.childNodes[startOffset - 1] || null;
  }

  // 纯空白 / 零宽占位文本节点要跟原子节点一起删掉，否则会先删出一个展开态
  while (node && node.nodeType === Node.TEXT_NODE && !(node.nodeValue || '').trim()) {
    if (node.nodeValue) spaces.push({ textNode: node, start: 0, end: node.nodeValue.length });

    node = node.previousSibling;
  }

  // 光标停在块级层（如编辑区直接子节点 <p data-block>）时，往里下钻到真正的末尾节点
  while (node && node.nodeType === Node.ELEMENT_NODE && !isMentionNode(node) && node.lastChild) {
    let child = node.lastChild;

    while (child && child.nodeType === Node.TEXT_NODE && !(child.nodeValue || '').trim()) {
      child = child.previousSibling;
    }

    if (!child) break;

    node = child;
  }

  return isMentionNode(node) ? { node, spaces } : null;
}
