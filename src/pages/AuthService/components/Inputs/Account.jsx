import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { createIntlTelInput } from 'ming-ui/components/PhoneNumberInput/util';
import { getDialCode, getEmailOrTel, isTel } from 'src/pages/AuthService/util.js';

// 无区号时的输入框左内边距（区号 trigger 隐藏或邮箱态），与 .title left 及 dialCodeInputGap 保持一致
const INPUT_PADDING_LEFT = 12;

// 'inputAccount',//手机邮箱输入框
export default function (props) {
  const { keys, onlyRead, type, emailOrTel, onChange = () => {}, canChangeEmailOrTel, focusDiv, warnList } = props;

  const cache = useRef({});
  const mobileInput = useRef();
  const isTelMode = keys.includes('tel') && !keys.includes('email');

  const resetToInitialState = () => {
    if (window.initIntlTelInput) {
      window.initIntlTelInput.setNumber('');
    }

    if (mobileInput.current) {
      mobileInput.current.value = '';
      mobileInput.current.style.paddingLeft = `${INPUT_PADDING_LEFT}px`;
    }
  };

  useEffect(() => {
    const prevValue = cache.current.emailOrTel;
    cache.current.emailOrTel = emailOrTel;
    if (emailOrTel) {
      setInputValue(emailOrTel);
    } else if (isTelMode || isTel(prevValue)) {
      resetToInitialState();
    }
  }, [emailOrTel, isTelMode]);

  useEffect(() => {
    renderItiInput();
  }, []);

  let autoCompleteData = { autoComplete: type !== 'login' ? 'new-password' : 'on' };

  const renderItiInput = () => {
    if (mobileInput.current) {
      window.initIntlTelInput = null;
      window.initIntlTelInput = createIntlTelInput(mobileInput.current, {
        separateDialCode: false,
        showSelectedDialCode: true,
        showDialCodeInput: true,
        dialCodeInputGap: 12,
      });
      window.initIntlTelInput.dialCodeTrigger.tabIndex = -1;
      emailOrTel && setInputValue(emailOrTel);
      $(mobileInput.current).on('close:countrydropdown keyup', () => {
        cache.current.emailOrTel && setInputValue(cache.current.emailOrTel);
        safeLocalStorageSetItem('DefaultCountry', window.initIntlTelInput.getSelectedCountryData().iso2);
      });
    }
  };

  const setInputValue = emailOrTel => {
    const isPhone = isTel(emailOrTel);

    if (isPhone) {
      window.initIntlTelInput.setNumber(emailOrTel || '');
    } else if (mobileInput.current) {
      // 区号组件会写入行内 padding，切换为邮箱时需恢复普通输入间距。
      mobileInput.current.style.paddingLeft = `${INPUT_PADDING_LEFT}px`;
    }

    const value = getEmailOrTel(emailOrTel);
    onChange({ emailOrTel: value, dialCode: isPhone ? getDialCode() : '' });
    mobileInput.current.value = value;
  };

  const onChangeAccount = e => {
    const { keys, warnList } = props;
    const prevValue = cache.current.emailOrTel;
    let data = _.filter(warnList, it => 'inputAccount' !== it.tipDom);
    let value = getEmailOrTel(e.target.value);

    if (!value && (isTelMode || isTel(prevValue))) {
      resetToInitialState();
    }

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
      <input
        type="text"
        id="txtMobilePhone"
        className={cx({ onlyRead: onlyRead, showIti: isTel(emailOrTel) })}
        disabled={onlyRead ? 'disabled' : ''}
        ref={mobileInput}
        onBlur={() => onChange({ focusDiv: '' })}
        onFocus={() => {
          if (!emailOrTel && mobileInput.current) {
            mobileInput.current.style.paddingLeft = `${INPUT_PADDING_LEFT}px`;
          }

          onChange({ focusDiv: 'inputAccount' });
        }}
        onPaste={e => onChangeAccount(e)}
        onChange={e => onChangeAccount(e)}
        {...autoCompleteData}
      />
      {canChangeEmailOrTel && (
        <Icon
          type="swap_horiz"
          className="textTertiary Hand hoverColorPrimary changeEmailOrTel Font20"
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
