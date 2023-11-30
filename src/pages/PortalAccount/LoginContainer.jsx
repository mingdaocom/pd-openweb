import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Icon, Checkbox } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import { statusList, accountResultAction, setAutoLoginKey } from './util';
import captcha from 'src/components/captcha';
import { getRequest } from 'src/util/sso';
import Message from 'src/pages/account/components/message';
import { encrypt } from 'src/util';
import { navigateTo } from 'router/navigateTo';
import moment from 'moment';

export const LOGIN_WAY = [
  { key: 'weChat', txt: _l('微信登录') },
  { key: 'phone', txt: _l('验证码登录') },
  { key: 'password', txt: _l('密码登录') },
];
const Wrap = styled.div`
  ul {
    & > li {
      padding-right: 40px;
      &:last-child {
        padding-right: 0;
      }
      span {
        color: #757575;
        padding-bottom: 8px;
        border-bottom: 3px solid #fff;
        &.isCur {
          color: #2196f3;
          border-bottom: 3px solid rgba(33, 150, 243);
        }
      }
    }
  }
  .footerTxt {
    margin-top: 40px;
    border-top: 1px solid #f5f5f5;
    padding-top: 24px;
  }
`;

const WrapWXCon = styled.div`
  .erweima {
    text-align: center;
    width: 100%;
    min-height: 312px;
    background: #ffffff;
    border: 1px solid #f4f4f4;
    border-radius: 8px;
    margin: 20px auto;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 8px;
    img {
      width: 100%;
      height: 100%;
    }
    .isOverTime {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background: rgba(250, 250, 250, 0.95);
      i {
        color: #2196f3;
        margin: 80px 0 0;
        display: inline-block;
      }
      p {
        margin: 24px auto;
      }
      .refresh {
        padding: 10px 24px;
        background: #2196f3;
        opacity: 1;
        border-radius: 18px;
        color: #fff;
      }
    }
  }
`;

