import React, { Component } from 'react';
import moment from 'moment';

export default class CountDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endDate: props.endDate || new Date(),
    };
    this.interval = null;
  }

  componentDidMount() {
    this.func();
    this.startTimer();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.endDate !== this.props.endDate) {
      this.setState(
        {
          endDate: this.props.endDate,
        },
        () => {
          this.func();
          this.startTimer();
        },
      );
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  startTimer = () => {
    this.clearTimer();
    this.interval = setInterval(() => {
      this.func();
    }, 60000);
  };

  clearTimer = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  // 时间转换成毫秒数
  getMillsecond = date => {
    return moment(date).valueOf();
  };

  func = () => {
    const { endDate = new Date() } = this.state;
    let startDate = new Date();
    let diffValue = this.getMillsecond(endDate) - this.getMillsecond(startDate);

    if (diffValue < 0) {
      this.clearTimer();
    }

    let s = Math.floor((diffValue / 1000) % 60);
    let m = Math.floor((diffValue / 1000 / 60) % 60);
    let h = Math.floor((diffValue / 1000 / 60 / 60) % 60);
    let d = Math.floor(h / 24);
    this.setState({ timeStr: this.formatValue(d, h, m, s) });
  };

  formatValue = (d, h, m, s) => {
    if (d > 0) {
      return _l('%0天%1时%2分', d, h, m);
    } else if (h > 0 && !m) {
      return _l('%0小时', h);
    } else if (h > 0 && m > 0) {
      return _l(`%0小时%1分钟`, h, m);
    } else if (m > 0) {
      return _l(`%0分钟`, m);
    } else if (s < 0) {
      return;
    } else {
      return _l('1分钟');
    }
  };
  render() {
    let { timeStr } = this.state;
    return (
      <span>
        {timeStr}
        {_l('后恢复')}
      </span>
    );
  }
}
