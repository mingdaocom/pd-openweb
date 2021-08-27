import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

class Item extends Component {
  render() {
    const classList = ['mui-formview-item'];
    if (this.props.size === 2) {
      classList.push('mui-formview-item-width-2');
    }
    const classNames = classList.join(' ');

    return (
      <li className={classNames}>
        <span className="mui-formview-item-label" title={this.props.label}>
          {_l(this.props.label)}
        </span>
        <span className="mui-formview-item-value">{this.props.value}</span>
      </li>
    );
  }
}

Item.propTypes = {
  /**
   * 字段名称
   */
  label: PropTypes.string,
  /**
   * 字段值
   */
  value: PropTypes.string,
  /**
   * 显示大小
   * 1: 整行
   * 2: 半行
   */
  size: PropTypes.number,
};

Item.defaultProps = {
  label: '',
  value: '',
  size: 1,
};

export default Item;
