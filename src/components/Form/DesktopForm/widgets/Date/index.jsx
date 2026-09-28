import React, { useCallback, useMemo, useRef, useState } from 'react';
import en_US from 'antd/es/date-picker/locale/en_US';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { DatePicker, Input, Space } from 'ming-ui/antd-components';
import { compareWithTime, getDatePickerConfigs, getShowFormat, getTimeZoneText } from 'src/utils/domain/control/date';
import { getValueStyle } from 'src/utils/domain/control/style';
import {
  dateAppZoneToServerZone,
  dateConvertToServerZone,
  dateConvertToUserZone,
  dateServerZoneToAppZone,
} from 'src/utils/platform/runtime/timeZone';
import { getDynamicValue } from '../../../core/formUtils';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const getDefaultDateTime = timeInterval => {
  const currentTime = moment();
  const currentMinute = currentTime.minute();

  return timeInterval === 1 ? currentTime : currentTime.minute(currentMinute - (currentMinute % timeInterval));
};

const FormDatePicker = styled(DatePicker)`
  flex: 1;
  min-width: 0;
  width: 100%;
  ${props => (props.$height ? `height: ${props.$height}px;` : '')}
  ${props => (props.$fontSize ? `font-size: ${props.$fontSize};` : '')}

  .hap-picker-input > input {
    ${props => (props.$fontSize ? `font-size: ${props.$fontSize};` : '')}
    ${props => props.$valueStyle}
  }

  .customFormItem.isFilledByAi & {
    animation: mingoAnimation 0.8s;
    background-color: #6e09f90f;
  }
`;

const TimeZoneInput = styled(Input)`
  flex: none;
  width: 64px;
  height: auto;
  padding-inline: 5px;
  font-size: 12px;
  text-align: center;
  color: var(--color-text-tertiary);
  cursor: default;
`;

