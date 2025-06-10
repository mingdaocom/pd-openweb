import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';

import './style.less';

import DatePickerBase from '../date-picker-base/index';
import Time from '../../NewTimePicker/index';
import LibCalender from '../lib/calender';
import Checkbox from '../../Checkbox';
import Button from '../../Button';
import Dropdown from '../../Dropdown';
import _ from 'lodash';

class DateTimeRangeDoublePicker extends Component {
  constructor(props) {
    super(props);

    this.state = this.generateState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.generateState(nextProps));
  }

  generateState = props => {
    const today = new Date();
    const defaultStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9);
    const defaultEndTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18);

    const value = [
      this.state && this.state.value ? this.state.value[0] : defaultStartTime,
      this.state && this.state.value ? this.state.value[1] : defaultEndTime,
    ];

    if (props.value[0]) {
      value[0] = props.value[0];
    }

    if (props.value[1]) {
      value[1] = props.value[1];
    }

    let halfData = ['AM', 'PM'];
    if (props.type === 'half') {
      halfData = [props.halfStart, props.halfEnd];
    }

    const state = {
      /**
       * 当前选中的值
       */
      value,
      /**
       * 当前时间
       */
      startTime: this.getTimeData(
        {
          hour: value[0].getHours(),
          minute: value[0].getMinutes(),
          second: value[0].getSeconds(),
        },
        props,
        value[0],
      ),
      endTime: this.getTimeData(
        {
          hour: value[1].getHours(),
          minute: value[1].getMinutes(),
          second: value[1].getSeconds(),
        },
        props,
        value[1],
      ),
      /**
       * 是否选中开始时间
       */
      partialStart: props.config.start || false,
      /**
       * 是否选中结束时间
       */
      partialEnd: props.config.end || false,
      halfData,
    };

    return state;
  };

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

  onPick = (event, value, i) => {
    const range = [this.state.value[0], this.state.value[1]];
    range[i] = value;

    this.dateOnChange(event, range, i);
  };

  dateOnChange = (event, value, i) => {
    const start = new Date(this.state.value[0]);

    start.setFullYear(value[0].getFullYear(), value[0].getMonth(), value[0].getDate());

    const startTime = {
      hour: start.getHours(),
      minute: start.getMinutes(),
      second: start.getSeconds(),
    };

    const end = new Date(this.state.value[1]);

    end.setFullYear(value[1].getFullYear(), value[1].getMonth(), value[1].getDate());

    const endTime = {
      hour: end.getHours(),
      minute: end.getMinutes(),
      second: end.getSeconds(),
    };

    const startTimeData = this.getTimeData(startTime, this.props, start);
    const endTimeData = this.getTimeData(endTime, this.props, end);

    // check is time in range
    if (this.props.type === 'datetime') {
      // check start.min
      if (
        startTimeData.min &&
        LibCalender.isSameDate(start, this.props.min) &&
        LibCalender.isTimeEarly(startTime, startTimeData.min)
      ) {
        start.setHours(startTimeData.min.hour);
        start.setMinutes(startTimeData.min.minute);
        start.setSeconds(startTimeData.min.second);

        startTimeData.value = startTimeData.min;
      }
      // check start.max
      if (
        startTimeData.max &&
        LibCalender.isSameDate(start, this.props.max) &&
        LibCalender.isTimeLater(startTime, startTimeData.max)
      ) {
        start.setHours(startTimeData.max.hour);
        start.setMinutes(startTimeData.max.minute);
        start.setSeconds(startTimeData.max.second);

        startTimeData.value = startTimeData.max;
      }

      // check end.min
      if (
        endTimeData.min &&
        LibCalender.isSameDate(end, this.props.min) &&
        LibCalender.isTimeEarly(endTime, endTimeData.min)
      ) {
        end.setHours(endTimeData.min.hour);
        end.setMinutes(endTimeData.min.minute);
        end.setSeconds(endTimeData.min.second);

        endTimeData.value = endTimeData.min;
      }
      // check end.max
      if (
        endTimeData.max &&
        LibCalender.isSameDate(end, this.props.max) &&
        LibCalender.isTimeLater(endTime, endTimeData.max)
      ) {
        end.setHours(endTimeData.max.hour);
        end.setMinutes(endTimeData.max.minute);
        end.setSeconds(endTimeData.max.second);

        endTimeData.value = endTimeData.max;
      }
    }

    this.setState(
      {
        value: [start, end],
        startTime: startTimeData,
        endTime: endTimeData,
        partialStart: !this.state.partialStart && i === 0 ? true : this.state.partialStart,
        partialEnd: !this.state.partialEnd && i === 1 ? true : this.state.partialEnd,
      },
      () => {
        if (this.props.onSelect) {
          this.props.onSelect([this.state.partialStart ? moment(start) : '', this.state.partialEnd ? moment(end) : '']);
        }
      },
    );
  };

  timeOnChange = (event, value, index, halfData) => {
    const newValue = new Date(this.state.value[index]);

    newValue.setHours(value.hour);
    newValue.setMinutes(value.minute);
    newValue.setSeconds(value.second);

    const list = this.state.value;
    list[index] = newValue;

    let startTime = this.state.startTime;
    let endTime = this.state.endTime;
    if (index === 1) {
      endTime = this.getTimeData(value, this.props, this.state.value[1]);
    } else {
      startTime = this.getTimeData(value, this.props, this.state.value[0]);
    }

    if (
      this.props.autoFillEndTime &&
      index === 0 &&
      moment(list[0]).format('YYYY-MM-DD') === moment(list[1]).format('YYYY-MM-DD')
    ) {
      list[1] = moment(list[0]).add(this.props.autoFillEndTime, 'h').toDate();
      endTime = _.cloneDeep(startTime);
      const newHour = endTime.value.hour + this.props.autoFillEndTime;
      endTime.value.hour = newHour > 23 ? newHour - 23 : newHour;
    }

    this.setState(
      {
        value: list,
        startTime,
        endTime,
        partialStart: !this.state.partialStart && index === 0 ? true : this.state.partialStart,
        partialEnd: !this.state.partialEnd && index === 1 ? true : this.state.partialEnd,
        halfData: halfData || this.state.halfData,
      },
      () => {
        if (this.props.onSelect) {
          this.props.onSelect([
            this.state.partialStart ? moment(list[0]) : '',
            this.state.partialEnd ? moment(list[1]) : '',
          ]);
        }
      },
    );
  };

  buttonOnClick = (event, action) => {
    if (this.props.onChange) {
      const value = this.state.value || null;

      if (action === 'ok' && value) {
        if (value[0] && value[0].getTime && value[1] && value[1].getTime) {
          if (this.props.type === 'half') {
            if (
              LibCalender.isSameDate(value[0], value[1]) &&
              this.state.halfData[0] === 'PM' &&
              this.state.halfData[1] === 'AM'
            ) {
              alert(_l('结束时间不能早于开始时间'), 3);

              return;
            }
          }
          if (
            value[0].getTime() > value[1].getTime() &&
            ((this.props.partial && this.state.partialStart && this.state.partialEnd) || !this.props.partial)
          ) {
            alert(_l('结束时间不能早于开始时间'), 3);

            return;
          }
        }
      }

      if (value) {
        value[0].setMilliseconds(0);
        value[1].setMilliseconds(0);
        if (this.props.timeType === 'minute') {
          value[0].setSeconds(0);
          value[1].setSeconds(0);

          if (this.props.timeType === 'hour') {
            value[0].setMinutes(0);
            value[1].setMinutes(0);
          }
        }
      }

      let config = {
        start: true,
        end: true,
      };
      let returnValue = null;
      if (value && value.length === 2) {
        returnValue = [moment(value[0]), moment(value[1])];
      }
      if (this.props.partial) {
        config = {
          start: this.state.partialStart,
          end: this.state.partialEnd,
        };
        returnValue = [
          this.state.partialStart ? value && value[0] && moment(value[0]) : null,
          this.state.partialEnd ? value && value[1] && moment(value[1]) : null,
        ];
      }

      this.props.onChange(event, value, config);

      let halfData = null;
      if (this.props.type === 'half') {
        halfData = this.state.halfData;
      }

      if (action === 'ok' && this.props.onOk) {
        this.props.onOk(returnValue, halfData);
      }
      if (action === 'clear' && this.props.onClear) {
        this.props.onClear();
      }
    }
  };

  checkboxOnChange = target => {
    const data = {};
    data[target] = !this.state[target];

    this.setState(data);
  };

  // 半天选择
  halfOnChange = (value, target) => {
    const halfData = this.state.halfData;
    let time = {
      hour: 0,
      minute: 0,
      second: 0,
    };
    let index = 0;

    if (target === 'start') {
      halfData[0] = value;
      if (value === 'PM') {
        time = {
          hour: 12,
          minute: 0,
          second: 0,
        };
      }
    } else {
      halfData[1] = value;
      index = 1;
      if (value === 'AM') {
        time = {
          hour: 12,
          minute: 0,
          second: 0,
        };
      } else {
        time = {
          hour: 23,
          minute: 59,
          second: 59,
        };
      }
    }

    this.timeOnChange(null, time, index, halfData);
  };

  render() {
    const classList = ['mui-datetimerangepicker'];
    if (this.props.show) {
      classList.push('show');
    }
    const classNames = classList.join(' ');

    const dateType = this.props.type === 'datetime' || this.props.type === 'half' ? 'date' : this.props.type;

    let partialToolbar = null;
    if (this.props.partial) {
      partialToolbar = (
        <div className="mui-datetimerangepicker-row partial">
          <div className="mui-datetimerangepicker-col">
            <Checkbox
              checked={this.state.partialStart}
              onClick={() => {
                this.checkboxOnChange('partialStart');
              }}
            >
              {_l('开始时间')}
            </Checkbox>
          </div>
          <div className="mui-datetimerangepicker-col">
            <Checkbox
              checked={this.state.partialEnd}
              onClick={() => {
                this.checkboxOnChange('partialEnd');
              }}
            >
              {_l('结束时间')}
            </Checkbox>
          </div>
        </div>
      );
    }

    let startTimePicker = null;
    let endTimePicker = null;
    const halfOptions = [
      {
        value: 'AM',
        text: 'AM',
      },
      {
        value: 'PM',
        text: 'PM',
      },
    ];

    if (this.props.type === 'datetime') {
      startTimePicker = [
        <span className="label">{_l('时间')}</span>,
        <Time
          type={this.props.timeType}
          min={this.state.startTime.min}
          max={this.state.startTime.max}
          value={this.state.startTime.value}
          onChange={(event, value) => {
            this.timeOnChange(event, value, 0);
          }}
        />,
      ];
      endTimePicker = [
        <span className="label">{_l('时间')}</span>,
        <Time
          type={this.props.timeType}
          min={this.state.endTime.min}
          max={this.state.endTime.max}
          value={this.state.endTime.value}
          onChange={(event, value) => {
            this.timeOnChange(event, value, 1);
          }}
        />,
      ];
    } else if (this.props.type === 'half') {
      startTimePicker = (
        <Dropdown
          value={this.state.halfData[0]}
          data={halfOptions}
          onChange={value => {
            this.halfOnChange(value, 'start');
          }}
        />
      );
      endTimePicker = (
        <Dropdown
          value={this.state.halfData[1]}
          data={halfOptions}
          onChange={value => {
            this.halfOnChange(value, 'end');
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
          onClick={event => {
            this.buttonOnClick(event, 'clear');
          }}
        >
          {_l('清空')}
        </Button>
      );
    }

    return (
      <div className={classNames}>
        {partialToolbar}
        <div className="mui-datetimerangepicker-row">
          <div className="mui-datetimerangepicker-col">
            <DatePickerBase
              type={dateType}
              part="start"
              firstDayOfWeek={this.props.firstDayOfWeek}
              min={this.props.min}
              max={this.props.max}
              value={this.state.value[0]}
              selectedRange={this.state.value}
              prefix={_l('开始:')}
              onChange={(event, value) => {
                this.onPick(event, value, 0);
              }}
            />
          </div>
          <div className="mui-datetimerangepicker-col">
            <DatePickerBase
              type={dateType}
              part="end"
              firstDayOfWeek={this.props.firstDayOfWeek}
              min={this.props.min}
              max={this.props.max}
              value={this.state.value[1]}
              selectedRange={this.state.value}
              prefix={_l('结束:')}
              onChange={(event, value) => {
                this.onPick(event, value, 1);
              }}
            />
          </div>
        </div>
        <div className="mui-datetimerangepicker-row toolbar">
          <div className="mui-datetimerangepicker-col">{startTimePicker}</div>
          <div className="mui-datetimerangepicker-col">
            {endTimePicker}
            {clearBtn}
            <Button
              type="primary"
              size="small"
              onClick={event => {
                this.buttonOnClick(event, 'ok');
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

DateTimeRangeDoublePicker.propTypes = {
  /**
   * 是否显示
   */
  show: PropTypes.bool,
  /**
   * 选择类型
   */
  type: PropTypes.oneOf([
    'year', // 年
    'month', // 月
    'date', // 日
    'datetime', // YYYY-MM-DD HH:mm:ss
    'half', // 半天 AM|PM
  ]),
  /**
   * 时间类型
   */
  timeType: PropTypes.oneOf([
    'hour', // HH
    'minute', // HH:mm
    'second', // HH:mm:ss
  ]),
  halfStart: PropTypes.oneOf(['AM', 'PM']),
  halfEnd: PropTypes.oneOf(['AM', 'PM']),
  /**
   * 是否支持部分返回
   */
  partial: PropTypes.bool,
  /**
   * 部分选择
   */
  config: PropTypes.any,
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

DateTimeRangeDoublePicker.defaultProps = {
  show: false,
  type: 'date',
  timeType: 'minute',
  halfStart: 'AM',
  halfEnd: 'PM',
  allowClear: true,
  partial: false,
  config: {
    start: true,
    end: true,
  },
  firstDayOfWeek: 1,
  value: [new Date(), new Date()],
  min: null,
  max: null,
  onChange: (event, time) => {
    //
  },
  onOk: time => {
    //
  },
  onClear: () => {
    //
  },
  onSelect: time => {
    //
  },
};

export default DateTimeRangeDoublePicker;
