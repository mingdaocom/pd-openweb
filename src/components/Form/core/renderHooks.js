import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { getStableCachedValue } from './renderDataUtils';
import { getCachedWidgetLayoutInfo } from './utils';

/** 为字段渲染过程中频繁重建的浅层 props 提供稳定引用。 */
export function useControlRenderCache(refreshButtonProps = false) {
  const cacheRef = useRef({
    formItemStyles: {},
    items: {},
    refreshButtonProps: {},
    widgetStyles: {},
  });

  return useMemo(() => {
    const caches = cacheRef.current;
    const renderCache = {
      getFormItemStyle(controlId, style) {
        return getStableCachedValue(caches.formItemStyles, controlId, style);
      },
      getItem(controlId, item) {
        return getStableCachedValue(caches.items, controlId, item);
      },
      getWidgetStyle(controlId, style) {
        return getStableCachedValue(caches.widgetStyles, controlId, style);
      },
    };

    if (refreshButtonProps) {
      renderCache.getRefreshButtonProps = (controlId, refreshProps) =>
        getStableCachedValue(caches.refreshButtonProps, controlId, refreshProps);
    }

    return renderCache;
  }, [refreshButtonProps]);
}

/** 创建复用字段布局计算结果的稳定函数。 */
export function useWidgetLayoutCache() {
  const cacheRef = useRef({});

  return useMemo(() => {
    const cache = cacheRef.current;
    return options => getCachedWidgetLayoutInfo(cache, options);
  }, []);
}

/** 返回引用稳定、但始终调用最新 callback 的事件函数。 */
export function useEventCallback(callback) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    if (typeof callbackRef.current === 'function') {
      return callbackRef.current(...args);
    }
  }, []);
}
