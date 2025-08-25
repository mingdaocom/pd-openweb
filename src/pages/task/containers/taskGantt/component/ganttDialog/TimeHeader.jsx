import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import config from './config';

const { TYPE_TO_WIDTH } = config;

/**
 * 获取总共的天数
 * @param {*} data
 */
const getDays = data =>
  data.sub.reduce((prev, curr) => prev + moment(`${data.pub}${curr}`, 'YYYYM月').daysInMonth(), 0);

export default class TimeHeader extends Component {
  componentDidMount() {
    const timeBox = document.querySelectorAll('.pubTime');
    this.props.getPosList(timeBox);
  }
  componentDidUpdate() {
    const timeBox = document.querySelectorAll('.pubTime');
    this.props.getPosList(timeBox);
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props.time, nextProps.time);
  }

  render() {
    const { time, type } = this.props;
    const width = TYPE_TO_WIDTH[type];
    let pubWidth, subWidth;
    return (
      <div className="timeHeader flexRow">
        {time.map((item, index) => {
          if (type === 'day') {
            pubWidth = width * item.sub.length;
            subWidth = width;
          }
          if (type === 'week') {
            pubWidth = width * item.sub.length * 7;
            subWidth = width * 7;
          }
          if (type === 'month') {
            pubWidth = width * getDays(item);
          }

          return (
            <div key={`pub-${index}`} style={{ width: pubWidth }} className="timeBox">
              <div className="pubTime">{item.pub}</div>
              <div className="subTimeBox">
                {item.sub.map((sub, index) => {
                  let isToday;
                  if (type === 'day') {
                    const todayFormat = moment().format('YYYY.MMD');
                    isToday = todayFormat === `${item.pub}${sub}`;
                  }
                  if (type === 'month') {
                    subWidth = width * moment(`${item.pub}${sub}`, 'YYYYMM月').daysInMonth();
                  }
                  return (
                    <div key={`sub-${index}`} style={{ width: subWidth }} className={cx({ isToday }, 'subTime')}>
                      {sub}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
