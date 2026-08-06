import React, { memo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import PhoneNumberInput from 'ming-ui/components/PhoneNumberInput';
import { ADD_EVENT_ENUM } from '../../../core/enum';
import ClearValueIcon, { CLEAR_ICON_SAFE_AREA, CLEAR_ICON_SAFE_CLASS } from '../../components/ClearValueIcon';
import { FIELD_SIZE_OPTIONS } from '../../tools/config';

const PhoneNumberWrap = styled.div`
  position: relative;
  .customFormControlBox {
    padding: 0 0 !important;
  }
  .customFormControlBox.controlDisabled {
    background: var(--color-background-primary) !important;
    border-color: transparent !important;
    .ant-input {
      ${props => (props.hiddenCountry ? 'padding-left: 0 !important;' : '')}
    }
  }

  .customFormControlBox.controlEditReadonly {
    background: var(--color-background-disabled) !important;
  }

  &.customFormControlMobileHover .customFormControlBox {
    ${props => (props.isEditing ? 'background: transparent !important' : '')}
  }

  && .ant-input {
    ${props => (props.showTelBtn ? 'padding-right: 32px !important;' : '')};
  }

  && .maskPhoneContent {
    ${props => (props.showTelBtn ? 'padding-right: 32px;' : '')};
  }

  &.${CLEAR_ICON_SAFE_CLASS} {
    && .ant-input,
    && .maskPhoneContent {
      padding-right: ${CLEAR_ICON_SAFE_AREA}px !important;
    }
  }

  && .ant-input,
  && .maskPhoneContent,
  && .countryTrigger {
    font-size: inherit !important;
  }

  .maskPhoneContent {
    line-height: 1.5;
  }

  .customFormControlTelBtn {
    position: absolute;
    right: 0;
    top: 50%;
    z-index: 2;
    transform: translateY(-50%);
  }
`;

const MobilePhone = props => {
  const {
    hint,
    enumDefault = 0,
    value = '',
    type,
    advancedSetting = {},
    triggerCustomEvent,
    disabled,
    formDisabled,
    onBlur = () => {},
    renderMaskContent = () => {},
    handleMaskClick = () => {},
    showMaskValue = false,
    isMaskReadonly = false,
  } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [originValue, setOriginValue] = useState('');

  const showTelBtn = !(showMaskValue && !renderMaskContent()) && value && formDisabled;
  const showClear = isEditing && !!value;
  const fieldSize = FIELD_SIZE_OPTIONS[advancedSetting.valuesize || '0'];

  const handleFocus = () => {
    setOriginValue(value || '');
    setIsEditing(true);

    if (_.isFunction(triggerCustomEvent)) {
      triggerCustomEvent(ADD_EVENT_ENUM.FOCUS);
    }
  };

  const handleBlur = nextValue => {
    setIsEditing(false);
    onBlur(originValue, nextValue);
  };

  const clearValue = () => {
    props.onChange('');
    setIsEditing(true);
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
    <PhoneNumberWrap
      className={cx({
        customFormControlMobileHover: !disabled,
        [CLEAR_ICON_SAFE_CLASS]: showClear,
      })}
      isEditing={isEditing}
      showTelBtn={showTelBtn}
      hiddenCountry={enumDefault === 1}
    >
      <PhoneNumberInput
        control={{ value, hint, disabled, enumDefault, advancedSetting, type, showMaskValue }}
        showMask={isMaskReadonly || showMaskValue}
        isFocused={isEditing}
        onChange={props.onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        renderMask={renderMask}
        className={cx('customFormControlBox', {
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
      />
      {/* 有掩码并有解码权限（无解码权限不可拨打电话） || 无掩码时可拨打电话 */}
      {showTelBtn && (
        <a href={`tel:${value}`} className="customFormControlTelBtn">
          <Icon icon="phone22" className="Font16 colorPrimary" />
        </a>
      )}
      {showClear && <ClearValueIcon size={fieldSize} onClear={clearValue} />}
    </PhoneNumberWrap>
  );
};

MobilePhone.propTypes = {
  className: PropTypes.string,
  hint: PropTypes.string,
  enumDefault: PropTypes.number,
  value: PropTypes.string,
  advancedSetting: PropTypes.object,
  triggerCustomEvent: PropTypes.func,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
  onBlur: PropTypes.func,
};

export default memo(MobilePhone, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'showMaskValue', 'formDisabled', 'isMaskReadonly']),
    _.pick(nextProps, ['value', 'disabled', 'showMaskValue', 'formDisabled', 'isMaskReadonly']),
  );
});
