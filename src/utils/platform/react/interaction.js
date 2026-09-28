import { useEffect } from 'react';

/** React 子元素与包装层需要共同触发的常用事件名。 */
const COMMON_TRIGGER_EVENT_NAMES = [
  'onBlur',
  'onClick',
  'onContextMenu',
  'onFocus',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseUp',
];

/** 按传入顺序合并两个可选事件处理函数。 */
function mergeEventHandlers(childHandler, parentHandler) {
  return (...args) => {
    if (typeof childHandler === 'function') childHandler(...args);
    if (typeof parentHandler === 'function') parentHandler(...args);
  };
}

/** 合并 React 子元素已有事件与包装层事件，并保留额外 props。 */
export function getMergedTriggerEventHandlers(childProps = {}, eventHandlers = {}, initialProps = {}) {
  return COMMON_TRIGGER_EVENT_NAMES.reduce((result, eventName) => {
    if (typeof eventHandlers[eventName] !== 'function') return result;

    return {
      ...result,
      [eventName]: mergeEventHandlers(childProps[eventName], eventHandlers[eventName]),
    };
  }, initialProps);
}

/** 创建支持外部拦截及受控模式的 open 变更处理函数。 */
export function createControllableOpenHandler({ isControlled, onOpenChange, setOpen }) {
  return nextOpen => {
    if (typeof onOpenChange === 'function' && onOpenChange(nextOpen) === false) return false;
    if (!isControlled && typeof setOpen === 'function') setOpen(nextOpen);
    return true;
  };
}

/** 在元素可用后自动聚焦，短暂等待延迟挂载的输入组件。 */
export function useAutoFocus(ref, active = true) {
  useEffect(() => {
    if (!active) return;

    let frame;
    let count = 0;

    const tryFocus = () => {
      const element = ref?.current;

      if (element) {
        element.focus();
        return;
      }

      if (count < 5) {
        count += 1;
        frame = requestAnimationFrame(tryFocus);
      }
    };

    frame = requestAnimationFrame(tryFocus);

    return () => cancelAnimationFrame(frame);
  }, [active, ref]);
}

/** active 时监听 Escape 键，并在触发后调用 callback。 */
export function useEsc(callback, active = true) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = event => {
      if (event.key === 'Escape') callback?.(event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, callback]);
}
