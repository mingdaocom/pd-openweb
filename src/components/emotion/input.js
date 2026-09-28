const resolveElement = value => {
  const resolvedValue = typeof value === 'function' ? value() : value;

  if (resolvedValue?.current) return resolvedValue.current;
  if (resolvedValue?.jquery) return resolvedValue[0];
  if (typeof resolvedValue === 'string') return document.querySelector(resolvedValue);
  return resolvedValue;
};

export function insertEmotionAtCaret(input, text) {
  const target = resolveElement(input);

  if (!target || !text) return;

  const start = typeof target.selectionStart === 'number' ? target.selectionStart : target.value.length;
  const end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;

  if (typeof target.setRangeText === 'function') {
    target.setRangeText(text, start, end, 'end');
  } else {
    target.value = `${target.value.slice(0, start)}${text}${target.value.slice(end)}`;
    target.setSelectionRange?.(start + text.length, start + text.length);
  }

  target.focus();
  if (typeof target.updateValue === 'function') {
    target.updateValue();
  } else {
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function resolvePopupContainer(popupContainer) {
  return resolveElement(popupContainer) || document.body;
}
