import React, { Component, cloneElement } from 'react';
import cx from 'classnames';
import PropTypes, { arrayOf, string } from 'prop-types';
import Trigger from 'rc-trigger';
import './less/Tooltip.less';
import _ from 'lodash';

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
    flag: string,
    action: arrayOf(string),
    /**
     * 放置的位置
     */
    popupPlacement: PropTypes.string,
    /**
     * 提示的文字
     */
    text: PropTypes.any,
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
     * 自定义样式
     */
    tooltipStyle: PropTypes.object,
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
    offset: [1, 3],
    overflow: [1, 1],
    disable: false,
    tooltipStyle: {},
  };
  constructor(props) {
    super(props);
    this.contentIsFunction = _.isFunction(props.text);
    this.state = {
      loading: this.contentIsFunction,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (this.contentIsFunction && nextProps.flag !== this.props.flag && !this.state.loading) {
      this.setState({ loading: true });
    }
  }
  renderPopup() {
    const { text, tooltipClass, tooltipStyle } = this.props;
    const { loading, value } = this.state;
    let content = text;
    if (this.contentIsFunction) {
      content = <span>{loading ? _l('加载中...') : value}</span>;
    } else if (typeof text === 'string') {
      content = <span>{text}</span>;
    }
    return (
      <div className={cx('Tooltip-wrapper', tooltipClass)} style={tooltipStyle}>
        <div className="Tooltip-arrow" />
        <div
          className="Tooltip-content"
          onScroll={e => {
            e.stopPropagation();
          }}
        >
          {cloneElement(content)}
        </div>
      </div>
    );
  }
  render() {
    const {
      action,
      children,
      text,
      popupPlacement,
      themeColor,
      offset,
      overflow,
      disable,
      destroyPopupOnHide,
      disableAnimation,
      onToolTipVisibleChange,
    } = this.props;
    const { loading } = this.state;
    const [adjustX, adjustY] = overflow;
    if (!text) {
      return children;
    }
    const props = Object.assign(
      {},
      {
        popupClassName: `ming Tooltip-${themeColor}`,
        prefixCls: 'Tooltip',
        action,
        popup: this.renderPopup(),
        popupTransitionName: disableAnimation ? '' : `Tooltip-move-${popupPlacement}`,
        builtinPlacements,
        destroyPopupOnHide,
        popupAlign: {
          offset,
          overflow: {
            adjustX,
            adjustY,
          },
        },
        onPopupVisibleChange: visible => {
          if (visible && this.contentIsFunction && loading && _.isFunction(text)) {
            const result = text();
            if (typeof result === 'string') {
              this.setState({ loading: false, value: result });
            } else if (_.isFunction(_.get(result, 'then'))) {
              result.then(value => {
                this.setState({ loading: false, value });
              });
            }
          }
          if (_.isFunction(onToolTipVisibleChange)) {
            onToolTipVisibleChange(visible);
          }
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
