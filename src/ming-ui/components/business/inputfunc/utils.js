export const getCursortPosition = (ctrl) => {
  // 获取光标位置函数
  let pos = 0;
  if (document.selection) {
    ctrl.focus();
    const sel = document.selection.createRange();
    sel.moveStart('character', -ctrl.value.length);
    pos = sel.text.length;
  } else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
    // Firefox support
    pos = ctrl.selectionStart;
  }
  return pos;
};

export const getSelectText = (ctrl) => {
  // 获取选中文本
  let selectText = '';
  if (document.selection) {
    const sel = document.selection.createRange();
    if (sel.text.length > 0) {
      selectText = sel.text;
    }
  } else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
    const startP = ctrl.selectionStart;
    const endP = ctrl.selectionEnd;
    if (startP != endP) {
      selectText = ctrl.value.substring(startP, endP);
    }
  }
  return selectText;
};

// 获取 keyCode
export const KEYCODE = {
  BACKSPACE: 8,
  LEFT: 37,
  RIGHT: 39,
  CTRL: 17,
  V: 86,
};
