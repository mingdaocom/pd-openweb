import _ from 'lodash';

// 每次滚动的距离
const SCROLL_SPEED = 40;
// 离边缘多近开始触发滚动
const EDGE_THRESHOLD = 40;

export const handleAutoScroll = _.throttle((scrollViewRef, monitor) => {
  if (!scrollViewRef.current || !monitor.getClientOffset) return;

  const scrollEL = scrollViewRef.current;
  const scrollInfo = scrollEL.getScrollInfo?.();
  const clientOffset = monitor.getClientOffset();
  if (!scrollInfo || !clientOffset) return;

  const { scrollLeft, scrollTop, viewport } = scrollInfo;
  const { top, bottom, left, right } = viewport.getBoundingClientRect();
  const { x, y } = clientOffset;

  // 垂直滚动
  if (y < top + EDGE_THRESHOLD && scrollTop > 0) {
    scrollEL.scrollTo({ top: scrollTop - SCROLL_SPEED });
  } else if (y > bottom - EDGE_THRESHOLD) {
    scrollEL.scrollTo({ top: scrollTop + SCROLL_SPEED });
  }

  // 水平滚动
  if (x < left + EDGE_THRESHOLD && scrollLeft > 0) {
    scrollEL.scrollTo({ left: scrollLeft - SCROLL_SPEED });
  } else if (x > right - EDGE_THRESHOLD) {
    scrollEL.scrollTo({ left: scrollLeft + SCROLL_SPEED });
  }
}, 50);
