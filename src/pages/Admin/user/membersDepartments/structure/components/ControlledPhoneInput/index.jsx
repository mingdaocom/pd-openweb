import React, { useEffect, useMemo, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';
import DialCodeSelectInstance from 'ming-ui/components/PhoneNumberInput/DialCodeSelect';
import {
  getDefaultCountry,
  getPhoneInputLocale,
  getPreferredCountries,
} from 'ming-ui/components/PhoneNumberInput/util';
import { getFullPhoneNumber, normalizeControlledPhoneChange } from './utils';
import './index.less';

const ControlledPhoneInput = ({
  value = '',
  dialCode = '',
  onChange = _.noop,
  onBlur = _.noop,
  onFocus = _.noop,
  placeholder,
  status,
  className,
  allowDropdown = true,
  showDialCode = true,
}) => {
  const triggerRef = useRef(null);
  const selectInstanceRef = useRef(null);
  const valueRef = useRef({ value, dialCode });
  const onChangeRef = useRef(onChange);
  const defaultCountry = useMemo(() => getDefaultCountry(), []);
  const preferredCountries = useMemo(() => getPreferredCountries(), []);
  const locale = useMemo(() => getPhoneInputLocale(), []);
  useEffect(() => {
    valueRef.current = { value, dialCode };
  }, [value, dialCode]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!showDialCode || !allowDropdown || !triggerRef.current) return;

    const currentPhone = valueRef.current;
    const instance = new DialCodeSelectInstance({
      dom: triggerRef.current,
      value: getFullPhoneNumber(currentPhone.dialCode, currentPhone.value),
      defaultCountry,
      preferredCountries,
      locale,
      onSelectCode: nextDialCode => {
        onChangeRef.current({ value: valueRef.current.value, dialCode: nextDialCode });
      },
    });

    selectInstanceRef.current = instance;

    return () => {
      instance._destroy?.();
      selectInstanceRef.current = null;
    };
  }, [showDialCode, allowDropdown, defaultCountry, preferredCountries, locale]);

  useEffect(() => {
    if (!selectInstanceRef.current) return;

    selectInstanceRef.current.value = getFullPhoneNumber(dialCode, value);
    selectInstanceRef.current.code = dialCode;
  }, [dialCode, value]);

  return (
    <div className={cx('controlledPhoneInput', className, { error: status === 'error' })}>
      {showDialCode && (
        <div
          className={cx('controlledPhoneDialCode', { disabled: !allowDropdown })}
          ref={triggerRef}
          role="button"
          tabIndex={allowDropdown ? 0 : -1}
          aria-haspopup={allowDropdown ? 'dialog' : undefined}
        >
          <span>{dialCode}</span>
          {allowDropdown && <Icon icon="arrow-down" className="controlledPhoneDialCodeArrow" />}
        </div>
      )}
      <Input
        key="phoneInput"
        value={value}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={event => {
          onChange(normalizeControlledPhoneChange(event.target.value, defaultCountry, dialCode));
        }}
      />
    </div>
  );
};

export default ControlledPhoneInput;
