import { getPssId } from 'src/util/pssId';
import langConfig from './langConfig';
import { antAlert, destroyAlert } from 'src/util/antdWrapper';
import _, { get } from 'lodash';
import moment from 'moment';
import axios from 'axios';
import qs from 'query-string';
import localForage from 'localforage';
import versionApi from 'src/api/version';

/**
 * 获取当前语言
 */
window.getCurrentLang = () => {
  const currentLang = getCookie('i18n_langtag');
  const lang = navigator.language;
  let langKey = 'zh-Hans';

  if (currentLang) {
    return currentLang;
  }

  if (lang.substr(0, 2) === 'en') {
    langKey = 'en';
  } else {
    switch (lang) {
      case 'zh-TW':
      case 'zh-HK':
      case 'zh-Hant':
        langKey = 'zh-Hant';
        break;
      case 'ja':
        langKey = 'ja';
    }
  }

  setCookie('i18n_langtag', langKey);

  return langKey;
};

/**
 * 获取当前语言code
 */
window.getCurrentLangCode = lang => {
  if (!lang) {
    lang = getCurrentLang();
  }

  return _.find(langConfig, o => o.key === lang).code;
};

/**
 * Cookies 写入
 * @param {string} name - Cookie名称
 * @param {string} value - Cookie值
 * @param {Date} expire - 过期时间
 */
window.setCookie = function setCookie(name, value, expire) {
  if (_.get(window, 'md.global.Config.HttpOnly')) {
    safeLocalStorageSetItem(name, value);
    return;
  }

  // 过期时间处理
  const expiration = expire ? moment(expire).toDate() : moment().add(10, 'days').toDate();

  const cookieOptions = {
    expires: expiration.toGMTString(),
    path: '/',
    domain: document.domain.indexOf('mingdao.com') === -1 ? '' : '.mingdao.com',
  };

  document.cookie = `${name}=${escape(value)};expires=${cookieOptions.expires};path=${cookieOptions.path};domain=${
    cookieOptions.domain
  }`;
};

/**
 * Cookies 读取
 * @param {string} name - Cookie名称
 * @returns {string|null} - Cookie值
 */
window.getCookie = function getCookie(name) {
  if (_.get(window, 'md.global.Config.HttpOnly')) {
    return localStorage.getItem(name) || null;
  }

  const cookieRegex = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
  const cookieMatch = document.cookie.match(cookieRegex);

  return cookieMatch ? decodeURIComponent(cookieMatch[2]) : null;
};

/**
 * Cookies 删除
 * @param {string} name - Cookie名称
 */
window.delCookie = function delCookie(name) {
  const cookieValue = getCookie(name);

  if (cookieValue) {
    const cookieOptions = {
      expires: moment().subtract(10, 'seconds').toDate().toGMTString(),
      path: '/',
      domain: document.domain.indexOf('.mingdao.com') !== -1 ? '.mingdao.com' : '',
    };
    document.cookie = `${name}=${cookieValue};expires=${cookieOptions.expires};path=${cookieOptions.path};domain=${cookieOptions.domain}`;
  }
};

/**
 * 多语言翻译
 * @param {string} key - 翻译的键值
 * @param {...string} args - 替换内容的参数
 * @returns {string} - 翻译后的结果
 */
window._l = function (key, ...args) {
  let content = key;

  // 翻译文件内存在这个key
  if (typeof translations !== 'undefined' && translations[key]) {
    content = translations[key];
  }

  // 含有0%、1%等内容参数替换
  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      content = content.replace(new RegExp(`%${i}`, 'g'), args[i]);
    }
  } else if (/.*%\d{5}/.test(content)) {
    // 处理特殊多语境单词问题
    content = content.replace(/%\d{5}$/, '');
  }

  return content;
};

const ua = window.navigator.userAgent.toLowerCase();

