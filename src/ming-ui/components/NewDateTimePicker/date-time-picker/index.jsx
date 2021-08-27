import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import './style.less';

import DatePickerBase from 'ming-ui/components/NewDateTimePicker/date-picker-base';
import Time from 'ming-ui/components/NewTimePicker';
import LibCalender from 'ming-ui/components/lib/calender';
import Button from 'ming-ui/components/Button';

class DateTimePicker extends Component {
  constructor(props) {
    super(props);

    const value = props.value || new Date();
    this.state = {
      /**
       * 当前选中的值
       */
      value,
      /**
       * 当前时间
       */
      time: this.getTimeData(
        {
          hour: value.getHours(),
          minute: value.getMinutes(),
          second: value.getSeconds(),
        },
        props,
        value
      ),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      const value = nextProps.value || new Date();
      this.setState({
        value,
        time: this.getTimeData(
          {
            hour: value.getHours(),
            minute: value.getMinutes(),
            second: value.getSeconds(),
          },
          nextProps,
          value
        ),
      });
    }
  }

  getTimeData = (value, props, time) => {
    return {
      min:
        props.min && LibCalender.isSameDate(time, props.min)
          ? {
              hour: props.min.getHours(),
              minute: props.min.getMinutes(),
              second: props.min.getSeconds(),
            }
          : null,
      max:
        props.max && LibCalender.isSameDate(time, props.max)
          ? {
              hour: props.max.getHours(),
              minute: props.max.getMinutes(),
              second: props.max.getSeconds(),
            }
          : null,
      value: {
        hour: value.hour,
        minute: value.minute,
        second: value.second,
      },
    };
  };

  dateOnChange = (event, value) => {
    const newValue = new Date(this.state.value);

    newValue.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());

    const time = {
      hour: newValue.getHours(),
      minute: newValue.getMinutes(),
      second: newValue.getSeconds(),
    };

    const timeData = this.getTimeData(time, this.props, newValue);

    // check is time in range
    if (this.props.type === 'datetime') {
      // check min
      if (timeData.min && LibCalender.isSameDate(newValue, this.props.min) && LibCalender.isTimeEarly(time, timeData.min)) {
        newValue.setHours(timeData.min.hour);
        newValue.setMinutes(timeData.min.minute);
        newValue.setSeconds(timeData.min.second);

        timeData.value = timeData.min;
      }
      // check max
      if (timeData.max && LibCalender.isSameDate(newValue, this.props.max) && LibCalender.isTimeLater(time, timeData.max)) {
        newValue.setHours(timeData.max.hour);
        newValue.setMinutes(timeData.max.minute);
        newValue.setSeconds(timeData.max.second);

        timeData.value = timeData.max;
      }
    }

    this.setState(
      {
        value: newValue,
        time: timeData,
      },
      () => {
        if (this.props.onSelect) {
          this.props.onSelect(moment(newValue));
        }
      }
    );
  };

  timeOnChange = (event, value) => {
    const newValue = new Date(this.state.value);

    newValue.setHours(value.hour);
    newValue.setMinutes(value.minute);
    newValue.setSeconds(value.second);

    this.setState(
      {
        value: newValue,
        time: this.getTimeData(value, this.props, newValue),
      },
      () => {
        if (this.props.onSelect) {
          this.props.onSelect(moment(newValue));
        }
      }
    );
  };

  buttonOnClick = (event, action) => {
    if (this.props.onChange) {
      const value = action === 'ok' ? this.state.value : null;
      if (value) {
        value.setMilliseconds(0);
        if (this.props.timeType === 'minute') {
          value.setSeconds(0);

          if (this.props.timeType === 'hour') {
            value.setMinutes(0);
          }
        }
      }
      this.props.onChange(event, value);

      if (action === 'ok' && this.props.onOk) {
        this.props.onOk(moment(value));
      }
      if (action === 'clear' && this.props.onClear) {
        this.props.onClear();
      }
    }
  };

  render() {
    const dateType = this.props.type === 'datetime' ? 'date' : this.props.type;

    let timePicker = null;
    if (this.props.type === 'datetime') {
      timePicker = (
        <Time
          type={this.props.timeType}
          min={this.state.time.min}
          max={this.state.time.max}
          value={this.state.time.value}
          onChange={(event, value) => {
            this.timeOnChange(event, value);
          }}
        />
      );
    }

    let clearBtn = null;
    if (this.props.allowClear) {
      clearBtn = (
        <Button
          type="link"
          size="small"
          onClick={(event) => {
            this.buttonOnClick(event, 'clear');
          }}
        >
          清空
        </Button>
      );
    }

    return (
      <div className="mui-datetimepicker">
        <div>
          <DatePickerBase
            type={dateType}
            firstDayOfWeek={this.props.firstDayOfWeek}
            min={this.props.min}
            max={this.props.max}
            value={this.state.value}
            onChange={(event, value) => {
              this.dateOnChange(event, value);
            }}
          />
        </div>
        <div className="mui-datetime-toolbar">
          {timePicker}
          {clearBtn}
          <Button
            type="primary"
            size="small"
            onClick={(event) => {
              this.buttonOnClick(event, 'ok');
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  }
}

DateTimePicker.propTypes = {
  /**
   * 选择类型
   */
  type: PropTypes.oneOf([
    'year', // 年
    'month', // 月
    'date', // 日
    'datetime', // YYYY-MM-DD HH:mm:ss
  ]),
  /**
   * 时间类型
   */
  timeType: PropTypes.oneOf([
    'hour', // HH
    'minute', // HH:mm
    'second', // HH:mm:ss
  ]),
  /**
   * 是否允许清除
   */
  allowClear: PropTypes.bool,
  /**
   * 每周的第一天
   */
  firstDayOfWeek: PropTypes.oneOf([
    0, // 周日
    1, // 周一
    2,
    3,
    4,
    5,
    6, // 周六
  ]),
  /**
   * 当前值
   */
  value: PropTypes.any,
  /**
   * 最小值
   */
  min: PropTypes.any,
  /**
   * 最大值
   */
  max: PropTypes.any,
  /**
   * 值发生改变
   * @param {event} event - 触发事件
   * @param {object} time - 选中的时间
   */
  onChange: PropTypes.func,
  /**
   * 确定选择
   * @param {object} time - 选中的时间
   */
  onOk: PropTypes.func,
  /**
   * 清除选择
   */
  onClear: PropTypes.func,
  /**
   * 值发生改变
   * @param {object} time - 选中的时间
   */
  onSelect: PropTypes.func,
};

DateTimePicker.defaultProps = {
  show: false,
  type: 'date',
  timeType: 'minute',
  allowClear: true,
  firstDayOfWeek: 1,
  value: new Date(),
  min: null,
  max: null,
  onChange: (event, time) => {
    //
  },
  onOk: (time) => {
    //
  },
  onClear: () => {
    //
  },
  onSelect: (time) => {
    //
  },
};

export default DateTimePicker;
