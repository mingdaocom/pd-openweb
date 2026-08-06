import React, { forwardRef, useCallback, useRef } from 'react';
import { useClickAway } from 'react-use';
import { compact, every, flatten, isFunction, map } from 'lodash';
import PropTypes from 'prop-types';

const DEFAULT_EVENTS = ['mousedown'];
const BOUNDARY_STYLE = { display: 'contents' };

function assignRef(ref, value) {
  if (isFunction(ref)) {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getDomNode(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType) {
    return node;
  }

  if (node.current) {
    return getDomNode(node.current);
  }

  return null;
}

function getClickAwayExceptions(onClickAwayExceptions) {
  return compact(
    map(onClickAwayExceptions, item => {
      if (window.jQuery && item instanceof window.jQuery) {
        return map(item, x => x);
      }

      if (typeof item === 'string' && window.jQuery) {
        return map(window.jQuery(item), x => x);
      }

      return getDomNode(item);
    }),
  );
}

function shouldTriggerClickAway({ el, target, exceptions, specialFilter }) {
  if (!target || !el || !window.jQuery) {
    return false;
  }

  return (
    target !== el &&
    !window.jQuery(target).closest(window.jQuery(el)).length &&
    every(flatten(exceptions), item => target !== item && !window.jQuery(target).closest(window.jQuery(item)).length) &&
    document.documentElement.contains(target) &&
    !(specialFilter && specialFilter(target))
  );
}

function useCompatibleClickAway({ ref, onClickAway, onClickAwayExceptions, specialFilter }) {
  useClickAway(
    ref,
    event => {
      if (
        onClickAway &&
        shouldTriggerClickAway({
          el: ref.current,
          target: event.target,
          exceptions: getClickAwayExceptions(onClickAwayExceptions),
          specialFilter,
        })
      ) {
        onClickAway(event.target);
      }
    },
    DEFAULT_EVENTS,
  );
}

function useClickAwayElement(props, ref, shouldForwardClickAwayProps) {
  const { component: Component = 'div', onClickAway, onClickAwayExceptions, specialFilter, ...rest } = props;
  const clickAwayRef = useRef(null);
  const handleRef = useCallback(
    node => {
      clickAwayRef.current = getDomNode(node);
      assignRef(ref, node);
    },
    [ref],
  );

  useCompatibleClickAway({
    ref: clickAwayRef,
    onClickAway,
    onClickAwayExceptions,
    specialFilter,
  });

  const componentProps = shouldForwardClickAwayProps
    ? {
        ...rest,
        onClickAway,
        onClickAwayExceptions,
        specialFilter,
      }
    : rest;

  if (typeof Component === 'string') {
    return <Component {...rest} ref={handleRef} />;
  }

  return <ClickAwayComponentBoundary component={Component} componentProps={componentProps} ref={handleRef} />;
}

const ClickAwayComponentBoundary = forwardRef(function ClickAwayComponentBoundary(props, ref) {
  const { component: Component, componentProps } = props;
  return (
    <span ref={ref} style={BOUNDARY_STYLE}>
      <Component {...componentProps} />
    </span>
  );
});

const ClickAway = forwardRef(function ClickAway(props, ref) {
  return useClickAwayElement(props, ref, false);
});

ClickAway.propTypes = {
  component: PropTypes.any,
  children: PropTypes.node,
  onClickAway: PropTypes.func, // 点击外部区域时触发的方法
  // 外部区域中点击到了不触发 onClickAway 的对象，可以是 jQuery 对象、ReactComponent 或原生 DOM 对象
  onClickAwayExceptions: PropTypes.array,
  // 部分由 jquery plugins 绑定的元素无法直接传入，可额外传自定义判断函数 return bool
  specialFilter: PropTypes.func,
};

ClickAway.wrap = Component => {
  const ClickAwayWrapper = forwardRef((props, ref) =>
    useClickAwayElement({ ...props, component: Component }, ref, true),
  );
  ClickAwayWrapper.displayName = `ClickAway(${Component.displayName || Component.name || 'Component'})`;
  return ClickAwayWrapper;
};

export default ClickAway;