window.isDingTalk = ua.includes('dingtalk'); // 是否是钉钉环境下
window.isMacOs = ua.includes('mac os'); // 是否是mac os环境下
window.isMingDaoApp = ua.includes('mingdao application'); //是否是明道app环境下
window.isMiniProgram = ua.includes('miniprogram'); //是否是小程序环境下
window.isWxWork = ua.includes('wxwork'); // 是否是企业微信环境下
window.isWeLink = ua.includes('huawei-anyoffice'); // 是否是WeLink环境下
window.isFeiShu = ua.includes('feishu'); // 是否是飞书环境下
window.isWeiXin = ua.includes('micromessenger'); // 是否是微信环境下
window.isIphone = ua.includes('iphone'); // 是否是iphone环境下
window.isAndroid = ua.includes('android'); // 是否是android环境下
window.isChrome = ua.includes('chrome'); // 是否chrome环境下
window.isFirefox = ua.includes('firefox'); // 是否firefox环境下
window.isEdge = ua.includes('edge'); // 是否edge环境下
window.isSafari = /^((?!chrome|android).)*safari/i.test(ua); // 是否safari环境下
window.isMDClient = ua.includes('mdclient'); // 是否是明道云客户端
window.isWindows = ua.includes('windows'); // 是否是windows环境下
window.isIPad = ua.includes('ipad'); // 是否是ipad环境下

/**
 * 全局变量
 */
window.md = {
  global: {
    Account: {
      accountId: '',
      hrVisible: true,
    },
    Config: {
      DefaultLang: 'zh-Hans',
      IsLocal: true,
      ServiceTel: '400-665-6655',
      DefaultConfig: {
        initialCountry: 'cn',
        preferredCountries: ['cn'],
        onlyCountries: [],
      },
    },
    getCaptchaType: () => {
      return window.localStorage.getItem('captchaType')
        ? parseInt(window.localStorage.getItem('captchaType'))
        : ua.match(/miniprogram|wechatdevtools|wxwork/) || !window.TencentCaptcha
        ? 1
        : md.global.Config.CaptchaType || 0;
    },
    SysSettings: {
      passwordRegex: /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/,
      passwordRegexTip: '',
      hideHelpTip: true,
      enableMobilePhoneRegister: true,
      enableEmailRegister: false,
      hideRegister: false,
      hideBrandLogo: false,
      brandLogoHeight: 40,
      brandLogoUrl: '',
      hideBrandName: false,
      forbidSuites: '',
    },
  },
};

/**
 * 自定义alert
 */
function customAlert() {
  window.nativeAlert = window.alert;
  window.alert = antAlert;
  window.destroyAlert = destroyAlert;
}

customAlert();

if (window.isWeiXin) {
  document.addEventListener('WeixinJSBridgeReady', () => {
    customAlert();
  });
}

window.File = typeof File === 'undefined' ? {} : File;

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} - 文件扩展名
 */
File.GetExt = function (fileName) {
  const t = (fileName || '').split('.');
  return t.length > 1 ? t[t.length - 1] : '';
};

/**
 * 获取文件名（不包含扩展名）
 * @param {string} fileName - 文件名
 * @returns {string} - 文件名（不包含扩展名）
 */
File.GetName = function (fileName) {
  const t = (fileName || '').split('.');
  t.pop();
  return t.join('.');
};

/**
 * 检查文件扩展名是否有效
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 文件扩展名是否有效
 */
File.isValid = function (fileExt) {
  const fileExts = new Set(['.exe', '.vbs', '.bat', '.cmd', '.com', '.url']);
  fileExt = (fileExt || '').toLowerCase();
  return !fileExts.has(fileExt);
};

/**
 * 检查文件扩展名是否为图片类型
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 文件扩展名是否为图片类型
 */
File.isPicture = function (fileExt) {
  const fileExts = new Set([
    '.jpg',
    '.gif',
    '.png',
    '.jpeg',
    '.bmp',
    '.webp',
    '.heic',
    '.heif',
    '.svg',
    '.tif',
    '.tiff',
  ]);
  fileExt = (fileExt || '').toLowerCase();
  return fileExts.has(fileExt);
};

/**
 * 返回loading动画
 */
window.LoadDiv = () => {
  return `
    <div class="TxtCenter TxtMiddle mTop10 mBottom10 w100">
      <div class="divCenter MdLoader MdLoader--middle">
        <svg class="MdLoader-circular">
          <circle class="MdLoader-path" stroke-width="3" cx="6" cy="6" r="12"></circle>
        </svg>
      </div>
    </div>
  `;
};

