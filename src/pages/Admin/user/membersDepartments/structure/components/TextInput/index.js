import React from 'react';
import { Input } from 'ming-ui/antd-components';
import { checkForm } from '../../constant';

export default function TextInput(props) {
  const { label, field, error, value, placeholder, onChange, onFocus, maxLength, ref, disabled, isRequired, type } =
    props;

  return (
    <div className="formGroup">
      <div className="formLabel">
        {label}
        {isRequired ? <span className="TxtMiddle Red">*</span> : null}
      </div>
      <Input
        type="text"
        className="formControl"
        status={error ? 'error' : undefined}
        ref={ref}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onFocus}
        type={type}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        maxLength={maxLength}
      />
      {props.children}
      {error && checkForm[field] && <div className="Block Red LineHeight25 Hidden">{checkForm[field](value)}</div>}
    </div>
  );
}
