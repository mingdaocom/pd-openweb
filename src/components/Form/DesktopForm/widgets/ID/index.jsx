import React, { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const IDWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${props => (props.isEditing ? 2 : -1)};
`;

const IDWidget = props => {
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

  const formatValue = val => {
    return (val || '').toUpperCase();
  };

  useEffect(() => {
    if (textRef.current && value !== textRef.current.value) {
      textRef.current.value = formatValue(value || '');
    }
  }, [value]);

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

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
    }
  }, [isEditing]);

  const handleFocus = event => {
    setOriginValue(event.target.value.trim());
    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = event => {
    const newVal = formatValue(event.target.value.trim());
    if (newVal !== originValue) {
      onChange(newVal);
    }
    setIsEditing(false);
    onBlur(originValue);
  };

  const handleChange = _.debounce(event => {
    const currentValue = formatValue(event.target.value);
    onChange(currentValue);
  }, 300);

  const getShowValue = () => {
    const currentValue = (value || '').replace(/ /g, '');
    return showMaskValue && currentValue ? dealMaskValue({ ...props, value: currentValue }) : currentValue || '';
  };

  return (
    <Fragment>
      <div
        className={cx(
          'customFormControlBox customFormTextareaBox',
          { Gray_bd: !value },
          { controlDisabled: disabled },
          { Visibility: isEditing },
        )}
        onClick={() => {
          if (!disabled) {
            setIsEditing(true);
          }
        }}
      >
        <span className={cx({ maskHoverTheme: isMaskReadonly })} onClick={handleMaskClick}>
          {getShowValue()}
          {renderMaskContent()}
        </span>
      </div>
      <IDWrap isEditing={isEditing}>
        <input
          type="text"
          className={cx('customFormControlBox', { controlDisabled: disabled })}
          ref={textRef}
          placeholder={hint}
          disabled={disabled}
          maxLength={18}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={createEventHandler}
          onBlur={handleBlur}
        />
      </IDWrap>
    </Fragment>
  );
};

IDWidget.propTypes = {
  enumDefault: PropTypes.number,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
  flag: PropTypes.any,
};

export default memo(IDWidget, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
