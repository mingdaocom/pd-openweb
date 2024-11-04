import _ from 'lodash';
import { getPssId } from 'src/util/pssId';

export const browserIsMobile = () => {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == 'ipad';
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  var bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  var bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  var bIsAndroid = sUserAgent.match(/android/i) == 'android';
  var bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  var bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';

  return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
};

export const ajax = {
  get: function (url, fn) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if ((xhr.readyState == 4 && xhr.status == 200) || xhr.status == 304) {
        fn.call(this, xhr.responseText);
      }
    };
    xhr.send();
  },
  post: function (params) {
    var md_pss_id = getPssId();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', params.url, params.async);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    if (md_pss_id) {
      xhr.setRequestHeader('Authorization', `md_pss_id ${md_pss_id}`);
    }
    if (window.md && window.md.global.Account && window.md.global.Account.accountId) {
      xhr.setRequestHeader('AccountId', md.global.Account.accountId);
    }
    xhr.withCredentials = 'withCredentials' in params ? params.withCredentials : true;
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
        var result = JSON.parse(xhr.responseText);
        if (result.state) {
          params.succees.call(this, result);
        } else {
          window.nativeAlert(result.exception);
          params.error.call(this, result);
        }
      }
    };
    xhr.onerror = err => {
      params.error.call(this, err);
    };
    xhr.send(JSON.stringify(params.data));
  },
};

export const login = () => {
  location.href = '/login';
};

export const getScript = (src, func) => {
  var script = document.createElement('script');
  script.async = 'async';
  script.src = src;
  if (func) {
    script.onload = func;
  }
  document.getElementsByTagName('head')[0].appendChild(script);
};

export const getRequest = () => {
  const encodeUrl = new URL(location.href.replace('#', encodeURIComponent('#')));
  const search = encodeUrl.search.replace('?', '');
  let theRequest = new Object();
  let strs = search.split('&');
  for (let i = 0; i < strs.length; i++) {
    let result = strs[i].split('=');
    theRequest[result[0]] = decodeURIComponent(result[1]);
  }
  return theRequest;
};

export const replenishRet = (ret, pc_slide) => {
  const url = decodeURIComponent(ret);
  const isHash = url.includes('#');
  const isPcSlide = pc_slide.includes('true');
  const add = url => {
    return url.includes('?') ? `${url}&pc_slide=true` : `${url}?pc_slide=true`;
  };

  if (!isPcSlide) {
    return url;
  }

  if (isHash) {
    const [page, hash] = url.split('#');
    const newUrl = add(page);
    return `${newUrl}#${hash}`;
  } else {
    return add(url);
  }
};

export const formatOtherParam = param => {
  let result = '';
  for(let i in param) {
    result = `${result ? `${result}&` : ``}` + `${i}=${param[i]}`;
  }
  return result;
}

export const addOtherParam = (url, param) => {
  if (url) {
    return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
  } else {
    return url;
  }
}

export const checkOriginUrl = url => {
  if (url && url.includes('http')) {
    return url.includes(location.origin);
  } else {
    return url;
  }
}

export const checkLogin = () => {
  let isLoing = false;
  ajax.post({
    url: __api_server__.main + 'Login/CheckLogin',
    data: {},
    async: false,
    succees: result => {
      if (result.data) {
        isLoing = true;
      }
    },
  });
  return isLoing;
};

export const getGlobalMeta = cb => {
  ajax.post({
    url: __api_server__.main + 'Global/GetGlobalMeta',
    data: {},
    async: true,
    succees: result => {
      const data = result.data;
      window.config = data.config;
      if (!window.md) {
        window.md = { global: data['md.global'] };
      } else {
        window.md.global = data['md.global'];
      }
      if (window.md.global && !window.md.global.Account) {
        window.md.global.Account = {};
      }
      cb();
    },
  });
};

export const getCurrentTime = time => {
  var date = time ? time : new Date();
  var month = zeroFill(date.getMonth() + 1);
  var day = zeroFill(date.getDate());
  var hour = zeroFill(date.getHours());
  var minute = zeroFill(date.getMinutes());
  var second = zeroFill(date.getSeconds());
  var curTime = date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  return curTime;
};

function zeroFill(i) {
  if (i >= 0 && i <= 9) {
    return '0' + i;
  } else {
    return i;
  }
}

export const getTimeNow = strTime => {
  return Date.parse(strTime.replace(/-/g, '/'));
};

export const isBefore = time => {
  let contrastTime = getTimeNow(time);
  let currentTime = getTimeNow(getCurrentTime());
  return currentTime < contrastTime;
};

export const setCookie = (name, value, expire) => {
  var expireDate;
  if (!expire) {
    var nextyear = new Date();
    nextyear.setFullYear(nextyear.getFullYear() + 10);
    expireDate = nextyear.toGMTString();
  } else {
    expireDate = expire.toGMTString();
  }

  if (document.domain.indexOf('mingdao.com') == -1) {
    document.cookie = name + '=' + escape(value) + ';expires=' + expireDate + ';path=/';
  } else {
    document.cookie = name + '=' + escape(value) + ';expires=' + expireDate + ';path=/;domain=.mingdao.com';
  }
};

const getCookie = name => {
  var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
  if (arr != null) {
    return unescape(arr[2]);
  }
  return null;
};
