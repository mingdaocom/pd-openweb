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
import { browserIsMobile } from 'src/util';

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
      value,
      from,
      controlName,
      advancedSetting = {},
      compProps = {},
    } = this.props;
    const allowweek = advancedSetting.allowweek || '1234567';
    const allowtime = advancedSetting.allowtime || '00:00-24:00';
    const timeinterval = advancedSetting.timeinterval || '1';

    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    let showTime;

    if (browserIsMobile()) {
      return (
        <MobileDatePicker
          className="customDatePicker"
          minDate={new Date(1900, 1, 1, 0, 0, 0)}
          maxDate={new Date(2100, 12, 31, 23, 59, 59)}
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
            return allowweek.indexOf(day === 0 ? '7' : day) === -1;
          }
        }}
        disabledTime={() => {
          return {
            disabledHours: () => {
              const start = parseInt(allowtime.split('-')[0]);
              const end = parseInt(allowtime.split('-')[1]);
              const result = [];

              for (let i = 0; i < 24; i++) {
                if (i < start || i >= end) {
                  result.push(i);
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
        onBlur={() => this.setState({ isFocus: false })}
        onChange={this.onChange}
        onOk={this.onChange}
        {...compProps}
      />
    );
  }
}
