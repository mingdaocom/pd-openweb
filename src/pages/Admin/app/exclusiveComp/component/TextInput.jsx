import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const FormGroup = styled.div`
  width: 100%;
  input:focus::-webkit-contacts-auto-fill-button {
    opacity: 0;
  }
  .formControl {
    width: 100%;
    height: 36px;
    border: 1px solid var(--color-border-tertiary);
    border-radius: 3px;
    box-sizing: border-box;
    display: inline-block;
    padding: 0 12px;
    line-height: 36px;
    &:hover {
      border-color: var(--color-text-disabled);
    }
    &:focus {
      border-color: var(--color-primary);
    }
    &.error {
      border-color: #f00 !important;
    }
    &.disabled {
      background-color: var(--color-background-secondary);
      border: 1px solid var(--color-background-secondary);
    }
  }
  .tipIcon {
    vertical-align: text-bottom;
  }
`;

const TextInput = React.forwardRef((props, ref) => {
  const {
    label,
    error,
    value,
    placeholder,
    maxLength,
    disabled,
    isRequired,
    type,
    className,
    onChange,
    onFocus,
    onBlur = () => {},
    tips,
    hideLabel,
  } = props;
  const inputProps = {
    ref,
    value,
    disabled,
    placeholder,
    onChange,
    onFocus,
    type,
    onBlur,
  };

  if (type === 'password') {
    inputProps.autoComplete = 'new-password';
  }

  return (
    <FormGroup className={cx('formGroup', className)}>
      {!hideLabel && (
        <div className="formLabel Font14 mBottom12">
          {isRequired ? <span className="TxtMiddle Red">* </span> : null}
          {label}
          {tips && (
            <Tooltip title={tips}>
              <Icon className="Font16 textDisabled mLeft8 tipIcon" icon="info_outline" />
            </Tooltip>
          )}
        </div>
      )}
      <input
        type="text"
        className={cx('formControl', { error, disabled, noBorder: disabled })}
        {...inputProps}
        maxLength={maxLength || Infinity}
      />
      {props.children}
      {error && <div className="Block Red LineHeight25 Hidden">{`${label}${_l('不能为空')}`}</div>}
    </FormGroup>
  );
});

export default TextInput;
