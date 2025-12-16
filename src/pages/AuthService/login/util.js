import moment from 'moment';
import loginController from 'src/api/login';
import workWeiXinController from 'src/api/workWeiXin';
import { loginSuccessRedirect } from 'src/pages/AuthService/util.js';
import { navigateTo } from 'src/router/navigateTo';
import { browserIsMobile, getRequest } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import { setPssId } from 'src/utils/pssId';
import { LoginResult } from './config.js';

//登录相关的回调处理
export const loginCallback = ({ data, onChange }) => {
  const request = getRequest();
  const { projectId, modeType, isNetwork, emailOrTel, fullName, isCheck, step } = data;

  //缓存这次登录的账号
  if (modeType === 1) {
    !!emailOrTel && safeLocalStorageSetItem('LoginName', emailOrTel);
  } else {
    !!fullName && safeLocalStorageSetItem('LoginLDAPName', fullName);
  }

  //缓存loginStatus 注销
  safeLocalStorageSetItem(
    'loginStatus',
    JSON.stringify({ state: data.state, createStateTime: moment().format('YYYY-MM-DD HH:mm:ss') }),
  );

  if ([LoginResult.accountSuccess, LoginResult.needTwofactorVerifyCode].includes(data.accountResult)) {
    //登录来源 登出后的跳转地址
    if (isNetwork) {
      safeLocalStorageSetItem('loginFrom', '2');
    } else {
      safeLocalStorageSetItem('loginFrom', '1');
    }

    // LoginCheckList 下次自动登录
    if (isCheck) {
      let account = modeType === 1 ? emailOrTel : fullName;
      safeLocalStorageSetItem(
        'LoginCheckList',
        JSON.stringify({
          accountId: data.accountId,
          encryptPassword: data.encryptPassword,
          loginType: data.loginType,
          account,
          projectId,
          time: new Date(),
          ua: window.navigator.userAgent,
        }),
      );
    }
  }

  if (data.accountResult === LoginResult.accountSuccess) {
    const { token = {} } = data;

    compatibleMDJS(
      'login',
      {
        access_token: token.accessToken || window.access_token,
        expires_in: 7200,
        refresh_token: token.rereshToken,
      },
      () => {
        setPssId(data.sessionId);

        if (location.href.indexOf('autoClose=true') > -1) {
          window.close();
          return;
        }

        loginSuccessRedirect();
      },
    );
  } else {
    //开启了两步验证
    if (data.accountResult === LoginResult.needTwofactorVerifyCode) {
      onChange({ warnList: [], state: data.state });

      if (request.ReturnUrl) {
        navigateTo(`/twofactor?state=${data.state}&ReturnUrl=${encodeURIComponent(request.ReturnUrl)}`);
      } else {
        navigateTo(`/twofactor?state=${data.state}`);
      }

      return;
    }
    if (
      [
        LoginResult.passwordOverdue, // 密码过期需要重新设置密码
        LoginResult.firstLoginResetPassword, //首次登录需修改密码
      ].includes(data.accountResult)
    ) {
      let type = LoginResult.firstLoginResetPassword === data.accountResult ? 1 : 2;
      //需要重置密码
      if (request.ReturnUrl) {
        location.href = `/resetPassword?state=${data.state}&type=${type}&ReturnUrl=${encodeURIComponent(
          request.ReturnUrl,
        )}`;
      } else {
        location.href = `/resetPassword?state=${data.state}&type=${type}`;
      }
      return;
    }

    // 如果登录失败，需要把本地保存的 accountId 和 encryptPassword 清理掉
    window.localStorage.removeItem('LoginCheckList');

    // 注销
    if (data.accountResult === LoginResult.cancellation) {
      location.href = '/cancellation';
      return;
    }

    if (data.accountResult === LoginResult.accountNotExist) {
      onChange({ warnList: [{ tipDom: 'inputAccount', warnTxt: _l('账号未注册') }], loading: false });
      return;
    }

    if (data.accountResult === LoginResult.accountFrequentLoginError) {
      onChange({ frequentLogin: true, loading: false });
      return;
    }
    const msgStyle = browserIsMobile() ? { 'margin-top': '180px' } : {};
    if (data.accountResult === LoginResult.isLock) {
      let t = data.state ? Math.ceil(data.state / 60) : 20;
      if (step === 'verifyCode') {
        onChange({ loading: false });
        return alert(
          _l('错误次数过多，出于安全考虑，暂时锁定您的账户，请%0分钟后尝试，或前往重置密码解除锁定', t),
          3,
          undefined,
          undefined,
          undefined,
          msgStyle,
        );
      }
      onChange({
        loading: false,
        warnList: [
          {
            tipDom: 'code',
            warnTxt: _l(
              '错误次数过多，出于安全考虑，暂时锁定您的账户，请 %0 分钟后尝试，或%1重置密码%2解除锁定',
              t,
              '<a href="/findPassword" target="_blank">',
              '</a>',
            ),
          },
        ],
      });
      return;
    }

    let msg = '';

    if (data.accountResult === LoginResult.userFromError) {
      msg = _l('账号来源类型受限');
    } else if (data.accountResult === LoginResult.accountDisabled) {
      msg = _l('账号被禁用，请联系系统管理员进行恢复');
    } else {
      //密码错误
      if (!(modeType === 2) && data.accountResult === LoginResult.passwordError) {
        const { state } = data;
        const t = (state || '').split('|');

        if (t.length > 1) {
          if (step === 'verifyCode') {
            return alert(
              _l('您输入错误%0次，还可尝试%1次', t[1], t[0] - t[1]),
              3,
              undefined,
              undefined,
              undefined,
              msgStyle,
            );
          }
          onChange({
            loading: false,
            warnList: [{ tipDom: 'code', warnTxt: _l('您输入错误%0次，还可尝试%1次', t[1], t[0] - t[1]) }],
          });
          return;
        }

        msg = _l('用户名或密码不正确');
      } else {
        msg = data.accountResult === LoginResult.verifyCodeError ? _l('验证码输入错误') : _l('用户名或密码不正确');
      }
    }
    onChange({ loading: false });
    alert({
      msg,
      type: 3,
      style: msgStyle,
    });
  }
};

