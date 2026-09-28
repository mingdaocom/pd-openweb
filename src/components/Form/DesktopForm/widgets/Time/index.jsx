import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { TimePicker } from 'ming-ui/antd-components';
import { getValueStyle } from 'src/utils/domain/control/style';
import { getDynamicValue } from '../../../core/formUtils';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const FormTimePicker = styled(TimePicker)`
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

const getTimeFormat = unit => (unit === '6' ? 'HH:mm:ss' : 'HH:mm');

const formatValueToMoment = (value, format) => {
  return value ? (moment(value).year() ? moment(value) : moment(value, format)) : null;
};

const Time = props => {
  const {
    dropdownClassName,
    advancedSetting = {},
    disabled,
    value: propValue,
    onChange,
    formData,
    masterData,
    onBlur = () => {},
    unit,
    compProps = {},
    formItemId,
    isFormDetail,
    createEventHandler = () => {},
  } = props;
  const {
    className: compClassName,
    classNames: compClassNames,
    inheritFieldStyle = true,
    isCell,
    open: initialOpen = false,
    ...restCompProps
  } = compProps;
  const [isFocus, setIsFocus] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [open, setOpen] = useState(Boolean(initialOpen));
  const pickerRef = useRef(null);
  const pendingCellValueRef = useRef(undefined);
  const timeFormat = getTimeFormat(unit);

  const handleChange = value => {
    if (value) {
      value = moment(moment(value).format('HH:mm:ss'), timeFormat).format('HH:mm:ss');
    }

    onChange(value);
  };

  const handleCellCalendarChange = value => {
    pendingCellValueRef.current = value;
  };

  const handleCellChange = value => {
    // 清空（清除按钮、删除输入内容）直接落库
    if (!value) {
      pendingCellValueRef.current = undefined;
      handleChange(value);
      return;
    }

    // 「确定」会先触发 onOk 再触发 onChange，onOk 已提交并清掉缓存，这里跳过避免重复更新；
    // 「此刻」和输入后回车只触发 onChange，必须在这里落库，否则失焦时选中的值会被丢弃
    if (pendingCellValueRef.current === undefined) {
      return;
    }

    pendingCellValueRef.current = undefined;
    handleChange(value);
  };

  const handleCellOk = value => {
    // 已有值的受控 TimePicker 确认时 onOk 仍可能返回旧值，以面板选择过程缓存的值为准
    const nextValue = pendingCellValueRef.current === undefined ? value : pendingCellValueRef.current;
    pendingCellValueRef.current = undefined;
    handleChange(nextValue);
  };

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;

      switch (triggerType) {
        case 'Enter':
          setOpen(true);
          break;
        case 'trigger_tab_enter':
          pickerRef.current && pickerRef.current.focus();
          break;
        case 'trigger_tab_leave':
          pickerRef.current && pickerRef.current.blur();
          setOpen(false);
          break;
        default:
          break;
      }
    }, []),
  );

  let value = propValue;

  if (/^\d+$/.test(String(value)) && String(value).length < 5) {
    value = '';
  }

  value = formatValueToMoment(value, timeFormat);
  const { height, size, valueStyle } = inheritFieldStyle ? getValueStyle({ ...props, value }) : {};
  const timeInterval = parseInt(advancedSetting.timeinterval || '1');
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

  return (
    <FormTimePicker
      $fontSize={size}
      $height={height}
      $valueStyle={valueStyle}
      ref={pickerRef}
      className={cx('timeFormPicker classtabfocus', compClassName, { controlDisabled: disabled })}
      disabled={disabled}
      value={value}
      open={open}
      format={timeFormat}
      placeholder={isFocus ? timeFormat : _l('请选择时间')}
      variant={isFormDetail ? 'filled' : 'outlined'}
      allowClear={!disabled}
      suffixIcon={!disabled ? <Icon icon="access_time" className="Font14 textTertiary" /> : null}
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
      disabledTime={current => {
        return {
          disabledHours: () => {
            const result = [];

            if (current && minDate) {
              for (let i = 0; i < 24; i++) {
                if (i < formatValueToMoment(minDate, timeFormat).hour()) {
                  result.push(i);
                }
              }
            }

            if (current && maxDate) {
              for (let i = 0; i < 24; i++) {
                if (i > formatValueToMoment(maxDate, timeFormat).hour()) {
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
                  selectHours === formatValueToMoment(minDate, timeFormat).hour() &&
                  i < formatValueToMoment(minDate, timeFormat).minute()
                ) {
                  result.push(i);
                }
              }
            }

            if (current && maxDate) {
              for (let i = 0; i < 60; i++) {
                if (
                  selectHours === formatValueToMoment(maxDate, timeFormat).hour() &&
                  i > formatValueToMoment(maxDate, timeFormat).minute()
                ) {
                  result.push(i);
                }
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
      onOpenChange={setOpen}
      onFocus={e => {
        setIsFocus(true);
        const inputValue = e?.target?.value;
        setOriginValue(typeof inputValue === 'string' ? inputValue.trim() : value?.format(timeFormat) || '');
      }}
      onBlur={() => {
        setIsFocus(false);
        onBlur(originValue);
      }}
      {...(isCell
        ? { onCalendarChange: handleCellCalendarChange, onChange: handleCellChange, onOk: handleCellOk }
        : { onCalendarChange: handleChange })}
      {...restCompProps}
    />
  );
};

Time.propTypes = {
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
  compProps: PropTypes.object,
  formItemId: PropTypes.string,
  isFormDetail: PropTypes.bool,
  createEventHandler: PropTypes.func,
};

export default Time;
