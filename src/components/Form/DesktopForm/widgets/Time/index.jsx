import React, { memo, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Icon, MdAntTimePicker } from 'ming-ui';
import { getDynamicValue } from '../../../core/formUtils';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const Time = props => {
  const {
    dropdownClassName,
    advancedSetting = {},
    disabled,
    controlId,
    value: propValue,
    onChange,
    formData,
    masterData,
    onBlur = () => {},
    unit,
    compProps = {},
    formItemId,
    createEventHandler = () => {},
  } = props;
  const [isFocus, setIsFocus] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  const handleChange = value => {
    const mode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    if (value) {
      value = moment(moment(value).format('HH:mm:ss'), mode).format('HH:mm:ss');
    }

    onChange(value);
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

  const formatValueToMoment = value => {
    const mode = unit === '6' ? 'HH:mm:ss' : 'HH:mm';
    return value ? (moment(value).year() ? moment(value) : moment(value, mode)) : '';
  };

  let value = propValue;
  if (/^\d+$/.test(String(value)) && String(value).length < 5) {
    value = '';
  }
  value = formatValueToMoment(value);
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

  const timeArr = '00:00-24:00'.split('-');

  return (
    <MdAntTimePicker
      ref={pickerRef}
      className={cx('w100 customAntPicker customFormControlBox', { controlDisabled: disabled })}
      disabled={disabled}
      value={value}
      open={open}
      format={unit === '6' ? 'HH:mm:ss' : 'HH:mm'}
      placeholder={isFocus ? (unit === '6' ? 'HH:mm:ss' : 'HH:mm') : _l('请选择时间')}
      suffixIcon={!disabled ? <Icon icon="access_time" className="Font14 Gray_bd" /> : null}
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
                if (i < formatValueToMoment(minDate).hour()) {
                  result.push(i);
                }
              }
            }

            if (current && maxDate) {
              for (let i = 0; i < 24; i++) {
                if (i > formatValueToMoment(maxDate).hour()) {
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
                if (selectHours === formatValueToMoment(minDate).hour() && i < formatValueToMoment(minDate).minute()) {
                  result.push(i);
                }
              }
            }

            if (current && maxDate) {
              for (let i = 0; i < 60; i++) {
                if (selectHours === formatValueToMoment(maxDate).hour() && i > formatValueToMoment(maxDate).minute()) {
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
        setOpen(open);
        if (open && parseInt(timeArr[0]) === 0 && parseInt(timeArr[1]) === 24) {
          setTimeout(() => {
            $(`.customAntPicker_${controlId}`).find('.ant-picker-time-panel-column:first').scrollTop(220);
          }, 200);
        }
      }}
      onFocus={e => {
        setIsFocus(true);
        setOriginValue(e.target.value.trim());
      }}
      onBlur={() => {
        setIsFocus(false);
        onBlur(originValue);
      }}
      onChange={handleChange}
      {...compProps}
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
};

export default memo(Time, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});
