import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProcessBar from './ProcessBar';
import cx from 'classnames';
import config from './config';
import { durDays, parseTime } from './time';
import moment from 'moment';

/**
 * 根据最早开始时间和实际起止时间计算时间跨度
 * @param {*} beginTime 最早开始时间
 * @param {*} startTime 起始时间
 * @param {*} endTime 结束时间
 */
const getWidthAndLeft = (beginTime, startTime, endTime) => {
  if (startTime.isValid() && endTime.isValid()) {
    return {
      leftDays: durDays(beginTime, startTime),
      widthDays: durDays(startTime, endTime) + 1,
    };
  }
  if (startTime.isValid() && !endTime.isValid()) {
    return {
      leftDays: durDays(beginTime, startTime),
      widthDays: 1,
    };
  }
  if (!startTime.isValid() && endTime.isValid()) {
    return {
      leftDays: durDays(beginTime, endTime),
      widthDays: 1,
    };
  }
  return {
    leftDays: 0,
    widthDays: 0,
  };
};
export default class GraphContent extends Component {
  constructor(props) {
    super(props);
  }

  renderProcess(data) {
    const { width, handleTaskItemHover, beginTime } = this.props;

    return data.map((item, index) => {
      let expectState, actualState, status;
      let { actualStartTime, completeTime, deadline, startTime } = item;

      /**
       * 确定计划时间是否需要向前或向后补一天
       */
      if (!startTime && deadline) expectState = 'noStart';
      if (startTime && !deadline) expectState = 'noEnd';

      /**
       * 确实实际时间是否需要向前或向后补一天
       */
      if (!actualStartTime && completeTime) actualState = 'noStart';
      if (actualStartTime && !completeTime) actualState = 'noEnd';

      /**
       *  当有实际完成时间且时间早于此刻时,状态为超前
       */
      if (completeTime && moment(completeTime).isBefore(moment())) status = 'inAdvance';
      if ((actualStartTime && !completeTime) || (completeTime && moment(completeTime) > moment())) status = 'normal';
      /**
       * 解析时间
       */
      actualStartTime = moment(parseTime(actualStartTime));
      completeTime = moment(parseTime(completeTime));
      deadline = moment(parseTime(deadline));
      startTime = moment(parseTime(startTime));

      /**
       * 获取时间条的宽度和距左边的距离
       */
      const expectPos = getWidthAndLeft(beginTime, startTime, deadline);
      const actualPos = getWidthAndLeft(beginTime, actualStartTime, completeTime);
      const expectLeft = expectPos.leftDays * width;
      const expectWidth = expectPos.widthDays * width;
      const actualLeft = actualPos.leftDays * width;
      const actualWidth = actualPos.widthDays * width;

      return (
        <div key={index} className="processWrap">
          <div
            className={cx('processBox flexRow')}
            onClick={() => this.props.showDetail(item.taskID)}
            onMouseOver={e => handleTaskItemHover(true, e)}
            onMouseOut={e => handleTaskItemHover(false)}
          >
            <div>
              {!!expectWidth && (
                <div className="expectProcess">
                  <ProcessBar width={expectWidth} left={expectLeft} className="expectBar" state={expectState} />
                </div>
              )}

              {!!actualWidth && (
                <div className="actualProcess">
                  <ProcessBar width={actualWidth} left={actualLeft} className="actualBar" state={actualState} status={status} />
                </div>
              )}
            </div>
            <div className="taskName ellipsis">{item.taskName}</div>
          </div>
          {item.child && item.childrenVisible && <div className="childrenProcess">{this.renderProcess(item.child)}</div>}
        </div>
      );
    });
  }
  render() {
    const { data } = this.props;
    return <div className="graphContent">{this.renderProcess(data)}</div>;
  }
}
