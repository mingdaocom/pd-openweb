import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { DatePicker as PCDatePicker } from 'antd';
import { DatePicker as MobileDatePicker } from 'antd-mobile';
import { FROM } from '../../tools/config';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import { getDynamicValue } from '../../tools/DataFormat';
import { compareWithTime } from '../../tools/utils';
import { browserIsMobile } from 'src/util';
import moment from 'moment';

export default class Widgets extends Component {
  static propTypes = {
    dropdownClassName: PropTypes.string,
    advancedSetting: PropTypes.object,
    from: PropTypes.number,
    type: PropTypes.number,
    disabled: PropTypes.bool,
    controlId: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    masterData: PropTypes.object,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    onBlur: () => {},
  };

  state = {
    isFocus: false,
  };

  onChange = value => {
    const { type } = this.props;

    if (value) {
      value = moment(value).format(type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    }

    this.props.onChange(value);
  };

  render() {
    const {
      dropdownClassName,
      disabled,
      type,
      controlId,
      from,
      controlName,
      advancedSetting = {},
      compProps = {},
      formData,
      masterData,
      onBlur,
    } = this.props;
    let { value } = this.props;
    if (/^\d+$/.test(String(value)) && String(value).length < 5) {
      value = '';
    }
    const allowweek = advancedSetting.allowweek || '1234567';
    const allowtime = advancedSetting.allowtime || '00:00-24:00';
    const timeinterval = advancedSetting.timeinterval || '1';
    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    let showTime;
    let minDate;
    let maxDate;

    if (advancedSetting.min) {
      minDate = getDynamicValue(
        formData,
        Object.assign({}, this.props, { advancedSetting: { defsource: advancedSetting.min } }),
        masterData,
      );
    }

    if (advancedSetting.max) {
      maxDate = getDynamicValue(
        formData,
        Object.assign({}, this.props, { advancedSetting: { defsource: advancedSetting.max } }),
        masterData,
      );
    }

    if (browserIsMobile()) {
      return (
        <MobileDatePicker
          className="customDatePicker"
          minDate={minDate ? new Date(moment(minDate)) : new Date(1900, 1, 1, 0, 0, 0)}
          maxDate={maxDate ? new Date(moment(maxDate)) : new Date(2100, 12, 31, 23, 59, 59)}
          mode={type === 15 ? 'date' : 'datetime'}
          minuteStep={parseInt(timeinterval)}
          value={value ? new Date(moment(value)) : ''}
          disabled={disabled}
          title={controlName}
          onOk={this.onChange}
        >
          <div className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}>
            <span className={cx('flex mRight20 ellipsis', { Gray_bd: !value })}>
              {value ? moment(value).format(type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm') : _l('请选择日期')}
            </span>
            {!disabled && (
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
                className="Font16 Gray_bd"
              />
            )}
          </div>
        </MobileDatePicker>
      );
    }

    const timeArr = allowtime.split('-');
    if (type === 16) {
      showTime = {
        defaultValue:
          parseInt(timeArr[0]) === 0 && parseInt(timeArr[1]) === 24 ? moment() : moment(timeArr[0], 'HH:mm'),
      };
    }

    return (
      <PCDatePicker
        className={cx('w100 customAntPicker customFormControlBox', { controlDisabled: disabled })}
        locale={lang === 'en' ? en_US : lang === 'zh-Hant' ? zh_TW : zh_CN}
        disabled={disabled}
        value={value ? moment(value) : ''}
        showTime={showTime || false}
        format={type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'}
        placeholder={this.state.isFocus ? (type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') : _l('请选择日期')}
        suffixIcon={
          !disabled ? (
            <Icon
              icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
              className="Font14 Gray_bd"
            />
          ) : null
        }
        hideDisabledOptions
        minuteStep={parseInt(timeinterval)}
        disabledDate={currentDate => {
          if (currentDate) {
            const day = currentDate.day();
            let isBetween = true;

            if (minDate && isBetween) {
              isBetween = currentDate.isSameOrAfter(moment(minDate), 'day');
            }

            if (maxDate && isBetween) {
              isBetween = currentDate.isSameOrBefore(moment(maxDate), 'day');
            }

            return allowweek.indexOf(day === 0 ? '7' : day) === -1 || !isBetween;
          }
        }}
        disabledTime={current => {
          return {
            disabledHours: () => {
              const start = parseInt(allowtime.split('-')[0]);
              const end = allowtime.split('-')[1];
              const result = [];

              for (let i = 0; i < 24; i++) {
                if (i < start || compareWithTime(`${i}:00`, end, 'isAfter')) {
                  result.push(i);
                }
              }

              if (current && minDate && moment(current).isSame(moment(minDate), 'day')) {
                for (let i = 0; i < 24; i++) {
                  if (minDate.split(' ')[1] && i < moment(minDate).hour()) {
                    result.push(i);
                  }
                }
              }

              if (current && maxDate && moment(current).isSame(moment(maxDate), 'day')) {
                for (let i = 0; i < 24; i++) {
                  if (maxDate.split(' ')[1] && i > moment(maxDate).hour()) {
                    result.push(i);
                  }
                }
              }

              return result;
            },
            disabledMinutes: selectHours => {
              let start = allowtime.split('-')[0];
              const end = allowtime.split('-')[1];
              const result = [];

              for (let i = 0; i < 60; i++) {
                if (
                  compareWithTime(`${selectHours}:${i}`, start, 'isBefore') ||
                  compareWithTime(`${selectHours}:${i}`, end, 'isAfter')
                ) {
                  result.push(i);
                }
              }

              if (current && minDate && moment(current).isSame(moment(minDate), 'day')) {
                for (let i = 0; i < 60; i++) {
                  if (moment(current).hour() === moment(maxDate).hour() && i < moment(minDate).minute()) {
                    result.push(i);
                  }
                }
              }

              if (current && maxDate && moment(current).isSame(moment(maxDate), 'day')) {
                for (let i = 0; i < 60; i++) {
                  if (moment(current).hour() === moment(maxDate).hour() && i > moment(maxDate).minute()) {
                    result.push(i);
                  }
                }
              }

              return result;
            },
          };
        }}
        dropdownClassName={`customAntPicker_${controlId} ${dropdownClassName || ''}`}
        onOpenChange={open => {
          if (open && parseInt(timeArr[0]) === 0 && parseInt(timeArr[1]) === 24) {
            setTimeout(() => {
              $(`.customAntPicker_${controlId}`).find('.ant-picker-time-panel-column:first').scrollTop(220);
            }, 200);
          }
        }}
        onFocus={() => this.setState({ isFocus: true })}
        onBlur={() => {
          this.setState({ isFocus: false });
          onBlur();
        }}
        onChange={this.onChange}
        onOk={this.onChange}
        {...compProps}
      />
    );
  }
}
