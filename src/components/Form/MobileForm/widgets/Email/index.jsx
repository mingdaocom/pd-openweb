import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { addBehaviorLog } from 'src/utils/project.js';
import { ADD_EVENT_ENUM } from '../../../core/enum';

const Email = props => {
  const {
    className,
    hint,
    flag,
    maskPermissions,
    value = '',
    advancedSetting = {},
    triggerCustomEvent,
    disabled,
    formDisabled,
  } = props;
  const getEditValue = () => {
    return value.replace(/ /g, '');
  };

  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [maskStatus, setMaskStatus] = useState(advancedSetting.datamask === '1');
  const [currentValue, setCurrentValue] = useState(getEditValue());
  const isMask = useMemo(() => {
    return maskPermissions && value && maskStatus;
  }, [maskPermissions, value, maskStatus]);

  const getShowValue = () => {
    const value = getEditValue();
    return maskStatus && value ? dealMaskValue({ ...props, value }) : value || hint;
  };

  const onFocus = event => {
    setOriginValue(event.target.value.trim());
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const onBlur = event => {
    const trimValue = event.target.value.trim();
    if (trimValue !== value) {
      props.onChange(trimValue);
    }
    setIsEditing(false);
    props.onBlur(originValue);
  };

  const debouncedOnChange = useRef(
    _.debounce((props, val) => {
      props.onChange(val);
    }, 300),
  ).current;

  useEffect(() => {
    setMaskStatus(_.get(props, 'advancedSetting.datamask') === '1');
  }, [flag]);

  useEffect(() => {
    setCurrentValue(getEditValue());
  }, [value]);

  return (
    <div className="Relative">
      <div
        className={cx('customFormControlBox customFormControlInputView', {
          controlEditReadonly: !formDisabled && currentValue && disabled,
          controlDisabled: formDisabled,
        })}
        style={{
          zIndex: isEditing ? -1 : 1,
        }}
        onClick={() => {
          if (disabled) return;
          setIsEditing(true);
          inputRef.current.focus();
        }}
      >
        <span
          className={cx({ overflowEllipsis: !currentValue })}
          onClick={() => {
            if (disabled && isMask) {
              addBehaviorLog('worksheetDecode', props.worksheetId, {
                rowId: props.recordId,
                controlId: props.controlId,
              });
              setMaskStatus(false);
            }
          }}
        >
          {getShowValue()}
          {isMask && <Icon icon="eye_off" className={cx('commonFormIcon', disabled ? 'mLeft7' : 'maskIcon')} />}
        </span>
      </div>
      {!disabled && (
        <input
          type="text"
          className={cx('customFormControlBox', className)}
          value={currentValue}
          disabled={disabled}
          ref={inputRef}
          onChange={event => {
            const val = event.target.value;
            setCurrentValue(val);
            debouncedOnChange(props, val);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
    </div>
  );
};

Email.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  flag: PropTypes.string,
  maskPermissions: PropTypes.bool,
  enumDefault: PropTypes.number,
  value: PropTypes.string,
  advancedSetting: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
};

export default memo(Email, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});
