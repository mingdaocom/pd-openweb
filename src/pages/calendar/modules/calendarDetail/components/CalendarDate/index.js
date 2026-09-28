import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { Checkbox, DatePicker } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import Icon from 'ming-ui/components/Icon';
import { formatRecur, formatShowTime } from '../../common';
import RepeatBox from './RepeatBox';

const TIME_PICKER_CONFIG = { format: 'HH:mm' };
const RANGE_PICKER_CLASS_NAMES = { popup: { root: 'calendarDateRangePickerPopup' } };

let EditBlock = class EditBlock extends Component {
  constructor() {
    super();
    this.state = {
      unSelected: false,
    };
  }

  handleDateChange(selectValue) {
    const {
      calendar: { allDay, start, end },
      change,
    } = this.props;
    let [startTime, endTime] = selectValue.map(value => value.clone());

    if (allDay) {
      startTime.startOf('day');
      endTime.endOf('day');
    } else if (
      startTime.isSame(start, 'day') &&
      !startTime.isSame(start, 'minute') &&
      endTime.isSame(end, 'minute') &&
      startTime.isSame(endTime, 'day')
    ) {
      endTime = startTime.clone().add(1, 'hour');
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

  render() {
    const {
      calendar: { start, allDay, end, isChildCalendar },
      change,
    } = this.props;
    const { unSelected } = this.state;

    return (
      <div className="calLine pTop5 pBottom5">
        <DatePicker.RangePicker
          variant="borderless"
          classNames={RANGE_PICKER_CLASS_NAMES}
          format={allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
          showTime={allDay ? false : TIME_PICKER_CONFIG}
          value={unSelected ? null : [moment(start), moment(end)]}
          onChange={range => {
            if (!range) {
              this.setState({ unSelected: true });
              return;
            }

            if (range[0] && range[1]) {
              this.handleDateChange(range);
            }
          }}
        />

        <div className="LineHeight30">
          <span className="formLabel">{_l('全天:')}</span>
          <div className="FormControl TxtMiddle">
            <Checkbox
              checked={allDay}
              onChange={event => {
                change({
                  allDay: event.target.checked,
                });
              }}
              className="TxtMiddle"
            />
          </div>
        </div>
        {!isChildCalendar ? <RepeatBox {...this.props} /> : null}
      </div>
    );
  }
};
EditBlock = ClickAway.wrap(EditBlock);
export default class CalendarDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
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
        onClickAway={() =>
          this.setState({
            isEditing: false,
          })
        }
        specialFilter={target => {
          if (!(target instanceof Element)) return false;
          return (
            !!target.closest('.calendarDateRangePickerPopup') ||
            !!target.closest('.calendarRepeatDatePickerPopup') ||
            !!target.closest('.calendarRepeatSelectPopup') ||
            !!target.closest('.ui-timepicker-list')
          );
        }}
      />
    );
  }

  render() {
    const { isEditing } = this.state;
    return (
      <div className={cx('calendarDate calRow', { isEditing })}>
        <Icon icon={'bellSchedule'} className="Font19 calIcon" />
        {isEditing ? this.renderEditBlock() : this.renderShowBlock()}
      </div>
    );
  }
}
