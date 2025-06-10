import _ from 'lodash';
import { Dialog } from 'ming-ui';
import login from 'src/api/login';
import project from 'src/api/project';
import { getSuffix } from 'src/pages/AuthService/portalAccount/util';
import { getAppFeaturesPath } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';

export function fillUrl(url) {
  const hash = url.split('#')[1] || '';
  const hash2 = url.split('#')[2] || '';

  url = url.split('#')[0];

  //是外部门户 当前环境以自定义后缀访问
  if (
    md.global.Account.isPortal &&
    getSuffix(location.href) === md.global.Account.addressSuffix &&
    url.indexOf(md.global.Account.addressSuffix) < 0 &&
    url.indexOf('app/') >= 0
  ) {
    url = url.replace('app/' + md.global.Account.appId, md.global.Account.addressSuffix);
  }
  if (!url.startsWith(window.subPath)) {
    url = (window.subPath || '') + url;
  }
  // 隐藏功能项参数
  const hideOptions = getAppFeaturesPath();

  if (hideOptions && url.indexOf(hideOptions) < 0) {
    url = url + (url.indexOf('?') > -1 ? `&${hideOptions}` : `?${hideOptions}`);
  }
  if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
    url = url + '#publicapp' + window.publicAppAuthorization + (hash2 ? `#${hash2}` : ``);
    return url;
  }
  return url + (hash ? `#${hash}` : '');
}

export function redirect(url, navigate = toUrl => (location.href = toUrl)) {
  if (url === '/app/my') {
    const latestGroup = safeParse(localStorage.getItem(`latest_group_${md.global.Account.accountId}`));
    if (!_.isEmpty(latestGroup)) {
      navigate(`/app/my/group/${latestGroup.projectId}/${latestGroup.groupType}/${latestGroup.groupId}`);
      return true;
    }
  }
}

/** 跳转到 url */
export function navigateTo(url, isReplace = false, noRedirect = false) {
  url = fillUrl(url);

  if (!window.redirected) {
    window.redirected = true;
  }

  if (!noRedirect) {
    if (redirect(url, navigateTo)) {
      return;
    }
  }

  if (window.reactRouterHistory) {
    if (isReplace) {
      window.reactRouterHistory.replace(String(url));
    } else {
      window.reactRouterHistory.push(String(url));
    }
  } else {
    if (isReplace) {
      window.location.replace(url);
    } else {
      window.location.assign(url);
    }
  }
}

/** 获取登录地址  */
const getLoginUrl = redirectUrl => {
  if (redirectUrl) return redirectUrl;

  if (_.get(md, 'global.Account.isSSO') && _.get(md, 'global.SysSettings.enableSso')) {
    return browserIsMobile() ? _.get(md, 'global.SysSettings.ssoAppUrl') : _.get(md, 'global.SysSettings.ssoWebUrl');
  }

  return '';
};

/** 跳转到 登录页 */
let pendingCheckLogin;

export function navigateToLogin({ needSecondCheck, needReturnUrl = true, redirectUrl } = {}) {
  const handleNavigate = (newTab = false) => {
    const host = location.host;
    const link = needReturnUrl ? `?ReturnUrl=${encodeURIComponent(location.href)}` : ``;
    let isSubDomain = true;

    //if (!_.includes(['meihua.mingdao.com', 'www.mingdao.com'], host)) {
    //  isSubDomain = project.checkSubDomain({ host }, { ajaxOptions: { sync: true } });
    //}

    let loginUrl = getLoginUrl(redirectUrl);
    const url = loginUrl
      ? loginUrl
      : isSubDomain
        ? `${window.subPath || ''}/network${link}`
        : `${window.subPath || ''}/login${link}`;

    if (newTab) {
      window.open(url + '#autoClose=true');
    } else {
      location.href = url;
      window.isWaiting = true;
    }
  };
  const checkLogin = isDialogClick => {
    login.checkLogin().then(isLogin => {
      const isNewTab =
        !!$('.workSheetNewRecord').length || !!$('.workSheetRecordInfo').length || !!$('.customWidgetContainer').length;

      if (!isLogin) {
        const isExecute =
          browserIsMobile() || _.get(md, 'global.SysSettings.sessionExpireRedirectType') === 2 ||
          window.isMDClient ||
          window.isDingTalk ||
          window.isWxWork ||
          window.isWeLink ||
          window.isFeiShu ||
          window.isWeiXin;

        if (isDialogClick) {
          handleNavigate(isNewTab);
          return;
        }

        isExecute ? handleNavigate() : loginFailDialog();
      } else if (!isNewTab) {
        location.reload();
      }

      pendingCheckLogin = '';
    });
  };
  const loginFailDialog = () => {
    if (document.getElementsByClassName('loginFailDialog').length) return;

    Dialog.confirm({
      className: 'loginFailDialog',
      title: _l('登录已失效'),
      description: _l('重新登录以继续使用'),
      width: 360,
      onlyClose: true,
      closable: false,
      removeCancelBtn: true,
      buttonType: 'ghostgray',
      okText: _l('登录'),
      onOk: () => checkLogin(true),
    });
  };

  if (needSecondCheck) {
    if (pendingCheckLogin) return;

    pendingCheckLogin = setTimeout(checkLogin, 2000);
  } else {
    handleNavigate();
  }
}

/** 跳转到 登出页 */
export function navigateToLogout() {
  location.href = `${window.subPath || ''}/logout?ReturnUrl=${encodeURIComponent(getLoginUrl() || location.href)}`;
}
