import ReactDOM from 'react-dom';
import redirect from 'src/common/redirect';
import { getAppFeaturesPath } from 'src/util';
import { getSuffix } from 'src/pages/PortalAccount/util';

const urlStack = [];

window.location.goto = function (url, isReplace = false) {
  if (isReplace) {
    window.location.replace(url);
  } else {
    window.location.assign(url);
  }
};

let historyObj;
export function setHistoryObject(history) {
  historyObj = history;
}

// 处理切换页面后残留的各种组件
export function clearZombie() {
  // tooltip
  $('.md_tooltip').remove();

  // mdDialog
  [...document.querySelectorAll('.mdDialog')].forEach(dialog => {
    const dialogId = dialog.getAttribute('id').replace('_container', '');
    $(document).off('keyup.' + dialogId);
    ReactDOM.unmountComponentAtNode(dialog);
    $(`#${dialogId}_mask`).remove();
    $(`#${dialogId}_container`).remove();
  });

  // 处理切换页面时残留 businessCard
  $('.businessCardSite').remove();
}

export function fillUrl(url) {
  const hash = url.split('#')[1] || '';

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
    url = url + '#publicapp' + window.publicAppAuthorization;
    return url;
  }
  return url + (hash ? `#${hash}` : '');
}

/** 跳转到 url */
export function navigateTo(url, isReplace = false, noRedirect = false) {
  url = fillUrl(url);
  clearZombie();
  if (!window.redirected) {
    window.redirected = true;
  }
  if (isReplace && urlStack.length) {
    urlStack.splice(urlStack.length - 1, 1, String(url));
  } else {
    urlStack.push(String(url));
  }
  if (!noRedirect) {
    if (redirect(url, navigateTo)) {
      return;
    }
  }
  if (historyObj) {
    if (isReplace) {
      historyObj.replace(String(url));
    } else {
      historyObj.push(String(url));
    }
  } else {
    window.location.goto(String(url), isReplace);
  }
}
