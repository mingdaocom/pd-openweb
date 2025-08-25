import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import intlTelInput from 'ming-ui/components/intlTelInput';
import { getDefaultCountry, getDialCode, getEmailOrTel, isTel } from 'src/pages/AuthService/util.js';

// 'inputAccount',//手机邮箱输入框
export default function (props) {
  const { keys, onlyRead, type, emailOrTel, onChange = () => {}, canChangeEmailOrTel, focusDiv, warnList } = props;

  const cache = useRef({});
  const mobile = useRef();
  const mobileInput = useRef();

  useEffect(() => {
    cache.current.emailOrTel = emailOrTel;
    emailOrTel && setInputValue(emailOrTel);
  }, [emailOrTel]);

  useEffect(() => {
    renderItiInput();
  }, []);

  let autoCompleteData = { autoComplete: type !== 'login' ? 'new-password' : 'on' };

  const renderItiInput = () => {
    if (mobile.current) {
      window.initIntlTelInput = null;
      window.initIntlTelInput = intlTelInput(mobile.current, {
        customPlaceholder: () => {
          return emailOrTel;
        },
        initialCountry: getDefaultCountry(),
        preferredCountries: _.get(md, 'global.Config.DefaultConfig.preferredCountries') || [getDefaultCountry()],
        separateDialCode: false,
        showSelectedDialCode: true,
      });
      emailOrTel && setInputValue(emailOrTel);
      $(mobile.current).on('close:countrydropdown keyup', () => {
        cache.current.emailOrTel && setInputValue(cache.current.emailOrTel);
        safeLocalStorageSetItem('DefaultCountry', window.initIntlTelInput.getSelectedCountryData().iso2);
      });
    }
  };

  const setInputValue = emailOrTel => {
    isTel(emailOrTel) && window.initIntlTelInput.setNumber(emailOrTel || '');
    const value = getEmailOrTel(emailOrTel);
    onChange({ emailOrTel: value, dialCode: isTel(emailOrTel) ? getDialCode() : '' });
    mobileInput.current.value = value;
    mobile.current.value = value;
  };

  const onChangeAccount = e => {
    const { keys, warnList } = props;
    let data = _.filter(warnList, it => 'inputAccount' !== it.tipDom);
    let value = getEmailOrTel(e.target.value);
    onChange({
      emailOrTel: value,
      warnList: data,
      dialCode: keys.includes('email') ? '' : getDialCode(value.indexOf('@') < 0 && !isNaN(value.replace(/\s*/g, ''))),
    });
    mobileInput.current.value = value;
    mobileInput.current && mobileInput.current.focus();
  };

  const warn = _.find(warnList, it => it.tipDom === 'inputAccount');
  return (
    <div
      className={cx('mesDiv', {
        hasValue: !!emailOrTel || focusDiv === 'inputAccount',
        errorDiv: warn,
        warnDiv: warn && warn.noErr,
        errorDivCu: !!focusDiv && focusDiv === 'inputAccount',
        showIti: isTel(emailOrTel),
      })}
    >
      <input type="text" className="itiCon" tabIndex="-1" ref={mobile} disabled={onlyRead ? 'disabled' : ''} />
      <input
        type="text"
        id="txtMobilePhone"
        className={cx({ onlyRead: onlyRead, showIti: isTel(emailOrTel) })}
        disabled={onlyRead ? 'disabled' : ''}
        ref={mobileInput}
        onBlur={() => onChange({ focusDiv: '' })}
        onFocus={() => onChange({ focusDiv: 'inputAccount' })}
        onPaste={e => onChangeAccount(e)}
        onChange={e => onChangeAccount(e)}
        {...autoCompleteData}
      />
      {canChangeEmailOrTel && (
        <Icon
          type="swap_horiz"
          className="Gray_9e Hand ThemeHoverColor3 changeEmailOrTel Font20"
          onClick={() => {
            const { dialCode, mobilephone, email } = props;
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
