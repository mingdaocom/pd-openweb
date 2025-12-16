import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';

const DATE_ROW_COUNT = 6;
const DATE_COL_COUNT = 7;

function getTitleString(value) {
  return value.date();
}

function getTodayTime() {
  return moment();
}

function isSameDay(one, two) {
  return one && two && one.isSame(two, 'day');
}

function beforeCurrentMonthYear(current, today) {
  if (current.year() < today.year()) {
    return 1;
  }
  return current.year() === today.year() && current.month() < today.month();
}

function afterCurrentMonthYear(current, today) {
  if (current.year() > today.year()) {
    return 1;
  }
  return current.year() === today.year() && current.month() > today.month();
}

function getIdFromDate(date) {
  return `Calendar-${date.year()}-${date.month()}-${date.date()}`;
}

function isStartOfMonth(current) {
  return isSameDay(current, current.clone().startOf('month'));
}

function isEndOfMonth(current) {
  return isSameDay(current, current.clone().endOf('month'));
}

class DateTBody extends Component {
  static propTypes = {
    disabledDate: PropTypes.func,
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    direction: PropTypes.string,
    selectedValue: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
  };

  render() {
    const props = this.props;
    const { prefixCls, selectedValue, value, disabledDate, direction } = props;
    let iIndex;
    let jIndex;
    let current;
    const dateTable = [];
    const today = getTodayTime();
    const cellClass = `${prefixCls}-cell`;
    const dateClass = `${prefixCls}-date`;
    const todayClass = `${prefixCls}-today`;
    const selectedClass = `${prefixCls}-selected-day`;
    const startOfMonthClass = `${prefixCls}-start-of-month`;
    const endOfMonthClass = `${prefixCls}-end-of-month`;
    const selectedStartClass = `${prefixCls}-selected-start-day`;
    const selectedEndClass = `${prefixCls}-selected-end-day`;
    const selectedDateClass = `${prefixCls}-selected-date`;
    const inRangeClass = `${prefixCls}-in-range-cell`;
    const errorEndDay = `${prefixCls}-error-end-day`;
    const lastMonthDayClass = `${prefixCls}-last-month-cell`;
    const nextMonthDayClass = `${prefixCls}-next-month-btn-day`;
    const disabledClass = `${prefixCls}-disabled-cell`;
    const firstDisableClass = `${prefixCls}-disabled-cell-first-of-row`;
    const lastDisableClass = `${prefixCls}-disabled-cell-last-of-row`;
    const month1 = value.clone();
    month1.date(1);
    const day = month1.day();
    const lastMonthDiffDay = (day + 7 - value.localeData().firstDayOfWeek()) % 7;
    const lastMonth1 = month1.clone();
    lastMonth1.add(0 - lastMonthDiffDay, 'days');
    let passed = 0;
    for (iIndex = 0; iIndex < DATE_ROW_COUNT; iIndex++) {
      for (jIndex = 0; jIndex < DATE_COL_COUNT; jIndex++) {
        current = lastMonth1;
        if (passed) {
          current = current.clone();
          current.add(passed, 'days');
        }
        dateTable.push(current);
        passed = passed + 1;
      }
    }
    const tableHtml = [];
    passed = 0;

    for (iIndex = 0; iIndex < DATE_ROW_COUNT; iIndex++) {
      let isCurrentWeek;
      const dateCells = [];

      for (jIndex = 0; jIndex < DATE_COL_COUNT; jIndex++) {
        let next = null;
        let last = null;
        current = dateTable[passed];
        if (jIndex < DATE_COL_COUNT - 1) {
          next = dateTable[passed + 1];
        }
        if (jIndex > 0) {
          last = dateTable[passed - 1];
        }
        let cls = cellClass;
        let disabled = false;
        let selected = false;
        let isInRangeClass = false;

        if (isSameDay(current, today)) {
          cls += ` ${todayClass}`;
          isCurrentWeek = true;
        }

        if (isStartOfMonth(current)) {
          cls += ` ${startOfMonthClass}`;
        }

        if (isEndOfMonth(current)) {
          cls += ` ${endOfMonthClass}`;
        }

        const isBeforeCurrentMonthYear = beforeCurrentMonthYear(current, value);
        const isAfterCurrentMonthYear = afterCurrentMonthYear(current, value);

        if (selectedValue && Array.isArray(selectedValue)) {
          if (!isBeforeCurrentMonthYear && !isAfterCurrentMonthYear) {
            const startValue = selectedValue[0];
            const endValue = selectedValue[1];
            if (isSameDay(current, startValue)) {
              isInRangeClass = true;
              cls += ` ${selectedStartClass} ${inRangeClass}`;
            }
            if (isSameDay(current, endValue)) {
              isInRangeClass = true;
              cls += ` ${selectedEndClass} ${inRangeClass}`;
            }
            if (direction === 'left' && isSameDay(current, startValue)) {
              selected = true;
            }
            if (direction === 'right' && isSameDay(current, endValue)) {
              selected = true;
            }
            if (startValue && endValue) {
              if (current.isAfter(startValue, 'day') && current.isBefore(endValue, 'day')) {
                isInRangeClass = true;
                cls += ` ${inRangeClass}`;
              }
              if (
                startValue.isAfter(endValue, 'day') &&
                (isSameDay(current, endValue) || isSameDay(current, startValue))
              ) {
                isInRangeClass = false;
              }
              if (startValue.isAfter(endValue, 'day') && isSameDay(current, endValue)) {
                cls += ` ${errorEndDay}`;
              }
            } else {
              isInRangeClass = false;
            }
          }
        } else if (isSameDay(current, value)) {
          selected = true;
        }
        if (selectedValue && !Array.isArray(selectedValue) && isSameDay(current, selectedValue)) {
          cls += ` ${selectedDateClass}`;
        }
        if (isBeforeCurrentMonthYear) {
          disabled = true;
          cls += ` ${lastMonthDayClass}`;
        }
        if (isAfterCurrentMonthYear) {
          disabled = true;
          cls += ` ${nextMonthDayClass}`;
        }
        if (disabledDate) {
          if (disabledDate(current, value)) {
            disabled = true;
            if (!last || !disabledDate(last, value)) {
              cls += ` ${firstDisableClass}`;
            }
            if (!next || !disabledDate(next, value)) {
              cls += ` ${lastDisableClass}`;
            }
          }
        }
        if (selected) {
          cls += ` ${selectedClass}`;
        }
        if (disabled) {
          cls += ` ${disabledClass}`;
        }
        const dateHtml = (
          <div key={getIdFromDate(current)} className={dateClass} aria-selected={selected} aria-disabled={disabled}>
            {current.date()}
          </div>
        );

        dateCells.push(
          <div
            key={passed}
            onClick={disabled ? undefined : props.onSelect.bind(null, current)}
            title={getTitleString(current)}
            className={cls}
          >
            {dateHtml}
            {isInRangeClass ? <span className={`${prefixCls}-cell-bg ThemeBGColor6`} /> : null}
          </div>,
        );

        passed = passed + 1;
      }

      tableHtml.push(
        <div
          key={iIndex}
          className={cx({
            [`${prefixCls}-every-week`]: 1,
            [`${prefixCls}-current-week`]: isCurrentWeek,
          })}
        >
          {dateCells}
        </div>,
      );
    }
    return <div className={`${prefixCls}-tbody`}>{tableHtml}</div>;
  }
}

export default DateTBody;