/**
 * 兼容parse报错
 * @param {string} str - 要解析的字符串
 * @param {string} type - 返回值类型 ('array' 或 'object')
 * @returns {Array|Object} - 解析结果或空数组/空对象
 */
window.safeParse = (str, type) => {
  if (!str) {
    return type === 'array' ? [] : {};
  }
  try {
    return JSON.parse(str);
  } catch (err) {
    if (str && !(typeof str === 'string' && str.startsWith('deleteRowIds'))) {
      console.error(err);
    }
    return type === 'array' ? [] : {};
  }
};

/**
 * 安全地将数据存储到本地存储中
 * @param {...any} args - 传递给 localStorage.setItem() 方法的参数
 */
window.safeLocalStorageSetItem = (...args) => {
  try {
    window.localStorage.setItem(...args);
  } catch (err) {
    console.log(err);
  }
};

/**
 * 安全地解析字符串为数组
 * @param {string} str - 要解析的字符串
 * @returns {Array} - 解析结果或空数组
 */
window.safeParseArray = str => {
  return window.safeParse(str, 'array');
};

/**
 * 格式化时间
 * @param {string} dateStr 具体的日期字符串，格式为 yyyy-MM-dd HH:mm:ss
 * @returns {string} 相对的时间，如15分钟前
 */
window.createTimeSpan = (dateStr, needSecond = false) => {
  const dateTime = moment(dateStr);
  const now = moment();
  const diff = now.diff(dateTime);
  const milliseconds = diff;
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const year = dateTime.format('YYYY');
  const month = dateTime.format('MM');
  const day = dateTime.format('DD');
  const hour = dateTime.format('HH');
  const minute = dateTime.format('mm');
  const second = needSecond ? ':' + dateTime.format('ss') : '';

  // 处理未来时间的情况
  if (diff < 0) return `${hour}:${minute}`;

  if (seconds < 60) {
    return _l('刚刚');
  } else if (minutes < 60) {
    return `${minutes}${_l('分钟前')}`;
  } else if (dateTime.isSame(now, 'd')) {
    return `${_l('今天')} ${hour}:${minute}${second}`;
  } else if (dateTime.isSame(now.subtract(1, 'd'), 'd')) {
    return `${_l('昨天')} ${hour}:${minute}${second}`;
  } else if (dateTime.format('YYYY') === now.format('YYYY')) {
    return `${_l('%0月%1日', month, day)} ${hour}:${minute}${second}`;
  }

  return `${_l('%0年%1月%2日', year, month, day)} ${hour}:${minute}${second}`;
};

/**
 * 是否需要设置clientId
 * @returns {boolean}
 */
window.needSetClientId = ({ clientId, controllerName } = {}) => {
  return (
    location.href.indexOf('/public/') > -1 &&
    clientId &&
    _.includes(
      ['AppManagement', 'Worksheet', 'PublicWorksheet', 'report_api', 'HomeApp', 'Attachment', 'Kc', 'Workflow'],
      controllerName,
    )
  );
};

/**
 * 获取错误信息
 * @returns {Object}
 */
const getErrorMessage = (jqXHR = {}, textStatus) => {
  let errorMessage;

  switch (jqXHR.status) {
    case 0:
      errorMessage = _l('网络异常，请检查您的网络');
      break;
    case 401:
      errorMessage = _l('帐号已退出，请重新登录');
      break;
    case 403:
      errorMessage = _l('403 权限不足');
      break;
    case 404:
      errorMessage = _l('404 页面不存在');
      break;
    case 405:
      errorMessage = _l('405 请求方法错误');
      break;
    case 413:
      errorMessage = _l('413 请求数据量过大');
      break;
    case 414:
      errorMessage = _l('414 请求URL过长');
      break;
    case 421:
      errorMessage = _l('421 请求过于频繁');
      break;
    case 501:
      errorMessage = _l('501 请求方法不存在');
      break;
    case 502:
      errorMessage = _l('502 上游服务器发生异常，请稍候再试');
      break;
    case 503:
      errorMessage = _l('503 服务临时不可用，请稍后重试');
      break;
    case 504:
      errorMessage = _l('504 服务超时，请稍后重试');
      break;
    case 505:
      errorMessage = _l('505 服务器不支持您的HTTP版本');
      break;
  }

  if (!errorMessage && jqXHR.status >= 400 && jqXHR.status < 500) {
    errorMessage = _l('请求失败，请稍后重试');
  } else if (!errorMessage && jqXHR.status >= 500) {
    errorMessage = _l('服务异常，请稍后重试');
  }

  // 火狐在用户跳走时会弹 “请求服务器失败”
  if (errorMessage && textStatus !== 'abort' && jqXHR.status !== 0 && !window.isFirefox) {
    alert(errorMessage, 2);
  }

  return {
    errorCode: textStatus === 'abort' ? 1 : jqXHR.status,
    errorMessage: textStatus === 'abort' ? _l('请求被取消') : errorMessage,
  };
};

