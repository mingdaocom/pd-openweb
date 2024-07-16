import React, { Fragment, Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import { getWorkDays, getDays, getWeeks, getMonths } from 'src/pages/worksheet/views/GunterView/util';
import { PERIOD_TYPE } from 'src/pages/worksheet/views/GunterView/config';
import _ from 'lodash';
import moment from 'moment';

const SpeedCreateTimeWrapper = styled.div`
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.04);
  pointer-events: none;
`;

const TimeWrapper = styled.div`
  width: 100%;
  height: 14px;
  margin-top: 9px;
  position: absolute;
  border: 2px solid #2196f3;
  border-radius: 2px;
  background-color: #fff;
  cursor: pointer;
`;

const MilepostTimeWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 22px;
  border-color: #2196f3;
  cursor: pointer;
  transform: translateY(5px);
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 11px;
    height: 100%;
  }
  &::before {
    left: 0;
    border: 11px solid transparent;
    border-left-color: inherit;
  }
  &::after {
    right: 0;
    border: 11px solid transparent;
    border-right-color: inherit;
  }
`;

const recordHeight = 32;
const milepostWidth = 22;
const borderRight = 1;

const flattenPeriodList = (periodList, periodType, viewConfig) => {
  const start = periodList[0];
  const end = periodList[periodList.length - 1];

  if ([PERIOD_TYPE.day].includes(periodType)) {
    return periodList;
  }
  if ([PERIOD_TYPE.month].includes(periodType)) {
    return getWeeks(moment(start.time), moment(end.time), null, viewConfig).result;
  }
  if ([PERIOD_TYPE.quarter, PERIOD_TYPE.year].includes(periodType)) {
    return getMonths(moment(start.time), moment(end.time), null, viewConfig).result;
  }

  return periodList;
};

const getDayPeriodList = (periodList, periodType, viewConfig) => {
  const { onlyWorkDay } = viewConfig;
  const start = periodList[0];
  const end = periodList[periodList.length - 1];
  if ([PERIOD_TYPE.day].includes(periodType)) {
    return periodList;
  }
  return onlyWorkDay ? getWorkDays(start.time, end.time).result : getDays(moment(start.time), moment(end.time), null, viewConfig).result;
};

const getWithoutArrangementIndexs = (grouping, milepost) => {
  const records = {};
  const indexs = [];
  const milepostIndexs = [];
  grouping.forEach(item => {
    if (item.subVisible) {
      item.rows.forEach((row, i) => {
        if (row.diff <= 0) {
          const index = item.groupingIndex + i + 1;
          if (row[milepost] === '1') {
            milepostIndexs.push(index);
          } else {
            indexs.push(index);
          }
          records[index] = row;
        }
      });
    }
  });
  return { records, indexs, milepostIndexs };
};

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class SpeedCreateTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      left: null,
      top: null,
      time: null,
      width: 0,
      hoverIndex: 0,
      isMilepost: false,
      records: {},
      periodList: [],
      dayPeriodList: [],
      withoutArrangementIndexs: [],
      withoutArrangementMilepostIndexs: [],
    };
  }
  componentWillReceiveProps({ gunterView }) {
    if (
      gunterView.periodType !== this.props.gunterView.periodType ||
      _.get(gunterView.periodList[0], 'time') !== _.get(this.props.gunterView.periodList[0], 'time') ||
      _.get(gunterView.periodList[0], 'width') !== _.get(this.props.gunterView.periodList[0], 'width') ||
      !_.isEqual(gunterView.grouping, this.props.gunterView.grouping)
    ) {
      this.initPeriodList(gunterView);
    }
  }
  componentDidMount() {
    const { gunterView, base } = this.props;
    const { viewConfig }  = gunterView;
    const { startId, endId } = viewConfig;
    this.debounceHandleMouseMove = _.throttle(this.handleMouseMove, 50);
    this.gunterViewEl = document.querySelector(`.gunterView-${base.viewId} .gunterChartWrapper`);
    this.gunterViewEl.addEventListener('mousemove', this.debounceHandleMouseMove);
    this.gunterViewEl.addEventListener('mouseleave', this.handleMouseLeave);
    gunterView.chartScroll.on('scrollStart', this.handleMouseLeave);
    this.initPeriodList(gunterView);
    this.setState({ disable: startId.includes('time') || endId.includes('time') });
  }
  componentWillUnmount() {
    const { chartScroll } = this.props.gunterView;
    this.gunterViewEl.removeEventListener('mousemove', this.debounceHandleMouseMove);
    this.gunterViewEl.removeEventListener('mouseleave', this.handleMouseLeave);
    chartScroll.off('scrollStart', this.handleMouseLeave);
  }
  initPeriodList({ grouping, periodList, periodType, viewConfig }) {
    const newPeriodList = flattenPeriodList(periodList, periodType, viewConfig);
    const { records, indexs, milepostIndexs } = getWithoutArrangementIndexs(grouping, viewConfig.milepost);
    this.setState({
      periodList: newPeriodList,
      dayPeriodList: milepostIndexs.length ? getDayPeriodList(periodList, periodType, viewConfig) : [],
      withoutArrangementIndexs: indexs,
      withoutArrangementMilepostIndexs: milepostIndexs,
      records,
    });
  }
  handleMouseLeave = () => {
    this.setState({ left: null, top: null });
  };
  addRecordTime = () => {
    const { hoverIndex, records, time, isMilepost } = this.state;
    const { gunterView, updateRecordTime } = this.props;
    const { periodType, viewConfig } = gunterView;
    const { startFormat, endZeroFormat } = viewConfig;
    const record = records[hoverIndex];

    if (_.isEmpty(record)) {
      return
    }

    if (isMilepost) {
      const start = moment(time).format(startFormat);
      const end = moment(time).format(endZeroFormat);
      updateRecordTime(record, start, end);
      return;
    }
    if (periodType === PERIOD_TYPE.day) {
      const start = moment(time).format(startFormat);
      const end = moment(time).format(endZeroFormat);
      updateRecordTime(record, start, end);
    }
    if (periodType === PERIOD_TYPE.week) {
      const start = moment(time).format(startFormat);
      const end = moment(time).endOf('w').format(endZeroFormat);
      updateRecordTime(record, start, end);
    }
    if (periodType === PERIOD_TYPE.month) {
      const start = moment(time).format(startFormat);
      const end = moment(time).add(6, 'd').format(endZeroFormat);
      updateRecordTime(record, start, end);
    }
    if ([PERIOD_TYPE.quarter, PERIOD_TYPE.year].includes(periodType)) {
      const start = moment(time).format(startFormat);
      const end = moment(time).endOf('M').format(endZeroFormat);
      updateRecordTime(record, start, end);
    }
  };
  getAxisTime(clientX, periodList) {
    const { chartScroll } = this.props.gunterView;
    const scrollX = Math.abs(chartScroll.x);
    const { left } = this.gunterViewEl.getBoundingClientRect();
    let scrollLeft = scrollX + clientX - left;
    let leftValue = 0;
    let indexValue = 0;
    for (let i = 0; i < periodList.length; i++) {
      leftValue = leftValue + periodList[i].width;
      if (scrollLeft > leftValue) {
        indexValue = i;
      } else {
        break;
      }
    }
    return { indexValue, leftValue, scrollLeft };
  }
  handleMouseMove = event => {
    const { periodList, dayPeriodList, withoutArrangementIndexs, withoutArrangementMilepostIndexs } = this.state;
    const { chartScroll } = this.props.gunterView;
    const scrollY = Math.abs(chartScroll.y);
    const { top, left } = this.gunterViewEl.getBoundingClientRect();
    const y = event.clientY - top;
    if (event.clientX <= left + 5) {
      this.handleMouseLeave();
      return;
    }
    if (y) {
      const index = Math.floor((y + scrollY) / recordHeight);
      if (withoutArrangementIndexs.includes(index) || withoutArrangementMilepostIndexs.includes(index)) {
        const isMilepost = withoutArrangementMilepostIndexs.includes(index);
        const list = isMilepost ? dayPeriodList : periodList;
        const { indexValue, leftValue, scrollLeft } = this.getAxisTime(event.clientX, list);
        const diff = leftValue - scrollLeft;
        const { time, width } = list[indexValue + 1];
        const left = scrollLeft + diff - width;
        this.setState({
          left: isMilepost ? left + width / 2 : left,
          width,
          top: index * recordHeight,
          time,
          isMilepost,
          hoverIndex: index,
        });
      } else {
        this.handleMouseLeave();
      }
    } else {
      this.handleMouseLeave();
    }
  };
  render() {
    const { disable, left, top, width, records, hoverIndex, isMilepost } = this.state;
    const record = records[hoverIndex];
    const style = {
      left,
      top,
      width: isMilepost ? 0 : width - borderRight,
      borderColor: record ? record.color : null,
    };
    const currentMilepostWidth = width > milepostWidth ? width : milepostWidth;
    if (disable) {
      return null;
    }
    return (
      <Fragment>
        {left !== null && (
          <Fragment>
            <SpeedCreateTimeWrapper
              style={{
                left: isMilepost ? left - currentMilepostWidth / 2 : left,
                width: isMilepost ? currentMilepostWidth : width,
              }}
            />
            {isMilepost ? (
              <MilepostTimeWrapper style={style} onClick={this.addRecordTime} />
            ) : (
              <TimeWrapper style={style} onClick={this.addRecordTime} />
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
}
