import React, { Component } from 'react';
import moment from 'moment';

const DATE_COL_COUNT = 7;

class DateTHead extends Component {
  render() {
    const props = this.props;
    const value = props.value;
    const localeData = value.localeData();
    const prefixCls = props.prefixCls;
    const veryShortWeekdays = [];
    const weekDays = [];
    const firstDayOfWeek = localeData.firstDayOfWeek();
    const now = moment();
    for (let dateColIndex = 0; dateColIndex < DATE_COL_COUNT; dateColIndex++) {
      const index = (firstDayOfWeek + dateColIndex) % DATE_COL_COUNT;
      now.day(index);
      veryShortWeekdays[dateColIndex] = localeData.weekdaysMin(now);
      weekDays[dateColIndex] = localeData.weekdaysShort(now);
    }

    const weekDaysEls = weekDays.map((day, xindex) => (
      <div key={xindex} title={day} className={`${prefixCls}-column-header`}>
        <div className={`${prefixCls}-column-header-inner`}>{veryShortWeekdays[xindex]}</div>
      </div>
    ));
    return (
      <div className={`${prefixCls}-thead`}>
        <div className={`${prefixCls}-thead-column`}>{weekDaysEls}</div>
      </div>
    );
  }
}

export default DateTHead;
