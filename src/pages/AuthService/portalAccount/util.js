import _ from 'lodash';
import externalPortalAjax from 'src/api/externalPortal';
import { setPssId } from 'src/utils/platform/auth/pssId';
import { browserIsMobile, getRequest } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';

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

//获取当前自定义域名后缀：theportal.cn 取根路径后第一段，否则取 /portal/ 后第一段
export const getSuffix = url => {
  const urlObj = new URL(decodeURIComponent(url));
  const pathname = urlObj.pathname;
  const hostname = urlObj.hostname;

  if (hostname.indexOf('theportal.cn') >= 0) {
    const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    return segments[0] || '';
  }

  const match = pathname.match(/\/portal\/([^/]+)/);
  return match ? match[1] : '';
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
    window.location.replace(pathCompletion(`/mobile/app/${appId}`));
  } else {
    window.location.replace(pathCompletion(`/app/${appId}`)); //进入应用
  }
};

export const getCurrentId = cb => {
  const request = getRequest();
  const { ReturnUrl = '', mdAppId = '', portalAppId = '' } = request;

  // portalAppId 只选择门户，不带微信回调的绑定模式语义。
  if (mdAppId || portalAppId) {
    cb(mdAppId || portalAppId);
    return;
  }

  let href = decodeURIComponent(ReturnUrl ? ReturnUrl : location.href);
  let currentAppId = '';
  urlList.forEach(o => {
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

// 重新验证必须刷新整页以丢弃 PC 扫码状态，不能保留 mdAppId/wxState/status 等回调模式。
export function restartPortalLogin(appId, customLink) {
  const loginUrl = new URL(pathCompletion('/login', { hasDomain: false }), location.origin);
  const source = new URL(location.href);
  const appUrl = new URL(`app/${encodeURIComponent(appId)}`, loginUrl);
  const isLocalEntry = url =>
    url.origin === location.origin &&
    ['http:', 'https:'].includes(url.protocol) &&
    !/\/(login|network|wxauth|wxscanauth)\/?$/.test(url.pathname);
  // 克隆已解析的 URL，不能把 // 开头的 pathname 再解析成外域地址。
  const fallback = new URL(source.href);
  // state/code 也可能是业务参数；微信回调路径整体拒绝，而非在业务页泛删这些键。
  const callbackKeys = ['mdAppId', 'wxState', 'status', 'accountId', 'portalAppId', 'ReturnUrl', 'returnUrl'];
  callbackKeys.forEach(key => fallback.searchParams.delete(key));
  let returnUrl = isLocalEntry(fallback) ? fallback : appUrl;

  try {
    const original = source.searchParams.get('ReturnUrl') || source.searchParams.get('returnUrl');

    if (original) {
      const candidate = new URL(original, source.origin);

      if (isLocalEntry(candidate)) {
        callbackKeys.forEach(key => candidate.searchParams.delete(key));
        returnUrl = candidate;
      }
    }
  } catch {
    // 畸形回跳地址退回安全入口，不影响重新验证。
  }

  // 包括 fallback 在内，最终回跳必须统一满足同源 HTTP(S) 业务入口约束。
  if (!isLocalEntry(returnUrl)) returnUrl = appUrl;

  loginUrl.searchParams.set('portalAppId', appId);
  loginUrl.searchParams.set('ReturnUrl', returnUrl.href);
  if (customLink) loginUrl.searchParams.set('customLink', customLink);
  sessionStorage.removeItem('clientId');
  localStorage.removeItem('pcScan');
  localStorage.removeItem(`${appId}_portalCustomLink`);
  localStorage.removeItem(`PortalLoginInfo-${appId}`);
  window.clientId = '';
  location.replace(loginUrl.href);
}

//外部门户已登录的情况下，customLink要去除，且h5的模式下，直接走/portal/app/${md.global.Account.appId}
export const resetPortalUrl = () => {
  window.localStorage.removeItem(`${md.global.Account.appId}_portalCustomLink`);
  const customLink = getCurrentExt(md.global.Account.appId, md.global.Account.addressSuffix);

  let targetUrl = pathCompletion(location.pathname);

  if (customLink) {
    targetUrl = targetUrl.replace(`/${customLink}`, '');
  }

  // 仅当目标 URL 与当前 URL 不同时才跳转，避免同页重复刷新导致无限循环
  if (new URL(targetUrl, location.origin).pathname !== location.pathname) {
    window.isWaiting = true;
    location.href = targetUrl;
    return;
  }
};

//获取当前自定义链接的后缀
export const getCurrentExt = (appId, suffix) => {
  const request = getRequest();
  const { ReturnUrl = '', customLink } = request;

  if (customLink) {
    return customLink;
  }

  const urlPathname = new URL(decodeURIComponent(ReturnUrl ? ReturnUrl : location.href));
  const pathname = urlPathname.pathname;
  let prefix;

  if (appId) {
    ['app/', 'mobile/recordList/'].forEach(o => {
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
    if (customLink) {
      try {
        const target = new URL(ReturnUrl, location.href);
        const lastSlash = target.pathname.lastIndexOf('/');

        // 邀请码仅是末尾路径段，不能连同业务 query/hash 一起删除。
        if (target.pathname.slice(lastSlash + 1) === customLink) {
          target.pathname = target.pathname.slice(0, lastSlash) || '/';
          ReturnUrl = target.href;
        }
      } catch {
        // 保持原有非标准 ReturnUrl 的跳转处理，不在此扩展全局路由规则。
      }
    }

    window.location.replace(ReturnUrl);
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
