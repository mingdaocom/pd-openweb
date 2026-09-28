import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Tooltip } from 'ming-ui/antd-components';

const FormGroup = styled.div`
  width: 100%;
  .formControl {
    width: 100%;
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
      <Input
        type="text"
        className="formControl"
        status={error ? 'error' : undefined}
        {...inputProps}
        maxLength={maxLength}
      />
      {props.children}
      {error && <div className="Block Red LineHeight25 Hidden">{`${label}${_l('不能为空')}`}</div>}
    </FormGroup>
  );
});

export default TextInput;
