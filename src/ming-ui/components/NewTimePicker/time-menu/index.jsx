import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import List from './list';
import LibCalender from 'ming-ui/components/lib/calender';

class TimeMenu extends Component {
  constructor(props) {
    super(props);

    this.state = this.init(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.init(nextProps));
  }

  init = (props) => {
    const state = {
      /**
       * 小时列表
       */
      hourList: this.generateHourList(props),
      /**
       * 分钟列表
       */
      minuteList: this.generateMinuteList(props),
      /**
       * 秒列表
       */
      secondList: this.generateSecondList(props),
    };

    return state;
  };

  generateHourList = (props) => {
    const list = [];

    let i = 0;
    while (i < 24) {
      let disabled = false;
      if ((props.min && i < props.min.hour) || (props.max && i > props.max.hour)) {
        disabled = true;
      }

      let label = i < 10 ? `0${i}:00` : `${i.toString()}:00`;
      if (props.mode !== 'hour') {
        label = i < 10 ? `0${i}` : `${i.toString()}`;
      }

      list.push({
        value: i,
        label,
        disabled,
        current: i === props.value.hour,
      });

      i = i + 1;
    }

    return list;
  };

  generateMinuteList = (props) => {
    const list = [];

    let i = 0;
    while (i < 60) {
      list.push({
        value: i,
        label: i < 10 ? `0${i}` : i.toString(),
        disabled: !LibCalender.minuteInRange(
          {
            hour: props.value.hour,
            minute: i,
          },
          props.min,
          props.max
        ),
        current: i === props.value.minute,
      });

      i = i + 1;
    }

    return list;
  };

  generateSecondList = (props) => {
    const list = [];

    let i = 0;
    while (i < 60) {
      list.push({
        value: i,
        label: i < 10 ? `0${i}` : i.toString(),
        disabled: !LibCalender.secondInRange(
          {
            hour: props.value.hour,
            minute: props.value.minute,
            second: i,
          },
          props.min,
          props.max
        ),
        current: i === props.value.second,
      });

      i = i + 1;
    }

    return list;
  };

  onPick = (event, type, value) => {
    if (this.props.onPick) {
      let time = {
        hour: this.props.value.hour,
        minute: this.props.value.minute,
        second: this.props.value.second,
      };

      time[type] = value;

      // check min
      let min = false;
      if (this.props.min) {
        if (time.hour < this.props.min.hour) {
          min = true;
        } else if (time.hour === this.props.min.hour) {
          if (time.minute < this.props.min.minute) {
            min = true;
          } else if (time.minute === this.props.min.minute && time.second < this.props.min.second) {
            min = true;
          }
        }
      }
      if (min) {
        time = this.props.min;
      }
      // check max
      let max = false;
      if (this.props.max) {
        if (time.hour > this.props.max.hour) {
          max = true;
        } else if (time.hour === this.props.max.hour) {
          if (time.minute > this.props.max.minute) {
            max = true;
          } else if (time.minute === this.props.max.minute && time.second > this.props.max.second) {
            max = true;
          }
        }
      }
      if (max) {
        time = this.props.max;
      }

      this.props.onPick(event, time);
    }
  };

  render() {
    const classList = ['mui-timemenu'];
    if (this.props.show) {
      classList.push('show');
    }
    if (this.props.mode === 'hour') {
      classList.push('col-1');
    } else if (this.props.mode === 'minute') {
      classList.push('col-2');
    } else if (this.props.mode === 'second') {
      classList.push('col-3');
    }
    const classNames = classList.join(' ');

    const content = [
      <div key="hour-menu" className="mui-timemenu-col">
        <List
          data={this.state.hourList}
          onPick={(event, value) => {
            this.onPick(event, 'hour', value);
          }}
        />
      </div>,
    ];
    if (this.props.mode === 'minute' || this.props.mode === 'second') {
      content.push(
        <div key="minute-menu" className="mui-timemenu-col">
          <List
            data={this.state.minuteList}
            onPick={(event, value) => {
              this.onPick(event, 'minute', value);
            }}
          />
        </div>
      );
    }
    if (this.props.mode === 'second') {
      content.push(
        <div key="second-menu" className="mui-timemenu-col">
          <List
            data={this.state.secondList}
            onPick={(event, value) => {
              this.onPick(event, 'second', value);
            }}
          />
        </div>
      );
    }

    return <div className={classNames}>{content}</div>;
  }
}

TimeMenu.propTypes = {
  /**
   * 是否显示
   */
  show: PropTypes.bool,
  /**
   * 选择模式
   */
  mode: PropTypes.oneOf([
    'hour', // hh
    'minute', // hh:MM
    'second', // hh:MM:ss
  ]),
  /**
   * 最小值
   */
  min: PropTypes.any,
  /**
   * 最大值
   */
  max: PropTypes.any,
  /**
   * 当前值
   */
  value: PropTypes.any,
  /**
   * 选择
   * @param {event} event - 事件
   * @param {object} time - 选择的时间
   */
  onPick: PropTypes.func,
};

TimeMenu.defaultProps = {
  show: false,
  mode: 'second',
  min: null,
  max: null,
  value: {
    hour: 0,
    minute: 0,
    second: 0,
  },
  onPick: (event, value) => {
    //
  },
};

export default TimeMenu;
