import React, { useEffect, useState, useMemo, memo, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, MobileDatePicker } from 'ming-ui';
import { getDynamicValue } from '../../../core/formUtils';
import { dateConvertToUserZone, dateConvertToServerZone } from 'src/util';
import { getDatePickerConfigs, getDateToEn, getShowFormat } from 'src/pages/widgetConfig/util/setting';
import moment from 'moment';
import cx from 'classnames';

const DateWidget = props => {
  const {
    value,
    controlName,
    formData,
    masterData,
    formDisabled,
    type,
    notConvertZone,
    disabled,
    hideIcon,
    advancedSetting = {},
    hint,
  } = props;
  const showformat = getShowFormat(props);
  const timeInterval = parseInt(advancedSetting.timeinterval || '1');
  const [dateProps, setDateProps] = useState(getDatePickerConfigs(props));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const precision = useMemo(() => {
    let mode =
      dateProps.formatMode === 'YYYY-MM-DD HH'
        ? 'hour'
        : dateProps.formatMode === 'YYYY-MM-DD HH:mm'
        ? 'minite'
        : 'second';
    return ['year', 'month', 'date'].includes(dateProps.mode) ? dateProps.mode : mode;
  }, [dateProps.mode, dateProps.formatMode]);

  const onChange = value => {
    if (value) {
      const date = moment(moment(value).format(dateProps.formatMode));
      value =
        type === 15
          ? date.format('YYYY-MM-DD')
          : notConvertZone
          ? date.format('YYYY-MM-DD HH:mm:ss')
          : dateConvertToServerZone(date);
    }

    props.onChange(value);
  };

  useEffect(() => {
    let _value = value;
    if (/^\d+$/.test(String(_value)) && String(_value).length < 5) {
      _value = '';
    }
    const currentMinute = moment().minute();
    const defaultValue =
      timeInterval === 1 ? new Date() : moment().minute(currentMinute - (currentMinute % timeInterval));
    const _dateTime = _value ? (type === 15 || notConvertZone ? _value : dateConvertToUserZone(_value)) : defaultValue;
    setDateTime(_dateTime);
  }, [value, type, notConvertZone, advancedSetting.timeinterval]);

  useEffect(() => {
    setDateProps(getDatePickerConfigs(props));
  }, [advancedSetting.showtype]);

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
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
        onClick={() => {
          !disabled && setShowDatePicker(true);
        }}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !value })}>
          {value ? getDateToEn(showformat, dateTime, advancedSetting.showformat) : hint}
        </span>
        {(!disabled || !formDisabled) && !hideIcon && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>
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
          onClose={() => setShowDatePicker(false)}
          onSelect={date => {
            onChange(date);
            setShowDatePicker(false);
          }}
          onCancel={() => {
            setShowDatePicker(false);
            onChange(null);
          }}
        />
      )}
    </Fragment>
  );
};

DateWidget.propTypes = {
  value: PropTypes.string,
  controlName: PropTypes.string,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  masterData: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  formDisabled: PropTypes.bool,
  type: PropTypes.number,
  notConvertZone: PropTypes.bool,
  disabled: PropTypes.bool,
  hideIcon: PropTypes.bool,
  hint: PropTypes.string,
  advancedSetting: PropTypes.object,
};

export default memo(DateWidget);
