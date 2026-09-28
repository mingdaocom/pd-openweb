import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Tooltip } from 'ming-ui/antd-components';
import { Popup } from 'ming-ui/antd-mobile-components';
import { captcha } from 'ming-ui/functions';
import accountAjax from 'src/api/account';
import accountSettingAjax from 'src/api/accountSetting';
import Select from 'src/ming-ui/antd-components/Select';
import { getSendVerifyCodeErrorMessage, getVerifyTypes, VERIFY_TYPE } from 'src/utils/domain/security/verification';
import { browserIsMobile, isBioVerifyAvailable } from 'src/utils/platform/browser/device';
import { getAccountPersonalUrl } from 'src/utils/platform/navigation/path';
import { getVerifyTypeText, VERIFY_TYPE_CONFIG } from './VerifyPasswordInput/config';

const Password = styled(Input.Password)`
  height: 36px;
  box-shadow: none !important;
  line-height: 28px !important;
  border-radius: 3px !important;
  border: 1px solid var(--color-border-primary) !important;
  margin-bottom: 10px;
  transition: none !important;
  &.hap-input-affix-wrapper-focused {
    border-color: var(--color-primary) !important;
  }
`;

const VerifyCodeInput = styled(Input)`
  height: 36px;
  box-shadow: none !important;
  border-radius: 3px !important;
  border: 1px solid var(--color-border-primary) !important;
  transition: none !important;
  &:focus,
  &:hover {
    border-color: var(--color-primary) !important;
    box-shadow: none !important;
  }
`;

const VerifyCodeRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SendCodeButton = styled.button`
  height: 36px;
  padding: 0 24px;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-secondary);
  background: var(--color-background-primary);
  cursor: pointer;
  &:not(:disabled):hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
  &:disabled {
    color: var(--color-text-disabled);
    border-color: var(--color-border-primary);
    cursor: not-allowed;
  }
`;

const User = styled.div`
  height: 36px;
  background: var(--color-background-secondary);
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  padding: 0 10px;
`;

const MobileVerifyTypeContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);

  .header {
    padding: 20px 15px 0 !important;
  }

  .verifyTypeList {
    flex: 1;
    padding: 0 20px 15px;
    color: var(--color-text-primary);
  }

  .verifyTypeItem {
    height: 50px;
    font-size: 15px;
    font-weight: 500;
  }
`;

const RequiredBox = styled.div`
  margin: 1px 0 0 -8px;
  color: var(--color-error);
`;

const TipsIconWrap = styled.div`
  color: var(--color-text-tertiary);
  cursor: pointer;
  &:hover {
    color: var(--color-text-secondary);
  }
