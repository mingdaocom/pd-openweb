import React, { Component } from 'react';
import moment from 'moment';

let timer = null;

export default class CountDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      endTime: props.endTime || new Date(),
      isArrive: false,
    };
  }
  componentDidMount() {
    this.func();
    timer = setInterval(() => {
      this.func();
    }, 1000);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.endTime !== nextProps.endTime) {
      this.setState({ endTime: nextProps.endTime }, () => {
        this.func();
        timer = setInterval(() => {
          this.func();
        }, 1000);
      });
    }
  }

  func = () => {
    const { endTime = new Date() } = this.state;

    const diffTime = moment(endTime).diff(moment());
    let durationTime = moment.duration(diffTime);
    let diffDays = moment(endTime).diff(moment(), 'days');

    if (diffTime < 0) {
      clearInterval(timer);
    }
    this.setState({
      timeStr: this.formatTime(diffDays, durationTime.hours(), durationTime.minutes(), durationTime.seconds()),
      isArrive: diffTime < 0,
    });
  };

  formatTime = (d, h, m, s) => {
    return `${d > 0 ? _l('%0天', d) : ''}${h > 0 ? _l('%0时', h) : ''}${m > 0 ? _l('%0分', m) : ''}${
      s > 0 ? _l('%0秒', s) : ''
    }`;
  };

  render() {
    const { className, beforeText, afterText, arriveText } = this.props;
    let { timeStr, isArrive } = this.state;

    return isArrive && arriveText ? (
      <span>{arriveText}</span>
    ) : (
      <React.Fragment>
        <span>{beforeText || ''}</span>
        <span className={`mLeft5 mRight5 ${className || ''}`}>{timeStr}</span>
        <span>{afterText || ''}</span>
      </React.Fragment>
    );
  }
}
