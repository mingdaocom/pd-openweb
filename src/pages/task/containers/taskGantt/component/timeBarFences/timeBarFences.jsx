import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import config from '../../config/config';
import utils from '../../utils/utils';
import './timeBarFences.less';

// 时间栅栏
export default class TimeBarFences extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const scrollLeft = this.getTimePosition();
    // 今天如何在视图上 视图进入默认今天靠左
    if (scrollLeft <= $('.timeBarContainer .timeBarBox').width()) {
      $('.timeBarContainer').scrollLeft(scrollLeft - 200);
    }
  }

  /**
   * 获取今天对应的位置
   * @return {number}
   */
  getTimePosition() {
    const { viewType, filterWeekend, timeAxisSource } = this.props;
    return utils.getTimePosition(
      timeAxisSource[0].dateList[0],
      moment(config.timeStamp).format('YYYY-MM-DD ') + config.workingTimes[0][0],
      viewType,
      filterWeekend,
    );
  }

  /**
   * 获取今天的样式
   * @return {object}
   */
  timeBarTodayStyle() {
    return {
      left: this.getTimePosition(),
      width: utils.getOneHourWidth(this.props.viewType) * config.workingSumHours - 1, // 留出边上1px的边线
    };
  }

  /**
   * 获取过期背景色
   * @return {string}
   */
  fencesBGColor(source) {
    const { viewType } = this.props;
    const currentTime = moment(config.timeStamp);
    const currentDays = currentTime.days();

    // 日视图
    if (viewType === config.VIEWTYPE.DAY) {
      const overdueTime = currentTime.add(-(currentDays || 7), 'd');

      if (moment(source) <= overdueTime) {
        return 'rgba(240, 240, 240, .3)';
      }

      return 'transparent';
    }

    // 周视图
    if (viewType === config.VIEWTYPE.WEEK) {
      if (moment(source[source.length - 1]) < currentTime) {
        return 'rgba(240, 240, 240, .3)';
      }

      return 'transparent';
    }

    // 月视图
    if (viewType === config.VIEWTYPE.MONTH) {
      if (moment(source) < moment(currentTime.format('YYYY-MM'))) {
        return 'rgba(240, 240, 240, .3)';
      }

      return 'transparent';
    }
  }

  render() {
    const { timeAxisSource, viewType, filterWeekend } = this.props;
    const fencesArr = [];

    timeAxisSource.forEach(items =>
      items.dateList.forEach(item => {
        fencesArr.push(item);
      }),
    );

    return (
      <div className="timeBarFences">
        {fencesArr.map((source, i) => {
          return (
            <div
              key={i}
              className="timeBarFencesSingle"
              style={{
                width: utils.singleTableWidth(viewType, filterWeekend, source),
                background: this.fencesBGColor(source),
              }}
            />
          );
        })}

        {!filterWeekend || !_.includes(config.filterWeekendDay, moment(config.timeStamp).days()) ? (
          <div className="timeBarToday" style={this.timeBarTodayStyle()} />
        ) : undefined}
      </div>
    );
  }
}
