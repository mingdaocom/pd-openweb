import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import config from './config';

const { TYPE_TO_WIDTH } = config;
export default class GraphBg extends Component {
  shouldComponentUpdate(nextProp) {
    return !_.isEqual(nextProp.time, this.props.time);
  }

  render() {
    const { time, type, durFromBeginToToday } = this.props;
    const width = TYPE_TO_WIDTH[type];
    let subWidth = width;
    if (type === 'week') subWidth = width * 7;
    return (
      <div className="graphBg flex flexRow">
        {time.map((item, index) => {
          return (
            <div key={`graphFiled-${index}`} className="fields flexRow">
              {item.sub.map((sub, index) => {
                if (type === 'month') {
                  const days = moment(`${item.pub}${sub}`, 'YYYYM月').daysInMonth();
                  subWidth = width * days;
                }
                return (
                  <div
                    key={`graphSub-${index}`}
                    style={{
                      width: subWidth - 1,
                      background:
                        type === 'day' &&
                        (moment(`${item.pub}.${sub}`).days() === 6 || moment(`${item.pub}.${sub}`).days() === 0) &&
                        moment(`${item.pub}.${sub}`).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')
                          ? '#F8F8F8'
                          : '#fff',
                    }}
                    className="subBg"
                  />
                );
              })}
            </div>
          );
        })}
        <div className="isToday" style={{ width, left: durFromBeginToToday * width }} />
      </div>
    );
  }
}
