import React, { useEffect, useState, memo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, MobileDatePicker } from 'ming-ui';
import { getDynamicValue } from '../../../core/formUtils';
import moment from 'moment';
import cx from 'classnames';

const Time = props => {
  const {
    value,
    controlName,
    formData,
    masterData,
    formDisabled,
    disabled,
    advancedSetting = {},
    unit,
  } = props;
  const timeInterval = parseInt(advancedSetting.timeinterval || '1');
  const currentMinute = moment().minute();
  const defaultValue =
    timeInterval === 1 ? new Date() : moment().minute(currentMinute - (currentMinute % timeInterval));
  const formatMode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentValue, setCurrentValue] = useState('');
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  const onChange = value => {
    const mode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    if (value) {
      value = moment(moment(value).format('HH:mm:ss'), mode).format('HH:mm:ss');
    }

    props.onChange(value);
  };

  const formatValueToMoment = value => {
    const mode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    return value ? (moment(value).year() ? moment(value) : moment(value, mode)) : '';
  };

  useEffect(() => {
    let _value = value;
    if (/^\d+$/.test(String(_value)) && String(_value).length < 5) {
      _value = '';
    }
    setCurrentValue(formatValueToMoment(_value));
  }, [value]);

  useEffect(() => {
    if (advancedSetting.min) {
      setMinDate(
        getDynamicValue(
          formData,
          Object.assign({}, props, { advancedSetting: { defsource: advancedSetting.min } }),
          masterData,
        ),
      );
    }
  }, [formData, masterData, advancedSetting.min]);

  useEffect(() => {
    if (advancedSetting.max) {
      setMaxDate(
        getDynamicValue(
          formData,
          Object.assign({}, props, { advancedSetting: { defsource: advancedSetting.max } }),
          masterData,
        ),
      );
    }
  }, [formData, masterData, advancedSetting.max]);

  return (
    <Fragment>
      <div
        className={cx('customFormControlBox flexRow flexCenter', {
          controlEditReadonly: !formDisabled && currentValue && disabled,
          controlDisabled: formDisabled,
        })}
        onClick={() => {
          !disabled && setShowTimePicker(true);
        }}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !currentValue })}>
          {currentValue && currentValue.format ? currentValue.format(formatMode) : _l('请选择时间')}
        </span>
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>
      {showTimePicker && (
        <MobileDatePicker
          minuteStep={timeInterval}
          customHeader={controlName}
          isOpen={showTimePicker}
          value={currentValue || defaultValue}
          min={minDate ? new Date(moment(minDate)) : new Date(1900, 1, 1, 0, 0, 0)}
          max={maxDate ? new Date(moment(maxDate)) : new Date(2100, 12, 31, 23, 59, 59)}
          disabled={disabled}
          onClose={() => {
            setShowTimePicker(false);
          }}
          onSelect={date => {
            onChange(date);
            setShowTimePicker(false);
          }}
          onCancel={() => {
            setShowTimePicker(false);
            onChange(null);
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
};

Time.propTypes = {
  advancedSetting: PropTypes.object,
  from: PropTypes.number,
  type: PropTypes.number,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  masterData: PropTypes.object,
  formDisabled: PropTypes.bool,
  controlName: PropTypes.string,
  unit: PropTypes.string,
};

export default memo(Time);
