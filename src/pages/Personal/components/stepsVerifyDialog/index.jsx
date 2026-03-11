import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import accountAjax from 'src/api/account';
import accountSettingAjax from 'src/api/accountSetting';
import { identityVerificationFunc } from '../IdentityVerification';
import { validateFunc } from '../ValidateInfo';
import '../InitBindAccountDialog/index.less';

const StepsVerifyDialogWrap = styled(Dialog)`
  .methodItem {
    display: flex;
    border-bottom: 1px solid #e8e8e8;
    padding: 18px 0;
    &:last-child {
      border-bottom: none;
    }
    .disabledSwitch {
      width: fit-content;
      height: fit-content;
    }
  }
`;

const QrCodeWrap = styled.div`
  width: 215px;
  height: 215px;
  text-align: center;
  position: relative;
  .isOverTime {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: rgba(250, 250, 250, 0.95);
    i {
      color: var(--color-primary);
      margin: 20px 0 0;
      display: inline-block;
    }
    p {
      margin: 24px auto;
    }
    .refresh {
      padding: 10px 24px;
      background: var(--color-primary);
      opacity: 1;
      border-radius: 18px;
      color: var(--color-white);
    }
  }
`;

// 身份验证器验证
function Authenticator(props) {
  const { onCancel, twoAuthenticationTotpEnabled, updateTwoAuthentication } = props;
  const [accountTotpScanUrl, setAccountTotpScanUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOverTime, setIsOverTime] = useState(false);
  const inputRef = useRef(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const getAccountTotpScanUrl = () => {
    if (twoAuthenticationTotpEnabled) return;
    setLoading(true);
    accountAjax
      .getAccountTotpScanUrl()
      .then(res => {
        setLoading(false);
        if (res) {
          setAccountTotpScanUrl(res);
          setIsOverTime(false);
          inputRef && inputRef.current?.focus();
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleVerify = () => {
    if (!verifyCode.trim() && !twoAuthenticationTotpEnabled) {
      alert(_l('请输入验证码'), 2);
      return;
    }

    setVerifyLoading(true);
    accountAjax.editAccountTotp({ verifyCode, isEnable: !twoAuthenticationTotpEnabled }).then(res => {
      setVerifyLoading(false);
      if (res === 1) {
        updateTwoAuthentication({ twoAuthenticationTotpEnabled: !twoAuthenticationTotpEnabled });
        onCancel();
      } else if (res === 0) {
        alert(_l('验证失败'), 2);
      } else if (res === 3) {
        alert(_l('验证码错误'), 2);
      } else if (res === 16) {
        // 二维码过期
        setIsOverTime(true);
      } else if (res === 19) {
        // 用户验证密码失效，重新验证密码
        identityVerificationFunc({
          verificationSuccess: handleVerify,
        });
      }
    });
  };

  useEffect(() => {
    if (twoAuthenticationTotpEnabled) {
      handleVerify();
      return;
    }
    getAccountTotpScanUrl();
  }, []);

  const codeUrl = accountTotpScanUrl
    ? md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${accountTotpScanUrl}`
    : '';

  if (twoAuthenticationTotpEnabled) return null;

  return (
    <Dialog
      width={720}
      title={_l('设置身份验证器')}
      visible
      showCancel={false}
      onCancel={onCancel}
      okDisabled={verifyLoading}
      onOk={handleVerify}
    >
      <div className="textPrimary">
        <div className="mBottom20">
          {_l(
            '身份验证器应用能让你无需接收短信或邮件，即可获取安全验证码。您需要先在手机上安装一个身份验证器应用，我们推荐安装',
          )}
          <span className="bold mLeft3 mRight3">Google Authenticator</span>、
          <span className="bold">Microsoft Authenticator</span>
          <span className="mLeft3 mRight3">{_l('或')}</span>
          <span className="bold">Authy</span>
        </div>
        <div className="Font15 bold mBottom20">{_l('1. 打开身份验证器应用')}</div>
        <div className="flexRow">
          <div className="flex">
            <div className="mBottom16">{_l('2. 扫描下方二维码添加账户')}</div>
            {loading || !codeUrl ? (
              <div className="flexRow justifyContentCenter qrCode">
                <LoadDiv />
              </div>
            ) : (
              <QrCodeWrap className="qrCode">
                <img src={codeUrl} width={215} height={215} />
                {isOverTime && (
                  <div className="isOverTime">
                    <Icon icon={'error1'} className="Font48 " />
                    <p className="Font14">{_l('当前二维码已过期')}</p>
                    <span className="refresh Hand" onClick={getAccountTotpScanUrl}>
                      {_l('刷新')}
                    </span>
                  </div>
                )}
              </QrCodeWrap>
            )}
          </div>
          <div className="flex">
            <div className="mBottom16">{_l('3. 输入扫码后获得的验证码')}</div>
            <Input
              maxLength={6}
              manualRef={inputRef}
              className="w100"
              placeholder={_l('输入6位验证码')}
              value={verifyCode}
              onChange={val => setVerifyCode(val.replace(/[^\d]/g, ''))}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

const authenticatorFunc = props => FunctionWrap(Authenticator, props);

// 设置两步验证方式
export default function StepsVerifyDialog(props) {
  const {
    mobilePhone,
    email,
    twoAuthenticationMobilePhoneEnabled,
    twoAuthenticationEmailEnabled,
    twoAuthenticationTotpEnabled,
    isVerify,
    visible,
    updateTwoAuthentication,
    getAccountSettings,
    onCancel,
  } = props;

  const editAccountTwoAuthenticationSetting = (settingType, settingValue) => {
    accountSettingAjax.editAccountTwoAuthenticationSetting({ settingType, settingValue }).then(res => {
      if (res === 19) {
        // 用户密码验证失效，重新验证密码
        identityVerificationFunc({
          verificationSuccess: () => {
            editAccountTwoAuthenticationSetting(settingType, settingValue);
          },
        });
      } else if (res === 17) {
        // 开启手机号验证，但是手机号为空
      } else if (res === 12) {
        // 开启邮箱验证，但是邮箱为空
      } else if (res === 1) {
        if (
          (settingType === 2 && !twoAuthenticationMobilePhoneEnabled) ||
          (settingType === 1 && !twoAuthenticationEmailEnabled)
        ) {
          alert(settingValue === 1 ? _l('已开启两步验证') : _l('已关闭两步验证'));
        }

        // 开启任意验证方式外侧总开关开启
        getAccountSettings();
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

  const handleSwitch = item => {
    if (item.value === 'authenticator') {
      authenticatorFunc({
        updateTwoAuthentication,
        twoAuthenticationTotpEnabled,
      });
      return;
    }

    const bindMobilePhone = item.value === 'mobilePhone' && mobilePhone;
    const bindEmail = item.value === 'email' && email && isVerify;

    if (bindMobilePhone) {
      editAccountTwoAuthenticationSetting(1, twoAuthenticationMobilePhoneEnabled ? 0 : 1);
      return;
    }
    if (bindEmail) {
      editAccountTwoAuthenticationSetting(2, twoAuthenticationEmailEnabled ? 0 : 1);
      return;
    }
    if (!bindMobilePhone || !bindEmail) {
      validateFunc({
        title: email && !isVerify ? _l('修改邮箱') : item.value === 'email' ? _l('绑定邮箱') : _l('绑定手机号码'),
        type: item.value,
        des: '',
        showStep: false,
        passVerifyPassword: true,
        callback: function () {
          updateTwoAuthentication({ isVerify: item.value === 'email' });
          editAccountTwoAuthenticationSetting(item.value === 'email' ? 2 : 1, 1);
        },
      });
    }
  };

  return (
    <StepsVerifyDialogWrap
      width={640}
      title={_l('设置两步验证方式')}
      visible={visible}
      okText={_l('关闭')}
      onOk={onCancel}
      onCancel={onCancel}
      showCancel={false}
      closable={false}
    >
      <div className="textSecondary">{_l('为避免收不到验证码，建议至少启用两种验证方式')}</div>
      <div>
        {[
          { label: _l('短信验证码'), value: 'mobilePhone', checked: 'twoAuthenticationMobilePhoneEnabled' },
          { label: _l('邮箱验证码'), value: 'email', checked: 'twoAuthenticationEmailEnabled' },
          {
            label: _l('身份验证器应用 (TOTP)'),
            value: 'authenticator',
            desc: _l('使用手机上的身份验证器应用获得验证码'),
            checked: 'twoAuthenticationTotpEnabled',
          },
        ].map(item => {
          const disabled =
            (item.value === 'authenticator' &&
              !twoAuthenticationEmailEnabled &&
              !twoAuthenticationMobilePhoneEnabled) ||
            (twoAuthenticationTotpEnabled &&
              ((item.value === 'mobilePhone' &&
                twoAuthenticationMobilePhoneEnabled &&
                !twoAuthenticationEmailEnabled) ||
                (item.value === 'email' && twoAuthenticationEmailEnabled && !twoAuthenticationTotpEnabled)));
          return (
            <div className="methodItem">
              {disabled ? (
                <Tooltip
                  title={
                    item.value === 'authenticator'
                      ? _l('需要先开启短信或邮箱验证方式，才能启用TOTP验证')
                      : _l('需要保留短信或邮箱至少一种验证方式')
                  }
                >
                  <div className="disabledSwitch InlineBlock mRight20">
                    <Switch className="mTop3" size="small" checked={props[item.checked]} disabled={disabled} />
                  </div>
                </Tooltip>
              ) : (
                <Switch
                  className="mRight20 mTop3"
                  size="small"
                  checked={props[item.checked]}
                  onClick={() => handleSwitch(item)}
                />
              )}
              <div className="flex minWidth0">
                <div className="Font13 textPrimary">{item.label}</div>
                <div className="textSecondary">
                  {item.value === 'authenticator'
                    ? item.desc
                    : item.value === 'mobilePhone' && mobilePhone
                      ? mobilePhone
                      : item.value === 'email' && email
                        ? email
                        : _l('未绑定')}
                  <span className="textPrimary mLeft12">
                    {!isVerify && item.value === 'email' && email && _l('未验证')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </StepsVerifyDialogWrap>
  );
}
