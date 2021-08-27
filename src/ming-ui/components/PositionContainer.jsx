/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
import PropTypes from 'prop-types';

import React, { Component, DOM } from 'react';
import ReactDom from 'react-dom';
import { render } from 'react-dom';
import cx from 'classnames';
import { isDescendant } from 'ming-ui/utils/DomHelpers';
import './less/PositionContainer.less';

class PositionContainer extends Component {
  static propTypes = {
    visible: PropTypes.bool, // 显示隐藏
    bounding: PropTypes.object, // 触发元素的 getBoundingClientRect
    placement: PropTypes.string, // 显示的位置，top，bottom，left，right
    onHide: PropTypes.func, // 设置隐藏的回调函数
    popupParentNode: PropTypes.func, // 创建指定的区域下，默认是body
    offset: PropTypes.object, //额外偏移的坐标
    isInit: PropTypes.bool, //是否在页面加载完初始化
    onClickAwayExceptions: PropTypes.array,
  };
  static defaultProps = {
    visible: false,
    placement: 'top',
    offset: {
      top: 0,
      left: 0,
    },
    isInit: false,
    onClickAwayExceptions: [],
    popupParentNode: () => document.body,
    onHide: () => {},
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.bounding = this.props.bounding;
    if (this.props.isInit) {
      this.create(this.props);
    }
    if (this.props.visible) {
      this.renderLayer(this.props);
    }
  }
  create(props) {
    let { popupParentNode } = props;
    this.popupParentNode = popupParentNode();
    this.hasTop = this.popupParentNode.tagName === 'BODY' ? true : false;
    this.popup = document.createElement('div');
    this.popup.className = 'ming PositionContainer-wrapper';
    this.popupParentNode.appendChild(this.popup);
    this.renderLayer(props);

    this.newDestroy = this.destroy.bind(this);
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.body.addEventListener('click', this.newDestroy, false);
  }
  componentWillUnmount() {
    if (this.popup) {
      this.popupParentNode.removeChild(this.popup);
      window.removeEventListener('resize', this.onWindowResize.bind(this));
      document.body.removeEventListener('click', this.newDestroy);
    }
  }
  componentWillReceiveProps(nextProps) {
    let { visible, bounding } = nextProps;
    this.bounding = bounding;
    if (visible) {
      if (this.popup) {
        this.renderLayer(nextProps);
      } else {
        this.create(nextProps);
        this.show();
      }
    } else {
      if (this.popup) {
        this.hide();
      }
    }
  }
  renderLayer(props) {
    let { children, visible } = props;
    render(children, this.popup, () => {
      visible && this.show();
    });
  }
  getHasParent(el, className) {
    let result = false;
    if (el.classList.contains(className)) {
      return true;
    }
    if (!el || !el.parentNode) {
      return result;
    }
    while ((result = !(el && el.parentNode && el.parentNode.classList.contains(className)))) {
      if (el && el.parentNode === null) {
        result = true;
        break;
      }
      if (el && el.tagName && el.tagName === 'BODY') break;
      el = el && el.parentNode ? el.parentNode : el;
    }
    return result;
  }
  destroy(event) {
    let target = event.target;
    let { props } = this;
    const exceptions = _.compact(
      _.map(this.props.onClickAwayExceptions, item => {
        if (item instanceof window.jQuery) {
          return _.map(item, x => x);
        }
        if (typeof item === 'string' && window.jQuery) {
          return _.map(window.jQuery(item), x => x);
        }
        try {
          return ReactDom.findDOMNode(item);
        } catch (err) {
          return null;
        }
      })
    );

    if (
      props.visible &&
      target &&
      this.getHasParent(target, 'PositionContainer-wrapper') &&
      _.every(_.flatten(exceptions), item => target !== item && !isDescendant(item, target))
    ) {
      props.onHide();
    }
  }
  onWindowResize() {
    let { visible, onHide } = this.props;
    if (visible) {
      onHide();
    }
  }
  getCurrentClientRect() {
    let { popupParentNode, bounding, popup } = this;
    let { placement } = this.props;
    let popupBounding = (this.popupBounding = popup.getBoundingClientRect());
    let result = {};

    let popupParentNodeBounding = popupParentNode.getBoundingClientRect();

    let crrentBounding = {
      top: bounding.top - popupParentNodeBounding.top,
      bottom: bounding.bottom - popupParentNodeBounding.bottom,
      left: bounding.left - popupParentNodeBounding.left,
      right: bounding.right - popupParentNodeBounding.left,
    };

    if (placement === 'top') {
      result = {
        top: crrentBounding.top - popupBounding.height + popupParentNode.scrollTop,
        left: crrentBounding.left,
      };
      if (crrentBounding.top < popupBounding.height) {
        result.top = crrentBounding.bottom + popupParentNodeBounding.height + popupParentNode.scrollTop;
      }
    }
    if (placement === 'bottom') {
      result = {
        top: crrentBounding.bottom + popupParentNodeBounding.height + popupParentNode.scrollTop,
        left: crrentBounding.left,
      };
      if (Math.abs(crrentBounding.bottom) < popupBounding.height && crrentBounding.top > popupBounding.height) {
        result.top = crrentBounding.top - popupBounding.height + popupParentNode.scrollTop;
      }
    }

    if (placement === 'left') {
      result = {
        top: crrentBounding.top + popupParentNode.scrollTop,
        left: crrentBounding.left - popupBounding.width,
      };
    }
    if (placement === 'right') {
      result = {
        top: crrentBounding.top + popupParentNode.scrollTop,
        left: crrentBounding.right,
      };
    }

    return result;
  }
  getVerticalSpace(bounding, popupBounding) {
    let { clientWidth, clientHeight } = document.body;

    let isTop = bounding.top - popupBounding.height >= 0 ? true : false;
    let isBottom = clientHeight - bounding.top - bounding.height - popupBounding.height >= 0 ? true : false;

    let topSpace = {
      top: bounding.top - popupBounding.height,
      left: bounding.left,
    };
    if (isBottom && topSpace.top < 0) {
      topSpace.top = bounding.bottom;
    }

    let bottomSpace = {
      top: bounding.bottom,
      left: bounding.left,
    };
    if (isTop && clientHeight < bottomSpace.top + popupBounding.height) {
      bottomSpace.top = bounding.top - popupBounding.height;
    }

    if (!isTop && !isBottom) {
      let top = popupBounding.height - bounding.top;
      let bottom = popupBounding.height - (clientHeight - bounding.top - bounding.height);
      topSpace.top = topSpace.top + top;
      bottomSpace.top = bottomSpace.top - bottom;
    }

    return {
      topSpace,
      bottomSpace,
    };
  }
  getHorizontalSpace(bounding, popupBounding) {
    let { clientWidth, clientHeight } = document.body;

    let left = bounding.left - popupBounding.width;
    let right = clientWidth - bounding.left - bounding.width - popupBounding.width;
    let isLeft = left >= 0 ? true : false;
    let isRight = right >= 0 ? true : false;

    let leftSpace = {
      top: bounding.top,
      left: bounding.left - popupBounding.width,
    };
    if (isRight && leftSpace.left < 0) {
      leftSpace.left = bounding.right;
    }

    let rightSpace = {
      top: bounding.top,
      left: bounding.right,
    };
    if (isLeft && rightSpace.left + popupBounding.width > clientWidth) {
      rightSpace.left = bounding.left - popupBounding.width;
    }

    if (!isLeft && !isRight) {
      leftSpace.left = leftSpace.left - left;
      rightSpace.left = rightSpace.left + right;
    }

    return {
      leftSpace,
      rightSpace,
    };
  }
  getBoundingClientRect() {
    let { bounding, popup } = this;
    let { placement } = this.props;
    let popupBounding = (this.popupBounding = popup.getBoundingClientRect());
    let { clientWidth, clientHeight } = document.body;
    let result = {};

    let verticalSpace = this.getVerticalSpace(bounding, popupBounding);
    let horizontalSpace = this.getHorizontalSpace(bounding, popupBounding);

    if (placement === 'top') {
      result = verticalSpace.topSpace;
    }
    if (placement === 'bottom') {
      result = verticalSpace.bottomSpace;
    }

    if (placement === 'left') {
      result = horizontalSpace.leftSpace;
    }
    if (placement === 'right') {
      result = horizontalSpace.rightSpace;
    }

    if (placement == 'top' || placement == 'bottom') {
      if (result.left + popupBounding.width > clientWidth) {
        result.left = clientWidth - popupBounding.width;
      }
    }

    if (placement == 'right' || placement == 'left') {
      if (clientHeight < result.top + popupBounding.height) {
        result.top = clientHeight - popupBounding.height;
      }
    }

    return result;
  }
  show() {
    let { offset } = this.props;
    let { popup } = this;
    let bounding = this.hasTop ? this.getBoundingClientRect() : this.getCurrentClientRect();
    popup.style.left = `${bounding.left + offset.left}px`;
    popup.style.top = `${bounding.top + offset.top}px`;
    popup.style.display = 'block';
    popup.classList.add('PositionContainer-active');
  }
  hide() {
    let { popup } = this;
    popup.style.left = '-99999px';
    popup.style.top = '-99999px';
    popup.classList.remove('PositionContainer-active');
  }
  render() {
    return <noscript />;
  }
}

export default PositionContainer;
