import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { OverlayScrollbars } from 'overlayscrollbars';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import PropTypes from 'prop-types';
import { browserIsMobile } from 'src/utils/common';
import instancePlugin from './plugins';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import './index.less';

OverlayScrollbars.plugin(instancePlugin);

// 边界触发精度
// 触发频率的滚动最小差值
const threshold = 2;

const defaultOptions = {
  paddingAbsolute: true,
  showNativeOverlaidScrollbars: false,
  update: {
    elementEvents: [
      ['img', 'load'],
      ['*', 'transitionstart transitionend'],
    ],
    debounce: [0, 33],
    attributes: null,
    ignoreMutation: null,
  },
  overflow: {
    x: 'scroll',
    y: 'scroll',
  },
  scrollbars: {
    theme: 'os-theme-common',
    visibility: 'auto',
    autoHide: 'leave',
    autoHideDelay: 800,
    autoHideSuspend: false,
    dragScroll: true,
    clickScroll: 'instant',
    pointers: ['mouse', 'touch', 'pen'],
  },
};

const ScrollView = forwardRef((props, ref) => {
  const {
    children,
    className = '',
    options = {},
    theme = 'os-theme-common',
    disableParentScroll = false,
    enableWheelDirectionControl = true,
    springBackMode = '',
    allowance = 20,
    style = {},
    onScrollEnd,
    onReachVerticalEdge,
    onReachHorizontalEdge,
    onScroll,
    customScroll,
    setViewPortRef,
    ...rest
  } = props;
  const isMobile = browserIsMobile();
  const finalOptions = useMemo(() => {
    return _.merge({}, defaultOptions, options, {
      scrollbars: {
        ...(options.scrollbars || {}),
        theme,
      },
      customOptions: { disableParentScroll, enableWheelDirectionControl, isMobile },
    });
  }, [options, disableParentScroll, enableWheelDirectionControl, theme]);
  const osRef = useRef();
  const lastScroll = useRef({ top: 0, left: 0 });

  // 设置滚动位置
  const scrollTo = (scrollOptions = { top: 0, left: 0 }, behavior = 'auto') => {
    if (!osRef.current) return;
    const osInstance = osRef.current.osInstance();
    if (!osInstance) return;
    const viewport = osInstance?.elements()?.viewport;
    if (viewport) {
      viewport.scrollTo({ ...scrollOptions, behavior });
    }
  };

  // 根据元素设置滚动位置
  const scrollToElement = (element, behavior = 'auto') => {
    if (!osRef.current || !element) return;
    const osInstance = osRef.current.osInstance();
    if (!osInstance) return;
    const viewport = osInstance?.elements()?.viewport;
    if (!viewport) return;
    const viewportRect = viewport.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const offsetTop = elementRect.top - viewportRect.top + viewport.scrollTop;
    viewport.scrollTo({ top: offsetTop, behavior });
  };

  // 获取滚动信息
  const getScrollInfo = () => {
    if (!osRef.current) return {};
    const osInstance = osRef.current.osInstance();
    if (!osInstance) return;
    const viewport = osInstance?.elements()?.viewport;
    if (!viewport) return;
    const scrollHeight = viewport.scrollHeight || 0;
    const clientHeight = viewport.clientHeight || 0;

    return {
      scrollTop: viewport.scrollTop || 0,
      scrollLeft: viewport.scrollLeft || 0,
      scrollHeight,
      clientHeight,
      maxScrollTop: Math.max(0, scrollHeight - clientHeight),
      viewport,
    };
  };

  // 滚动边界检测
  const throttledHandleScroll = _.throttle(instance => {
    const { scrollOffsetElement } = instance.elements();
    const { scrollTop, scrollLeft, scrollWidth, scrollHeight, clientWidth, clientHeight } = scrollOffsetElement;

    const deltaY = Math.abs(scrollTop - lastScroll.current.top);
    const deltaX = Math.abs(scrollLeft - lastScroll.current.left);

    if (deltaY > threshold) {
      const reachedBottom = scrollTop + clientHeight >= scrollHeight - allowance;
      const reachedTop = scrollTop <= allowance;
      // 触发底部边界事件
      if (onScrollEnd && reachedBottom) {
        onScrollEnd({ scrollTop, scrollLeft, clientHeight });
      }
      // 触发顶部 或 底部
      if (onReachVerticalEdge) {
        if (reachedBottom) {
          onReachVerticalEdge({ direction: 'down' });
        } else if (reachedTop) {
          onReachVerticalEdge({ direction: 'up' });
        }
      }
    }

    // 横向滚动触发
    if (deltaX > threshold) {
      const reachedRight = scrollLeft + clientWidth >= scrollWidth - allowance;
      const reachedLeft = scrollLeft <= allowance;
      if (onReachHorizontalEdge) {
        if (reachedRight) {
          onReachHorizontalEdge({ direction: 'right' });
        } else if (reachedLeft) {
          onReachHorizontalEdge({ direction: 'left' });
        }
      }
    }

    lastScroll.current = { top: scrollTop, left: scrollLeft };
    onScroll && onScroll({ scrollTop, scrollLeft });
  }, 300);

  useEffect(() => {
    if (osRef.current && setViewPortRef) {
      const osInstance = osRef.current.osInstance();
      if (!osInstance) return;
      const viewport = osInstance?.elements()?.viewport;
      if (viewport) {
        setViewPortRef(viewport);
      }
    }
  }, [osRef.current]);

  useEffect(() => {
    return () => {
      osRef.current && osRef.current.osInstance().destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    scrollTo,
    scrollToElement,
    getScrollInfo,
  }));

  return (
    <OverlayScrollbarsComponent
      ref={osRef}
      className={cx(
        'scrollViewContainer',
        {
          'os-scroll-lock': disableParentScroll,
          'os-scrollbar-scale': !isMobile,
        },
        theme,
        className,
      )}
      style={style}
      options={finalOptions}
      events={{
        initialized: instance => {
          const viewport = instance.elements().viewport;
          viewport.classList.add('scroll-viewport');
          if (isMobile && springBackMode) {
            viewport.classList.add(springBackMode);
          }
        },
        // destroyed: () => console.log('destroyed'),
        // updated: () => console.log('updated'),
        scroll: instance => {
          if (customScroll) {
            customScroll(instance);
            return;
          }

          throttledHandleScroll(instance);
        },
      }}
      {...rest}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
});

ScrollView.propTypes = {
  /** React 子元素 */
  children: PropTypes.node,
  /** 额外的 className */
  className: PropTypes.string,
  /** 主题 */
  theme: PropTypes.string,
  /** 当 disableParentScroll 为 true 时，阻止外层滚动 */
  disableParentScroll: PropTypes.bool,
  /** 是否允许按住 shift 和 command 修改滚动方向 */
  enableWheelDirectionControl: PropTypes.bool,
  /** 是否禁用回弹效果 */
  springBackMode: PropTypes.oneOf(['disableSpringBack', 'disableSpringBackX', 'disableSpringBackY']),
  /** 边界触发精度 */
  allowance: PropTypes.number,
  /** 内联样式 */
  style: PropTypes.object,
  /** 滚动到达下边界时触发 */
  onScrollEnd: PropTypes.func,
  /** 纵向滚动，到达 上或下 边界时触发 */
  onReachVerticalEdge: PropTypes.func,
  /** 横向滚动，到达 上或下 边界时触发 */
  onReachHorizontalEdge: PropTypes.func,
  /** 滚动时触发 */
  onScroll: PropTypes.func,
  /** 自定义滚动，无节流 */
  customScroll: PropTypes.func,
  /** OverlayScrollbars 配置项 */
  options: PropTypes.shape({
    paddingAbsolute: PropTypes.bool,
    showNativeOverlaidScrollbars: PropTypes.bool,
    update: PropTypes.shape({
      elementEvents: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
      debounce: PropTypes.arrayOf(PropTypes.number),
      attributes: PropTypes.bool,
      ignoreMutation: PropTypes.bool,
    }),
    overflow: PropTypes.shape({
      x: PropTypes.oneOf(['visible', 'hidden', 'scroll', 'auto']),
      y: PropTypes.oneOf(['visible', 'hidden', 'scroll', 'auto']),
    }),
    scrollbars: PropTypes.shape({
      theme: PropTypes.string,
      visibility: PropTypes.oneOf(['visible', 'hidden', 'auto']),
      autoHide: PropTypes.oneOf(['never', 'scroll', 'leave', 'move']),
      autoHideDelay: PropTypes.number,
      autoHideSuspend: PropTypes.bool,
      dragScroll: PropTypes.bool,
      clickScroll: PropTypes.bool,
      pointers: PropTypes.arrayOf(PropTypes.oneOf(['mouse', 'touch', 'pen'])),
    }),
  }),
};

export default ScrollView;
