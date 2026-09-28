import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import login from 'src/api/login';
import project from 'src/api/project';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getPathWithoutSubPath, pathCompletion } from 'src/utils/platform/navigation/path';

const isPrivateDeployment = () => _.get(window, 'platformENV.isOverseas') || _.get(window, 'platformENV.isLocal');

export function redirect(url, navigate = toUrl => (location.href = toUrl)) {
  if (getPathWithoutSubPath(url).split(/(?=[?#])/)[0] === '/app/my') {
    const latestGroup = safeParse(localStorage.getItem(`latest_group_${md.global.Account.accountId}`));

    if (!_.isEmpty(latestGroup)) {
      navigate(`/app/my/group/${latestGroup.projectId}/${latestGroup.groupType}/${latestGroup.groupId}`);
      return true;
    }
  }
}

/** 跳转到 url */
export function navigateTo(url, isReplace = false, noRedirect = false) {
  if (!window.redirected) {
    window.redirected = true;
  }

  if (!noRedirect) {
    if (redirect(url, navigateTo)) {
      return;
    }
  }

  url = pathCompletion(url, { hasDomain: false });

  if (url === location.href || url === location.pathname + location.search + location.hash) {
    return;
  }

  if (window.reactRouterHistory) {
    if (isReplace) {
      window.reactRouterHistory.replace(String(url.replace(location.origin, '')));
    } else {
      window.reactRouterHistory.push(String(url.replace(location.origin, '')));
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
    let isSubDomain = isPrivateDeployment();

    if (!isPrivateDeployment() && !_.includes(['meihua.mingdao.com', 'www.mingdao.com'], host)) {
      isSubDomain = project.checkSubDomain({ host }, { ajaxOptions: { sync: true } });
    }

    const loginUrl = isPrivateDeployment() ? getLoginUrl(redirectUrl) : redirectUrl;

    const url = loginUrl
      ? loginUrl
      : isSubDomain
        ? pathCompletion(`/network${link}`, { hasDomain: false })
        : pathCompletion(`/login${link}`, { hasDomain: false });

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
          browserIsMobile() ||
          (isPrivateDeployment() && _.get(md, 'global.SysSettings.sessionExpireRedirectType') === 2) ||
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

        if (window.allowNotLogin) return;

        isExecute ? handleNavigate() : loginFailDialog();
      } else if (!isNewTab) {
        location.reload();
      }

      pendingCheckLogin = '';
    });
  };

  const loginFailDialog = () => {
    if (document.getElementsByClassName('loginFailDialog').length) return;

    Modal.confirm({
      className: 'loginFailDialog',
      title: _l('登录已失效'),
      content: _l('重新登录以继续使用'),
      width: 360,
      closable: false,
      okButtonProps: {
        color: 'primary',
        variant: 'outlined',
      },
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
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
  const returnUrl = isPrivateDeployment() ? getLoginUrl() || location.href : location.href;

  location.href = pathCompletion(`/logout?ReturnUrl=${encodeURIComponent(returnUrl)}`);
}
