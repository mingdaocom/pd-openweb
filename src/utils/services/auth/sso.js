import { PUBLIC_KEY } from 'src/utils/domain/shared/securityConstants';
import { getPssId } from 'src/utils/platform/auth/pssId';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/**
 * 根据用户代理判断 SSO 页面是否运行在移动设备。
 */
export const browserIsMobile = () => {
  let sUserAgent = navigator.userAgent.toLowerCase();
  let bIsIpad = sUserAgent.match(/ipad/i) == 'ipad';
  let bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  let bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  let bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  let bIsAndroid = sUserAgent.match(/android/i) == 'android';
  let bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  let bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';

  return bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM;
};

export const ajax = {
  /**
   * 通过原生 XMLHttpRequest 发起 GET 请求并回调响应文本。
   */
  get: function (url, fn) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if ((xhr.readyState == 4 && xhr.status == 200) || xhr.status == 304) {
        fn.call(this, xhr.responseText);
      }
    };

    xhr.send();
  },
  /**
   * 通过原生 XMLHttpRequest 发起带认证信息的 JSON POST 请求。
   */
  post: function (params) {
    let md_pss_id = getPssId();
    let xhr = new XMLHttpRequest();
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
        let result = JSON.parse(xhr.responseText);

        if (result.state) {
          if (result.encrypted) {
            interfaceDataDecryption(result).then(data => {
              params.success.call(this, data);
            });
          } else {
            params.success.call(this, result);
          }
        } else {
          window.alert(result.exception);
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

const interfaceDataDecryption = source => {
  return new Promise(resolve => {
    const { data, key, encrypted } = source || {};

    if (encrypted) {
      import('crypto-js').then(CryptoJS => {
        const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
          iv: CryptoJS.enc.Utf8.parse(PUBLIC_KEY.replace(/\r|\n/, '').slice(26, 42)),
        });
        resolve({
          data: JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)),
        });
      });
    } else {
      resolve(source);
    }
  });
};

/**
 * 跳转到兼容部署子路径的登录页。
 */
export const login = () => {
  location.href = pathCompletion('/login');
};

/**
 * 异步加载脚本，并在加载完成后执行可选回调。
 */
export const getScript = (src, func) => {
  let script = document.createElement('script');
  script.async = 'async';
  script.src = src;
  if (func) {
    script.onload = func;
  }

  document.getElementsByTagName('head')[0].appendChild(script);
};

/**
 * 解析当前页面查询字符串为键值对象。
 */
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

/**
 * 解码返回地址，并在侧栏登录场景补充 pc_slide 参数。
 */
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

/**
 * 将附加参数对象序列化为查询字符串片段。
 */
export const formatOtherParam = param => {
  let result = '';

  for (let i in param) {
    result = `${result ? `${result}&` : ``}` + `${i}=${param[i]}`;
  }

  return result;
};

/**
 * 将已序列化的附加参数拼接到目标地址。
 */
export const addOtherParam = (url, param) => {
  if (url) {
    return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
  } else {
    return url;
  }
};

/**
 * 校验返回地址是否属于明道云域名或当前页面来源。
 */
export const checkOriginUrl = url => {
  if (!url) return '';

  try {
    const target = new URL(url, location.origin);
    const isMingdaoDomain = target.hostname === 'mingdao.com' || target.hostname.endsWith('.mingdao.com');
    const isTrusted = target.origin === location.origin || isMingdaoDomain;
    const isHttp = ['http:', 'https:'].includes(target.protocol);

    return isHttp && isTrusted ? target.href : '';
  } catch {
    return '';
  }
};

/**
 * 同步检查当前 SSO 会话是否已登录。
 */
export const checkLogin = () => {
  let isLoing = false;
  ajax.post({
    url: __api_server__.main + 'Login/CheckLogin',
    data: {},
    async: false,
    success: result => {
      if (result.data) {
        isLoing = true;
      }
    },
  });
  return isLoing;
};

/**
 * 获取并初始化 SSO 页面依赖的全局配置与账户元数据。
 */
export const getGlobalMeta = () => {
  return new Promise(resolve => {
    ajax.post({
      url: __api_server__.main + 'Global/GetGlobalMeta',
      data: {},
      async: true,
      success: result => {
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

        resolve();
      },
    });
  });
};
