/**
 * 统一滚轮控制插件
 * disableParentScroll：滚动到底部或顶部时，是否阻止parent滚动
 * enableWheelDirectionControl：是否允许按住 shift 和 command 修改滚动方向
 */
export default {
  instance: (osInstance, event) => {
    const { customOptions = {} } = osInstance.options();
    const { isMobile, disableParentScroll, enableWheelDirectionControl } = customOptions;

    if (isMobile || (!disableParentScroll && !enableWheelDirectionControl)) return;

    const viewport = osInstance.elements().viewport;
    let lastScrollLeft = viewport.scrollLeft;

    const handleWheel = e => {
      const isMac = window.isMacOs;
      const isHorizontalKey = e.shiftKey || (isMac && e.metaKey);

      // 是否进行横向控制
      if (enableWheelDirectionControl && isHorizontalKey && viewport.scrollWidth > viewport.clientWidth) {
        e.preventDefault();
        e.stopPropagation();
        // 把纵向滚轮距离应用到横向
        lastScrollLeft += e.deltaY;
        // 避免越界
        lastScrollLeft = Math.max(0, Math.min(lastScrollLeft, viewport.scrollWidth - viewport.clientWidth));
        viewport.scrollLeft = lastScrollLeft;
        return;
      }

      // 是否阻止外层滚动
      if (disableParentScroll) {
        e.preventDefault();
        e.stopPropagation();
        viewport.scrollTop += e.deltaY;
        viewport.scrollLeft += e.deltaX;
      }

      // 其他情况
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });

    event('destroyed', () => {
      viewport.removeEventListener('wheel', handleWheel);
    });

    return {};
  },
};