/**
 * 处理请求参数
 */
const disposeRequestParams = (controllerName, actionName, data, ajaxOptions) => {
  let serverPath = __api_server__.main;
  let headers = {
    Authorization: getPssId() ? `md_pss_id ${getPssId()}` : '',
    AccountId: !ajaxOptions.url && _.get(md.global.Account, 'accountId') ? md.global.Account.accountId : undefined,
    'X-Requested-With': !ajaxOptions.url ? 'XMLHttpRequest' : undefined,
  };
  const clientId = window.clientId || sessionStorage.getItem('clientId');

  if (window.needSetClientId({ clientId, controllerName })) {
    headers.clientId = clientId;
  }

  // 应用库
  if (window.publicAppAuthorization) {
    if (
      _.get(md.global.Config, 'IsLocal') &&
      !/#isPrivateBuild/.test(location.hash) &&
      _.get(md.global.SysSettings, 'templateLibraryTypes') !== '2'
    ) {
      serverPath = 'https://www.mingdao.com/api/';
    }

    headers.shareAuthor = window.publicAppAuthorization;
    headers.clientId = undefined;
  }

  // 工作流&统计服务
  if (window.access_token) {
    headers.access_token = access_token;
    headers.Authorization = `access_token ${access_token}`;
  }

  if ((ajaxOptions.type || '').toUpperCase() === 'GET') {
    let value;
    Object.keys(data).forEach(key => {
      value = data[key];
      data[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
    });
  }

  if (typeof data === 'string') {
    data = JSON.parse(data);
  }

  return {
    url: ajaxOptions.url || serverPath + encodeURIComponent(controllerName) + '/' + encodeURIComponent(actionName),
    headers,
    data,
  };
};

/**
 * 获取本地化存储Key
 * @param {String} controllerName 模块名称
 * @param {String} actionName     操作名称
 * @param {Object} requestData    请求参数
 * @returns
 */
const getLocalizationKey = (controllerName, actionName, requestData = {}) => {
  const key = `${controllerName}_${actionName}`;
  const CACHE_PARAMS = {
    AppManagement_GetAppLangDetail: {
      moduleType: 1,
      sourceId: requestData.appId,
      extraKey: `_${requestData.appLangId}`,
    },
  };

  return CACHE_PARAMS[key] ? { key, ...CACHE_PARAMS[key] } : {};
};

/**
 * 插入本地化存储数据
 */
const insertLocalData = ({ key, moduleType, sourceId, extraKey, version, data }) => {
  if (!key) return;

  if (version) {
    localForage.setItem(`${key}_${sourceId}${extraKey || ''}`, { version, data });
  } else {
    versionApi.getVersion({ moduleType, sourceId }).then(({ version }) => {
      localForage.setItem(`${key}_${sourceId}${extraKey || ''}`, { version, data });
    });
  }
};

/**
 * 请求 API 接口
 * @param  {String} controllerName 模块名称
 * @param  {String} actionName     操作名称
 * @param  {Object} requestData    请求参数
 * @param  {Object} options        额外配置
 * @param  {Boolean} options.silent 发生错误时不弹出提示
 * @return {Promise}               返回结果的 promise
 */
window.mdyAPI = (controllerName, actionName, requestData, options = {}) => {
  const controller = new AbortController();
  const ajaxOptions = options.ajaxOptions || {};
  const method = ajaxOptions.type || 'POST';
  const isSync = ajaxOptions.sync;
  const { url, headers, data } = disposeRequestParams(controllerName, actionName, requestData || {}, ajaxOptions);

  if (isSync) {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url + (method === 'GET' ? `?${qs.stringify(data)}` : ''), false);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.withCredentials = !ajaxOptions.url;
    xhr.send(method === 'GET' ? '' : JSON.stringify(data));

    const responseData = JSON.parse(xhr.responseText);

    if (xhr.status === 200) {
      if (responseData.exception) {
        !options.silent && alert(responseData.exception, 2);
      } else {
        return responseData.data;
      }
    } else {
      !options.silent && alert(responseData.exception, 2);
    }
  }

  const promise = new Promise(async (resolve, reject) => {
    const { key, moduleType, sourceId, extraKey } = getLocalizationKey(controllerName, actionName, requestData);
    let version;

    if (key) {
      const localSource = await localForage.getItem(`${key}_${sourceId}${extraKey || ''}`);
      if (localSource) {
        const versionData = await versionApi.getVersion({ moduleType, sourceId });

        version = versionData.version;

        if (version === localSource.version) {
          resolve(localSource.data);
          return;
        }
      }
    }

    axios({
      method,
      url,
      headers,
      params: method === 'GET' ? data : {},
      data: method === 'POST' ? data : {},
      withCredentials: !ajaxOptions.url,
      signal: controller.signal,
    })
      .then(response => {
        const responseData = response.data || { state: -1, exception: _l('解析返回结果错误') };

        if (responseData.exception) {
          !options.silent && alert(responseData.exception, 2);
          reject({ errorCode: responseData.state, errorMessage: responseData.exception, errorData: responseData });
        } else {
          insertLocalData({ key, moduleType, sourceId, extraKey, version, data: responseData.data });
          resolve(responseData.data);
        }
      })
      .catch(error => {
        if (
          error.response &&
          error.response.status === 402 &&
          error.response.data &&
          error.response.data.state === 13 &&
          error.response.data.data
        ) {
          if (_.get(md, 'global.Account.accountId') && location.href.indexOf('mobile') === -1) {
            import('../pages/PageHeader/components/NetState').then(netState => {
              netState.default(error.response.data.data);
            });
          }
        }

        reject({
          ...getErrorMessage(error.response, axios.isCancel(error) ? 'abort' : ''),
          errorData: axios.isCancel(error) ? {} : get(error, 'response.data'),
        });
      });
  });

  promise.abort = () => {
    controller.abort();
  };

  return promise;
};

