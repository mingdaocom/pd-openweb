import EventEmitter from 'events';
import { isEmpty } from 'lodash';

export const emitter = new EventEmitter();

window.onresize = () => emitter.emit('WINDOW_RESIZE');

/**
 * 判断键盘事件值是否属于可直接输入的常用字符。
 */
export function isKeyBoardInputChar(value) {
  return (
    `1234567890-=!@#$%^&*()_+[];',./{}|:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.indexOf(value) > -1
  );
}

/**
 * 返回界面布局使用的固定滚动条宽度。
 */
export function getScrollBarWidth() {
  return 10;
}

/**
 * 获取输入控件当前文本光标位置，并兼容旧版 IE API。
 */
export const getCaretPosition = ctrl => {
  let sel, sel2;
  let caretPos = 0;

  if (document.selection) {
    // IE Support
    ctrl.focus();
    sel = document.selection.createRange();
    sel2 = sel.duplicate();
    sel2.moveToElementText(ctrl);
    caretPos = -1;
    while (sel2.inRange(sel)) {
      sel2.moveStart('character');
      caretPos++;
    }
  } else if (ctrl.setSelectionRange) {
    // W3C
    ctrl.focus();
    caretPos = ctrl.selectionStart;
  }

  return caretPos;
};

/**
 * 将输入控件文本光标移动到指定位置，并兼容旧版 IE API。
 */
export const setCaretPosition = (ctrl, caretPos) => {
  if (!ctrl) return;
  if (ctrl.createTextRange) {
    let range = ctrl.createTextRange();
    range.move('character', caretPos);
    range.select();
  } else if (caretPos) {
    ctrl.focus();
    ctrl.setSelectionRange(caretPos, caretPos);
  } else {
    ctrl.focus();
  }
};

/**
 * 通过 DOMParser 提取 HTML 的纯文本内容，解析失败时保留原文。
 */
export function domFilterHtmlScript(html) {
  try {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (err) {
    console.log(err);
    return html;
  }
}

/**
 * 获取当前页面快捷保存容器中最新的创建时间戳。
 */
export const getLatestCreateTimestampOfWithSaveShortcut = () => {
  const timestamps = [...document.querySelectorAll('.withSaveShortcut')].map(el =>
    Number(el.className.match(/createTimestamp-(\d+)/)?.[1] || 0),
  );

  if (isEmpty(timestamps)) {
    return 0;
  }

  return Math.max(...timestamps);
};
