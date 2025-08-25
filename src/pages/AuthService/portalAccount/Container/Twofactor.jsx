import React from 'react';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { isTel } from 'src/pages/AuthService/util.js';
import { validation } from 'src/pages/AuthService/util.js';
import { encrypt } from 'src/utils/common';
import { setAutoLoginKey } from '../util';
import Form from './Form';

export default function (props) {
  const {
    appId = '',
    state,
    isAutoLogin,
    autoLogin,
    loading,
    sending,
    twofactorInfo,
    dialCode,
    emailOrTel,
    verifyCode,
    focusDiv,
    onlyRead,
    password,
    warnList,
    updateWarn = () => {},
    onChange = () => {},
    loginCallback = () => {},
  } = props;

  const twofactorLogin = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { ticket, randstr } = resRet;
    const account = (isTel(emailOrTel) ? dialCode : '') + emailOrTel;
    externalPortalAjax
      .twofactorLogin(
        {
          account: encrypt(account),
          verifyCode,
          captchaType: md.global.getCaptchaType(),
          ticket,
          randStr: randstr,
          state, // 首次登陆返回的state
          autoLogin: autoLogin && isAutoLogin,
        },
        props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
      )
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        loginCallback(res);
      });
  };
  const { email, mobilephone } = twofactorInfo; // accountId,accountResult, email,mobilephone
  const way = (email && mobilephone) || (!email && !mobilephone) ? 'emailOrTel' : mobilephone ? 'tel' : 'email';
  const param = {
    warnList,
    focusDiv,
    dialCode,
    emailOrTel,
    verifyCode,
    password,
    onlyRead,
    type: 'portalLogin',
    onChange: data => onChange({ ...data }),
  };
  return loading ? (
    <LoadDiv style={{ margin: '100px auto' }} />
  ) : (
    <React.Fragment>
      <Form
        {...param}
        type="portalLogin"
        keys={[way, 'code']}
        key={'phone_con'}
        canChangeEmailOrTel={email && mobilephone}
        appId={appId}
        sendVerifyCode={externalPortalAjax.sendVerifyCode}
      />

      <React.Fragment>
        <div
          className={cx('loginBtn mTop32 TxtCenter Hand', { sending })}
          onClick={async () => {
            let validationData = await validation({
              isForSendCode: false,
              keys: [way, 'code'],
              type: 'portalLogin',
              info: props,
            });
            let isV = await validationData.isRight;
            updateWarn(validationData.warnList);
            if (isV) {
              if (!props.verifyCode) {
                updateWarn([{ tipDom: 'inputCode', warnTxt: _l('请输入验证码！') }]);
                return;
              }
              twofactorLogin({});
            }
          }}
        >
          {_l('登录')}
          {sending ? '...' : ''}
        </div>
      </React.Fragment>
    </React.Fragment>
  );
}
