import React, { useCallback, useRef } from 'react';

const DOUBLE_CLICK_DELAY = 200; // 双击判定时间阈值（毫秒）

export default function DragCore({ className, style, setRef, children, onDrag, onDBClick, ...props }) {
  const clickTimerRef = useRef(null);
  const lastClickTimeRef = useRef(0);
  const isWaitingForDoubleClickRef = useRef(false);

  const handleMouseDown = useCallback(
    e => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      // 判断是否为双击
      if (timeSinceLastClick < DOUBLE_CLICK_DELAY && isWaitingForDoubleClickRef.current) {
        // 是双击，清除等待定时器
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        isWaitingForDoubleClickRef.current = false;
        lastClickTimeRef.current = 0;

        // 触发双击回调
        if (onDBClick) {
          onDBClick(e);
        }
      } else {
        // 可能是单击，设置等待双击的状态
        lastClickTimeRef.current = now;
        isWaitingForDoubleClickRef.current = true;

        // 设置定时器，超时后触发 onDrag
        clickTimerRef.current = setTimeout(() => {
          if (isWaitingForDoubleClickRef.current) {
            isWaitingForDoubleClickRef.current = false;
            // 触发拖拽回调
            if (onDrag) {
              onDrag(e);
            }
          }
          clickTimerRef.current = null;
        }, DOUBLE_CLICK_DELAY);
      }
    },
    [onDrag, onDBClick],
  );

  return (
    <div
      className={className}
      ref={setRef}
      style={style}
      title={_l('双击到最小宽度')}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </div>
  );
}
