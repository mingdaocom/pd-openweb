import React, { useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import DialCodeSelectInstance from 'ming-ui/components/PhoneNumberInput/DialCodeSelect';
import {
  buildCountryOptions,
  getDefaultCode,
  parseFullNumberInput,
} from 'ming-ui/components/PhoneNumberInput/DialCodeSelect/utils';
import {
  getDefaultCountry,
  getPhoneInputLocale,
  getPreferredCountries,
  initIntlTelInput,
} from 'ming-ui/components/PhoneNumberInput/util';

const isPhoneAccount = value => {
  const normalized = String(value || '').replace(/\s*/g, '');
  return !!normalized && !normalized.includes('@') && !isNaN(normalized);
};

// 'inputAccount',//手机邮箱输入框
export default function (props) {
  const {
    keys,
    onlyRead,
    type,
    emailOrTel,
    dialCode,
    onChange = () => {},
    canChangeEmailOrTel,
    focusDiv,
    warnList = [],
  } = props;
  const dialCodeTriggerRef = useRef(null);
  const dialCodeInstanceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const isComposingRef = useRef(false);
  const [compositionValue, setCompositionValue] = useState(null);
  const defaultCountry = useMemo(getDefaultCountry, []);
  const preferredCountries = useMemo(getPreferredCountries, []);
  const locale = useMemo(getPhoneInputLocale, []);
  const countryOptions = useMemo(
    () => buildCountryOptions({ preferredCountries, locale }),
    [preferredCountries, locale],
  );
  const rawAccountValue = String(emailOrTel || '');
  const normalizedAccountValue = rawAccountValue.replace(/\s/g, '');
  const parsedAccount = useMemo(
    () =>
      parseFullNumberInput({
        inputValue: normalizedAccountValue,
        defaultCountry,
        fallbackCode: dialCode || getDefaultCode(defaultCountry),
      }),
    [normalizedAccountValue, defaultCountry, dialCode],
  );
  const accountValue = parsedAccount?.numberValue || normalizedAccountValue;
  const currentDialCode = parsedAccount?.code || dialCode || getDefaultCode(defaultCountry);
  const isPhone = isPhoneAccount(accountValue);
  const normalizedDialCode = isPhone ? currentDialCode : '';
  const shouldNormalizeAccount =
    !!rawAccountValue && (accountValue !== rawAccountValue || dialCode !== normalizedDialCode);
  const dialCodeStateRef = useRef({
    value: `${currentDialCode}${accountValue}`,
    code: currentDialCode,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!shouldNormalizeAccount) return;

    onChangeRef.current({
      emailOrTel: accountValue,
      dialCode: normalizedDialCode,
    });
  }, [shouldNormalizeAccount, accountValue, normalizedDialCode]);

  useEffect(() => {
    const value = `${currentDialCode}${accountValue}`;

    dialCodeStateRef.current = { value, code: currentDialCode };

    if (dialCodeInstanceRef.current) {
      dialCodeInstanceRef.current.value = value;
      dialCodeInstanceRef.current.code = currentDialCode;
    }
  }, [accountValue, currentDialCode]);

  useEffect(() => {
    if (!isPhone || onlyRead || !dialCodeTriggerRef.current) return;

    const { value, code } = dialCodeStateRef.current;
    const instance = new DialCodeSelectInstance({
      dom: dialCodeTriggerRef.current,
      value,
      defaultCountry,
      preferredCountries,
      locale,
      onSelectCode: nextCode => {
        const selectedCountry = _.find(countryOptions, item => item.code === nextCode);

        onChangeRef.current({ dialCode: nextCode });

        if (selectedCountry?.iso2) {
          safeLocalStorageSetItem('DefaultCountry', selectedCountry.iso2.toLowerCase());
        }
      },
    });

    instance.value = value;
    instance.code = code;
    dialCodeInstanceRef.current = instance;

    return () => {
      instance._destroy?.();

      if (dialCodeInstanceRef.current === instance) {
        dialCodeInstanceRef.current = null;
      }
    };
  }, [isPhone, onlyRead, defaultCountry, preferredCountries, locale, countryOptions]);

  useEffect(() => {
    initIntlTelInput().setCode(currentDialCode);
  }, [currentDialCode]);

  const onChangeAccount = (e, forceCommit = false) => {
    const inputValue = e.target.value;

    if (!forceCommit && (isComposingRef.current || e.nativeEvent?.isComposing)) {
      setCompositionValue(inputValue);
      return;
    }

    const normalizedValue = String(inputValue || '').replace(/\s/g, '');
    const parsed = parseFullNumberInput({
      inputValue: normalizedValue,
      defaultCountry,
      fallbackCode: currentDialCode,
    });
    const value = parsed ? parsed.numberValue : normalizedValue;
    const nextIsPhone = isPhoneAccount(value);

    onChange({
      emailOrTel: value,
      warnList: _.filter(warnList, it => 'inputAccount' !== it.tipDom),
      dialCode: keys.includes('email') || !nextIsPhone ? '' : parsed?.code || currentDialCode,
    });
  };

  const warn = _.find(warnList, it => it.tipDom === 'inputAccount');

  return (
    <div
      className={cx('mesDiv', {
        hasValue: !!accountValue || focusDiv === 'inputAccount',
        errorDiv: warn,
        warnDiv: warn && warn.noErr,
        errorDivCu: !!focusDiv && focusDiv === 'inputAccount',
      })}
    >
      <div className={cx('authAccountControl', { onlyRead })}>
        {isPhone && (
          <div
            className="authAccountDialCodeTrigger"
            ref={dialCodeTriggerRef}
            role="button"
            tabIndex="-1"
            aria-haspopup="dialog"
          >
            <span className="authAccountDialCodeValue">{currentDialCode}</span>
            <Icon icon="arrow-down" className="authAccountDialCodeArrow" />
          </div>
        )}
        <input
          type="text"
          id="txtMobilePhone"
          disabled={onlyRead}
          value={compositionValue === null ? accountValue : compositionValue}
          autoComplete={type !== 'login' ? 'new-password' : 'on'}
          onBlur={() => onChange({ focusDiv: '' })}
          onFocus={() => onChange({ focusDiv: 'inputAccount' })}
          onChange={onChangeAccount}
          onCompositionStart={e => {
            isComposingRef.current = true;
            setCompositionValue(e.currentTarget.value);
          }}
          onCompositionEnd={e => {
            isComposingRef.current = false;
            setCompositionValue(null);
            onChangeAccount(e, true);
          }}
        />
      </div>
      {canChangeEmailOrTel && (
        <Icon
          type="swap_horiz"
          className="textTertiary Hand hoverColorPrimary changeEmailOrTel Font20"
          onClick={() => {
            const { mobilephone, email } = props;
            let mobile = mobilephone;

            if (dialCode) {
              mobile = mobilephone.replace(dialCode, '');
            }

            onChange({
              emailOrTel: emailOrTel === email ? mobile : email,
              dialCode: emailOrTel === email ? dialCode : '',
            });
          }}
        />
      )}
      <div className="title" onClick={() => onChange({ focusDiv: 'inputAccount' })}>
        {keys.includes('tel') ? _l('手机号') : keys.includes('email') ? _l('邮箱') : _l('手机号或邮箱')}
      </div>
      {warn && <div className={cx('warnTips')}>{warn.warnTxt}</div>}
    </div>
  );
}
