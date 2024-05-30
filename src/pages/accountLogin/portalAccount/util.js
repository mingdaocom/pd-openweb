import { setPssId } from 'src/util/pssId';
import { getRequest, browserIsMobile } from 'src/util';
import externalPortalAjax from 'src/api/externalPortal';

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
  let addressSuffix = (
    (
      decodeURIComponent(url)
        .replace(/http(s)?:\/\/([^/]+)\//i, '')
        .split(/portal\/(.*)/)
        .filter(o => o)[0] || ''
    ).split(/\/(.*)/)[0] || ''
  ).split('?')[0];
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
    externalPortalAjax.getAppIdByAddressSuffix({ customeAddressSuffix: getSuffix(href) }).then(res => {
      cb(res);
    });
  } else {
    cb(currentAppId);
  }
};

export const goApp = (sessionId, appId) => {
  setPssId(sessionId);
  const request = getRequest();
  const { ReturnUrl = '' } = request;
  if (ReturnUrl) {
    window.location.replace(ReturnUrl);
  } else {
    //h5暂不处理后缀
    toApp(appId);
  }
};
export const setAutoLoginKey = res => {
  const { appId, autoLoginKey } = res;
  if (!autoLoginKey) {
    window.localStorage.removeItem(`PortalLoginInfo-${appId}`); //删除自动登录的key
  } else {
    // 本地存key和APPID
    safeLocalStorageSetItem(`PortalLoginInfo-${appId}`, autoLoginKey);
  }
};

export const accountResultAction = res => {
  const { accountResult, sessionId, appId, state } = res;
  let msg = '';
  switch (accountResult) {
    case 1:
      return goApp(sessionId, appId);
    // break;
    case -1:
      msg = _l('该帐号不存在');
      break;
    case 0:
      msg = _l('登录失败');
      break;
    case 2:
      msg = _l('该帐号已停用');
      break;
    case 3:
      msg = _l('该帐号待审核');
      break;
    case 4:
      msg = _l('该帐号审核未通过');
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
      msg = _l('未绑定微信公众号');
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
    default:
      msg = _l('登录失败');
      break;
  }
  alert(msg, 3);
  return;
};
export const statusList = [2, 3, 4, 9, 10, 11, 12, 13, 14, 10000, 20000]; //需要呈现相对落地页的状态码
