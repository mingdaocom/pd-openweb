import externalPortalAjax from 'src/api/externalPortal';
import { browserIsMobile, getRequest } from 'src/utils/common';
import { setPssId } from 'src/utils/pssId';

export const urlList = [
  'app/',
  'mobile/recordList/',
  'mobile/customPage/',
  'mobile/record/',
  'mobile/addRecord/',
  'mobile/searchRecord/',
  'mobile/groupFilterDetail/',
  'mobile/discuss/',
  'mobile/addDiscuss/',
  'printForm/',
];

export const getSuffix = url => {
  const urlPathname = new URL(decodeURIComponent(url));
  const pathname = urlPathname.pathname;
  const addressSuffix = pathname.replace(window.subPath, '').split('/')[1] || '';
  return addressSuffix;
};

export const replacePorTalUrl = url => {
  //是外部门户 当前环境以自定义后缀访问
  if (
    md.global.Account.isPortal &&
    md.global.Account.addressSuffix &&
    getSuffix(location.href) === md.global.Account.addressSuffix &&
    url.indexOf(md.global.Account.addressSuffix) < 0 &&
    url.indexOf('app/') >= 0
  ) {
    url = url.replace('app/' + md.global.Account.appId, md.global.Account.addressSuffix);
  }
  return url;
};

export const getAppId = params => {
  let { appId } = params;
  if (md.global.Account.isPortal) {
    appId = md.global.Account.appId;
  }
  return appId;
};

export const toApp = appId => {
  //手机端来源
  if (browserIsMobile()) {
    window.location.replace(`${window.subPath || ''}/mobile/app/${appId}`);
  } else {
    window.location.replace(`${window.subPath || ''}/app/${appId}`); //进入应用
  }
};

export const getCurrentId = cb => {
  const request = getRequest();
  const { ReturnUrl = '', mdAppId = '' } = request;
  if (!!mdAppId) {
    cb(mdAppId);
    return;
  }
  let href = decodeURIComponent(!!ReturnUrl ? ReturnUrl : location.href);
  let currentAppId = '';
  urlList.map(o => {
    if (href.indexOf(o) >= 0) {
      currentAppId = href.substr(href.indexOf(o) + o.length, 36);
    }
  });
  if (!currentAppId) {
    const addressSuffix = getSuffix(href);
    externalPortalAjax.getAppIdByAddressSuffix({ customeAddressSuffix: addressSuffix }).then(res => {
      cb(res, addressSuffix);
    });
  } else {
    cb(currentAppId, '');
  }
};

export const resetPortalUrl = () => {
  window.localStorage.removeItem(`${md.global.Account.appId}_portalCustomLink`);
  const customLink = getCurrentExt(md.global.Account.appId, md.global.Account.addressSuffix);
  if (!customLink) {
    return;
  }
  const hasCustomLink = location.pathname.indexOf(`/${customLink}`) >= 0;
  if (hasCustomLink) {
    window.isWaiting = true;
    location.href = location.href.replace(`/${customLink}`, '');
    return;
  }
};

export const getCurrentExt = (appId, suffix) => {
  const request = getRequest();
  const { ReturnUrl = '', customLink } = request;
  if (!!customLink) {
    return customLink;
  }
  const urlPathname = new URL(decodeURIComponent(!!ReturnUrl ? ReturnUrl : location.href));
  const pathname = urlPathname.pathname;
  let prefix;
  if (appId) {
    ['app/', 'mobile/recordList/'].map(o => {
      if (pathname.indexOf(`/${o}${appId}/`) >= 0) {
        prefix = `/${o}${appId}/`;
      }
    });
  }
  if (!prefix) {
    if (suffix) {
      prefix = `/${suffix}/`;
    } else {
      return null;
    }
  }
  if (pathname.indexOf(prefix) >= 0) {
    const restOfPath = pathname.substring(pathname.indexOf(prefix) + prefix.length);
    const indexOfSlash = restOfPath.indexOf('/');
    if (indexOfSlash < 0 && restOfPath.length === 6) {
      return restOfPath;
    }
  }
  return null;
};