`;

const settingBtns = () => {
  return (
    <span
      className="colorPrimary Hand"
      onClick={() => {
        window.open(getAccountPersonalUrl());
      }}
    >
      {_l('前往设置')}
    </span>
  );
};

export default function VerifyPasswordInput(props) {
  const {
    className,
    showSubTitle,
    isRequired,
    autoFocus,
    showVerifyType = false,
    allowNoVerify,
    showAccountEmail,
    onChange = () => {},
  } = props;
  const mobilePhone = md.global.Account.mobilePhone;
  const email = md.global.Account.email || '';
  const account = showAccountEmail && email ? email : mobilePhone ? mobilePhone : email;
  const bioVerifyAvailable = showVerifyType && isBioVerifyAvailable();
  const [isNoneVerification, setIsNoneVerification] = useState(false);
  const [verifyType, setVerifyType] = useState(bioVerifyAvailable ? VERIFY_TYPE.bioVerify : VERIFY_TYPE.password);
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [showVerifyTypePopup, setShowVerifyTypePopup] = useState(false);
  const countDownRef = useRef(null);
  const bioVerifyInitializedRef = useRef(false);
  const inputRef = useRef(null);
  const isMobile = browserIsMobile();
  const verifyTypes = getVerifyTypes({ mobilePhone, email, totpEnabled, bioVerifyAvailable });
  const hideMobileVerifyTypeSelect = isMobile && verifyTypes.length === 1 && verifyTypes[0] === VERIFY_TYPE.password;
  const isPasswordVerify = verifyType === VERIFY_TYPE.password;
  const isBioVerify = verifyType === VERIFY_TYPE.bioVerify;
  const isSendCodeVerify = verifyType === VERIFY_TYPE.mobilePhone || verifyType === VERIFY_TYPE.email;

  useEffect(() => {
    if (!autoFocus || isMobile || verifyType === VERIFY_TYPE.bioVerify) return;

    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  }, [autoFocus, isMobile, verifyType]);

  const onBioVerifyFallback = useCallback(
    keepNoneVerification => {
      setVerifyType(VERIFY_TYPE.password);
      onChange({
        verifyType: VERIFY_TYPE.password,
        password: '',
        verifyCode: '',
        isNoneVerification: keepNoneVerification,
      });
    },
    [onChange],
  );

  useEffect(() => {
    if (!bioVerifyAvailable || bioVerifyInitializedRef.current) return;

    bioVerifyInitializedRef.current = true;
    onChange({
      verifyType: VERIFY_TYPE.bioVerify,
      password: '',
      verifyCode: '',
      isNoneVerification: false,
      onBioVerifyFallback,
    });
  }, [bioVerifyAvailable, onBioVerifyFallback, onChange]);

  useEffect(() => {
    if (!showVerifyType) return;

    accountSettingAjax.getAccountSettings({}).then(res => {
      setTotpEnabled(!!res.twoAuthenticationTotpEnabled);
    });
  }, [showVerifyType]);

  useEffect(() => {
    return () => {
      countDownRef.current && clearInterval(countDownRef.current);
    };
  }, []);

  const emitChange = nextValue => {
    onChange({
      verifyType,
      password,
      verifyCode,
      isNoneVerification,
      onBioVerifyFallback,
      ...nextValue,
    });
  };

  const resetCountDown = () => {
    countDownRef.current && clearInterval(countDownRef.current);
    countDownRef.current = null;
    setCountDown(0);
  };

  const startCountDown = () => {
    countDownRef.current && clearInterval(countDownRef.current);
    setCountDown(60);
    countDownRef.current = setInterval(() => {
      setCountDown(value => {
        if (value <= 1) {
          clearInterval(countDownRef.current);
          countDownRef.current = null;
          return 0;
        }

        return value - 1;
      });
    }, 1000);
  };

  const handleVerifyTypeChange = type => {
    if (type === verifyType) return;

    setVerifyType(type);
    setPassword('');
    setVerifyCode('');
    resetCountDown();
    emitChange({ verifyType: type, password: '', verifyCode: '' });
  };

  const handleSendVerifyCode = () => {
    if (!isSendCodeVerify || sendCodeLoading || countDown > 0) return;

    const cb = res => {
      if (res.ret !== 0) return;

      setSendCodeLoading(true);
      accountAjax
        .sendVerifyCode({
          type: verifyType,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        })
        .then(statusCode => {
          setSendCodeLoading(false);
          if (statusCode === 1) {
            startCountDown();
            return;
          }

          alert(getSendVerifyCodeErrorMessage(statusCode), 2);
        })
        .catch(() => {
          setSendCodeLoading(false);
        });
    };

    new captcha(cb);
  };

  const verifyCheckBox = () => {
    return (
      <span className="mTop5 InlineBlock noVerifyWrap">
        <Checkbox
          className="TxtTop textPrimary"
          checked={isNoneVerification}
          onChange={event => {
            const checked = event.target.checked;
            setIsNoneVerification(checked);
            emitChange({ isNoneVerification: checked });
          }}
        >
          {_l('一小时内免验证')}
        </Checkbox>
      </span>
    );
  };

  const renderVerifyTypeLabel = () => {
    if (!showVerifyType) return null;

    return (
      <div className="Font13 mTop20 mBottom10 relative flexRow alignItemsCenter">
        <span className={`Font13 textPrimary label ${isMobile ? 'bold flex' : ''}`}>{_l('验证方式')}</span>
        {isMobile ? (
          renderPasswordTip()
        ) : (
          <Tooltip
            title={_l(
              '支持登录密码、短信验证码、邮件验证码、身份验证器 4 种验证方式。短信、邮件验证码需先绑定手机号或邮箱；身份验证器需先开启两步认证并完成配置。',
            )}
          >
            <TipsIconWrap className="flexRow alignItemsCenter mLeft8">
              <i className="icon icon-help Font16" />
            </TipsIconWrap>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderVerifyTypeContent = (type, showCheck) => {
    const config = VERIFY_TYPE_CONFIG[type];

    return (
      <div className="flexRow alignItemsCenter">
        <Icon icon={config.icon} style={{ color: config.color }} className="mRight10 Font16" />
        <span className="flex">{config.text}</span>
        {showCheck && <Icon icon="done" className="Font18 colorPrimary" />}
      </div>
    );
  };

  const renderMobileVerifyTypePopup = () => {
    return (
      <Popup
        position="bottom"
        className="mobileModal topRadius verifyTypeMobilePopup"
        visible={showVerifyTypePopup}
        onMaskClick={() => setShowVerifyTypePopup(false)}
        onClose={() => setShowVerifyTypePopup(false)}
      >
        <MobileVerifyTypeContent>
          <div className="header flexRow alignItemsCenter">
            <div className="Font13 textTertiary flex">{_l('验证方式')}</div>
            <div className="closeIcon" onClick={() => setShowVerifyTypePopup(false)}>
              <Icon icon="close" className="Font17 textTertiary bold" />
            </div>
          </div>
          <div className="verifyTypeList">
            {verifyTypes.map(type => {
              const config = VERIFY_TYPE_CONFIG[type];

              return (
                <div
                  className="verifyTypeItem flexRow alignItemsCenter"
                  key={type}
                  onClick={() => {
                    handleVerifyTypeChange(type);
                    setShowVerifyTypePopup(false);
                  }}
                >
                  <Icon icon={config.icon} style={{ color: config.color }} className="mRight24 Font20 TxtMiddle" />
                  <span>{config.text}</span>
                </div>
              );
            })}
          </div>
        </MobileVerifyTypeContent>
      </Popup>
    );
  };

  const handleOpenMobileVerifyTypePopup = e => {
    if (verifyTypes.length === 1) return;

    e && e.preventDefault();
    setShowVerifyTypePopup(true);
  };

  const renderVerifyTypeSelect = () => {
    if (!showVerifyType || hideMobileVerifyTypeSelect) return null;

    const mobileSelectProps = isMobile
      ? {
          open: false,
          onMouseDown: handleOpenMobileVerifyTypePopup,
          onClick: handleOpenMobileVerifyTypePopup,
        }
      : {};

    return (
      <Fragment>
        <Select
          className={`w100 ${isMobile ? 'mBottom10' : 'mBottom20'}`}
          disabled={verifyTypes.length === 1}
          optionLabelProp="label"
          suffixIcon={<Icon icon="arrow-down-border" className="textTertiary Font14" />}
          value={verifyType}
          onChange={handleVerifyTypeChange}
          options={verifyTypes.map(type => ({
            value: type,
            label: renderVerifyTypeContent(type),
          }))}
          optionRender={({ value }) => renderVerifyTypeContent(value, value === verifyType)}
          {...mobileSelectProps}
        />
        {isMobile && renderMobileVerifyTypePopup()}
      </Fragment>
    );
  };

  const renderPasswordTip = () => {
    if (!isPasswordVerify) return null;

    return (
      <Tooltip
        title={
          <Fragment>
            {isRequired ? (
              <div>
                <div>{_l('此操作必须验证用户密码。')}</div>
                <div>{_l('如果你是集成帐号，还没有设置过当前平台密码，请先在个人中心设置密码')}</div>
                {settingBtns()}
              </div>
            ) : (
              <div>
                <div>{_l('如果你是集成帐号，还没有设置过当前平台密码：')}</div>
                <div>{_l('- 不需要输入，不进行安全验证')}</div>
                <div>
                  {_l('- 如果你希望提高安全性，可在个人中心设置密码。设置后将必须输入密码进行安全验证')}
                  {settingBtns()}
                </div>
              </div>
            )}
          </Fragment>
        }
      >
        <TipsIconWrap className="flexRow alignItemsCenter">
          <i className="icon icon-help mRight5 Font16" />
          <span>{_l('没有密码')}</span>
        </TipsIconWrap>
      </Tooltip>
    );
  };

  const renderInputLabel = () => {
    return (
      <div className={`Font13 ${showVerifyType ? '' : 'mTop20'} mBottom10 relative flexRow alignItemsCenter`}>
        {!showVerifyType && isRequired && <RequiredBox className="Absolute">*</RequiredBox>}
        <span className={`flex Font13 textPrimary label ${isMobile ? 'bold' : ''}`}>
          {isPasswordVerify ? _l('密码') : getVerifyTypeText(verifyType)}
        </span>
        {renderPasswordTip()}
      </div>
    );
  };

  const renderPasswordInput = () => {
    return (
      <Fragment>
        <div style={{ height: 0, overflow: 'hidden' }}>
          {/* 用来避免浏览器将用户名塞到其它input里 */}
          <input type="text" />
        </div>
        <Password
          ref={inputRef}
          autoFocus={autoFocus}
          autoComplete="new-password"
          placeholder={_l('请输入账号%0密码', account)}
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            emitChange({ password: e.target.value });
          }}
        />
      </Fragment>
    );
  };

  const getVerifyCodePlaceholder = () => {
    if (verifyType === VERIFY_TYPE.totp) return _l('请输入6位验证码');

    const verifyAccount =
      verifyType === VERIFY_TYPE.mobilePhone ? mobilePhone : verifyType === VERIFY_TYPE.email ? email : '';

    return _l('请输入%0验证码', verifyAccount);
  };

  const renderVerifyCodeInput = () => {
    return (
      <VerifyCodeRow>
        <VerifyCodeInput
          ref={inputRef}
          className="flex"
          autoFocus={autoFocus}
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          value={verifyCode}
          placeholder={getVerifyCodePlaceholder()}
          onChange={e => {
            const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);

            setVerifyCode(value);
            emitChange({ verifyCode: value });
          }}
        />
        {isSendCodeVerify && (
          <SendCodeButton type="button" disabled={sendCodeLoading || countDown > 0} onClick={handleSendVerifyCode}>
            {countDown > 0 ? _l('%0秒后重发', countDown) : sendCodeLoading ? _l('发送中...') : _l('获取验证码')}
          </SendCodeButton>
        )}
      </VerifyCodeRow>
    );
  };

  return (
    <div className={className}>
      {showSubTitle && <div className="Font17 bold mBottom16 verifyPasswordTitle">{_l('安全验证')}</div>}

      {!isMobile && (
        <Fragment>
          <div className="Font13 textPrimary label">{_l('账号')}</div>
          <User className="mTop10 flexRow alignItemsCenter">{account}</User>
        </Fragment>
      )}

      {renderVerifyTypeLabel()}
      {renderVerifyTypeSelect()}
      {!isBioVerify && (!isMobile || !showVerifyType) && renderInputLabel()}
      {!isBioVerify && (isPasswordVerify ? renderPasswordInput() : renderVerifyCodeInput())}

      {/* 一小时免验证 */}
      {allowNoVerify && !isBioVerify ? (
        isMobile ? (
          verifyCheckBox()
        ) : (
          <Tooltip placement="bottom" title={_l('此后1小时内在当前设备上应用和审批操作无需再次验证')}>
            {verifyCheckBox()}
          </Tooltip>
        )
      ) : (
        ''
      )}
    </div>
  );
}
