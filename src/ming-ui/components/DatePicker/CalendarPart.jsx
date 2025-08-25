import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CalendarHeader from './CalendarHeaderOld';
import DateTable from './DateTable';

class CalendarPart extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.any,
    selectedValue: PropTypes.any,
    direction: PropTypes.string,
    locale: PropTypes.any,
    onSelect: PropTypes.func,
    onValueChange: PropTypes.func,
    disabledDate: PropTypes.func,
  };

  render() {
    const props = this.props;
    const { prefixCls, value, disabledDate, selectedValue, direction, locale } = props;
    const rangeClassName = `${prefixCls}-range`;
    const newProps = {
      locale,
      value,
      prefixCls,
      direction,
    };

    return (
      <div className={`${rangeClassName}-part ${rangeClassName}-${direction}`}>
        <div style={{ outline: 'none' }}>
          <CalendarHeader {...newProps} direction={direction} onValueChange={props.onValueChange} />
          <div className={`${prefixCls}-body`}>
            <DateTable
              {...newProps}
              disabledDate={disabledDate}
              selectedValue={selectedValue}
              onSelect={props.onSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CalendarPart;
