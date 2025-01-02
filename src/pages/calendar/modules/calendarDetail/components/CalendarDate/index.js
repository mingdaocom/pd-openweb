import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import RepeatBox from './RepeatBox';
import Icon from 'ming-ui/components/Icon';
import CheckBox from 'ming-ui/components/Checkbox';
import DatePicker from 'ming-ui/components/DatePicker';

const RangePicker = DatePicker.RangePicker;

import withClickAway from 'ming-ui/decorators/withClickAway';
import { formatShowTime, formatRecur } from '../../common';
import moment from 'moment';

@withClickAway
class EditBlock extends Component {
  constructor() {
    super();
    this.state = {
      unSelected: false,
    };
  }

  handleDateChange(selectValue) {
    const {
      calendar: { allDay },
      change,
    } = this.props;
    const [startTime, endTime] = selectValue;
    if (allDay) {
      startTime.startOf('day');
      endTime.endOf('day');
    }
    this.setState(
      {
        unSelected: false,
      },
      () => {
        change({
          start: startTime.format('YYYY-MM-DD HH:mm'),
          end: endTime.format('YYYY-MM-DD HH:mm'),
        });
      },
    );
  }

  renderResult() {
    const { unSelected } = this.state;
    if (unSelected) {
      return <span className="editWrapper">{_l('请选择')}</span>;
    } else {
      const {
        calendar: { start, end, allDay },
      } = this.props;
      const format = allDay ? 'YYYY-MM-DD (ddd)' : 'YYYY-MM-DD (ddd) HH:mm';
      return (
        <span className="editWrapper">
          {moment(start).format(format)}
          <span className="mLeft5 mRight5">{_l('至')}</span>
          {moment(end).format(format)}
        </span>
      );
    }
  }

  render() {
    const {
      calendar: { start, allDay, end, isChildCalendar },
      change,
    } = this.props;
    const { unSelected } = this.state;
    const rangePickerProps = {
      offset: {
        left: -48,
        top: 5,
      },
      popupParentNode: () => this.box,
      selectedValue: unSelected ? [] : [moment(start), moment(end)],
      timePicker: !allDay,
      onOk: selectValue => {
        this.handleDateChange(selectValue);
      },
      onClear: () => {
        this.setState({ unSelected: true });
      },
      autoFillEndTime: 1,
    };
    return (
      <div className="calLine pTop5 pBottom5">
        <div
          className="Relative"
          ref={el => {
            this.box = el;
          }}
        >
          <RangePicker {...rangePickerProps}>{this.renderResult()}</RangePicker>
        </div>

        <div className="LineHeight30">
          <span className="formLabel">{_l('全天:')}</span>
          <div className="FormControl TxtMiddle">
            <CheckBox
              checked={allDay}
              onClick={checked => {
                change({ allDay: !checked });
              }}
              className="TxtMiddle"
            />
          </div>
        </div>
        {!isChildCalendar ? <RepeatBox {...this.props} /> : null}
      </div>
    );
  }
}

export default class CalendarDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
  }

  componentWillUpdate() {
    if (!this.elem) return;
    this.origHeight = $(this.elem).height();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.elem) return;
    var $elem = $(this.elem);
    var height = this.origHeight;
    this.elem.style.height = 'auto';
    var _newHeight = $elem.height();
    if (_newHeight !== height) {
      $elem.height(height);
      $elem.width();
      $elem
        .height(_newHeight)
        .addClass('overflowHidden')
        .one('transitionend', function () {
          $elem.removeClass('overflowHidden');
        });
    }
  }

  handleClick() {
    const {
      calendar: { editable },
    } = this.props;
    if (typeof window.getSelection === 'function') {
      const selectText = window.getSelection().toString();
      if (selectText) return false;
    }
    if (editable && !this.state.isEditing) {
      this.setState({
        isEditing: true,
      });
    }
  }

  renderShowBlock() {
    const { calendar } = this.props;
    return (
      <div onClick={this.handleClick.bind(this)} className="pTop5 pBottom5 w100">
        <div className="calLine">{formatShowTime(calendar)}</div>
        {calendar.isRecur && !calendar.isChildCalendar ? (
          <div className="calLine">{_l('重复：%0', formatRecur(calendar))}</div>
        ) : null}
      </div>
    );
  }

  renderEditBlock() {
    return (
      <EditBlock
        {...this.props}
        onClickAway={() => this.setState({ isEditing: false })}
        ignoreOnHide={false}
        specialFilter={target => {
          const $el = $(target);
          return $el.closest('.warpDatePicker').length || $el.closest('.ui-timepicker-list').length;
        }}
      />
    );
  }

  render() {
    const { isEditing } = this.state;
    return (
      <div
        className={cx('calendarDate calRow', { isEditing })}
        ref={elem => {
          this.elem = elem;
        }}
      >
        <Icon icon={'bellSchedule'} className="Font19 calIcon" />
        {isEditing ? this.renderEditBlock() : this.renderShowBlock()}
      </div>
    );
  }
}
