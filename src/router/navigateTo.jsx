import ReactDOM from 'react-dom';
import $ from 'jquery';

export const urlStack = [];
export function urlStackBack(e) {
  if (urlStack.length > 1) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    history.back(); // TODO: test
    return false;
  }
}

window.location.goto = function(url, isReplace = false) {
  if (isReplace) {
    window.location.replace(url);
  } else {
    window.location.assign(url);
  }
};

const xhrs = [];
/** 终止掉记录下的 ajax 请求 */
export function abortAjax() {
  // TODO: clear $.api queque, and abort xhr without causing error alert
  xhrs.forEach(xhr => xhr.abort());
  xhrs.splice(0);
}

export function logAjax() {
  // 记录下所有 ajax 请求，切换模块时终止掉
  $(document).ajaxSend(function logAjaxSent(e, jqXHR, options) {
    xhrs.push(jqXHR);
  });
  $(document).ajaxComplete(function logAjaxComplete(e, jqXHR, options) {
    let index = -1;
    while (xhrs.length && index >= 0) {
      index = xhrs.indexOf(jqXHR);
      xhrs.splice(index, 1);
    }
    // xhrs = xhrs.filter(xhr => xhr !== jqXHR);
  });
}

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

/** 跳转到 url */
export function navigateTo(url, isReplace = false) {
  clearZombie();
  if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
    url = url + '#publicapp' + window.publicAppAuthorization;
  }
  if (isReplace && urlStack.length) {
    urlStack.splice(urlStack.length - 1, 1, String(url));
  } else {
    urlStack.push(String(url));
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
