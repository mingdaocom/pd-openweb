import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { DatePicker } from 'ming-ui/antd-components';
import { FROM } from '../../../core/config';

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';
const DATE_TIME_PICKER_CONFIG = { format: 'HH:mm' };

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
    const formatText = type === 17 ? DATE_FORMAT : DATE_TIME_FORMAT;

    if (value) {
      value = JSON.stringify([value[0].format(formatText), value[1].format(formatText)]);
    } else {
      value = '';
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
    const formatText = type === 17 ? DATE_FORMAT : DATE_TIME_FORMAT;
    const durationText = this.duration();

    return (
      <DatePicker.RangePicker
        allowClear={!disabled}
        className={cx('w100 customFormControlBox', { controlDisabled: disabled })}
        disabled={disabled}
        format={formatText}
        inputReadOnly
        needConfirm
        placeholder={[_l('开始日期'), _l('结束日期')]}
        separator="~"
        showNow={false}
        showTime={type === 18 ? DATE_TIME_PICKER_CONFIG : false}
        suffixIcon={
          durationText || !disabled ? (
            <React.Fragment>
              {durationText && <span className="Font13 textSecondary mRight5">{durationText}</span>}
              {!disabled && (
                <Icon
                  icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
                  className="Font16 textDisabled"
                />
              )}
            </React.Fragment>
          ) : null
        }
        value={start && end ? [start, end] : null}
        onChange={this.onChange}
      />
    );
  }
}
