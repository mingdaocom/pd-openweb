import React, { Fragment, Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import cx from 'classnames';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { PERIOD_TYPE, viewConfig } from 'worksheet/views/GunterView/config';
import { timeToPercentage, percentageToTime } from 'worksheet/views/GunterView/util';
import { Tooltip } from 'antd';
import { Icon } from 'ming-ui';
import _ from 'lodash';
import moment from 'moment';
import { renderTitleByViewtitle } from 'src/pages/worksheet/views/util.js';

const getAssignWorkDays = (value, time, dayOff) => {
  const result = [];
  const target = Math.abs(value);
  let count = value >= 0 ? 1 : -1;
  while (result.length !== target) {
    const date = moment(time).add(count, 'd');
    const day = date.day();
    if (value >= 0) {
      count = count + 1;
    } else {
      count = count - 1;
    }
    if (!dayOff.includes(day)) {
      result.push(date.format('YYYY-MM-DD'));
    }
  }
  return result;
};

const getNextWorkStartTime = (time, dayOff) => {
  let current = moment(time);
  while (dayOff.includes(current.day())) {
    current = current.add(1, 'd');
  }
  return current.format('YYYY-MM-DD');
};

const getLastWorkEndTime = (time, dayOff) => {
  let current = moment(time);
  while (dayOff.includes(current.day())) {
    current = current.add(-1, 'd');
  }
  return current.format('YYYY-MM-DD');
};

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['searchRecordId', 'viewConfig', 'chartScroll']),
    ..._.pick(state.sheet, ['controls', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class RowBlock extends Component {
  constructor(props) {
    super(props);
    const { base } = props;
    this.state = {
      tooltipLeft: 0,
      dragStartTime: null,
      dragEndTime: null,
      currentChangeStartTime: null,
      currentChangeEndTime: null,
      tooltipVisible: false,
    };
    this.$ref = createRef(null);
    this.isScroll = false;
    this.timer = null;
    this.gunterChartWrapperEl = document.querySelector(`.gunterView-${base.viewId} .gunterChartWrapper`);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.style, this.props.style)) {
      this.$ref.current.style.transform = null;
    }
    if (nextProps.row.resetTime !== this.props.row.resetTime) {
      this.$ref.current.style.transform = null;
      this.$ref.current.style.left = `${nextProps.row.left}px`;
      this.$ref.current.style.width = `${nextProps.row.width}px`;
    }
  }
  openScroll(x, changValue) {
    const { left, right } = this.gunterChartWrapperEl.getBoundingClientRect();
    const { chartScroll, viewConfig, row } = this.props;
    const diff = 30;
    if (x < left + diff) {
      if (!this.isScroll) {
        this.isScroll = true;
        this.timer = setInterval(() => {
          const { dragStartTime, dragEndTime } = this.state;
          if (!dragStartTime || !dragEndTime) {
            this.handleChange(changValue);
          }
          this.handleAutoUpdateTime(-1);
          chartScroll.scrollTo(chartScroll.x + viewConfig.minDayWidth, 0);
          chartScroll._execEvent('scroll');
        }, 200);
      }
      return;
    }
    if (x > right - diff) {
      if (!this.isScroll) {
        this.isScroll = true;
        this.timer = setInterval(() => {
          const { dragStartTime, dragEndTime } = this.state;
          if (!dragStartTime || !dragEndTime) {
            this.handleChange(changValue);
          }
          this.handleAutoUpdateTime(1);
          chartScroll.scrollTo(chartScroll.x - viewConfig.minDayWidth, 0);
          chartScroll._execEvent('scroll');
        }, 200);
      }
      return;
    }
    if (this.isScroll) {
      row.dragStartTime = null;
      row.dragEndTime = null;
      this.closeScroll();
    }
  }
  closeScroll() {
    const { row } = this.props;
    this.isScroll = false;
    this.setState({ dragStartTime: null, dragEndTime: null });
    clearInterval(this.timer);
  }
  handleAutoUpdateTime = value => {
    const { row } = this.props;
    const { dragStartTime, dragEndTime } = this.state;
    this.props.updateRecordDragTime(row, dragStartTime, dragEndTime, value);
  };
  handleUpdateRecordTime = (start, end) => {
    const { dragStartTime, dragEndTime } = this.state;
    const { row, updateRecordTime } = this.props;
    // if (this.isScroll) {
    //   this.setState({ dragStartTime: start, dragEndTime: end });
    // } else {
    // console.log(row.dragStartTime, row.dragBeforeStartTime, start);
    // updateRecordTime(row, row.dragStartTime || start, row.dragEndTime || end);
    // }
    updateRecordTime(row, start, end);
  };
  handleChange(value) {
    const [start, end] = this.getAllTime(value);
    this.handleUpdateRecordTime(start, end);
  }
  getAllTime(value) {
    const { row, viewConfig } = this.props;
    const { minDayWidth, onlyWorkDay, periodType, startType, endType, startFormat, endFormat, dayOff } = viewConfig;
    const day = parseInt(value / minDayWidth);
    const isHours = startType === 16 && endType === 16 && periodType === PERIOD_TYPE.day;
    if (onlyWorkDay) {
      const isStartDayOff = dayOff.includes(moment(row.startTime).days());
      const isEndDayOff = dayOff.includes(moment(row.endTime).days());
      const isStartHour = moment(row.startTime).minute() || moment(row.startTime).hour();
      const isEndHour = moment(row.endTime).minute() || moment(row.endTime).hour();
      const starts = getAssignWorkDays(day, getNextWorkStartTime(row.startTime, dayOff), dayOff);
      const ends = getAssignWorkDays(day, getLastWorkEndTime(row.endTime, dayOff), dayOff);
      let startTime = starts[starts.length - 1];
      let endTime = ends[ends.length - 1];
      if (isHours) {
        const startIsZero = !moment(row.startTime).minute() && !moment(row.startTime).hour();
        const startIsDayOff = dayOff.includes(moment(row.startTime).days());
        const startHoursWidth = startIsZero ? 0 : timeToPercentage(row.startTime, minDayWidth);
        const startDay =
          (value > 0
            ? startIsDayOff
              ? value
              : startHoursWidth + value
            : startIsDayOff
              ? value - minDayWidth
              : startHoursWidth + value - minDayWidth) / minDayWidth;
        const currentStartTime = getNextWorkStartTime(row.startTime, dayOff);
        const starts = getAssignWorkDays(parseInt(startDay), currentStartTime, dayOff);
        const startDayTime = starts[starts.length - 1];
        const startHours =
          value > 0 ? percentageToTime((startDay % 1) * 100) : percentageToTime(100 - (Math.abs(startDay) % 1) * 100);
        const startTime = moment(startDayTime ? startDayTime : currentStartTime)
          .add(startHours, 'h')
          .format('YYYY-MM-DD HH:mm');

        const endIsZero = !moment(row.endTime).minute() && !moment(row.endTime).hour();
        const endIsDayOff = dayOff.includes(moment(row.endTime).days());
        const endHoursWidth = endIsZero ? minDayWidth : timeToPercentage(row.endTime, minDayWidth);
        const endDay =
          (value > 0
            ? endIsDayOff
              ? minDayWidth + value
              : endHoursWidth + value
            : endIsDayOff
              ? value
              : endHoursWidth + value - minDayWidth) / minDayWidth;
        const currentEndTime = getLastWorkEndTime(row.endTime, dayOff);
        const ends = getAssignWorkDays(parseInt(endDay), currentEndTime, dayOff);
        const endDayTime = ends[ends.length - 1];
        const endHours =
          value > 0
            ? percentageToTime(((endDayTime ? endDay : value / minDayWidth) % 1) * 100)
            : percentageToTime(100 - (Math.abs(endDay) % 1) * 100);
        const endTime = moment(endDayTime ? endDayTime : currentEndTime)
          .add(endHours, 'h')
          .format('YYYY-MM-DD HH:mm');

        return [startTime, endTime];
      } else if ((startType === 16 || endType === 16) && periodType === PERIOD_TYPE.day) {
        if (isStartHour && !isStartDayOff) {
          const [day, hour] = row.startTime.split(' ');
          startTime = `${startTime} ${hour}`;
        }
        if (isEndHour && !isEndDayOff) {
          const [day, hour] = row.endTime.split(' ');
          endTime = `${endTime} ${hour}`;
        }
        return [startTime, endTime];
      } else {
        return [startTime, endTime];
      }
    } else {
      if (isHours) {
        const day = value / minDayWidth;
        const endIsZero = !moment(row.endTime).minute() && !moment(row.endTime).hour();
        const hours = percentageToTime((day % 1) * 100);
        const startDayCount = parseInt(day);
        const endDayCount = endIsZero ? parseInt(day) + 1 : parseInt(day);
        const startTime = moment(row.startTime).add(startDayCount, 'd').add(hours, 'h').format(startFormat);
        const endTime = moment(row.endTime).add(endDayCount, 'd').add(hours, 'h').format(endFormat);
        return [startTime, endTime];
      } else {
        const startTime = moment(row.startTime).add(day, 'd').format(startFormat);
        const endTime = moment(row.endTime).add(day, 'd').format(endFormat);
        return [startTime, endTime];
      }
    }
  }
  handleChangeStart(value) {
    const [start, end] = this.getStartTime(value);
    this.handleUpdateRecordTime(start, end);
  }
  getStartTime(value) {
    const { row, viewConfig } = this.props;
    const { minDayWidth, onlyWorkDay, periodType, startType, startFormat, dayOff } = viewConfig;
    if (startType === 16 && periodType === PERIOD_TYPE.day) {
      if (onlyWorkDay) {
        const startIsZero = !moment(row.startTime).minute() && !moment(row.startTime).hour();
        const startIsDayOff = dayOff.includes(moment(row.startTime).days());
        const startHoursWidth = startIsZero ? 0 : timeToPercentage(row.startTime, minDayWidth);
        const startDay =
          (value > 0
            ? startIsDayOff
              ? value
              : startHoursWidth + value
            : startIsDayOff
              ? value - minDayWidth
              : startHoursWidth + value - minDayWidth) / minDayWidth;
        const currentStartTime = getNextWorkStartTime(row.startTime, dayOff);
        const starts = getAssignWorkDays(parseInt(startDay), currentStartTime, dayOff);
        const startDayTime = starts[starts.length - 1];
        const startHours =
          value > 0 ? percentageToTime((startDay % 1) * 100) : percentageToTime(100 - (Math.abs(startDay) % 1) * 100);
        const startTime = moment(startDayTime ? startDayTime : currentStartTime)
          .add(startHours, 'h')
          .format('YYYY-MM-DD HH:mm');
        return [startTime, null];
      } else {
        const day = value / minDayWidth;
        const hours = percentageToTime((day % 1) * 100);
        const dayCount = parseInt(day);
        const startTime = moment(row.startTime).add(dayCount, 'd').add(hours, 'h').format('YYYY-MM-DD HH:mm');
        return [startTime, null];
      }
    }
    const day = parseInt(value / minDayWidth);
    if (onlyWorkDay) {
      const starts = getAssignWorkDays(day, getNextWorkStartTime(row.startTime, dayOff), dayOff);
      const startTime = starts[starts.length - 1];
      return [startTime, null];
    } else {
      const startTime = moment(row.startTime).add(day, 'd').format(startFormat);
      return [startTime, null];
    }
  }
  handleChangeEnd(value) {
    const [start, end] = this.getEndTime(value);
    this.handleUpdateRecordTime(start, end);
  }
  getEndTime(value) {
    const { row, viewConfig } = this.props;
    const { minDayWidth, onlyWorkDay, periodType, endType, endFormat, dayOff } = viewConfig;
    if (endType === 16 && periodType === PERIOD_TYPE.day) {
      const endIsZero = !moment(row.endTime).minute() && !moment(row.endTime).hour();
      if (onlyWorkDay) {
        const endIsDayOff = dayOff.includes(moment(row.endTime).days());
        const endHoursWidth = endIsZero ? minDayWidth : timeToPercentage(row.endTime, minDayWidth);
        const endDay =
          (value > 0
            ? endIsDayOff
              ? minDayWidth + value
              : endHoursWidth + value
            : endIsDayOff
              ? value
              : endHoursWidth + value - minDayWidth) / minDayWidth;
        const currentEndTime = getLastWorkEndTime(row.endTime, dayOff);
        const ends = getAssignWorkDays(parseInt(endDay), currentEndTime, dayOff);
        const endDayTime = ends[ends.length - 1];
        const endHours =
          value > 0
            ? percentageToTime(((endDayTime ? endDay : value / minDayWidth) % 1) * 100)
            : percentageToTime(100 - (Math.abs(endDay) % 1) * 100);
        const endTime = moment(endDayTime ? endDayTime : currentEndTime)
          .add(endHours, 'h')
          .format('YYYY-MM-DD HH:mm');
        return [null, endTime];
      } else {
        const day = value / minDayWidth;
        const hours = percentageToTime((day % 1) * 100);
        const dayCount = endIsZero ? parseInt(day) + 1 : parseInt(day);
        const endTime = moment(row.endTime).add(dayCount, 'd').add(hours, 'h').format('YYYY-MM-DD HH:mm');
        return [null, endTime];
      }
    }
    const day = parseInt(value / minDayWidth);
    if (onlyWorkDay) {
      const ends = getAssignWorkDays(day, getLastWorkEndTime(row.endTime, dayOff), dayOff);
      const endTime = ends[ends.length - 1];
      return [null, endTime];
    } else {
      const endTime = moment(row.endTime).add(day, 'd').format(endFormat);
      return [null, endTime];
    }
  }
  formatRemainder(value) {
    const { viewConfig } = this.props;
    const { minDayWidth } = viewConfig;
    const diff = value % minDayWidth;
    return value - diff;
  }
  getIsSurpassBoundary(x) {
    const { left, right } = this.gunterChartWrapperEl.getBoundingClientRect();
    if (x > right || x < left) {
      return true;
    }
    return false;
  }
  handleMouseDown = event => {
    if (event.target.classList.contains('recordTitle')) return;
    window.isDrag = true;
    event.stopPropagation();
    const { row, viewConfig } = this.props;
    const { startType, endType, periodType, milepost, minDayWidth } = viewConfig;
    const isHours = startType === 16 && endType === 16 && periodType === PERIOD_TYPE.day;
    const isMilepost = row[milepost] === '1';
    let changValue = null;
    let { left } = $(this.$ref.current).position();
    let x = event.clientX - left;
    document.onmousemove = event => {
      if (this.getIsSurpassBoundary(event.clientX)) return;
      if (this.isScroll) {
        left = $(this.$ref.current).position().left - minDayWidth;
        x = event.clientX - left;
      } else {
        const newLeft = event.clientX - x - left;
        changValue = isHours && !isMilepost ? newLeft : this.formatRemainder(newLeft);
        const { left: refLeft, width } = this.$ref.current.getBoundingClientRect();
        const [start, end] = this.getAllTime(changValue);
        this.setState({
          tooltipVisible: true,
          tooltipLeft: event.clientX - refLeft - width / 2,
          currentChangeStartTime: start,
          currentChangeEndTime: end,
        });
        this.$ref.current.style.transform = `translateX(${changValue}px)`;
        // this.$ref.current.style.left = `${left + changValue}px`;
      }
      // this.openScroll(event.clientX, changValue);
    };
    document.onmouseup = () => {
      // this.closeScroll();
      changValue && this.handleChange(changValue);
      this.setState({ tooltipVisible: false, currentChangeStartTime: null, currentChangeEndTime: null });
      window.isDrag = changValue ? true : false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  handleMouseDownStart = event => {
    window.isDrag = true;
    event.stopPropagation();
    const { viewConfig } = this.props;
    const { minDayWidth, startType, periodType } = viewConfig;
    const { left, width } = this.props.style;
    const isHours = startType === 16 && periodType === PERIOD_TYPE.day;
    const x = event.clientX;
    let changValue = null;
    document.onmousemove = event => {
      const originalLeft = event.clientX - (x - left);
      const newLeft = isHours ? originalLeft : this.formatRemainder(originalLeft);
      const newWidth = width + (x - event.clientX) + (originalLeft - newLeft);
      if (newWidth < (isHours ? 5 : minDayWidth)) {
        return;
      }
      changValue = newLeft - left;
      const { left: refLeft } = this.$ref.current.getBoundingClientRect();
      const [start, end] = this.getStartTime(changValue);
      this.setState({
        tooltipVisible: true,
        tooltipLeft: event.clientX - refLeft - newWidth / 2,
        currentChangeStartTime: start,
        currentChangeEndTime: end,
      });
      this.$ref.current.style.width = `${newWidth}px`;
      this.$ref.current.style.left = `${newLeft}px`;
    };
    document.onmouseup = () => {
      changValue && this.handleChangeStart(changValue);
      this.setState({ tooltipVisible: false, currentChangeStartTime: null, currentChangeEndTime: null });
      window.isDrag = changValue ? true : false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  handleMouseDownEnd = event => {
    window.isDrag = true;
    event.stopPropagation();
    const { viewConfig } = this.props;
    const { minDayWidth, endType, periodType } = viewConfig;
    const x = event.clientX;
    const isHours = endType === 16 && periodType === PERIOD_TYPE.day;
    const { width } = this.props.style;
    let changValue = null;
    document.onmousemove = event => {
      const originalLeft = event.clientX - x + width;
      const newWidth = isHours ? originalLeft : this.formatRemainder(originalLeft);
      if (newWidth < (isHours ? 5 : minDayWidth)) {
        return;
      }
      changValue = newWidth - width;
      const { left } = this.$ref.current.getBoundingClientRect();
      const [start, end] = this.getEndTime(changValue);
      this.setState({
        tooltipVisible: true,
        tooltipLeft: event.clientX - left - newWidth / 2,
        currentChangeStartTime: start,
        currentChangeEndTime: end,
      });
      this.$ref.current.style.width = `${newWidth}px`;
    };
    document.onmouseup = () => {
      changValue && this.handleChangeEnd(changValue);
      this.setState({ tooltipVisible: false, currentChangeStartTime: null, currentChangeEndTime: null });
      window.isDrag = changValue ? true : false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  handleMouseEnter = event => {
    const { style } = this.props;
    const el = event.target.classList.contains('recordTitle') ? event.target.parentNode : event.target;
    const { left } = el.getBoundingClientRect();
    this.setState({
      tooltipLeft: event.clientX - left - style.width / 2,
    });
  };
  getTooltipText(isMilepost) {
    const { row } = this.props;
    const { currentChangeStartTime, currentChangeEndTime } = this.state;
    const startTime = currentChangeStartTime || row.startTime;
    const endTime = currentChangeEndTime || row.endTime;
    const diff = moment(endTime).diff(moment(startTime), 'd') + 1;
    const day = isMilepost ? '' : _l('%0天', diff);

    if (moment(startTime).format('YYYY/MM') === moment(endTime).format('YYYY/MM')) {
      return `${moment(startTime).format('MM/DD')}-${moment(endTime).format('DD')} ${day}`;
    }
    if (moment(startTime).year() === moment(endTime).year()) {
      return `${moment(startTime).format('MM/DD')}-${moment(endTime).format('MM/DD')} ${day}`;
    }

    return `${moment(startTime).format('YYYY/MM/DD')}-${moment(endTime).format('YYYY/MM/DD')} ${day}`;
  }
  renderMilepost(color) {
    return (
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
        <path
          fill={color}
          d="M571.733333 153.6l298.666667 298.666667c34.133333 34.133333 34.133333 85.333333 0 119.466666l-298.666667 298.666667c-34.133333 34.133333-85.333333 34.133333-119.466666 0l-298.666667-298.666667c-34.133333-34.133333-34.133333-85.333333 0-119.466666l298.666667-298.666667c34.133333-34.133333 85.333333-34.133333 119.466666 0z"
        ></path>
      </svg>
    );
  }
  renderTitle() {
    const { row, controls, viewConfig } = this.props;
    const titleControl = _.find(controls, { attribute: 1 });
    const value = row[titleControl.controlId] || row.titleValue;
    const emptyValue = _l('未命名');
    const title = _.get(viewConfig, 'viewtitle')
      ? renderTitleByViewtitle(row, controls, { advancedSetting: { viewtitle: _.get(viewConfig, 'viewtitle') } })
      : titleControl
        ? renderCellText({ ...titleControl, value })
        : emptyValue;
    return <span className="recordTitle overflow_ellipsis">{title || emptyValue}</span>;
  }
  render() {
    const { tooltipVisible } = this.state;
    const { row, style, onClick, viewConfig, searchRecordId, disable } = this.props;
    const { milepost, startDisable, endDisable } = viewConfig;
    const { tooltipLeft } = this.state;
    const isMilepost = row[milepost] === '1';
    const dragDisable = disable || startDisable || endDisable;
    return (
      <Tooltip
        arrowPointAtCenter={true}
        title={this.getTooltipText(isMilepost)}
        align={{
          offset: [isMilepost ? 15 : tooltipLeft, 0],
        }}
        visible={tooltipVisible}
        onVisibleChange={tooltipVisible => {
          this.setState({ tooltipVisible });
        }}
      >
        <div
          ref={this.$ref}
          className={cx(isMilepost ? 'milepostRecordBlock' : 'recordBlock', { disable: dragDisable })}
          style={{
            backgroundColor: row.color,
            width: isMilepost ? 0 : style.width,
            left: style.left,
            top: isMilepost ? style.top - 7 : style.top,
          }}
          onMouseDown={dragDisable ? _.noop() : this.handleMouseDown}
          onMouseEnter={this.handleMouseEnter}
          onClick={onClick}
        >
          {row.rowid === searchRecordId && <Icon className={cx('forward', { isMilepost })} icon="forward1" />}
          {isMilepost && this.renderMilepost(row.color)}
          {!disable && !isMilepost && (
            <Fragment>
              {!startDisable && (
                <div
                  onMouseDown={this.handleMouseDownStart}
                  className="dragStart"
                  style={{ borderColor: row.color }}
                ></div>
              )}
              {!endDisable && (
                <div onMouseDown={this.handleMouseDownEnd} className="dragEnd" style={{ borderColor: row.color }}></div>
              )}
            </Fragment>
          )}
          {this.renderTitle()}
        </div>
      </Tooltip>
    );
  }
}
