import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DateTimeRange } from 'ming-ui/components/NewDateTimePicker';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { FROM } from '../../../core/config';
import _ from 'lodash';
import moment from 'moment';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    type: PropTypes.number,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  onChange = value => {
    const { type } = this.props;
    const formatText = type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';

    if (value) {
      value = JSON.stringify([value[0].format(formatText), value[1].format(formatText)]);
    }

    this.props.onChange(value);
  };

  duration() {
    const { type } = this.props;
    const value = JSON.parse(this.props.value || JSON.stringify(['', '']));
    let lengthText = '';

    if (value[0]) {
      const start = moment(value[0]);
      const end = moment(value[1]);
      const unit = _l('天');
      const length = end.diff(start, 'days') + 1;

      if (type === 17) {
        lengthText = ` ${_l('时长')}: ${length} ${unit}`;
      } else {
        const time = new Date(value[1]).getTime() - new Date(value[0]).getTime();
        // 计算出相差天数
        const days = Math.floor(time / (24 * 3600 * 1000));
        // 计算出小时数
        const leave1 = time % (24 * 3600 * 1000);
        // 计算天数后剩余的毫秒数
        const hours = Math.floor(leave1 / (3600 * 1000));
        // 计算相差分钟数
        const leave2 = leave1 % (3600 * 1000);
        // 计算小时数后剩余的毫秒数
        const minutes = Math.floor(leave2 / (60 * 1000));

        lengthText = ` ${_l('时长')}: ${days > 0 ? _l('%0天', days) : ''} ${hours > 0 ? _l('%0小时', hours) : ''} ${minutes > 0 ? _l('%0分钟', minutes) : ''} `;
      }
    }

    return lengthText;
  }

  render() {
    const { disabled, type, from } = this.props;
    const value = JSON.parse(this.props.value || JSON.stringify(['', '']));
    const start = value[0] ? moment(value[0]) : null;
    const end = value[1] ? moment(value[1]) : null;
    const formatText = type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';
    const durationText = this.duration();

    return (
      <DateTimeRange
        disabled={disabled}
        selectedValue={start ? [start, end] : null}
        timePicker={type === 18}
        timeMode="minute"
        placeholder=""
        onOk={this.onChange}
        onClear={() => this.onChange('')}
      >
        <div className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}>
          <span className={cx('flex mRight20 ellipsis', { Gray_bd: !start })}>
            {start && end ? `${start.format(formatText)} ~ ${end.format(formatText)}` : _l('请选择日期')}
            {durationText && <span className="mLeft5">{durationText}</span>}
          </span>

          {!disabled && <Icon icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'} className="Font16 Gray_bd" />}
        </div>
      </DateTimeRange>
    );
  }
}
