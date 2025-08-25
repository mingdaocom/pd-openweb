import React, { Component } from 'react';
import PropTypes from 'prop-types';

class YearTable extends Component {
  /**
   * 渲染列表
   */
  renderList = () => {
    const list = [];
    let value = this.props.value;
    if (value === undefined) {
      value = new Date().getFullYear();
    }

    let page = this.props.page;
    if (page === undefined) {
      page = value % 16 ? 16 * Math.floor(value / 16) + 1 : 16 * (Math.floor(value / 16) - 1) + 1;
    }

    for (let i = 0; i < 16; i++) {
      const item = this.props.page + i;
      let className = '';
      if (this.props.value !== undefined && item === this.props.value) {
        className = 'active';
      }
      list.push(
        <li
          className={className}
          key={item}
          onClick={event => {
            this.itemOnClick(event, item);
          }}
        >
          {item}
        </li>,
      );
    }

    return list;
  };

  /**
   * 选择年
   */
  itemOnClick = (event, year) => {
    if (year !== this.props.value && this.props.onChange) {
      this.props.onChange(event, year, {
        prevValue: this.props.value,
      });
    }
  };

  render() {
    // list items
    const list = this.renderList();

    return <ul className="calendar-year-table">{list}</ul>;
  }
}

YearTable.propTypes = {
  /**
   * 当前年份
   */
  value: PropTypes.number,
  /**
   * 起始年份（每页 16 年）
   */
  page: PropTypes.number,
  /**
   * 【回调】年份改变
   * @param {Event} event - 点击事件
   * @param {number} value - 选中的年份
   * @param {Object} data - 其他数据
   * data.prevValue {number} - 改变前的年份
   */
  onChange: PropTypes.func,
};

YearTable.defaultProps = {
  value: null,
  page: null,
  onChange: () => {},
};

export default YearTable;
