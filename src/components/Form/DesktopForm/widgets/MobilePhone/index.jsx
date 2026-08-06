import React, { memo, useCallback, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PhoneNumberInput from 'ming-ui/components/PhoneNumberInput';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const PhoneNumberWrap = styled.div`
  &.customFormControlMobileHover .customFormControlBox {
    ${props => (props.isEditing ? 'background: transparent !important' : '')}
  }

  .customFormControlBox .ant-input {
    transition: none !important;
    animation: none !important;
  }
`;

const MobilePhone = props => {
  const {
    disabled,
    value,
    onChange,
    inputClassName,
    onBlur = () => {},
    onInputKeydown,
    isCell,
    triggerCustomEvent,
    showMaskValue = false,
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    isMaskReadonly = false,
    formItemId,
    createEventHandler = () => {},
  } = props;

  const [originValue, setOriginValue] = useState('');
  const [isEditing, setIsEditing] = useState(isCell || false);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;

      switch (triggerType) {
        case 'trigger_tab_enter':
          setIsEditing(true);
          break;
        case 'trigger_tab_leave':
          setIsEditing(false);
          break;
        default:
          break;
      }
    }, []),
  );

  const handleFocus = () => {
    setOriginValue(value || '');
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = blurValue => {
    setIsEditing(false);
    onBlur(originValue || '', blurValue || '');
  };

  const renderMask = maskValue => {
    return (
      <span className={cx('InlineBlock overflowHidden', { maskHoverTheme: isMaskReadonly })} onClick={handleMaskClick}>
        {maskValue}
        {renderMaskContent()}
      </span>
    );
  };

  return (
    <PhoneNumberWrap className={cx({ customFormControlMobileHover: !disabled })} isEditing={isEditing}>
      <PhoneNumberInput
        control={_.pick(props, [
          'value',
          'hint',
          'disabled',
          'enumDefault',
          'advancedSetting',
          'type',
          'showMaskValue',
        ])}
        showMask={isMaskReadonly || showMaskValue}
        isFocused={isEditing}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        renderMask={renderMask}
        className={cx('customFormControlBox', { controlDisabled: disabled })}
        inputClassName={inputClassName}
        onKeyDown={event => {
          createEventHandler(event, onInputKeydown);
        }}
      />
    </PhoneNumberWrap>
  );
};

MobilePhone.propTypes = {
  hint: PropTypes.string,
  inputClassName: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onInputKeydown: PropTypes.func,
  enumDefault: PropTypes.number,
  advancedSetting: PropTypes.any,
  from: PropTypes.number,
  isCell: PropTypes.bool,
  triggerCustomEvent: PropTypes.func,
  flag: PropTypes.any,
};

export default memo(MobilePhone, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'isMaskReadonly']),
  );
});
