import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

function getElementSize(el) {
  return el
    ? {
        width: el.clientWidth,
        height: el.clientHeight,
      }
    : {};
}

function shouldUpdateSize(nextSize, prevSize, watchHeight, forceUpdate) {
  if (forceUpdate || !prevSize) {
    return true;
  }

  return (
    Math.abs(nextSize.width - prevSize.width) > 10 || (watchHeight && Math.abs(nextSize.height - prevSize.height) > 10)
  );
}

function canReceiveRef(Comp) {
  return !!(
    Comp &&
    ((Comp.prototype && Comp.prototype.isReactComponent) || Comp.$$typeof === Symbol.for('react.forward_ref'))
  );
}

export default function autoSize(Comp, { onlyWidth } = {}) {
  const AutoSizer = memo(
    forwardRef(function AutoSizer(props, ref) {
      const { height, width, watchHeight, ...rest } = props;
      const controlledSize = width && height ? { width, height } : undefined;
      const [measureRef, rect] = useMeasure();
      const conRef = useRef(null);
      const tableRef = useRef(null);
      const [size, setSize] = useState(controlledSize);
      const supportResizeObserver = typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined';

      const setConRef = useCallback(
        con => {
          conRef.current = con;
          measureRef(con);
        },
        [measureRef],
      );

      const commitSize = useCallback(
        (nextSize, forceUpdate) => {
          setSize(prevSize => (shouldUpdateSize(nextSize, prevSize, watchHeight, forceUpdate) ? nextSize : prevSize));
        },
        [watchHeight],
      );

      const updateSize = useCallback(() => {
        commitSize(getElementSize(conRef.current), true);
      }, [commitSize]);

      const childRefProps = useMemo(() => {
        return canReceiveRef(Comp)
          ? {
              ref: tableRef,
            }
          : {};
      }, []);

      useImperativeHandle(
        ref,
        () => ({
          get con() {
            return conRef.current;
          },
          get table() {
            return tableRef.current;
          },
          updateSize,
        }),
        [updateSize],
      );

      useEffect(() => {
        if (controlledSize) {
          setSize(controlledSize);
        }
      }, [controlledSize && controlledSize.width, controlledSize && controlledSize.height]);

      useEffect(() => {
        if (controlledSize) {
          return undefined;
        }

        const initSize = () => updateSize();

        if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && !window.sheetAutoSized) {
          const timer = setTimeout(initSize, 300);
          window.sheetAutoSized = true;
          return () => clearTimeout(timer);
        }

        initSize();
        return undefined;
      }, [controlledSize, updateSize]);

      useEffect(() => {
        if (controlledSize || !supportResizeObserver) {
          return undefined;
        }

        const elementSize = getElementSize(conRef.current);

        if (!rect.width && !rect.height && (elementSize.width || elementSize.height)) {
          return undefined;
        }

        commitSize(
          {
            width: rect.width,
            height: rect.height,
          },
          false,
        );
      }, [commitSize, controlledSize, rect.height, rect.width, supportResizeObserver]);

      useEffect(() => {
        if (controlledSize || supportResizeObserver) {
          return undefined;
        }

        const watcher = setInterval(() => {
          commitSize(getElementSize(conRef.current), false);
        }, 100);

        return () => clearInterval(watcher);
      }, [commitSize, controlledSize, supportResizeObserver]);

      const currentSize = controlledSize || size;

      return (
        <div className="autosize" ref={setConRef} style={{ width: '100%', height: onlyWidth ? 'auto' : '100%' }}>
          {currentSize && (
            <Comp
              {...rest}
              {...childRefProps}
              updateSize={updateSize}
              watchHeight={watchHeight}
              width={currentSize.width}
              height={height || currentSize.height}
            />
          )}
        </div>
      );
    }),
  );

  AutoSizer.displayName = `autoSize(${Comp.displayName || Comp.name || 'Component'})`;

  return AutoSizer;
}
