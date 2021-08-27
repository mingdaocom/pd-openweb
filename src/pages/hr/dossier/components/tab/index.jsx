import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class Tab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      // apply props.value update
      this.setState({
        value: nextProps.value,
      });
    }
  }

  // item on click
  itemOnClick = (event, item) => {
    // fire callback
    if (this.props.onChange) {
      this.props.onChange(event, item.value, {
        item,
        prevValue: this.state.item,
      });
    }

    // update state.value
    this.setState({
      value: item.value,
    });
  };

  /**
   * render tabs
   */
  renderTabs = () => {
    let tabs = [];
    if (this.props.data && this.props.data) {
      tabs = this.props.data.map((item, i, list) => {
        const classList = ['mui-tab-item', 'ThemeHoverColor3'];
        // checked
        if (this.props.checkable && item.value === this.state.value) {
          classList.push('mui-tab-item-active');
          classList.push('ThemeColor3');
          classList.push('ThemeBorderColor3');
        }
        const classNames = classList.join(' ');

        return (
          <li
            key={item.value}
            className={classNames}
            onClick={(event) => {
              this.itemOnClick(event, item);
            }}
          >
            {item.label}
          </li>
        );
      });
    }

    return tabs;
  };

  render() {
    let tabs = null;
    if (this.props.data && this.props.data.length) {
      tabs = this.renderTabs();
    }

    const classList = ['mui-tab'];
    // itemAlign
    if (this.props.itemAlign === 'center') {
      classList.push('mui-tab-align-center');
    } else if (this.props.itemAlign === 'right') {
      classList.push('mui-tab-align-right');
    }
    const classNames = classList.join(' ');

    return <ul className={classNames}>{tabs}</ul>;
  }
}

Tab.propTypes = {
  /**
   * 选项列表
   */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /**
       * 选项展示文本
       */
      label: PropTypes.string,
      /**
       * 选项值
       */
      value: PropTypes.any,
    })
  ),
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * 是否支持选中
   */
  checkable: PropTypes.bool,
  /**
   * 选项位置
   */
  itemAlign: PropTypes.oneOf([
    /**
     * 居左
     */
    'left',
    /**
     * 居中
     */
    'center',
    /**
     * 居右
     */
    'right',
  ]),
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.item - 选中的项目
   * data.prevValue - 之前的值
   */
  onChange: PropTypes.func,
};

Tab.defaultProps = {
  data: [],
  value: null,
  checkable: true,
  itemAlign: 'left',
  onChange: (event, value, item) => {
    //
  },
};

export default Tab;
