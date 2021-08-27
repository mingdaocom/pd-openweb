import React, { Component } from 'react';
import { connect } from 'react-redux';
import config from '../../config/config';
import './timeAxis.less';
import utils from '../../utils/utils';

const { GRANULARITY, workingSumHours } = config;

class TimeAxis extends Component {
  constructor(props) {
    super(props);
    this.currentYear = moment().isoWeekYear();
  }

  componentDidUpdate() {
    utils.syncUpdateScroll();
  }

  getYearCount(dateList, currentView, filterWeekend) {
    return dateList.reduce((count, item) => {
      count += utils.singleTableWidth(currentView, filterWeekend, item);
      return count;
    }, 0);
  }

  adjustYear(time) {
    return this.currentYear == time.split('-')[0] ? moment(new Date(time.split('-').concat([1]))).format('MMM') : time.replace('-', '.');
  }

  getScrollValue() {
    return ($('.ganttMain .timeBarContainer').scrollLeft() || 0) * -1;
  }

  renderDays(currentView, timeAxisSource) {
    const filterWeekend = this.props.stateConfig.filterWeekend;
    const width = utils.singleTableWidth(currentView);
    const dayStyle = { width };
    const translateX = `translateX(${this.getScrollValue()}px)`;

    return (
      <div className="timeAxisContent">
        <div className="timeAxisContentScroll" style={{ width: utils.getViewSumWidth(currentView, timeAxisSource, filterWeekend), transform: translateX }}>
          <div className="timeAxisMonthsWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisMonths" style={{ width: width * item.dateList.length }} key={index}>
                {this.adjustYear(item.month)}
              </div>
            ))}
          </div>
          <div className="timeAxisDaysWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisDays" key={index}>
                {item.dateList.map((day, dayIndex) => (
                  <div className="timeAxisDay" style={dayStyle} key={dayIndex}>
                    <span>{moment(day).format('DD')}</span>
                    <span>{moment(day).format('dd')}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  renderWeeks(currentView, timeAxisSource) {
    const filterWeekend = this.props.stateConfig.filterWeekend;
    const width = utils.singleTableWidth(currentView, filterWeekend);
    const dayStyle = { width };
    const translateX = `translateX(${this.getScrollValue()}px)`;

    return (
      <div className="timeAxisContent">
        <div className="timeAxisContentScroll" style={{ width: utils.getViewSumWidth(currentView, timeAxisSource, filterWeekend) }}>
          <div className="timeAxisMonthsWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisMonths" style={{ width: width * item.dateList.length }} key={index}>
                {this.adjustYear(item.month)}
              </div>
            ))}
          </div>
          <div className="timeAxisDaysWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisDays" key={index}>
                {item.dateList.map((day, dayIndex) => (
                  <div className="timeAxisDay" style={dayStyle} key={dayIndex}>
                    <span>{`${moment(day[0]).format('DD')}~${moment(day[day.length - 1]).format('Do')}`}</span>
                    <span>{`${moment(day[0]).isoWeek()}${_l('周')}`}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  renderMonths(currentView, timeAxisSource) {
    const filterWeekend = this.props.stateConfig.filterWeekend;
    const translateX = `translateX(${this.getScrollValue()}px)`;

    return (
      <div className="timeAxisContent">
        <div className="timeAxisContentScroll" style={{ width: utils.getViewSumWidth(currentView, timeAxisSource, filterWeekend), transform: translateX }}>
          <div className="timeAxisMonthsWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisMonths" style={{ width: this.getYearCount(item.dateList, currentView, filterWeekend) }} key={index}>
                {item.year}
              </div>
            ))}
          </div>
          <div className="timeAxisDaysWrapper">
            {timeAxisSource.map((item, index) => (
              <div className="timeAxisDays" key={index}>
                {item.dateList.map((month, dayIndex) => (
                  <div className="timeAxisDay" style={{ width: utils.singleTableWidth(currentView, filterWeekend, month) }} key={dayIndex}>
                    <span>{moment(month).format('MMM')}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { stateConfig, timeAxisSource } = this.props;
    const { currentView } = stateConfig;

    return (
      <div className="timeAxis">
        {currentView === config.VIEWTYPE.DAY ? this.renderDays(currentView, timeAxisSource) : undefined}
        {currentView === config.VIEWTYPE.WEEK ? this.renderWeeks(currentView, timeAxisSource) : undefined}
        {currentView === config.VIEWTYPE.MONTH ? this.renderMonths(currentView, timeAxisSource) : undefined}
      </div>
    );
  }
}

export default connect((state) => {
  const { stateConfig, timeAxisSource } = state.task;

  return {
    stateConfig,
    timeAxisSource,
  };
})(TimeAxis);
