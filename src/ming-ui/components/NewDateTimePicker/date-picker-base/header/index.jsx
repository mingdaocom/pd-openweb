import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Icon from 'ming-ui/components/Icon';

class Header extends Component {
  buttonOnClick = (event, action) => {
    if (this.props.buttonOnClick) {
      this.props.buttonOnClick(event, action);
    }
  };

  render() {
    const time = this.props.time;
    // 年 YYYY
    const thisYear = time.getFullYear();
    const year = thisYear.toString();

    const page = parseInt(thisYear / 10, 10);

    const startYear = (page * 10).toString();
    const endYear = ((page + 1) * 10 - 1).toString();

    const _month = time.getMonth() + 1;
    // 月 MM
    const month = _month.toString();

    const _date = time.getDate();
    // 日 DD
    const date = _date < 10 ? '0' + _date.toString() : _date.toString();

    const timeButtons = [];
    if (this.props.view === 'year') {
      timeButtons.push(
        <span key="year-range" className="year">
          {startYear} ~ {endYear}
        </span>
      );
    }
    if (this.props.view === 'month') {
      timeButtons.push(
        <button
          key="year"
          className="year ThemeHoverColor3"
          onClick={(event) => {
            event.nativeEvent.stopImmediatePropagation();
            this.buttonOnClick(event, 'year');
          }}
        >
          {year}
          {_l('年')}
        </button>
      );
    }
    if (this.props.view === 'date') {
      if (this.props.prefix) {
        timeButtons.push(
          <span key="prefix" className="year">
            {this.props.prefix}
          </span>
        );
      }
      timeButtons.push([
        <button
          key="year"
          className="year ThemeHoverColor3"
          onClick={(event) => {
            event.nativeEvent.stopImmediatePropagation();
            this.buttonOnClick(event, 'year');
          }}
        >
          {year}
          {_l('年')}
        </button>,
        <button
          key="month"
          className="month ThemeHoverColor3"
          onClick={(event) => {
            event.nativeEvent.stopImmediatePropagation();
            this.buttonOnClick(event, 'month');
          }}
        >
          {_l(`${month}月`)}
        </button>,
      ]);
    }

    return (
      <div className="mui-datepicker-header">
        <div className="time">{timeButtons}</div>
        <div className="pager">
          <button
            className="prev ThemeHoverColor3"
            onClick={(event) => {
              event.nativeEvent.stopImmediatePropagation();
              this.buttonOnClick(event, 'prev');
            }}
          >
            <Icon icon="arrow-left-border" />
          </button>
          <button
            className="now ThemeHoverColor3"
            onClick={(event) => {
              event.nativeEvent.stopImmediatePropagation();
              this.buttonOnClick(event, 'now');
            }}
          >
            <Icon icon="circle" />
          </button>
          <button
            className="next ThemeHoverColor3"
            onClick={(event) => {
              event.nativeEvent.stopImmediatePropagation();
              this.buttonOnClick(event, 'next');
            }}
          >
            <Icon icon="arrow-right-border" />
          </button>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  /**
   * 当前界面
   */
  view: PropTypes.oneOf([
    'date', // 日
    'month', // 月
    'year', // 年
  ]),
  /**
   * 显示时间
   */
  time: PropTypes.any,
  /**
   * 标题前缀
   */
  prefix: PropTypes.string,
  /**
   * 按钮点击回调
   * @param {event} event - 点击事件
   * @param {string} action - 点击的按钮
   */
  buttonOnClick: PropTypes.func,
};

export default Header;
