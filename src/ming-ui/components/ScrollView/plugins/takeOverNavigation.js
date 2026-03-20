import { compatibleMDJS } from 'src/utils/project';

export default {
  name: 'takeOverNavigation',
  instance: (osInstance, event) => {
    const { customOptions = {} } = osInstance.options();
    const { enableSwipeBack, isMobile } = customOptions || {};

    if (!isMobile || enableSwipeBack) return;

    const viewport = osInstance.elements().viewport;

    let startX = 0;
    let startY = 0;
    let isHorizontal = false;

    const sessionId = Date.now().toString();

    const onTouchStart = e => {
      if (!e.touches?.length) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontal = false;
    };

    const onTouchMove = e => {
      if (!e.touches?.length) return;

      const curX = e.touches[0].clientX;
      const curY = e.touches[0].clientY;

      const dx = curX - startX;
      const dy = curY - startY;

      if (!isHorizontal) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
          isHorizontal = true;
        } else {
          return;
        }
      }
      compatibleMDJS('takeOverNavigation', {
        sessionId,
      });
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });

    event('destroyed', () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      compatibleMDJS('handOverNavigation', {
        sessionId,
      });
    });

    return {};
  },
};
