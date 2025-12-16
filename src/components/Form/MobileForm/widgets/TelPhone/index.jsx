import React, { memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { ADD_EVENT_ENUM } from '../../../core/enum';

const TelPhone = props => {
  const {
    className,
    hint,
    value = '',
    triggerCustomEvent,
    disabled,
    formDisabled,
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
        <span className={cx({ overflowEllipsis: !currentValue })} onClick={handleMaskClick}>
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

TelPhone.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  value: PropTypes.string,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
};

export default memo(TelPhone, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled', 'showMaskValue']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled', 'showMaskValue']),
  );
});
