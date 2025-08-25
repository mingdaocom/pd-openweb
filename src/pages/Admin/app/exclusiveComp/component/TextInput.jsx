import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const FormGroup = styled.div`
  width: 100%;
  input:focus::-webkit-contacts-auto-fill-button {
    opacity: 0;
  }
  .formControl {
    width: 100%;
    height: 36px;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
    display: inline-block;
    padding: 0 12px;
    line-height: 36px;
    &:hover {
      border-color: #bbb;
    }
    &:focus {
      border-color: #1677ff;
    }
    &.error {
      border-color: #f00 !important;
    }
    &.disabled {
      background-color: #f5f5f5;
      border: 1px solid #f5f5f5;
    }
  }
`;

export default function TextInput(props) {
  const {
    label,
    error,
    value,
    placeholder,
    maxLength,
    ref,
    disabled,
    isRequired,
    type,
    className,
    onChange,
    onFocus,
    onBlur = () => {},
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
      <div className="formLabel Font14 mBottom12">
        {isRequired ? <span className="TxtMiddle Red">* </span> : null}
        {label}
      </div>
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
}
