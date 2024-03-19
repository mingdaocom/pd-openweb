import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Icon, MobileDatePicker } from 'ming-ui';
import cx from 'classnames';
import { DatePicker as PCDatePicker } from 'antd';
import { FROM } from '../../tools/config';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import { getDynamicValue } from '../../tools/DataFormat';
import { compareWithTime } from '../../tools/utils';
import { browserIsMobile } from 'src/util';
import { getDatePickerConfigs, getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import moment from 'moment';
import _ from 'lodash';

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
    originValue: '',
    dateProps: getDatePickerConfigs(this.props),
    showMobileDatePicker: false,
  };

  componentWillReceiveProps(nextProps) {
    if ((nextProps.advancedSetting || {}).showtype !== (this.props.advancedSetting || {}).showtype) {
      this.setState({ dateProps: getDatePickerConfigs(nextProps) });
    }
  }

  onChange = value => {
    const { type } = this.props;
    const { dateProps = {} } = this.state;

    if (value) {
      value = moment(moment(value).format(dateProps.formatMode)).format(
        type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
      );
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
    const { originValue, dateProps = {}, isFocus } = this.state;
    let { value } = this.props;
    if (/^\d+$/.test(String(value)) && String(value).length < 5) {
      value = '';
    }
    const showformat = getShowFormat(this.props);
    const allowweek = advancedSetting.allowweek || '1234567';
    const allowtime = advancedSetting.allowtime || '00:00-24:00';
    const timeinterval = advancedSetting.timeinterval || '1';
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    const isLocalFormat = _.includes(['zh-Hans', 'zh-Hant'], lang) && isFocus;
    const focusFormat = isLocalFormat ? _.get(getDatePickerConfigs(this.props), 'formatMode') : showformat;
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
      let mobileMode =
        dateProps.formatMode === 'YYYY-MM-DD HH'
          ? 'hour'
          : dateProps.formatMode === 'YYYY-MM-DD HH:mm'
          ? 'minite'
          : 'second';
      let precision =
        dateProps.mode === 'year' || dateProps.mode === 'month' || dateProps.mode === 'date'
          ? dateProps.mode
          : mobileMode;
      return (
        <Fragment>
          <div
            className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}
            onClick={
              disabled
                ? () => {}
                : () => {
                    this.setState({ showMobileDatePicker: true });
                  }
            }
          >
            <span className={cx('flex mRight20 ellipsis', { Gray_bd: !value })}>
              {value ? moment(value).format(showformat) : _l('请选择日期')}
            </span>
            {!disabled && (
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
                className="Font16 Gray_bd"
              />
            )}
          </div>
          {this.state.showMobileDatePicker && (
            <MobileDatePicker
              customHeader={controlName}
              isOpen={this.state.showMobileDatePicker}
              precision={precision}
              value={value ? new Date(moment(value)) : new Date()}
              min={minDate ? new Date(moment(minDate)) : new Date(1900, 1, 1, 0, 0, 0)}
              max={maxDate ? new Date(moment(maxDate)) : new Date(2100, 12, 31, 23, 59, 59)}
              disabled={disabled}
              onSelect={date => {
                this.onChange(date);
                this.setState({ showMobileDatePicker: false });
              }}
              onCancel={() => {
                this.setState({ showMobileDatePicker: false });
                this.onChange(null);
              }}
            ></MobileDatePicker>
          )}
        </Fragment>
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
        locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
        disabled={disabled}
        value={value ? moment(value) : ''}
        picker={dateProps.mode === 'datetime' ? 'date' : dateProps.mode}
        showTime={showTime || false}
        format={focusFormat}
        placeholder={this.state.isFocus ? showformat : _l('请选择日期')}
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
        onFocus={e => this.setState({ isFocus: true, originValue: e.target.value.trim() })}
        onBlur={() => {
          this.setState({ isFocus: false });
          onBlur(originValue);
        }}
        onChange={this.onChange}
        {...compProps}
      />
    );
  }
}