const DateWidgets = props => {
  const {
    dropdownClassName,
    advancedSetting = {},
    type,
    disabled,
    value: propValue,
    onChange,
    formData,
    masterData,
    onBlur = () => {},
    notConvertZone,
    hideIcon = false,
    suffixIcon,
    compProps = {},
    formItemId,
    appId,
    isFormDetail,
    createEventHandler = () => {},
  } = props;
  const {
    className: compClassName,
    classNames: compClassNames,
    inheritFieldStyle = true,
    isCell,
    showDatePicker: showDatePickerFromProps,
    ...restCompProps
  } = compProps;
  const timeInterval = parseInt(advancedSetting.timeinterval || '1');

  const [originValue, setOriginValue] = useState('');
  const [open, setOpen] = useState(Boolean(showDatePickerFromProps));
  const [defaultValue, setDefaultValue] = useState(() => getDefaultDateTime(timeInterval));
  const pickerRef = useRef(null);
  const tempDateValueRef = useRef('');
  const appTimeZone = window[`timeZone_${appId}`];
  const timeZoneText = advancedSetting.showtimezone === '1' ? getTimeZoneText(props, appId) : '';
  const dateProps = getDatePickerConfigs(props);

  useWidgetEvent(
    formItemId,
    useCallback(
      data => {
        const { triggerType } = data;

        switch (triggerType) {
          case 'trigger_tab_enter':
            setDefaultValue(getDefaultDateTime(timeInterval));
            pickerRef.current && pickerRef.current.focus();
            break;
          case 'trigger_tab_leave':
            pickerRef.current && pickerRef.current.blur();
            setOpen(false);
            break;
          case 'Enter':
            setDefaultValue(getDefaultDateTime(timeInterval));
            setOpen(true);
            break;
          default:
            break;
        }
      },
      [timeInterval],
    ),
  );

  const handleChange = value => {
    if (value) {
      const date = moment(moment(value).format(dateProps.formatMode));
      value =
        type === 15
          ? date.format('YYYY-MM-DD')
          : notConvertZone
            ? date.format('YYYY-MM-DD HH:mm:ss')
            : advancedSetting.timezonetype === '1'
              ? dateAppZoneToServerZone(date, appTimeZone)
              : dateConvertToServerZone(date);
    }

    tempDateValueRef.current = '';
    onChange(value);
  };

  let value = propValue;

  if (/^\d+$/.test(String(value)) && String(value).length < 5) {
    value = '';
  }

  const showformat = getShowFormat(props);
  const { height, size, valueStyle } = inheritFieldStyle ? getValueStyle({ ...props, value }) : {};
  const allowweek = advancedSetting.allowweek || '1234567';
  const allowtime = advancedSetting.allowtime || '00:00-24:00';
  const dateTime = value
    ? type === 15 || notConvertZone
      ? value
      : advancedSetting.timezonetype === '1'
        ? dateServerZoneToAppZone(value, appTimeZone)
        : dateConvertToUserZone(value)
    : defaultValue;
  // Keep the controlled value stable while browsing other months or years in the panel.
  const pickerValue = useMemo(() => (value ? moment(dateTime) : null), [dateTime, value]);

  let minDate;
  let maxDate;

  if (advancedSetting.min) {
    minDate = getDynamicValue(
      formData,
      Object.assign({}, props, { advancedSetting: { defsource: advancedSetting.min } }),
      masterData,
    );
  }

  if (advancedSetting.max) {
    maxDate = getDynamicValue(
      formData,
      Object.assign({}, props, { advancedSetting: { defsource: advancedSetting.max } }),
      masterData,
    );
  }

  minDate = minDate ? moment(minDate).format(dateProps.formatMode) : minDate;
  maxDate = maxDate ? moment(maxDate).format(dateProps.formatMode) : maxDate;

  let showTime;
  const [allowTimeStart, allowTimeEnd] = allowtime.split('-');

  if (type === 16 && props.showTime !== false) {
    showTime = {
      defaultOpenValue:
        parseInt(allowTimeStart) === 0 && parseInt(allowTimeEnd) === 24
          ? defaultValue
          : moment(allowTimeStart, 'HH:mm'),
    };
  }

  let mergedSuffixIcon = suffixIcon;

  if (mergedSuffixIcon === undefined) {
    mergedSuffixIcon = !disabled && !hideIcon ? <Icon icon="bellSchedule" className="Font14 textDisabled" /> : null;
  }

  const datePicker = (
    <FormDatePicker
      $fontSize={size}
      $height={height}
      $valueStyle={valueStyle}
      ref={pickerRef}
      className={cx('dateFormPicker classtabfocus', compClassName, { controlDisabled: disabled })}
      data-instance-id={formItemId}
      disabled={disabled}
      value={pickerValue}
      {...(minDate && advancedSetting.locationbegin === '1' && !value ? { defaultPickerValue: moment(minDate) } : {})}
      picker={dateProps.mode === 'datetime' ? 'date' : dateProps.mode}
      showTime={showTime || false}
      format={showformat}
      open={open}
      placeholder={props.hint || showformat}
      locale={advancedSetting.showformat?.includes('#EN#') ? en_US : undefined}
      variant={isFormDetail ? 'filled' : 'outlined'}
      allowClear={!disabled && !hideIcon}
      suffixIcon={mergedSuffixIcon}
      hideDisabledOptions
      minuteStep={timeInterval}
      onKeyDown={event => {
        createEventHandler(event, () => {
          // 阻止enter键触发tab事件，导致日期无法选择
          if (event.key === 'Enter' && open) {
            event.stopPropagation();
            return;
          }
        });
      }}
      disabledDate={currentDate => {
        if (currentDate) {
          const day = currentDate.day();
          const rangeUnit = ['year', 'month'].includes(dateProps.mode) ? dateProps.mode : 'day';
          let isBetween = true;

          if (minDate && isBetween) {
            isBetween = currentDate.isSameOrAfter(moment(minDate), rangeUnit);
          }

          if (maxDate && isBetween) {
            isBetween = currentDate.isSameOrBefore(moment(maxDate), rangeUnit);
          }

          return allowweek.indexOf(day === 0 ? '7' : day) === -1 || !isBetween;
        }
      }}
      disabledTime={current => {
        return {
          disabledHours: () => {
            const start = parseInt(allowTimeStart);
            const result = [];

            for (let i = 0; i < 24; i++) {
              if (i < start || compareWithTime(`${i}:00`, allowTimeEnd, 'isAfter')) {
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
            const result = [];

            for (let i = 0; i < 60; i++) {
              if (
                compareWithTime(`${selectHours}:${i}`, allowTimeStart, 'isBefore') ||
                compareWithTime(`${selectHours}:${i}`, allowTimeEnd, 'isAfter')
              ) {
                result.push(i);
              }
            }

            if (dateProps.showMinute === false) return result;

            if (current && minDate && moment(current).isSame(moment(minDate), 'day')) {
              for (let i = 0; i < 60; i++) {
                if (selectHours === moment(minDate).hour() && i < moment(minDate).minute()) {
                  result.push(i);
                }
              }
            }

            if (current && maxDate && moment(current).isSame(moment(maxDate), 'day')) {
              for (let i = 0; i < 60; i++) {
                if (selectHours === moment(maxDate).hour() && i > moment(maxDate).minute()) {
                  result.push(i);
                }
              }
            }

            return result;
          },
          disabledSeconds: (selectHours, selectMinutes) => {
            const result = [];

            if (!dateProps.showSecond || !current) return result;

            if (
              minDate &&
              moment(current).isSame(moment(minDate), 'day') &&
              selectHours === moment(minDate).hour() &&
              selectMinutes === moment(minDate).minute()
            ) {
              for (let i = 0; i < moment(minDate).second(); i++) {
                result.push(i);
              }
            }

            if (
              maxDate &&
              moment(current).isSame(moment(maxDate), 'day') &&
              selectHours === moment(maxDate).hour() &&
              selectMinutes === moment(maxDate).minute()
            ) {
              for (let i = moment(maxDate).second() + 1; i < 60; i++) {
                result.push(i);
              }
            }

            return result;
          },
        };
      }}
      classNames={{
        ...compClassNames,
        popup: {
          ...(compClassNames || {}).popup,
          root: cx((compClassNames || {}).popup?.root, dropdownClassName),
        },
      }}
      onOpenChange={open => {
        if (!open && tempDateValueRef.current) {
          handleChange(tempDateValueRef.current);
        }

        setOpen(open);
      }}
      onFocus={e => {
        setDefaultValue(getDefaultDateTime(timeInterval));
        setOriginValue((e.target.value || '').trim());
      }}
      onBlur={() => {
        onBlur(originValue);
      }}
      onCalendarChange={value => (tempDateValueRef.current = value)}
      onChange={handleChange}
      {...restCompProps}
    />
  );

  if (!timeZoneText) {
    return datePicker;
  }

  return (
    <Space.Compact block>
      {datePicker}
      <TimeZoneInput
        className="timeZoneTag"
        readOnly
        tabIndex={-1}
        value={timeZoneText}
        variant={isCell ? 'borderless' : isFormDetail ? 'filled' : 'outlined'}
      />
    </Space.Compact>
  );
};

DateWidgets.propTypes = {
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
  hideIcon: PropTypes.bool,
  suffixIcon: PropTypes.node,
  compProps: PropTypes.object,
  formItemId: PropTypes.string,
  appId: PropTypes.string,
  isFormDetail: PropTypes.bool,
  showTime: PropTypes.bool,
  createEventHandler: PropTypes.func,
};

export default DateWidgets;
