import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import DatePicker from 'ming-ui/components/DatePicker';
import Dropdown from 'ming-ui/components/Dropdown';
import { formatRecur } from '../../common';
import { FREQUENCY, RECURLAYERS, RECURTYPE, WEEKDAYS } from '../../constant';

export default class RepeatBox extends Component {
  static propTypes = {
    change: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
  }
  /**
   * eventHandlers
   */
  // 修改重复方式
  changeFrequency(value) {
    this.props.change({
      isRecur: FREQUENCY.NONE !== +value,
      frequency: +value,
    });
  }
  // 修改重复间隔
  changeInterval(event) {
    const value = parseInt(event.target.value, 10);
    this.props.change({
      interval: isNaN(value) || value <= 0 ? 1 : Math.min(value, 99),
    });
  }

  // 修改星期
  changeWeekDay(event) {
    const {
      calendar: { weekDay },
    } = this.props;
    let weekDayArray = weekDay ? weekDay.split(',').sort((a, b) => a - b) : [];
    const value = event.target.getAttribute('value');
    const isInArray = weekDayArray.indexOf(value) !== -1;
    if (isInArray) {
      weekDayArray = _.without(weekDayArray, value);
    } else {
      _.chain(weekDayArray)
        .push(value)
        .sort((a, b) => a - b)
        .commit();
    }
    this.props.change({
      weekDay: weekDayArray.join(','),
    });
  }

  // 修改重复日程结束
  changeRecur(value) {
    this.props.change({
      recurType: value,
    });
  }

  // 修改重复次数
  changeRecurCount(event) {
    const value = parseInt(event.target.value, 10);
    this.props.change({
      recurCount: isNaN(value) || value <= 0 ? 1 : Math.min(value, 99),
    });
  }

  /**
   * render functions
   */
  renderFrequency() {
    const {
      calendar: { frequency },
    } = this.props;
    // dropDown props required value is string
    const data = [
      { text: _l('无'), value: FREQUENCY.NONE + '' },
      { text: _l('每天'), value: FREQUENCY.DAY + '' },
      { text: _l('每周'), value: FREQUENCY.WEEK + '' },
      { text: _l('每月'), value: FREQUENCY.MONTH + '' },
      { text: _l('每年'), value: FREQUENCY.YEAR + '' },
    ];
    const dropDownProps = {
      data,
      value: frequency + '',
      onChange: this.changeFrequency.bind(this),
      key: 'frequency-input',
    };
    return (
      <div>
        <div className="LineHeight30">
          <span className="formLabel">{_l('重复:')}</span>
          <Dropdown {...dropDownProps} />
        </div>
        {frequency === FREQUENCY.NONE ? null : this.renderInterval()}
        {frequency === FREQUENCY.NONE ? null : this.renderRecur()}
      </div>
    );
  }

  renderInterval() {
    const {
      calendar: { frequency, interval },
    } = this.props;
    const suffix = RECURLAYERS[frequency - 1];
    return (
      <div className="LineHeight30">
        <span className="formLabel">{_l('频率:')}</span>
        <div className="FormControl">
          {_l('每')}
          <input
            type="text"
            className="intervalBox ThemeBorderColor3"
            value={interval}
            onChange={this.changeInterval.bind(this)}
          />
          {suffix}
          {this.renderWeekDay(frequency)}
        </div>
      </div>
    );
  }

  renderWeekDay() {
    const {
      calendar: { frequency, weekDay },
    } = this.props;
    const weekDayArray = weekDay ? weekDay.split(',').sort((a, b) => a - b) : [];
    if (frequency !== FREQUENCY.WEEK) return null;
    return (
      <span className="weekDaysContainer">
        {WEEKDAYS.map((day, index) => {
          const isSelected = weekDayArray.indexOf('' + index) !== -1;
          return (
            <span
              className={cx('weekday', { ThemeBGColor3: isSelected })}
              onClick={this.changeWeekDay.bind(this)}
              value={index}
              key={index}
            >
              {day}
            </span>
          );
        })}
      </span>
    );
  }

  renderRecur() {
    const {
      calendar: { recurType },
    } = this.props;
    // dropDown props required value is string
    const data = [
      { text: _l('永不'), value: RECURTYPE.NONE },
      { text: _l('次数'), value: RECURTYPE.COUNT },
      { text: _l('日期'), value: RECURTYPE.DATE },
    ];
    const dropDownProps = {
      data,
      value: recurType,
    };
    return (
      <div className="LineHeight30">
        <span className="formLabel">{_l('结束:')}</span>
        <Dropdown {...dropDownProps} onChange={this.changeRecur.bind(this)} key="recur-input" />
        {recurType === RECURTYPE.NONE ? null : this.renderRecurEdit()}
      </div>
    );
  }

  renderRecurEdit() {
    const {
      calendar: { end, recurType, recurCount, untilDate },
    } = this.props;
    if (recurType === RECURTYPE.COUNT) {
      return (
        <span className="mLeft10">
          {_l('发生')}
          <input
            type="text"
            className="recurCountBox ThemeBorderColor3"
            value={recurCount}
            onChange={this.changeRecurCount.bind(this)}
          />
          次后
        </span>
      );
    } else {
      return (
        <span
          className="mLeft10 Relative untilDateBox ThemeBorderColor3"
          ref={el => {
            this.untilDateBox = el;
          }}
        >
          <DatePicker
            popupParentNode={() => this.untilDateBox}
            format={'YYYY-MM-DD'}
            selectedValue={moment(untilDate)}
            disabledDate={date => {
              if (date.isSameOrBefore(moment(end), 'day')) return true;
            }}
            onSelect={selectDate => {
              if (selectDate) {
                this.props.change({
                  untilDate: selectDate.format('YYYY-MM-DD'),
                });
              } else {
                this.props.change({
                  untilDate: '0',
                });
              }
            }}
          />
        </span>
      );
    }
  }

  render() {
    const {
      calendar: { isChildCalendar, frequency },
    } = this.props;
    if (isChildCalendar) return null;
    return (
      <div>
        {this.renderFrequency()}
        {frequency !== FREQUENCY.NONE ? (
          <div className="LineHeight30">
            <span className="formLabel Gray">{_l('结果:')}</span>
            {formatRecur(this.props.calendar)}
          </div>
        ) : null}
      </div>
    );
  }
}
