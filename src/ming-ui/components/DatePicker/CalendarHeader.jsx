import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from 'ming-ui/components/Icon';

function formatMonth(month) {
  month = month + 1;
  if (month < 10) {
    return `0${month}`;
  }
  return month;
}

class CalendarHeader extends Component {
  /**
   * 后退
   */
  goBack = event => {
    if (this.props.goBack) {
      this.props.goBack(event);
    }
  };

  /**
   * 前进
   */
  goForward = event => {
    if (this.props.goForward) {
      this.props.goForward(event);
    }
  };

  render() {
    let beginEnd;
    if (this.props.direction === 'left') {
      beginEnd = this.props.locale.lang.begin;
    }
    if (this.props.direction === 'right') {
      beginEnd = this.props.locale.lang.end;
    }

    // header-year
    const yearClassList = [`${this.props.prefixCls}-header-year`];
    if (this.props.view === 'year') {
      yearClassList.push('active');
    }
    const year = (
      <span
        className={yearClassList.join(' ')}
        onClick={() => {
          this.props.openView('year');
        }}
      >{`${this.props.value.year()}年`}</span>
    );

    // header-month
    const monthClassList = [`${this.props.prefixCls}-header-month`];
    if (this.props.view === 'month') {
      monthClassList.push('active');
    }
    let month = null;
    if (this.props.mode !== 'year') {
      month = (
        <span
          className={monthClassList.join(' ')}
          onClick={() => {
            this.props.openView('month');
          }}
        >
          {`${formatMonth(this.props.value.month())}月`}
        </span>
      );
    }

    return (
      <div className={`${this.props.prefixCls}-header`}>
        <Icon
          icon="arrow-left-border"
          className={`${this.props.prefixCls}-prev-month-btn`}
          onClick={() => {
            this.goBack();
          }}
        />
        <div className={`${this.props.prefixCls}-title`}>
          {beginEnd && <span className={`${this.props.prefixCls}-beginEnd`}>{`${beginEnd}: `}</span>}
          <span className={`${this.props.prefixCls}-content`}>
            {year}
            {month}
          </span>
        </div>
        <Icon
          icon="arrow-right-border"
          className={`${this.props.prefixCls}-next-month-btn`}
          onClick={() => {
            this.goForward();
          }}
        />
      </div>
    );
  }
}

CalendarHeader.propTypes = {
  prefixCls: PropTypes.string,
  /**
   * 选择模式
   */
  mode: PropTypes.oneOf([
    /**
     * 【默认】日期（等同于 timePicker = false）
     */
    'date',
    /**
     * 日期时间（等同于 timePicker = true）
     */
    'datetime',
    /**
     * 月
     */
    'month',
    /**
     * 年
     */
    'year',
  ]),
  /**
   * 当前视图
   * date - 日
   * month - 月
   * year - 年
   */
  view: PropTypes.oneOf([
    /**
     * 【默认】日期（等同于 timePicker = false）
     */
    'date',
    /**
     * 月
     */
    'month',
    /**
     * 年
     */
    'year',
  ]),
  /**
   * 切换当前视图
   */
  openView: PropTypes.func,
  /**
   * 左箭头
   */
  goBack: PropTypes.func,
  /**
   * 右箭头
   */
  goForward: PropTypes.func,
  value: PropTypes.object,
  locale: PropTypes.object,
  direction: PropTypes.string,
};

export default CalendarHeader;
