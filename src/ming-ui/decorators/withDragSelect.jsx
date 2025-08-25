import React from 'react';
import ReactDom from 'react-dom';
import { assign } from 'lodash';
import PropTypes from 'prop-types';

function execFunc(func, ...args) {
  if (typeof func === 'function') {
    return func.call(this, ...args);
  }
}

/**
 * Given offsets, widths, and heights of two objects, determine if they collide (overlap).
 * @param  {int} aTop    The top position of the first object
 * @param  {int} aLeft   The left position of the first object
 * @param  {int} bTop    The top position of the second object
 * @param  {int} bLeft   The left position of the second object
 * @param  {int} aWidth  The width of the first object
 * @param  {int} aHeight The height of the first object
 * @param  {int} bWidth  The width of the second object
 * @param  {int} bHeight The height of the second object
 * @return {bool}
 */
function coordsCollide(aTop, aLeft, bTop, bLeft, aWidth, aHeight, bWidth, bHeight, tolerance) {
  if (typeof tolerance === 'undefined') {
    tolerance = 0;
  }

  return !(
    aTop + aHeight - tolerance < bTop ||
    // 'a' top doesn't touch 'b' bottom
    aTop + tolerance > bTop + bHeight ||
    // 'a' right doesn't touch 'b' left
    aLeft + aWidth - tolerance < bLeft ||
    aLeft + tolerance > bLeft + bWidth
  );
}

/**
 * Given a node, get everything needed to calculate its boundaries
 * @param  {HTMLElement} node
 * @return {Object}
 */
function getBoundsForNode(node) {
  const rect = node.getBoundingClientRect();

  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft,
    offsetWidth: node.offsetWidth,
    offsetHeight: node.offsetHeight,
  };
}

/**
 * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
 * properties, determine if they collide.
 * @param  {Object|HTMLElement} a
 * @param  {Object|HTMLElement} b
 * @return {bool}
 */
function objectsCollide(a, b, tolerance) {
  const aObj = a instanceof HTMLElement ? getBoundsForNode(a) : a;
  const bObj = b instanceof HTMLElement ? getBoundsForNode(b) : b;

  return coordsCollide(
    aObj.top,
    aObj.left,
    bObj.top,
    bObj.left,
    aObj.offsetWidth,
    aObj.offsetHeight,
    bObj.offsetWidth,
    bObj.offsetHeight,
    tolerance,
  );
}

