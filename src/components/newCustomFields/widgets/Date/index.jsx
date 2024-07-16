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
import { browserIsMobile, dateConvertToUserZone, dateConvertToServerZone } from 'src/util';
import { getDatePickerConfigs, getDateToEn, getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import moment from 'moment';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

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
    notConvertZone: PropTypes.bool,
  };

  static defaultProps = {
    onBlur: () => {},
  };

  state = {
    originValue: '',
    dateProps: getDatePickerConfigs(this.props),
    showDatePicker: false,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.advancedSetting || {}).showtype !== (this.props.advancedSetting || {}).showtype) {
      this.setState({ dateProps: getDatePickerConfigs(nextProps) });
    }
  }

  onChange = value => {
    const { type, notConvertZone } = this.props;
    const { dateProps = {} } = this.state;

    if (value) {
      const date = moment(moment(value).format(dateProps.formatMode));
      value =
        type === 15
          ? date.format('YYYY-MM-DD')
          : notConvertZone
          ? date.format('YYYY-MM-DD HH:mm:ss')
          : dateConvertToServerZone(date);
    }

    this.props.onChange(value);
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  renderIcon = value => {
    const { disabled, hideIcon, onChange } = this.props;
    if (!disabled && !hideIcon) {
      if (browserIsMobile()) {
        return <Icon icon="arrow-right-border" className="Font16 Gray_bd" />;
      } else {
        return (
          <Fragment>
            {value && (
              <Icon
                icon="cancel"
                className="Font14 dateClearIcon"
                onClick={e => {
                  e.stopPropagation();
                  onChange('');
                }}
              />
            )}
            <Icon icon="bellSchedule" className="Font14 Gray_bd bellScheduleIcon" />
          </Fragment>
        );
      }
    }
    return null;
  };

  renderValue = (showformat, value) => {
    const { disabled, from, type, notConvertZone, advancedSetting, hideIcon } = this.props;
    const dateTime = type === 15 || notConvertZone ? value : dateConvertToUserZone(value);

    return (
      <div
        className={cx('customFormControlBox flexRow flexCenter', { controlDisabled: disabled, dateTimeIcon: value })}
        onClick={() => {
          !disabled && this.setState({ showDatePicker: true });
        }}
      >
        <span className={cx('flex ellipsis', { Gray_bd: !value })}>
          {value ? getDateToEn(showformat, dateTime, advancedSetting.showformat) : _l('请选择日期')}
        </span>
        {this.renderIcon(value)}
      </div>
    );
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
      notConvertZone,
      hideIcon = false,
    } = this.props;
    const { originValue, dateProps = {}, showDatePicker } = this.state;
    let { value } = this.props;
    if (/^\d+$/.test(String(value)) && String(value).length < 5) {
      value = '';
    }
    const showformat = getShowFormat(this.props);
    const allowweek = advancedSetting.allowweek || '1234567';
    const allowtime = advancedSetting.allowtime || '00:00-24:00';
    const timeInterval = parseInt(advancedSetting.timeinterval || '1');
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

    const dateTime = value ? (type === 15 || notConvertZone ? value : dateConvertToUserZone(value)) : '';

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
          {this.renderValue(showformat, value)}
          {showDatePicker && (
            <MobileDatePicker
              minuteStep={timeInterval}
              customHeader={controlName}
              isOpen={showDatePicker}
              precision={precision}
              value={dateTime}
              min={minDate ? new Date(moment(minDate)) : new Date(1900, 1, 1, 0, 0, 0)}
              max={maxDate ? new Date(moment(maxDate)) : new Date(2100, 12, 31, 23, 59, 59)}
              disabled={disabled}
              onSelect={date => {
                this.onChange(date);
                this.setState({ showDatePicker: false });
              }}
              onCancel={() => {
                this.setState({ showDatePicker: false });
                this.onChange(null);
              }}
            ></MobileDatePicker>
          )}
        </Fragment>
      );
    }

    // 特殊处理，中文环境下聚焦始终以控件基础格式显示
    const isLocalFormat = _.includes(['zh-Hans', 'zh-Hant'], lang) && showDatePicker;
    const focusFormat = isLocalFormat ? _.get(getDatePickerConfigs(this.props), 'formatMode') : showformat;

    let showTime;
    const timeArr = allowtime.split('-');
    if (type === 16 && this.props.showTime !== false) {
      showTime = {
        defaultValue:
          parseInt(timeArr[0]) === 0 && parseInt(timeArr[1]) === 24 ? moment() : moment(timeArr[0], 'HH:mm'),
      };
    }

    const isOpen = showDatePicker || compProps.showDatePicker;

    return (
      <Fragment>
        {!isOpen ? (
          this.renderValue(showformat, value)
        ) : (
          <PCDatePicker
            className={cx('w100 customAntPicker customFormControlBox', { controlDisabled: disabled })}
            locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN}
            disabled={disabled}
            value={value ? moment(dateTime) : ''}
            picker={dateProps.mode === 'datetime' ? 'date' : dateProps.mode}
            showTime={showTime || false}
            format={focusFormat}
            open={true}
            placeholder={showformat}
            autoFocus
            suffixIcon={
              !disabled && !hideIcon ? (
                <Icon
                  icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
                  className="Font14 Gray_bd"
                />
              ) : null
            }
            hideDisabledOptions
            minuteStep={timeInterval}
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
              this.setState({ showDatePicker: open });
            }}
            onFocus={e => this.setState({ originValue: e.target.value.trim() })}
            onBlur={() => {
              onBlur(originValue);
            }}
            onChange={this.onChange}
            {...compProps}
          />
        )}
      </Fragment>
    );
  }
}
