import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MonthTable extends Component {
  /**
   * 渲染列表
   */
  renderList = () => {
    const list = [];
    let value = this.props.value;
    if (!this.props.value) {
      value = new Date().getMonth() + 1;
    }

    for (let i = 1; i <= 12; i++) {
      let className = '';
      if (i === value) {
        className = 'active';
      }

      list.push(
        <li
          className={className}
          key={i}
          onClick={event => {
            this.itemOnClick(event, i);
          }}
        >
          {i}
        </li>,
      );
    }

    return list;
  };

  /**
   * 选择月
   */
  itemOnClick = (event, month) => {
    if (month !== this.props.value && this.props.onChange) {
      this.props.onChange(event, month, {
        prevValue: this.props.value,
      });
    }
  };

  render() {
    const list = this.renderList();

    return <ul className="calendar-month-table">{list}</ul>;
  }
}

MonthTable.propTypes = {
  /**
   * 当前月份
   */
  value: PropTypes.number,
  /**
   * 【回调】月份改变
   * @param {Event} event - 点击事件
   * @param {number} value - 选中的月份
   * @param {Object} data - 其他数据
   * data.prevValue {number} - 改变前的月份
   */
  onChange: PropTypes.func,
};

MonthTable.defaultProps = {
  value: null,
  onChange: () => {},
};

export default MonthTable;
