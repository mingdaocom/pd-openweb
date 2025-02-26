import React, { useEffect, useRef } from 'react';
import { Wrap } from './style.jsx';
import DocumentTitle from 'react-document-title';
import FormContainer from './Form.jsx';
import { getRequest } from 'src/util';
import { LoadDiv, Checkbox } from 'ming-ui';
import { getDataByFilterXSS, getAccountTypes, validation, hasCaptcha } from 'src/pages/AuthService/util.js';
import ChangeLang from 'src/components/ChangeLang';
import { navigateTo } from 'src/router/navigateTo';
import VerifyCode from './verifyCode';
import BtnList from './BtnList.jsx';
import loginController from 'src/api/login';
import { captcha } from 'ming-ui/functions';
import { encrypt } from 'src/util';
import { removePssId } from 'src/util/pssId';
import { loginCallback } from 'src/pages/AuthService/login/util.js';
import { useKey } from 'react-use';
import AccountInfo from 'src/pages/AuthService/components/AccountInfo.jsx';

export default function (props) {
  const {
    projectId,
    ldapName,
    modeType,
    verifyType,
    step,
    isNetwork,
    linkInvite,
    loading,
    title,
    onChange = () => {},
    projectNameLang,
    companyName,
    loginDisabled,
    isCheck,
  } = props;
  const showProjectName = isNetwork && !_.get(md, 'global.SysSettings.hideBrandName');

  const cache = useRef({});

  useKey('Enter', e => {
    if (!hasCaptcha()) {
      cache.current.onLogin();
    }
  });

  const onLogin = async frequentLogin => {
    const { modeType } = props;
    if (loginDisabled) {
      return;
    }
    let callback = (res = {}) => {
      if (frequentLogin && res.ret !== 0) {
        return;
      }
      onChange({
        loginDisabled: true,
      });
      if (verifyType !== 'verifyCode') {
        onLoginFetch(res);
      } else {
        sendForVerifyCodeLogin(res);
      }
    };
    const validationData = validation({
      isForSendCode: false,
      keys:
        modeType === 2
          ? ['fullName', 'password']
          : verifyType !== 'verifyCode'
            ? [getAccountTypes(true), 'password']
            : [getAccountTypes(true)],
      type: 'login',
      info: _.pick(props, ['emailOrTel', 'fullName', 'verifyCode', 'password', 'dialCode']),
    });
    let isV = await validationData.isRight;
    onChange({ warnList: validationData.warnList });

    if (isV) {
      if (frequentLogin) {
        if (md.global.getCaptchaType() === 1) {
          new captcha(callback);
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback, { needFeedBack: false }).show();
        }
      } else {
        callback();
      }
    }
  };

  cache.current.onLogin = onLogin;
  //验证码登录=>发送验证码
  const sendForVerifyCodeLogin = data => {
    const { emailOrTel, dialCode } = props;
    let { ticket, randstr } = data;
    loginController
      .sendLoginVerifyCode({
        ticket,
        randStr: randstr,
        captchaType: md.global.getCaptchaType(),
        account: encrypt(dialCode + emailOrTel),
        lang: getCurrentLangCode(),
      })
      .then(res => {
        onChange({ loginDisabled: false });
        switch (res.actionResult) {
          case 1: // 1、发送成功
          case 8: // 8：发送验证码过于频繁
            onChange({ warnList: [], verifyResult: res.actionResult, step: 'verifyCode' });
            break;
          case 3: // 3：前端图形验证码校验失败
            onLogin(true);
            break;
          case 5: // 5：用户不存在
            alert(_l('账号不正确'), 3);
            break;
          case 21: // 21之前登录锁定了，不能进行发送，通常通过忘记密码重置
            alert(_l('当前账户已锁定，验证码发送失败'), 3);
            break;
          default: // 0：失败
            alert(_l('验证码发送失败'), 3);
            break;
        }
      });
  };

  //账号或者手机邮箱登录
  const onLoginFetch = res => {
    const { emailOrTel, password, fullName, isCheck, dialCode, projectId, modeType } = props;
    let account = modeType === 1 ? emailOrTel : fullName;
    let params = {
      password: encrypt(password),
      isCookie: isCheck,
    };
    if (res) {
      params.ticket = res.ticket;
      params.randStr = res.randstr;
      params.captchaType = md.global.getCaptchaType();
    }
    removePssId();
    let cb = data => {
      onChange({ loginDisabled: false });
      loginCallback({
        data: { ...props, ...data },
        onChange: data => {
          onChange(data);
          //需要图形验证
          if (data.frequentLogin) {
            onLogin(true);
          }
        },
      });
    };
    const request = getRequest();
    if (modeType === 2) {
      params.projectId = projectId;
      params.userName = encrypt(account);
      params.regFrom = request.s;
      loginController.lDAPLogin(params).then(data => {
        data.loginType = 1;
        cb(data);
      });
    } else {
      params.account = encrypt(dialCode + account.trim());
      params.state = request.state;
      params.unionId = request.unionId;
      params.tpType = request.tpType;
      params.regFrom = request.s;
      loginController.mDAccountLogin(params).then(data => {
        data.account = account;
        data.loginType = 0;
        cb(data);
      });
    }
  };

  const renderCon = () => {
    switch (step) {
      case 'verifyCode':
        return <VerifyCode {...props} />;
      default:
        const { unionId, state, tpType } = getRequest();
        return (
          <React.Fragment>
            <div className={`titleHeader flexRow alignItemsCenter Bold ${isNetwork ? 'mTop32' : 'mTop40'}`}>
              <div className="title WordBreak hTitle" style={{ WebkitBoxOrient: 'vertical' }}>
                {/* 1:手机号邮箱 2:用户名登录 其他:不使用账户登录方式 */}
                {modeType === 2 ? ldapName || _l('LDAP登录') : _l('登录%14002')}
              </div>
            </div>
            {unionId && state && tpType && <AccountInfo />}
            {modeType && (
              <FormContainer
                {...props}
                key={`formContainer_${modeType}`}
                keys={
                  modeType === 2
                    ? ['fullName', 'password']
                    : verifyType === 'verifyCode'
                      ? [getAccountTypes(true)]
                      : [getAccountTypes(true), 'password']
                }
              />
            )}
            {loginDisabled && <div className="loadingLine"></div>}
            <div className="mTop24 clearfix Font14">
              <div
                className="cbRememberPasswordDiv Gray Font14 Left Hand flexRow alignItemsCenter"
                onClick={() => onChange({ isCheck: !isCheck })}
              >
                <Checkbox checked={isCheck} className="InlineBlock" />
                {_l('下次自动登录')}
              </div>
              {modeType !== 2 && verifyType === 'password' && (
                <div className="Right">
                  <a target="_blank" className="findPassword" onClick={() => navigateTo('/findPassword')}>
                    {_l('忘记密码？')}
                  </a>
                </div>
              )}
            </div>
            <span className="btnForLogin Hand" onClick={() => onLogin(verifyType === 'verifyCode')}>
              {verifyType !== 'verifyCode' ? _l('登 录') : _l('继 续')}
              {loginDisabled ? '...' : ''}
            </span>
            <BtnList {...props} />
            {window.isMiniProgram && (
              <div className="flexRow alignItemsCenter justifyContentCenter mTop25 Gray_75">
                {_l('此小程序仅支持组织内部员工登录使用')}
              </div>
            )}
          </React.Fragment>
        );
    }
  };

  const toRegist = () => {
    if (window.isMingDaoApp) {
      window.md_js.back({ closeAll: true, next: 'register' });
      return;
    }
    const request = getRequest();
    onChange({ warnList: [] });
    if (md.global.Config.IsPlatformLocal) {
      //平台版=>/register
      navigateTo('/register');
    } else if (linkInvite) {
      onChange({ isLink: true, projectId: projectId });
      navigateTo(linkInvite);
    } else {
      let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');
      if (returnUrl.indexOf('type=privatekey') > -1) {
        navigateTo('/register?ReturnUrl=' + encodeURIComponent(returnUrl));
      } else if (request.unionId) {
        navigateTo(`/register?state=${request.state}&tpType=${request.tpType}&unionId=${request.unionId}`);
      } else {
        navigateTo('/register');
      }
    }
  };

  return (
    <Wrap>
      <DocumentTitle title={title} />
      {loading ? (
        <LoadDiv className="" style={{ margin: '50px auto' }} />
      ) : (
        <React.Fragment>
          <div className="titleHeader">
            {showProjectName && <p className="Font17 Gray mAll0 mTop8">{projectNameLang || companyName}</p>}
          </div>
          {renderCon()}
          <div className="flexRow alignItemsCenter justifyContentCenter footerCon">
            {!window.isMiniProgram && !_.get(md, 'global.SysSettings.hideRegister') && (
              <React.Fragment>
                <span className="changeBtn Hand TxtRight" onClick={toRegist}>
                  {_l('注册新账号')}
                </span>
                <span className="lineCenter mLeft24"></span>
              </React.Fragment>
            )}
            <div className="mLeft16 TxtLeft">
              <ChangeLang className="justifyContentLeft" />
            </div>
          </div>
        </React.Fragment>
      )}
    </Wrap>
  );
}