// 在集成环境如果 ReturnUrl 包含 appId，去 sso 页面登录
export const ssoLogin = (returnUrl = '') => {
  const getAppId = pathname => {
    if (pathname.includes('mobile')) {
      const match = pathname.match(/\/mobile\/([^/]+)\/([^/]+)/);
      return match && match[2];
    } else if (pathname.includes('embed/view')) {
      const match = pathname.match(/\/embed\/view\/([^/]+)/);
      return match && match[1];
    } else {
      const match = pathname.match(/\/app\/([^/]+)/);
      return match && match[1];
    }
  };
  const isApp = window.isDingTalk || window.isWxWork || window.isWeLink || window.isFeiShu;
  if (isApp && returnUrl) {
    const { pathname, search } = new URL(returnUrl);
    const appId = getAppId(pathname);
    if (appId) {
      workWeiXinController
        .getIntergrationInfo({
          appId,
        })
        .then(data => {
          const { item1, item2 } = data;
          const url = encodeURIComponent(pathname + search);
          // 钉钉
          if (item1 === 1) {
            const url = encodeURIComponent(pathname.replace(/^\//, '') + search);
            location.href = `/sso/sso?t=2&p=${item2}&ret=${url}`;
          }
          // 企业微信
          if (item1 === 3) {
            location.href = `/auth/workwx?p=${item2}&url=${url}`;
          }
          // welink
          if (item1 === 4) {
            location.href = `/auth/welink?p=${item2}&url=${url}`;
          }
          // 飞书
          if (item1 === 6) {
            location.href = `/auth/feishu?p=${item2}&url=${url}`;
          }
        });
    }
  }
};

export const getWorkWeiXinCorpInfoByApp = (projectId, returnUrl = '') => {
  loginController
    .getWorkWeiXinCorpInfoByApp({
      projectId,
    })
    .then(result => {
      const { corpId, state, agentId, scanUrl } = result;
      const redirect_uri = encodeURIComponent(`${location.origin}/auth/workwx?url=${encodeURIComponent(returnUrl)}`);
      const url = `${scanUrl}/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&state=${state}`;
      location.href = url;
    });
};