const WrapCon = styled.div`
  .warnningTip {
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

export default function LoginContainer(props) {
  const {
    appId = '',
    state,
    setLogState,
    setAccount,
    setStatus,
    setAccountId,
    loginMode = {},
    registerMode = {},
    isWXOfficialExist,
    setParamForPcWx,
    paramForPcWx,
    isAutoLogin,
    allowUserType,
    termsAndAgreementEnable,
    setAutoLogin,
    loginForType,
    loginForTypeBack,
    registerInfo = {},
    status,
  } = props;
  let request = getRequest();
  const [{ stateWX, scan, urlWX, isRegister, type, loading, sending, txt, hasCheck, twofactorInfo }, setState] =
    useSetState({
      stateWX: '',
      scan: true,
      urlWX: '', //微信二维码url
      isRegister: false, //是否需要注册
      type: '', //登录方式 验证码|密码|微信扫码
      loading: true, //二维码获取
      sending: false, //点击登录
      txt: '',
      hasCheck: false,
      twofactorInfo: {},
    });

  useEffect(() => {
    let list = LOGIN_WAY.map(o => o.key).filter(o => loginMode[o]);
    setState({
      type: !!loginForType
        ? loginForType //已指定登录方式的情况下，直接走对应登录方式
        : paramForPcWx || request.mdAppId //扫码后 需要填写手机号 //微信扫码登录流程回跳只进手机号验证码流程
        ? 'phone'
        : list.includes('weChat') && loginMode.weChat && isWXOfficialExist //点击进入微信登录 手机和微信同时设置时，默认微信优先
        ? 'weChat'
        : list[0],
    });
  }, [loginMode]);

  useEffect(() => {
    status === -6 && getTwofactorInfo();
  }, [status]);

  const [paramLogin, setParam] = useState({
    account: '',
    verifyCodeType: '',
    ticket: '',
    randStr: '',
    captchaType: md.staticglobal.getCaptchaType(),
  });
  const [dataLogin, setData] = useState({
    dialCode: '',
    warnningData: [],
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '',
  });
  const getScanUrl = () => {
    externalPortalAjax
      .getSelfLoginScanUrl({
        appId,
      })
      .then(res => {
        if (res.accountResult === 1) {
          setState({ loading: false });
          if (res.scanUrl) {
            const url = `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(res.scanUrl)}`;
            setState({ stateWX: res.state, scan: true, urlWX: url });
          }
        } else {
          if (16 === res.accountResult) {
            //16 代表未绑定微信公众号
            setState({ stateWX: '', urlWX: '', txt: _l('未绑定微信公众号'), loading: false });
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
    if (!stateWX || !appId) {
      return;
    }
    type === 'weChat' &&
      externalPortalAjax
        .scanTpLogin({
          state: stateWX,
          appId,
          autoLogin: isAutoLogin, //自动登录的参数
        })
        .then(res => {
          setAutoLoginKey({ ...res, appId });
          const { accountResult, sessionId, state, accountId } = res;
          //31过期， 30未扫码，可继续轮询
          if (accountResult === 31) {
            setState({ scan: false });
          } else if (accountResult === 30) {
            setState({ scan: true });
          } else if (accountResult === 32) {
            //32用户已经扫码但是未关注公众号 暂时接着轮询
            setState({ scan: true });
          } else if (accountResult === -6) {
            //两步验证
            setLogState(state);
            setState({ sending: false, scan: false, loading: true });
            setStatus(accountResult);
          } else {
            if (accountResult === 1 || accountResult === 24) {
              //24代表账号频繁登录被锁，state里面会返回锁定时间；
              accountResultAction(res);
            } else {
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

  //确认逻辑
  const sendCode = () => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode, password } = dataLogin;
    if (!emailOrTel) {
      const way =
        registerMode.email && registerMode.phone
          ? _l('请输入手机/邮箱！')
          : registerMode.phone
          ? _l('请输入手机号！')
          : _l('请输入邮箱！');

      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '#txtMobilePhone', warnningText: way }],
      });
      return;
    }
    if (!verifyCode && ((type === 'password' && isRegister) || type === 'phone')) {
      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('请输入验证码！') }],
      });
      return;
    }
    if (!password && type === 'password') {
      setData({
        ...dataLogin,
        warnningData: [{ tipDom: '.passwordIcon', warnningText: _l('请输入密码！') }],
      });
      return;
    }
    setState({
      sending: true,
    });
    if (type === 'phone') {
      loginFn();
    } else {
      doPwdLogin();
    }
  };

  const doCaptchaFn = () => {
    let callback = (res = {}) => {
      if (res.ret !== 0) {
        return;
      }
      if (type === 'phone') {
        loginFn(
          Object.assign({}, res, {
            captchaType: md.staticglobal.getCaptchaType(),
          }),
        );
      } else {
        doPwdLogin(
          Object.assign({}, res, {
            captchaType: md.staticglobal.getCaptchaType(),
          }),
        );
      }
    };
    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
  };

  const loginFn = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode } = dataLogin;
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .login({
        ...paramLogin,
        account: encrypt(dialCode + emailOrTel),
        verifyCode,
        captchaType: md.staticglobal.getCaptchaType(),
        ticket,
        randStr: randstr,
        appId, //应用ID
        state, // 微信登录成功之后返回的临时状态码 用于反向存储微信相关信息，具备有效期
        autoLogin: isAutoLogin,
      })
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        loginCallback(res);
      });
  };

  const twofactorLogin = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { verifyCode, dialCode, emailOrTel } = dataLogin;
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .twofactorLogin({
        account: encrypt(dialCode + emailOrTel),
        verifyCode,
        captchaType: md.staticglobal.getCaptchaType(),
        ticket,
        randStr: randstr,
        state, // 首次登陆返回的state
        autoLogin: isAutoLogin,
      })
      .then(res => {
        setAutoLoginKey({ ...res, appId });
        loginCallback(res);
      });
  };

  const loginCallback = res => {
    const { accountResult, sessionId, accountId, projectId, state } = res;
    state && setLogState(state);
    accountId && setAccountId(accountId);
    const { dialCode, emailOrTel, verifyCode } = dataLogin;
    setAccount(dialCode + emailOrTel);
    setState({
      sending: false,
    });
    if ([21, 22].includes(accountResult)) {
      //频繁登录或者图形验证码错误需要重新验证
      //需要图形验证
      doCaptchaFn();
    } else {
      if (statusList.includes(accountResult)) {
        // _l('需要收集信息');
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
        accountResultAction(res);
      }
    }
  };

  const doPwdLogin = (resRet = {}) => {
    if (sending) {
      return;
    }
    const { dialCode, emailOrTel, verifyCode, password } = dataLogin;
    const { ticket, randstr } = resRet;
    externalPortalAjax
      .pwdLogin({
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        appId,
        verifyCode, //verifyCode不为空则代表是注册，为空则代表进行密码登录；
        autoLogin: isAutoLogin,
        captchaType: md.staticglobal.getCaptchaType(),
        ticket,
        randStr: randstr,
      })
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
            setData({
              ...dataLogin,
              warnningData: [
                { tipDom: '.passwordIcon', warnningText: passwordRegexTip || _l('8-20位，需包含字母和数字') },
              ],
            });
            setState({
              sending: false,
            });
            break;
          case -2:
            //-2代表密码错误校验失败；
            setData({
              ...dataLogin,
              warnningData: [{ tipDom: '.passwordIcon', warnningText: _l('密码错误校验失败') }],
            });
            setState({
              sending: false,
            });
            break;
          case -4:
            if ([3, 9].includes(allowUserType)) {
              //邀请注册，输入验证码
              setState({
                isRegister: true,
                sending: false,
              });
            } else {
              //-4代表用户未设置密码不能以密码方式登录，需要使用其他模式登录
              alert(_l('未设置密码，请登录后完成密码设置!'), 2);
              setState({
                sending: false,
              });
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

  const footerNotice = isScanLogin => {
    let isNoRightTime =
      //开启了注册时间验证
      !!_.get(registerInfo, 'enable') &&
      //设置了开始和结束时间 且不在开始和结束时间范围内
      ((!!_.get(registerInfo, 'startTime') &&
        !!_.get(registerInfo, 'endTime') &&
        !moment().isBetween(registerInfo.startTime, registerInfo.endTime)) ||
        //只设置了开始时间 且当前时间早于开始时间
        (!!_.get(registerInfo, 'startTime') &&
          !_.get(registerInfo, 'endTime') &&
          moment().isBefore(_.get(registerInfo, 'startTime'))) ||
        //只设置了结束时间 且当前时间晚于结束时间
        (!_.get(registerInfo, 'startTime') &&
          !!_.get(registerInfo, 'endTime') &&
          moment().isAfter(_.get(registerInfo, 'endTime'))));
    if (allowUserType === 9 || isNoRightTime) {
      return (
        <p className={cx('txt TxtCenter Gray_75 Bold Font14 footerTxt', { mTop24: isScanLogin })}>
          {allowUserType === 9
            ? _l('仅受邀用户可以注册')
            : isNoRightTime
            ? _l('当前门户暂不支持注册，仅允许已有账号登录')
            : ''}
        </p>
      );
    } else {
      return '';
    }
  };

  const footer = (isValid, findPassword) => {
    return (
      <React.Fragment>
        {!paramForPcWx && (
          <div className="mTop16 flexRow alignItemsCenter">
            {findPassword && (
              <span
                className="Hand ThemeHoverColor3 Gray_9e"
                style={{ margin: '0 0 0 auto' }}
                onClick={() => {
                  navigateTo(`${window.subPath || ''}/findPwd?appId=${appId}`);
                }}
              >
                {_l('忘记密码')}
              </span>
            )}
          </div>
        )}
        <div
          className={cx('loginBtn mTop32 TxtCenter Hand', {
            sending: sending,
          })}
          onClick={() => {
            if (isValid()) {
              if (termsAndAgreementEnable && !hasCheck) {
                return alert(_l('请先勾选同意《用户协议》和《隐私政策》'), 3);
              }
              sendCode();
            }
          }}
        >
          {paramForPcWx ? _l('绑定并登录/注册') : _l('登录/注册')}
          {sending ? '...' : ''}
        </div>
        {termsAndAgreementEnable && (
          <div className="mTop12 Gray_9e TxtTop LineHeight22 flexRow alignItemsCenter">
            <Checkbox
              checked={hasCheck}
              onClick={() => {
                setState({
                  hasCheck: !hasCheck,
                });
              }}
              className="Hand"
              name=""
            />
            <div className="flex alignItemsCenter flexRow">
              {_l('同意')}
              <span
                className="ThemeColor3 Hand mRight5 mLeft5"
                onClick={() => {
                  window.open(`${location.origin}${window.subPath || ''}/agreen?appId=${appId}`);
                }}
              >
                《{_l('用户协议')}》
              </span>
              {_l('与')}
              <span
                className="ThemeColor3 Hand mLeft5"
                onClick={() => {
                  window.open(`${location.origin}${window.subPath || ''}/privacy?appId=${appId}`);
                }}
              >
                《{_l('隐私政策')}》
              </span>
            </div>
          </div>
        )}
        {!paramForPcWx && (
          <div className="mTop12 flexRow alignItemsCenter">
            <div
              className="flexRow alignItemsCenter"
              onClick={() => {
                setAutoLogin(!isAutoLogin);
              }}
            >
              <Checkbox checked={isAutoLogin} className="Hand" name="" />
              <span className="Gray_9e Hand">{_l('7天内免登录')}</span>
            </div>
          </div>
        )}
        {footerNotice()}
      </React.Fragment>
    );
  };

  const getTwofactorInfo = () => {
    externalPortalAjax
      .getTwofactorInfo({
        state,
      })
      .then(twofactorInfo => {
        setState({ twofactorInfo, loading: false });
      });
  };

  const renderTwofactorLogin = () => {
    const { email, mobilephone } = twofactorInfo; // accountId,accountResult, email,mobilephone
    const way = (email && mobilephone) || (!email && !mobilephone) ? 'emailOrTel' : mobilephone ? 'tel' : 'email';
    let emailOrTel =
      !!email && !!dataLogin.emailOrTel && dataLogin.emailOrTel === email
        ? email
        : dataLogin.emailOrTel || mobilephone || email;
    return loading ? (
      <LoadDiv style={{ margin: '100px auto' }} />
    ) : (
      <Message
        type="portalLogin"
        keys={[way, 'code']}
        key={'phone_con'}
        openLDAP={false}
        dataList={{ ...dataLogin, emailOrTel, onlyRead: !!emailOrTel }}
        canChangeEmailOrTel={email && mobilephone}
        onChangeEmailOrTel={() => {
          let mobile = mobilephone;
          if (dataLogin.dialCode) {
            mobile = mobilephone.replace(dataLogin.dialCode, '');
          }
          setData({
            ...dataLogin,
            emailOrTel: emailOrTel === email ? mobile : email,
            dialCode: emailOrTel === email ? dataLogin.dialCode : '',
          });
        }}
        isNetwork={false}
        onChangeData={data => {
          let info = { ...dataLogin, ...data };
          let mobile = info.emailOrTel;
          if (info.dialCode) {
            mobile = info.emailOrTel.replace(dataLogin.dialCode, '');
          }
          setData({ ...info, emailOrTel: mobile });
        }}
        appId={appId}
        sendVerifyCodeInfo={{ state, autoLogin: isAutoLogin }}
        sendVerifyCode={externalPortalAjax.sendVerifyCode}
        nextHtml={isValid => {
          return (
            <React.Fragment>
              <div
                className={cx('loginBtn mTop32 TxtCenter Hand', {
                  sending: sending,
                })}
                onClick={() => {
                  if (isValid()) {
                    if (!dataLogin.verifyCode) {
                      setData({
                        ...dataLogin,
                        warnningData: [{ tipDom: '.txtLoginCode', warnningText: _l('请输入验证码！') }],
                      });
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
          );
        }}
      />
    );
  };

  const renderCon = () => {
    // { key: 'phone', txt: _l('验证码') },
    // { key: 'password', txt: _l('密码') },
    // { key: 'weChat', txt: _l('微信扫码') },
    const way = registerMode.email && registerMode.phone ? 'emailOrTel' : registerMode.phone ? 'tel' : 'email';
    let dataList = { ...dataLogin, onlyRead: false };
    switch (type) {
      case 'phone': //验证码
        return (
          <Message
            type="portalLogin"
            keys={[way, 'code']}
            key={'phone_con'}
            openLDAP={false}
            dataList={dataList}
            isNetwork={false}
            onChangeData={data => {
              setData({ ...dataLogin, ...data });
            }}
            appId={appId}
            sendVerifyCode={externalPortalAjax.sendVerifyCode}
            nextHtml={isValid => footer(isValid)}
          />
        );
      case 'password': //密码
        return (
          <Message
            key={'password_con'}
            type="portalLogin"
            keys={isRegister ? [way, 'code', 'setPassword'] : [way, 'password']}
            openLDAP={false}
            dataList={dataList}
            isNetwork={false}
            onChangeData={data => {
              setData({ ...dataLogin, ...data });
            }}
            appId={appId}
            sendVerifyCode={externalPortalAjax.sendVerifyCode}
            nextHtml={isValid => footer(isValid, true)}
          />
        );
      case 'weChat': //微信扫码
        return (
          <WrapWXCon>
            <div className={cx('erweima ', { 'alignItemsCenter flexRow': !urlWX })}>
              {loading ? (
                <LoadDiv style={{ margin: '100px auto' }} />
              ) : urlWX ? (
                <img src={urlWX} />
              ) : (
                <p className="pAll30 Font18 Gray_bd">
                  {txt || _l('授权不足，请管理员到组织管理-微信公众号重新绑定授权')}
                </p>
              )}
              {!scan && (
                <div className="isOverTime">
                  <Icon icon={'error1'} className="Font48 " />
                  <p className="Font18">{_l('当前二维码已过期')}</p>
                  <span
                    className="refresh Hand"
                    onClick={() => {
                      getScanUrl();
                    }}
                  >
                    {_l('刷新')}
                  </span>
                </div>
              )}
            </div>
            <div
              className="mTop24 flexRow alignItemsCenter Hand justifyContentCenter"
              onClick={() => {
                setAutoLogin(!isAutoLogin);
              }}
            >
              <Checkbox checked={isAutoLogin} className="" name="" />
              <span className="Gray_9e">{_l('7天内免登录')}</span>
            </div>
            {footerNotice(true)}
          </WrapWXCon>
        );
    }
  };

  return (
    <Wrap>
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
              <ul className="flexRow">
                {LOGIN_WAY.map((o, i) => {
                  if (!loginMode[o.key]) {
                    return '';
                  }
                  return (
                    <li
                      className={cx('Hand')}
                      onClick={() => {
                        setState({ type: o.key, sending: false, isRegister: false });
                        setData({
                          dialCode: '',
                          warnningData: [],
                          emailOrTel: '', // 邮箱或手机
                          verifyCode: '', // 验证码
                          password: '',
                        });
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
            )}
        </React.Fragment>
      )}

      <WrapCon className="mTop28">{status === -6 ? renderTwofactorLogin() : renderCon()}</WrapCon>
    </Wrap>
  );
}