export const goApp = (sessionId, appId, customLink) => {
  setPssId(sessionId);
  const request = getRequest();
  let { ReturnUrl = '' } = request;
  if (ReturnUrl) {
    if (ReturnUrl.indexOf(`/${customLink}`) >= 0 && customLink) {
      const regex = new RegExp(`\/${customLink}(.*)$`, 'g');
      window.location.replace(ReturnUrl.replace(regex, ''));
    } else {
      window.location.replace(ReturnUrl);
    }
  } else {
    //h5暂不处理后缀
    toApp(appId);
  }
};
export const setAutoLoginKey = (res, removeLink = true) => {
  if (res.accountResult === 9 && res.state) {
    window.clientId = res.state;
    sessionStorage.setItem('clientId', res.state);
    window.shareState.isPublicFormPreview = true;
    window.shareState.isPublicForm = true;
  } else {
    window.clientId = '';
    sessionStorage.removeItem('clientId');
    window.shareState.isPublicFormPreview = false;
    window.shareState.isPublicForm = false;
  }
  const { appId, autoLoginKey } = res;
  removeLink && window.localStorage.removeItem(`${appId}_portalCustomLink`);
  if (!autoLoginKey) {
    window.localStorage.removeItem(`PortalLoginInfo-${appId}`); //删除自动登录的key
  } else {
    // 本地存key和APPID
    safeLocalStorageSetItem(`PortalLoginInfo-${appId}`, autoLoginKey);
  }
};

export const accountResultAction = (res, customLink) => {
  const { accountResult, sessionId, appId, state } = res;
  window.localStorage.removeItem(`${appId}_portalCustomLink`);
  let msg = '';
  switch (accountResult) {
    case 1:
      return goApp(sessionId, appId, customLink);
    // break;
    case -1:
      msg = _l('该账号不存在');
      break;
    case 0:
      msg = _l('登录失败');
      break;
    case 2:
      msg = _l('该账号已停用');
      break;
    case 3:
      msg = _l('该账号待审核');
      break;
    case 4:
      msg = _l('该账号审核未通过');
      break;
    case 5:
      msg = _l('该账号已删除');
      break;
    case 6:
      msg = _l('该账号未激活');
      break;
    case 10:
      msg = _l('应用不存在');
      break;
    case 11:
      msg = _l('外部门户已关闭');
      break;
    case 12:
      msg = _l('应用授权达到用户数量限制');
      break;
    case 13:
      msg = _l('应用授权不用');
      break;
    case 14:
      msg = _l('应用维护中');
      break;
    case 15:
      msg = _l('您未被邀请注册');
      break;
    case 16:
      msg = _l('未绑定微信服务号');
      break;
    case 17:
      msg = _l('微信扫码登录方式关闭');
      break;
    case 18:
      msg = _l('当前门户不在设置的注册时间范围内，暂不支持注册');
      break;
    case 20:
      msg = _l('手机号/邮箱或者验证码错误');
      break;
    case 21:
      msg = _l('验证码错误');
      break;
    case 22:
      msg = _l('请输入验证码');
      break;
    case 23:
      msg = _l('验证码已过期');
      break;
    case 24:
      // msg = _l('频繁登录，已被锁定');
      let t = state ? Math.ceil(state / 60) : 20;
      msg = _l('登录次数过多被锁定，请 %0 分钟后再试', t);
      break;
    case 40:
      msg = _l('自定义链接不存在');
      break;
    default:
      msg = _l('登录失败');
      break;
  }
  alert(msg, 3);
  return;
};
export const statusList = [2, 3, 4, 9, 10, 11, 12, 13, 14, 10000, 20000, 40]; //需要呈现相对落地页的状态码

export const isErrSet = portalSetResult => {
  //手机 邮箱 及微信 都关闭
  return (
    (!_.get(portalSetResult, 'registerMode.email') &&
      !_.get(portalSetResult, 'registerMode.phone') &&
      !_.get(portalSetResult, 'loginMode.weChat')) ||
    //微信 验证码 密码 都关闭
    (!_.get(portalSetResult, 'loginMode.password') &&
      !_.get(portalSetResult, 'loginMode.phone') &&
      !_.get(portalSetResult, 'loginMode.weChat'))
  );
};
