import React, { useEffect, useRef } from 'react';

const Collapse = ({ open, duration = 300, children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open) {
      // 展开
      const height = el.scrollHeight;
      el.style.height = height + 'px';
    } else {
      // 收起
      el.style.height = el.scrollHeight + 'px';
      requestAnimationFrame(() => {
        el.style.height = '0px';
      });
    }
  }, [open]);

  const handleTransitionEnd = () => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.style.height = 'auto';
    }
  };

  return (
    <div
      ref={ref}
      onTransitionEnd={handleTransitionEnd}
      style={{
        overflow: 'hidden',
        height: open ? 'auto' : 0,
        transition: `height ${duration}ms ease`,
      }}
    >
      {children}
    </div>
  );
};

export default Collapse;
