import React, { Component, cloneElement } from 'react';
import cx from 'classnames';
import PropTypes, { arrayOf, string } from 'prop-types';
import Trigger from 'rc-trigger';
import { render } from 'react-dom';
import './less/Tooltip.less';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
  leftBottom: {
    points: ['br', 'cl'],
  },
  leftTop: {
    points: ['tr', 'cl'],
  },
  rightBottom: {
    points: ['bl', 'cr'],
  },
  rightTop: {
    points: ['tl', 'cr'],
  },
};

class Tooltip extends Component {
  static propTypes = {
    action: arrayOf(string),
    /**
     * 放置的位置
     */
    popupPlacement: PropTypes.string,
    /**
     * 提示的文字
     */
    text: PropTypes.element,
    /**
     * 子节点
     */
    children: PropTypes.element,
    /**
     * 风格，有 “black” & “white” 两种风格
     */
    themeColor: PropTypes.string,
    /**
     * 自定义类名
     */
    tooltipClass: PropTypes.string,
    /**
     * 偏移的值，[x, y]
     */
    offset: PropTypes.array,
    /**
     * 能否可见，[x, y]，如果 x 值为真，节点的 x 坐标始终保持在可见区域，y 同理
     */
    overflow: PropTypes.array,
    /**
     * 是否禁用
     */
    disable: PropTypes.bool,
    /**
     * 是否禁用动画
     */
    disableAnimation: PropTypes.bool,
  };
  static defaultProps = {
    action: ['hover'],
    text: <span />,
    popupPlacement: 'top',
    themeColor: 'black',
    offset: [1, 1],
    overflow: [1, 1],
    disable: false,
  };
  renderPopup() {
    const { text, tooltipClass } = this.props;
    return (
      <div className={cx('Tooltip-wrapper', tooltipClass)}>
        <div className="Tooltip-arrow" />
        <div
          className="Tooltip-content"
          onScroll={e => {
            e.stopPropagation();
          }}
        >
          {cloneElement(text)}
        </div>
      </div>
    );
  }
  render() {
    const { action, children, popupPlacement, themeColor, offset, overflow, popupVisible, disable, disableAnimation } =
      this.props;
    const [adjustX, adjustY] = overflow;

    const props = Object.assign(
      {},
      {
        popupClassName: `ming Tooltip-${themeColor}`,
        prefixCls: 'Tooltip',
        action,
        popup: this.renderPopup(),
        popupTransitionName: disableAnimation ? '' : `Tooltip-move-${popupPlacement}`,
        builtinPlacements,
        popupAlign: {
          offset,
          overflow: {
            adjustX,
            adjustY,
          },
        },
      },
      this.props,
    );
    if (disable) {
      props.popupVisible = false;
    }

    return <Trigger {...props}>{cloneElement(children)}</Trigger>;
  }
}

export default Tooltip;
