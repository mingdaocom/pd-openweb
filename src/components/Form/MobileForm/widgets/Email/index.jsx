import React, { memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { ADD_EVENT_ENUM } from '../../../core/enum';
import ClearValueIcon, { CLEAR_ICON_SAFE_CLASS } from '../../components/ClearValueIcon';
import { FIELD_SIZE_OPTIONS } from '../../tools/config';

const Email = props => {
  const {
    className,
    hint,
    value = '',
    triggerCustomEvent,
    disabled,
    formDisabled,
    advancedSetting = {},
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
  } = props;

  const getEditValue = () => {
    return value.replace(/ /g, '');
  };

  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');
  const [currentValue, setCurrentValue] = useState(getEditValue());
  const showClear = isEditing && !!currentValue;
  const fieldSize = FIELD_SIZE_OPTIONS[advancedSetting.valuesize || '0'];

  const getShowValue = () => {
    const value = getEditValue();
    return showMaskValue && value ? dealMaskValue({ ...props, value }) : value || hint;
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

    debouncedOnChange.cancel();
    if (trimValue !== value) {
      props.onChange(trimValue);
    }

    setIsEditing(false);
    props.onBlur(originValue);
  };

  const handleControlClick = () => {
    if (disabled) return;

    setIsEditing(true);
    inputRef.current.focus();
  };

  const debouncedOnChange = useRef(
    _.debounce((props, val) => {
      props.onChange(val);
    }, 300),
  ).current;

  const handleInputChange = event => {
    const val = event.target.value;
    setCurrentValue(val);
    debouncedOnChange(props, val);
  };

  const clearValue = () => {
    debouncedOnChange.cancel();
    setCurrentValue('');
    props.onChange('');

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    setCurrentValue(getEditValue());
  }, [value]);

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, []);

  return (
    <div className={cx('Relative', { [CLEAR_ICON_SAFE_CLASS]: showClear })}>
      <div
        className={cx('customFormControlBox customFormControlInputView', {
          controlEditReadonly: !formDisabled && currentValue && disabled,
          controlDisabled: formDisabled,
        })}
        style={{
          zIndex: isEditing ? -1 : 1,
        }}
        onClick={handleControlClick}
      >
        <span
          className={cx({ overflowEllipsis: !currentValue, customFormPlaceholder: !currentValue })}
          onClick={handleMaskClick}
        >
          {getShowValue()}
          {renderMaskContent()}
        </span>
      </div>
      {!disabled && (
        <input
          type="text"
          className={cx('customFormControlBox', className)}
          value={currentValue}
          disabled={disabled}
          ref={inputRef}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {showClear && <ClearValueIcon size={fieldSize} onClear={clearValue} />}
    </div>
  );
};

Email.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  enumDefault: PropTypes.number,
  value: PropTypes.string,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
  advancedSetting: PropTypes.object,
};

export default memo(Email, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled', 'showMaskValue']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled', 'showMaskValue']),
  );
});
