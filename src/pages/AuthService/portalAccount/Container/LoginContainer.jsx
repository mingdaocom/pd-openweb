import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import externalPortalAjax from 'src/api/externalPortal';
import { getDialCode, getEmailOrTel } from 'src/pages/AuthService/util.js';
import { browserIsMobile } from 'src/utils/common';
import { encrypt } from 'src/utils/common';
import { getRequest } from 'src/utils/sso';
import { WrapUl } from '../style';
import { accountResultAction, setAutoLoginKey, statusList } from '../util';
import Content from './Content';
import Twofactor from './Twofactor';

export const LOGIN_WAY = [
  { key: 'weChat', txt: _l('微信') },
  { key: 'phone', txt: _l('验证码') },
  { key: 'password', txt: _l('密码') },
];

const WrapCon = styled.div`
  .warnTips {
    z-index: 10 !important;
  }
`;

function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default function (props) {
  const paramLogin = {
    account: '',
    verifyCodeType: '',
    ticket: '',
    randStr: '',
    captchaType: md.global.getCaptchaType(),
  };
  const {
    appId = '',
    state,
    setLogState,
    setAccount,
    setStatus,
    loginMode = {},
    registerMode = {},
    isWXOfficialExist,
    setParamForPcWx,
    paramForPcWx,
    isAutoLogin,
    allowUserType,
    loginForType,
    loginForTypeBack,
    status,
    autoLogin,
  } = props;
  let request = getRequest();
  const [
    {
      stateWX,
      scan,
      urlWX,
      type,
      loading,
      sending,
      twofactorInfo,
      dialCode,
      emailOrTel,
      verifyCode,
      password,
      isRegister,
      txt,
      warnList,
      focusDiv,
      onlyRead,
    },
    setState,
  ] = useSetState({
    stateWX: '',
    scan: true,
    urlWX: '', //微信二维码url
    isRegister: false, //是否需要注册
    type: '', //登录方式 验证码|密码|微信扫码
    loading: true, //二维码获取
    sending: false, //点击登录
    txt: '',
    twofactorInfo: {},
    warnList: [],
    dialCode: '',
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '',
    focusDiv: '',
    onlyRead: false,
  });

  useEffect(() => {
    let list = LOGIN_WAY.map(o => o.key).filter(o => loginMode[o]);
    setState({
      type: !!loginForType
        ? loginForType //已指定登录方式的情况下，直接走对应登录方式
        : paramForPcWx || request.mdAppId //扫码后 需要填写手机号 //微信扫码登录流程回跳只进手机号验证码流程
          ? 'phone'
          : browserIsMobile() && list.includes('weChat') && list.length > 1
            ? list[1]
            : list.includes('weChat') && isWXOfficialExist //点击进入微信登录 手机和微信同时设置时，默认微信优先
              ? 'weChat'
              : list[0],
    });
  }, [loginMode]);

  useEffect(() => {
    status === -6 && getTwofactorInfo();
  }, [status]);

  const getScanUrl = () => {
    externalPortalAjax
      .getSelfLoginScanUrl({
        appId,
      })
      .then(res => {
        // res.scanUrl=> "http://web.dev.mingdao.net/portal/wxscanauth?state=xxx"
        if (res.accountResult === 1) {
          setState({ loading: false });
          if (res.scanUrl) {
            const url = `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(res.scanUrl)}`;
            setState({ stateWX: res.state, scan: true, urlWX: url });
          }
        } else {
          if (16 === res.accountResult) {
            //16 代表未绑定微信服务号
            setState({ stateWX: '', urlWX: '', txt: _l('未绑定微信服务号'), loading: false });
          } else if (17 === res.accountResult) {
            //17代表微信扫码登录方式关闭；
            setState({ stateWX: '', urlWX: '', txt: _l('微信扫码登录方式关闭'), loading: false });
          } else if (statusList.includes(res.accountResult)) {
            // _l('需要收集信息');
            setStatus(res.accountResult);
          } else if ([20].includes(accountResult)) {
            return alert(
              registerMode.email && registerMode.phone
                ? _l('手机号/邮箱或者验证码错误!')
                : registerMode.phone
                  ? _l('手机号或者验证码错误!')
                  : _l('邮箱或者验证码错误!'),
              3,
            );
          } else {
            accountResultAction(res);
          }
        }
      });
  };
  const refreshUrl = () => {
    if (!stateWX || !appId) return;
    type === 'weChat' &&
      externalPortalAjax
        .scanTpLogin(
          { state: stateWX, appId, autoLogin: autoLogin && isAutoLogin }, //自动登录的参数
          props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
        )
        .then(res => {
          setAutoLoginKey({ ...res, appId });
          const { accountResult, sessionId, state, accountId } = res;
          //31过期， 30未扫码，可继续轮询
          if (accountResult === 31) {
            setState({ scan: false });
          } else if (accountResult === 30) {
            setState({ scan: true });
          } else if (accountResult === 32) {
            //32用户已经扫码但是未关注服务号 暂时接着轮询
            setState({ scan: true });
          } else if (accountResult === -6) {
            //两步验证
            setLogState(state);
            setState({ sending: false, scan: false, loading: true });
            setStatus(accountResult);
          } else {
            if (accountResult === 1 || accountResult === 24) {
              //24代表账号频繁登录被锁，state里面会返回锁定时间；
              accountResultAction(res, props.customLink);
            } else {
              if (props.customLink && !_.get(props, 'registerMode.email') && !_.get(props, 'registerMode.phone')) {
                return setStatus(40);
              }
              setParamForPcWx({
                mdAppId: appId || '',
                wxState: state || '',
                status: accountResult,
                accountId: accountId || '',
              });
            }
          }
        });
  };
  useInterval(
    () => {
      refreshUrl();
    },
    scan ? 3000 : null,
  );

  useEffect(() => {
    type === 'weChat' && !urlWX && getScanUrl();
  }, [type]);

  const updateWarn = warnList => {
    setState({
      focusDiv: '',
      warnList,
    });
  };

  const doCaptchaFn = () => {
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      if (type === 'phone') {
        onLogin(Object.assign({}, res, { captchaType: md.global.getCaptchaType() }));
      } else {
        doPwdLogin(Object.assign({}, res, { captchaType: md.global.getCaptchaType() }));
      }
    };
    new captcha(callback);
  };

  const onLogin = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .login(
        {
          ...paramLogin,
          account: encrypt(dialCode + emailOrTel),
          verifyCode,
          captchaType: md.global.getCaptchaType(),
          ticket,
          randStr: randstr,
          appId, //应用ID
          state, // 微信登录成功之后返回的临时状态码 用于反向存储微信相关信息，具备有效期
          autoLogin: autoLogin && isAutoLogin,
        },
        props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
      )
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        loginCallback(res);
      });
  };

  const loginCallback = res => {
    const { accountResult, sessionId, accountId, projectId, state } = res;
    state && setLogState(state);
    let info = { account: dialCode + emailOrTel };
    if (accountId) info.accountId = accountId;
    setAccount({ ...info });
    setState({ sending: false });
    if ([21, 22].includes(accountResult)) {
      //频繁登录或者图形验证码错误需要重新验证  //需要图形验证
      doCaptchaFn();
    } else {
      if (statusList.includes(accountResult)) {
        setStatus(accountResult);
      } else if ([20].includes(accountResult)) {
        return alert(
          registerMode.email && registerMode.phone
            ? _l('手机号/邮箱或者验证码错误！')
            : registerMode.phone
              ? _l('手机号或者验证码错误!')
              : _l('邮箱或者验证码错误!'),
          3,
        );
      } else {
        accountResultAction(res, props.customLink);
      }
    }
  };

  const doPwdLogin = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { ticket, randstr } = resRet;

    externalPortalAjax
      .pwdLogin(
        {
          account: encrypt(dialCode + emailOrTel),
          password: encrypt(password),
          appId,
          verifyCode, //verifyCode不为空则代表是注册，为空则代表进行密码登录；
          autoLogin: autoLogin && isAutoLogin,
          captchaType: md.global.getCaptchaType(),
          ticket,
          randStr: randstr,
        },
        props.customLink ? { ajaxOptions: { header: { 'Ex-custom-link-path': props.customLink } } } : {},
      )
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        const { accountResult, sessionId, accountId, projectId, state } = res;
        switch (accountResult) {
          case -1:
            if (allowUserType === 9) {
              setState({
                sending: false,
              });
              alert(_l('您未被邀请注册'), 3);
            } else {
              //-1代表用户不存在，则需要进入到密码注册流程；
              setState({
                isRegister: true,
                sending: false,
              });
              alert(_l('请输入验证码'), 3);
            }
            break;
          case -3:
            // -3代表密码不符合格式规范，后端会强行校验；
            const { md = {} } = window;
            const { global = {} } = md;
            const { SysSettings = {} } = global;
            const { passwordRegexTip } = SysSettings;
            updateWarn([{ tipDom: 'inputPassword', warnTxt: passwordRegexTip || _l('8-20位，需包含字母和数字') }]);
            setState({
              sending: false,
            });
            break;
          case -2:
            //-2代表密码错误校验失败；
            updateWarn([{ tipDom: 'inputPassword', warnTxt: _l('密码错误校验失败') }]);
            setState({ sending: false });
            break;
          case -4:
            if ([3, 9].includes(allowUserType)) {
              //邀请注册，输入验证码
              setState({ isRegister: true, sending: false });
            } else {
              //-4代表用户未设置密码不能以密码方式登录，需要使用其他模式登录
              alert(_l('未设置密码，请登录后完成密码设置!'), 2);
              setState({ sending: false });
            }
            break;
          case -6:
            //两步验证
            setState({ state, sending: false, loading: true });
            setLogState(state);
            setStatus(accountResult);
            break;
          default:
            loginCallback(res);
        }
      });
  };

  const getTwofactorInfo = () => {
    externalPortalAjax.getTwofactorInfo({ state }).then(twofactorInfo => {
      setState({ twofactorInfo, loading: false });
      const { email, mobilephone } = twofactorInfo; // accountId,accountResult, email,mobilephone
      let emailOrTel = getEmailOrTel(
        !!email && !!props.emailOrTel && props.emailOrTel === email ? email : props.emailOrTel || mobilephone || email,
      );
      let onlyRead = !!emailOrTel;
      const dialCode = getDialCode();
      setState({
        dialCode,
        emailOrTel, // 邮箱或手机
        verifyCode: '', // 验证码
        password: '',
        onlyRead,
        focusDiv: '',
      });
      updateWarn([]);
    });
  };

  const param = {
    stateWX,
    scan,
    urlWX,
    type,
    loading,
    sending,
    twofactorInfo,
    dialCode,
    emailOrTel,
    verifyCode,
    password,
    isRegister,
    txt,
    warnList,
    focusDiv,
    onlyRead,
    updateWarn,
    onChange: state => setState({ ...state }),
    onLogin,
    doPwdLogin,
    loginCallback,
    getScanUrl,
  };

  return (
    <WrapUl>
      {/* 未指定登录方式的情况下，对应tab,以及头部显示内容 */}
      {!!(loginForType && status !== -6) ? (
        <div
          className="Font17 Hand back Gray_75"
          onClick={() => {
            loginForTypeBack();
          }}
        >
          <Icon icon="backspace mRight8" />
          {_l('返回')}
        </div>
      ) : (
        <React.Fragment>
          {(paramForPcWx || (status === -6 && !request.mdAppId)) && (
            <div
              className="Font17 Hand back Gray_75"
              onClick={() => {
                if (status === -6) {
                  //二步验证 -6
                  setState({ onlyRead: false, verifyCode: '' });
                  setStatus(0);
                  if (type === 'weChat') {
                    setState({ scan: true });
                    getScanUrl();
                  }
                } else {
                  setState({
                    type: 'weChat',
                  });
                  setParamForPcWx(null);
                }
              }}
            >
              <Icon icon="backspace mRight8" />
              {_l('返回')}
            </div>
          )}
          {(paramForPcWx || request.mdAppId || status === -6) && (
            <p className="Gray mTop20 Bold mBottom5">
              <Icon icon={'check_circle1'} className="Font20 TxtMiddle mRight5" style={{ color: '#4CAF50' }} />
              {status === -6
                ? _l('已开启登录保护，验证码登录')
                : registerMode.email && registerMode.phone
                  ? _l('扫码成功，请绑定手机号/邮箱！')
                  : registerMode.phone
                    ? _l('扫码成功，请绑定手机号')
                    : _l('扫码成功，请绑定邮箱')}
            </p>
          )}
          {!(paramForPcWx || request.mdAppId || status === -6) &&
            LOGIN_WAY.filter(o => loginMode[o.key]).length > 1 && (
              <React.Fragment>
                <ul className="flexRow mTop32 alignItemsCenter justifyContentCenter loginWays">
                  {LOGIN_WAY.map((o, i) => {
                    if (!loginMode[o.key]) {
                      return '';
                    }
                    return (
                      <li
                        className={cx('Hand')}
                        onClick={() => {
                          setState({ type: o.key, sending: false, isRegister: false });
                          setState({
                            dialCode: '',
                            emailOrTel: '', // 邮箱或手机
                            verifyCode: '', // 验证码
                            password: '',
                          });
                          updateWarn([]);
                          //第一个输入框，聚焦
                          setTimeout(() => {
                            $('.messageBox input:first').focus();
                          }, 500);
                        }}
                      >
                        <span className={cx('Bold Font15', { isCur: type === o.key })}>{o.txt}</span>
                      </li>
                    );
                  })}
                </ul>
              </React.Fragment>
            )}
        </React.Fragment>
      )}

      <WrapCon className="mTop28">
        {status === -6 ? <Twofactor {...props} {...param} /> : <Content {...props} {...param} />}
      </WrapCon>
    </WrapUl>
  );
}