/**
 * 加载多语言文件
 */
(function () {
  const pages = [
    '/auth/workwx',
    '/auth/chatTools',
    '/auth/welink',
    '/auth/feishu',
    '/sso/dingding',
    '/sso/sso',
    '/sso/workweixin',
  ];

  if (pages.includes(location.pathname)) {
    return;
  }

  const currentLang = langConfig.find(item => item.key === getCurrentLang());

  if (!!currentLang) {
    const xhrObj = new XMLHttpRequest();
    const script = document.createElement('script');
    const path = !location.href.match(/mingdao\.com|share\.mingdao\.net/)
      ? currentLang.path
      : currentLang.path.replace('/staticfiles/lang', '/locale') +
        `?${moment().format('YYYY_MM_DD_') + Math.floor(moment().hour() / 6)}`;

    xhrObj.open('GET', path, false);
    xhrObj.send('');
    script.type = 'text/javascript';
    script.text = xhrObj.responseText;
    document.head.appendChild(script);
  }
})();

/**
 * 兼容企业微信windows客户端低版本没有prepend方法报错的问题
 */
(function (arr) {
  arr.forEach(function (item) {
    item.prepend =
      item.prepend ||
      function () {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      };
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

/**
 * 兼容钉钉内核63 问题
 */
if (!Object.fromEntries) {
  Object.fromEntries = function (entries) {
    let entriesObj = {};

    if (Array.isArray(entries)) {
      (entries || []).forEach(element => {
        entriesObj[element[0]] = element[1];
      });
    }

    return entriesObj;
  };
}
