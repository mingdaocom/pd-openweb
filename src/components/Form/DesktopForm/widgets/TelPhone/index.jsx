import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const TelPhoneWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${props => (props.isEditing ? 2 : -1)};
`;

const TelPhone = props => {
  const {
    hint,
    disabled,
    formItemId,
    value,
    onChange,
    onBlur,
    triggerCustomEvent,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
    createEventHandler = () => {},
  } = props;

  const [originValue, setOriginValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current && value !== textRef.current.value) {
      textRef.current.value = value || '';
    }
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      textRef.current && textRef.current.focus();
    }
  }, [isEditing]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          setIsEditing(true);
          break;
        case 'trigger_tab_leave':
          textRef.current && textRef.current.blur();
          break;
        default:
          break;
      }
    }, []),
  );

  const handleFocus = e => {
    setOriginValue(e.target.value.trim());
    setIsEditing(true);
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleChange = _.debounce(event => {
    const value = event.target.value;
    onChange(value);
  }, 300);

  const getShowValue = () => {
    const currentValue = (value || '').replace(/ /g, '');
    return showMaskValue && currentValue
      ? dealMaskValue({ ...props, value: currentValue })
      : currentValue || hint || '';
  };

  const handleContainerClick = () => {
    if (!disabled && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = event => {
    setIsEditing(false);
    if (event.target.value.trim() !== originValue) {
      onChange(event.target.value.trim());
    }
    onBlur(originValue);
  };

  return (
    <React.Fragment>
      <div
        className={cx(
          'customFormControlBox',
          { Gray_bd: !value },
          { controlDisabled: disabled },
          { Visibility: isEditing },
        )}
        onClick={handleContainerClick}
      >
        <span className={cx({ maskHoverTheme: isMaskReadonly })} onClick={handleMaskClick}>
          {getShowValue()}
          {renderMaskContent()}
        </span>
      </div>
      <TelPhoneWrap isEditing={isEditing}>
        <input
          type="text"
          className={cx('customFormControlBox', {
            controlDisabled: disabled,
            customFormControlTelPhone: !isEditing && value,
          })}
          ref={textRef}
          placeholder={hint}
          disabled={disabled}
          defaultValue={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={createEventHandler}
        />
      </TelPhoneWrap>
    </React.Fragment>
  );
};

TelPhone.propTypes = {
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  from: PropTypes.number,
};

export default memo(TelPhone, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
