import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const EmailWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${props => (props.isEditing ? 2 : -1)};
`;

const Email = props => {
  const {
    hint,
    disabled,
    value,
    onChange,
    onBlur,
    triggerCustomEvent,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
    formItemId,
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
    if (isEditing && textRef.current) {
      textRef.current.focus();
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

  const handleFocus = event => {
    setOriginValue(event.target.value.trim());
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const onChangeDebounced = _.debounce(event => {
    const value = event.target.value;
    onChange(value);
  }, 300);

  const getShowValue = () => {
    const currentValue = (value || '').replace(/ /g, '');
    return showMaskValue && currentValue
      ? dealMaskValue({ ...props, value: currentValue })
      : currentValue || hint || '';
  };

  const handleClick = useCallback(() => {
    if (!disabled) {
      setIsEditing(true);
    }
  }, [disabled]);

  const handleBlur = event => {
    if (event.target.value.trim() !== originValue) {
      onChange(event.target.value.trim());
    }
    setIsEditing(false);
    onBlur(originValue);
  };

  return (
    <Fragment>
      <div
        className={cx(
          'customFormControlBox',
          { Gray_bd: !value },
          { controlDisabled: disabled },
          { Visibility: isEditing },
        )}
        onClick={handleClick}
      >
        <span className={cx({ maskHoverTheme: isMaskReadonly })} onClick={handleMaskClick}>
          {getShowValue()}
          {renderMaskContent()}
        </span>
      </div>
      <EmailWrap isEditing={isEditing}>
        <input
          type="text"
          className={cx('customFormControlBox', { controlDisabled: disabled })}
          ref={textRef}
          placeholder={hint}
          disabled={disabled}
          defaultValue={value}
          onChange={onChangeDebounced}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={createEventHandler}
        />
      </EmailWrap>
    </Fragment>
  );
};

Email.propTypes = {
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
};

export default memo(Email, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
