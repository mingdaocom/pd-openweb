import React from 'react';
import cx from 'classnames';
import { checkForm } from '../../constant';

export default function TextInput(props) {
  const { label, field, error, value, placeholder, onChange, onFocus, maxLength, ref, disabled, isRequired, type } =
    props;
  const inputProps = {
    ref,
    value,
    disabled,
    placeholder,
    onChange,
    onFocus,
    type,
  };
  if (type === 'password') {
    inputProps.autoComplete = 'new-password';
  }
  return (
    <div className="formGroup">
      <div className="formLabel">
        {label}
        {isRequired ? <span className="TxtMiddle Red">*</span> : null}
      </div>
      <input
        type="text"
        className={cx('formControl', { error, disabled, noBorder: disabled })}
        {...inputProps}
        maxLength={maxLength || Infinity}
      />
      {props.children}
      {error && checkForm[field] && <div className="Block Red LineHeight25 Hidden">{checkForm[field](value)}</div>}
    </div>
  );
}