function withDragSelect(Component) {
  class SelectableComponent extends React.Component {
    static propTypes = {
      selectionStyle: PropTypes.object, // 选择框样式
      manuallyStart: PropTypes.bool, // 如果为 true，需要手动调用组件的 startDragSelect 方法开始框选
      onDragSelectStart: PropTypes.func,
      onDragSelect: PropTypes.func,
      onClickOnly: PropTypes.func,
      onDragSelectEnd: PropTypes.func,
      onMouseDown: PropTypes.func,
      clickOnlyDistance: PropTypes.number, // 拖拽距离少于 clickOnlyDistance 时算作点击，不调用 onDragSelect，调用 onClickOnly 方法
      tolerance: PropTypes.number,
      containerSelector: PropTypes.any,
      children: PropTypes.any,
    };
    componentDidMount() {
      const fn = this.handleMouseDown.bind(this);
      const container = this.getContainer();
      container.addEventListener('mousedown', fn);
      this.removeMouseDownHandler = () => container.removeEventListener('mousedown', fn);
    }
    componentWillUnmount() {
      this.removeMouseDownHandler();
    }
    getContainer = () => {
      let container;
      if (this.props.containerSelector) {
        container = $(this.props.containerSelector)[0];
      }
      if (!container) {
        container = ReactDom.findDOMNode(this);
      }
      return container;
    };
    handleMouseMove = evt => {
      if (this.started) {
        const rect = ReactDom.findDOMNode(this).getBoundingClientRect();
        this.endPos = {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
        };
        const clickOnlyDistance = this.props.clickOnlyDistance || 0;
        if (
          !this.dragging &&
          Math.abs(this.startPos.x - this.endPos.x) <= clickOnlyDistance &&
          Math.abs(this.startPos.y - this.endPos.y) <= clickOnlyDistance
        ) {
          this.dragging = false;
        } else {
          this.dragging = true;

          if (!this.selectionEl) {
            this.selectionEl = document.createElement('div');
            ReactDom.findDOMNode(this).appendChild(this.selectionEl);
          }
          const style = assign(
            { display: 'block' },
            this.calcRect(this.startPos, this.endPos),
            this.props.selectionStyle || {
              position: 'absolute',
              zIndex: 4500,
              cursor: 'default',
              boxSizing: 'border-box',
              border: '1px solid #3a96dd',
              backgroundColor: 'rgba(58,150,221,.1)',
            },
          );
          assign(this.selectionEl.style, style);

          const coveredChildren = [];
          React.Children.forEach(this.props.children, (child, i) => {
            if (!React.isValidElement(child)) {
              return;
            }
            const childEl = ReactDom.findDOMNode(this['dragSelectItem$' + i]);
            if (childEl && objectsCollide(childEl, this.selectionEl, this.props.tolerance)) {
              coveredChildren.push(child);
            }
          });
          execFunc(this.props.onDragSelect, coveredChildren, evt);
        }
      }
    };
    clear = () => {
      this.dragging = false;
      this.started = false;
      if (this.selectionEl) {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.finishDragSelect);
        document.removeEventListener('keyup', this.cancelDragSelect);
        $(this.selectionEl).remove();
        this.selectionEl = null;
      }
      execFunc(this.props.onDragSelectEnd);
    };
    cancelDragSelect = evt => {
      if (evt.which !== 27 /* Esc*/) {
        return;
      }
      this.clear();
    };
    finishDragSelect = evt => {
      if (evt.button !== 0) {
        return;
      }
      if (this.started && !this.dragging) {
        React.Children.forEach(this.props.children, (child, i) => {
          if (!React.isValidElement(child)) {
            return;
          }
          const childEl = ReactDom.findDOMNode(this['dragSelectItem$' + i]);
          const rect = childEl.getBoundingClientRect();
          const x = evt.clientX;
          const y = evt.clientY;
          if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
            execFunc(this.props.onClickOnly, child, evt);
          }
        });
      }
      this.clear();
    };
    startDragSelect = evt => {
      this.started = true;
      if (evt.button !== 0) {
        return;
      }
      const rect = ReactDom.findDOMNode(this).getBoundingClientRect();
      const pos = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
      this.startPos = pos;
      this.endPos = pos;

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.finishDragSelect);
      document.addEventListener('keyup', this.cancelDragSelect);

      execFunc(this.props.onDragSelectStart, evt);
    };
    calcRect(startPos, endPos, range) {
      const el = ReactDom.findDOMNode(this);
      let left = startPos.x < endPos.x ? startPos.x : endPos.x;
      let right = el.clientWidth - (startPos.x > endPos.x ? startPos.x : endPos.x);
      let top = startPos.y < endPos.y ? startPos.y : endPos.y;
      let bottom = el.clientHeight - (startPos.y > endPos.y ? startPos.y : endPos.y);

      range = assign(
        {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        range,
      );

      left = left < range.left ? range.left : left + 'px';
      right = right < range.right ? range.right : right + 'px';
      top = top < range.top ? range.top : top + 'px';
      bottom = bottom < range.bottom ? range.bottom : bottom + 'px';

      return { left, right, top, bottom };
    }
    handleMouseDown(...args) {
      execFunc(!this.props.manuallyStart && !this.selectionEl && this.startDragSelect, ...args);
      execFunc(this.props.onMouseDown, ...args);
    }
    render() {
      const { children, ...rest } = this.props;
      return (
        <Component {...rest}>
          {React.Children.map(children, (child, i) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { ref: ref => (this['dragSelectItem$' + i] = ref) })
              : child,
          )}
        </Component>
      );
    }
  }

  return SelectableComponent;
}

export default withDragSelect;
