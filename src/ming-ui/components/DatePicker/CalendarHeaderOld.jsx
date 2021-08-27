import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'ming-ui/components/Icon';

function formatMonth(month) {
  month = month + 1;
  if (month < 10) {
    return `0${month}`;
  }
  return month;
}

const CalendarHeader = ({ prefixCls, value, onValueChange, locale, direction }) => {
  let beginEnd;
  if (direction === 'left') {
    beginEnd = locale.lang.begin;
  }
  if (direction === 'right') {
    beginEnd = locale.lang.end;
  }
  return (
    <div className={`${prefixCls}-header`}>
      <Icon icon="arrow-left-border" className={`${prefixCls}-prev-month-btn`} onClick={() => onValueChange(value.clone().add(-1, 'months'))} />
      <div className={`${prefixCls}-title`}>
        {beginEnd && <span className={`${prefixCls}-beginEnd`}>{`${beginEnd}: `}</span>}
        <span className={`${prefixCls}-content`}>{`${value.year()}年${formatMonth(value.month())}月`}</span>
      </div>
      <Icon icon="arrow-right-border" className={`${prefixCls}-next-month-btn`} onClick={() => onValueChange(value.clone().add(1, 'months'))} />
    </div>
  );
};

CalendarHeader.propTypes = {
  prefixCls: PropTypes.string,
  value: PropTypes.object,
  locale: PropTypes.object,
  direction: PropTypes.string,
  onValueChange: PropTypes.func,
};

export default CalendarHeader;
