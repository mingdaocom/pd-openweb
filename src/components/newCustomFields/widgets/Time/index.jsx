import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Icon, MdAntTimePicker, MobileDatePicker } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { FROM } from '../../tools/config';
import { getDynamicValue } from '../../tools/formUtils';

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
    showobileDatePicker: false,
  };

  onChange = value => {
    const mode = this.props.unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    if (value) {
      value = moment(moment(value).format('HH:mm:ss'), mode).format('HH:mm:ss');
    }

    this.props.onChange(value);
  };

  formatValueToMoment = value => {
    const { unit } = this.props;
    const mode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    return value ? (moment(value).year() ? moment(value) : moment(value, mode)) : '';
  };

  render() {
    const {
      dropdownClassName,
      disabled,
      unit,
      controlId,
      from,
      advancedSetting = {},
      compProps = {},
      formData,
      masterData,
      onBlur,
      controlName,
    } = this.props;

    const { originValue, showobileDatePicker } = this.state;
    let { value } = this.props;
    if (/^\d+$/.test(String(value)) && String(value).length < 5) {
      value = '';
    }
    value = this.formatValueToMoment(value);
    const timeInterval = parseInt(advancedSetting.timeinterval || '1');
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

    const timeArr = '00:00-24:00'.split('-');

    if (browserIsMobile()) {
      let formatMode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
      const currentMinute = moment().minute();
      const defaultValue =
        timeInterval === 1 ? new Date() : moment().minute(currentMinute - (currentMinute % timeInterval));

      return (
        <Fragment>
          <div
            className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}
            onClick={() => {
              !disabled && this.setState({ showobileDatePicker: true });
            }}
          >
            <span className={cx('flex mRight20 ellipsis', { Gray_bd: !value })}>
              {value ? value.format(formatMode) : _l('请选择日期')}
            </span>
            {!disabled && (
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'bellSchedule'}
                className="Font16 Gray_bd"
              />
            )}
          </div>
          {showobileDatePicker && (
            <MobileDatePicker
              minuteStep={timeInterval}
              customHeader={controlName}
              isOpen={showobileDatePicker}
              value={value || defaultValue}
              min={minDate ? new Date(moment(minDate)) : new Date(1900, 1, 1, 0, 0, 0)}
              max={maxDate ? new Date(moment(maxDate)) : new Date(2100, 12, 31, 23, 59, 59)}
              disabled={disabled}
              onClose={() => {
                this.setState({ showobileDatePicker: false });
              }}
              onSelect={date => {
                this.onChange(date);
                this.setState({ showobileDatePicker: false });
              }}
              onCancel={() => {
                this.setState({ showobileDatePicker: false });
                this.onChange(null);
              }}
              dateConfig={
                unit === '6'
                  ? {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: timeInterval,
                      },
                      second: {
                        format: _l('ss秒'),
                        caption: 'Second',
                        step: 1,
                      },
                    }
                  : {
                      hour: {
                        format: _l('hh时'),
                        caption: 'Hour',
                        step: 1,
                      },
                      minute: {
                        format: _l('mm分'),
                        caption: 'Min',
                        step: timeInterval,
                      },
                    }
              }
            />
          )}
        </Fragment>
      );
    }

    return (
      <MdAntTimePicker
        className={cx('w100 customAntPicker customFormControlBox', { controlDisabled: disabled })}
        disabled={disabled}
        value={value}
        format={unit === '6' ? 'HH:mm:ss' : 'HH:mm'}
        placeholder={this.state.isFocus ? (unit === '6' ? 'HH:mm:ss' : 'HH:mm') : _l('请选择时间')}
        suffixIcon={
          !disabled ? (
            <Icon
              icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'access_time'}
              className="Font14 Gray_bd"
            />
          ) : null
        }
        hideDisabledOptions
        minuteStep={timeInterval}
        disabledTime={current => {
          return {
            disabledHours: () => {
              const result = [];

              if (current && minDate) {
                for (let i = 0; i < 24; i++) {
                  if (i < this.formatValueToMoment(minDate).hour()) {
                    result.push(i);
                  }
                }
              }

              if (current && maxDate) {
                for (let i = 0; i < 24; i++) {
                  if (i > this.formatValueToMoment(maxDate).hour()) {
                    result.push(i);
                  }
                }
              }

              return result;
            },
            disabledMinutes: selectHours => {
              const result = [];

              if (current && minDate) {
                for (let i = 0; i < 60; i++) {
                  if (
                    selectHours === this.formatValueToMoment(minDate).hour() &&
                    i < this.formatValueToMoment(minDate).minute()
                  ) {
                    result.push(i);
                  }
                }
              }

              if (current && maxDate) {
                for (let i = 0; i < 60; i++) {
                  if (
                    selectHours === this.formatValueToMoment(maxDate).hour() &&
                    i > this.formatValueToMoment(maxDate).minute()
                  ) {
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
