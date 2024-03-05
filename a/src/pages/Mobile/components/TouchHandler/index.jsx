import React, { useEffect } from 'react';

export default function TouchHandler(props) {
  const { touchClassName, onClose } = props;
  let startX = null;
  let startY = null;
  
  useEffect(() => {
    const el = document.querySelector(touchClassName);
    const touchstart = e => {
      startX = e.changedTouches[0].pageX;
      startY = e.changedTouches[0].pageY;
    }
    const touchmove = e => {
      let moveEndX = e.changedTouches[0].pageX;
      let moveEndY = e.changedTouches[0].pageY;
      let X = moveEndX - startX;
      let Y = moveEndY - startY;
      if (Math.abs(X) > Math.abs(Y) && X > 160) {
        onClose();
      }
    }
    if (el) {
      el.addEventListener('touchstart', touchstart, false);
      el.addEventListener('touchmove', touchmove, false);
    }
    return () => {
      if (el) {
        el.removeEventListener('touchstart', touchstart, false);
        el.removeEventListener('touchmove', touchmove, false);
      }
    }
  }, []);
  return props.children;
}
