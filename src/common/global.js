import baseAxios from 'axios';
import CryptoJS from 'crypto-js';
import localForage from 'localforage';
import _, { get, isFunction, isObject, replace, some } from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import { antAlert, destroyAlert } from 'ming-ui/functions/alert';
import loginApi from 'src/api/login';
import versionApi from 'src/api/version';
import { PUBLIC_KEY } from 'src/utils/enum';
import { getPssId } from 'src/utils/pssId';
import langConfig from './langConfig';

const axios = baseAxios.create();

function testApiPath(apiPath, url) {
  const apiPathOfRequest = new URL(/^http/.test(url) ? url : location.origin + url).pathname;
  return new RegExp(apiPath + '$').test(apiPathOfRequest);
}

function changeRequestData(config, apiPath, changes = {}) {
  const needChange = isFunction(apiPath) ? apiPath() : testApiPath(apiPath, config.url);
  if (needChange) {
    if (isFunction(changes)) {
      config.data = changes(config.data);
    } else if (isObject(changes)) {
      config.data = {
        ...config.data,
        ...changes,
      };
    }
  }
}

axios.interceptors.request.use(
  config => {
    try {
      changeRequestData(
        config,
        () =>
          some(
            [
              'Worksheet/AddWorksheetRow',
              'Worksheet/UpdateWorksheetRow',
              'Worksheet/UpdateWorksheetRows',
              'Worksheet/DeleteWorksheetRows',
              'process/startProcessByPBC',
              'process/startProcess',
            ].map(apiPath => testApiPath(apiPath, config.url)),
          ),
        {
          pushUniqueId: testApiPath('process/startProcess', config.url)
            ? get(md, 'global.Config.pushUniqueId')
            : replace(get(md, 'global.Config.pushUniqueId', ''), /__.*/, ''),
        },
      );
    } catch (err) {
      console.error(err);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * 获取当前语言
 */
window.getCurrentLang = (hasDefault = true) => {
  if (window.defaultLang) {
    return window.defaultLang;
  }

  const currentLang = getCookie('i18n_langtag');

  if (currentLang) {
    return currentLang;
  }

  let langKey;

  switch (navigator.language) {
    case 'zh-CN':
    case 'zh_cn':
    case 'zh-cn':
    case 'zh-SG':
    case 'zh_sg':
      langKey = 'zh-Hans';
      break;
    case 'zh-TW':
    case 'zh-HK':
    case 'zh-Hant':
      langKey = 'zh-Hant';
      break;
    case 'ja':
      langKey = 'ja';
      break;
    default:
      langKey = hasDefault ? 'en' : '';
  }

  langKey && setCookie('i18n_langtag', langKey);

  return langKey;
};

/**
 * 获取当前语言code
 */
window.getCurrentLangCode = lang => {
  if (!lang) {
    lang = getCurrentLang(false);
  }

  return (_.find(langConfig, o => o.key === lang) || {}).code;
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

  return content.replace(/\\/g, '');
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

  if (currentLang) {
    const xhrObj = new XMLHttpRequest();
    const script = document.createElement('script');
    const path =
      (!location.href.match(/mingdao\.com|share\.mingdao\.net/)
        ? currentLang.path
        : currentLang.path.replace('/staticfiles/lang', 'https://alifile.mingdaocloud.com/lang/HAP')) +
      `?${moment().format('YYYY_MM_DD_') + Math.floor(moment().hour() / 6)}`;

    xhrObj.open('GET', path, false);
    xhrObj.send('');
    script.type = 'text/javascript';
    script.text = xhrObj.responseText;
    document.head.appendChild(script);
  }
})();

const ua = window.navigator.userAgent.toLowerCase();

window.isDingTalk = ua.includes('dingtalk'); // 是否是钉钉环境下
window.isMacOs = ua.includes('mac os') || ua.includes('mdclient_mac'); // 是否是mac os环境下
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
      guideSettings: {},
    },
    Config: {
      DefaultLang: 'zh-Hans',
      IsLocal: true,
      ServiceTel: '400-665-6655',
      DefaultConfig: {
        initialCountry: 'cn',
        preferredCountries: ['cn', 'hk', 'mo', 'tw'],
        onlyCountries: [],
      },
    },
    PriceConfig: {
      SmsPrice: window._l ? _l('0.05元') : '0.05元',
      EmailPrice: window._l ? _l('0.03元') : '0.03元',
      PdfPrice: window._l ? _l('0.15元') : '0.15元',
      DataPipelinePrice: window._l ? _l('0.1元') : '0.1元',
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
      enableFooterInfo: false, //登录页底部信息
      footerThemeColor: '', //登录页底部颜色
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
 * 格式化时间
 * @param {string} dateStr 具体的日期字符串，格式为 yyyy-MM-dd HH:mm:ss
 * @param {string} showType 输出类型 1:精简模式 2:极简模式 3:完整显示 4:完整显示（不带时分秒）
 * @returns {string} 相对的时间，如15分钟前
 */
window.createTimeSpan = (dateStr, showType = 1) => {
  const dateTime = moment(dateStr);
  const now = moment();
  const diff = now.diff(dateTime);
  const milliseconds = diff;
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const year = dateTime.format('YYYY');
  const month = dateTime.format('MM');
  const simpleMonth = dateTime.format('M');
  const day = dateTime.format('DD');
  const simpleDay = dateTime.format('D');
  const hour = dateTime.format('HH');
  const minute = dateTime.format('mm');
  const second = dateTime.format('ss');

  if (showType === 3) return `${_l('%0年%1月%2日', year, month, day)} ${hour}:${minute}:${second}`;
  if (showType === 4) return `${_l('%0年%1月%2日', year, month, day)}`;

  // 处理未来时间的情况
  if (diff < 0) return `${hour}:${minute}`;

  const isShowSort = showType === 2;

  if (seconds < 60) {
    return _l('刚刚');
  } else if (minutes < 60) {
    return isShowSort ? `${hour}:${minute}` : `${minutes}${_l('分钟前')}`;
  } else if (dateTime.isSame(now, 'd')) {
    return `${isShowSort ? '' : _l('今天')} ${hour}:${minute}`;
  } else if (dateTime.isSame(now.subtract(1, 'd'), 'd')) {
    return _l('昨天') + (isShowSort || showType === 5 ? '' : ` ${hour}:${minute}`);
  } else if (dateTime.format('YYYY') === now.format('YYYY')) {
    if (showType === 5) {
      return _l('%0月%1日', simpleMonth, simpleDay);
    }
    return `${_l('%0月%1日', simpleMonth, simpleDay)}` + (isShowSort ? '' : ` ${hour}:${minute}`);
  }

  return isShowSort || showType === 5
    ? `${_l('%0年', year)}`
    : `${_l('%0年%1月%2日', year, simpleMonth, simpleDay)} ${hour}:${minute}`;
};

const tabId = Date.now().toString();

/**
 * 添加tabId
 */
localStorage.setItem('tabIds', JSON.stringify(safeParse(localStorage.getItem('tabIds'), 'array').concat(tabId)));

/**
 * 判断是否是最新窗口
 * @returns {boolean}
 */
window.isNewTab = () => {
  const tabIds = safeParse(localStorage.getItem('tabIds'), 'array');

  return _.max(tabIds) === tabId;
};

/**
 * 移除tabId
 */
window.addEventListener('beforeunload', () => {
  const tabIds = safeParse(localStorage.getItem('tabIds'), 'array');
  const newTabIds = tabIds.filter(id => id !== tabId);

  localStorage.setItem('tabIds', JSON.stringify(newTabIds));
});

/**
 * 获取错误信息
 * @returns {Object}
 */
const getErrorMessage = (jqXHR = {}, textStatus, exception) => {
  let errorMessage;

  switch (jqXHR.status) {
    case 0:
      errorMessage = _l('网络异常，请检查您的网络');
      break;
    case 401:
      errorMessage = _l('账号已退出，请重新登录');
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
    errorMessage = exception || _l('请求失败，请稍后重试');
  } else if (!errorMessage && jqXHR.status >= 500) {
    errorMessage = _l('服务异常，请稍后重试');
  }

  // 火狐在用户跳走时会弹 "请求服务器失败"
  if (errorMessage && textStatus !== 'abort' && jqXHR.status !== 0 && !window.isFirefox) {
    alert({ msg: errorMessage, type: 2, key: _.includes([401, 412], jqXHR.status) ? 'failure' : '' });
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
    'X-Requested-With': 'XMLHttpRequest',
    ...(ajaxOptions.header || {}),
  };
  const clientId = window.clientId || sessionStorage.getItem('clientId');
  const needClientIdControllerNames = [
    'AppManagement',
    'Worksheet',
    'PublicWorksheet',
    'report_api',
    'HomeApp',
    'Attachment',
    'Kc',
    'Workflow',
    'Payment',
    'Integration',
  ];

  if (
    (location.href.indexOf('/public/') > -1 && clientId && _.includes(needClientIdControllerNames, controllerName)) ||
    ((location.href.indexOf('/portal/network') > -1 ||
      location.href.indexOf('/portal/login') > -1 ||
      location.href.indexOf('theportal.cn/network') > -1 ||
      location.href.indexOf('theportal.cn/login') > -1) &&
      clientId)
  ) {
    headers.clientId = clientId;
  }

  if (window.apireply_forbid) {
    // AES-256-CBC 加密函数
    const encryptAES256CBC = plainText => {
      // 将密钥和 IV 转换为 CryptoJS 的 WordArray
      const keyWordArray = CryptoJS.enc.Hex.parse(window.apireply_hex_key);
      const ivWordArray = CryptoJS.enc.Hex.parse(window.apireply_hex_iv);

      // 加密
      const encrypted = CryptoJS.AES.encrypt(plainText, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7, // 默认是 Pkcs7
      });

      return encrypted.toString(); // 返回加密后的字符串
    };

    headers['x-nonce'] = encryptAES256CBC(uuidv4() + '_' + moment().unix());
  }

  if (window.isMingDaoApp && window.access_token) {
    headers.Authorization = `access_token ${window.access_token}`;
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

  //工作表信息
  if (controllerName === 'Worksheet' && actionName === 'GetWorksheetInfo') {
    data = { ...data, getTemplate: true, getViews: true, getSwitchPermit: true, getRules: true };
  }

  return {
    url: ajaxOptions.url || serverPath + controllerName + '/' + encodeURIComponent(actionName),
    headers,
    data,
  };
};

/**
 * 生成本地化存储参数
 */
const generateLocalizationParams = (requestData = {}) => {
  const lang = _.get(md, 'global.Account.lang');

  return {
    AppManagement_GetAppLangDetail: {
      moduleType: 1,
      sourceId: `${requestData.appId}_${requestData.appLangId}`,
      clearInterface: ['AppManagement_EditAppLang', 'AppManagement_MachineTranslation'],
    },
    HomeApp_GetHomePlatformSetting: {
      moduleType: 2,
      sourceId: `${requestData.projectId}_${lang}`,
      clearInterface: ['HomeApp_EditPlatformSetting', 'ProjectSetting_SetLogo', 'ProjectSetting_ClearLogo'],
    },
    Worksheet_GetWorksheetInfo: {
      moduleType: 3,
      sourceId: `${requestData.worksheetId}_${lang}`,
      clearInterface: [
        'Worksheet_SaveWorksheetView',
        'Worksheet_DeleteWorksheetView',
        'Worksheet_SaveWorksheetControls',
        'AppManagement_EditWorkSheetInfoForApp',
        'Worksheet_SortWorksheetViews',
        'Worksheet_EditWorksheetControls',
        'WorksheetSetting_SavPaymentSetting',
        'Worksheet_UpdateEntityName',
        'Login_LoginOut',
        'Worksheet_UpdateWorksheetRow',
        'Worksheet_AddWorksheetRow',
        'Worksheet_RestoreWorksheetView',
      ],
    },
    Worksheet_GetQueryBySheetId: {
      moduleType: 4,
      sourceId: `${requestData.worksheetId}`,
      clearInterface: [],
    },
    AppManagement_GetProjectLangs: {
      moduleType: 20,
      sourceId:
        requestData.correlationIds || requestData.type !== 20 ? '' : `${requestData.projectId}_${requestData.type}`,
      clearInterface: ['AppManagement_EditProjectLangs'],
    },
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
  const CACHE_PARAMS = generateLocalizationParams(requestData);

  return CACHE_PARAMS[key] ? { key, ...CACHE_PARAMS[key] } : {};
};

/**
 * 插入本地化存储数据
 */
const insertLocalData = ({ key, moduleType, sourceId, version, data }) => {
  if (!key || !sourceId) return;

  if (key === 'Worksheet_GetWorksheetInfo' && !_.get(data, 'views.length')) return;

  if (version) {
    localForage.setItem(`${key}_${sourceId}`, { version, data, time: moment().format('YYYY-MM-DD HH:mm:ss') });
  } else {
    versionApi.getVersion({ moduleType, sourceId }).then(({ version }) => {
      localForage.setItem(`${key}_${sourceId}`, { version, data, time: moment().format('YYYY-MM-DD HH:mm:ss') });
    });
  }
};

/**
 * 指定接口编辑后，需清理缓存时间
 */
window.clearLocalDataTime = ({ controllerName, actionName, requestData = {}, clearSpecificKey }) => {
  const key = `${controllerName}_${actionName}`;
  const CACHE_PARAMS = generateLocalizationParams({
    ..._.pick(requestData, ['appId', 'projectId', 'correlationIds']),
    appLangId: requestData.langId || requestData.targetLangId,
    type: 20,
    worksheetId: requestData.worksheetId || requestData.workSheetId || requestData.sourceId,
  });
  let localKey;

  Object.keys(CACHE_PARAMS).forEach(currentKey => {
    if (CACHE_PARAMS[currentKey].clearInterface.includes(key) || currentKey === clearSpecificKey) {
      localKey = `${currentKey}_${CACHE_PARAMS[currentKey].sourceId}`;
    }
  });

  if (!localKey) return;

  localForage.getItem(localKey).then(localSource => {
    localSource && localForage.setItem(localKey, { version: localSource.version, data: localSource.data, time: null });
  });
};

/**
 * 接口数据解密
 */
const interfaceDataDecryption = (response, actionName = '') => {
  const { data, key, encrypted } = response || {};
  const getDecryptedValue = (decryptKey, encryptedValue) => {
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, CryptoJS.enc.Utf8.parse(decryptKey), {
      iv: CryptoJS.enc.Utf8.parse(PUBLIC_KEY.replace(/\r|\n/, '').slice(26, 42)),
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  };

  // 返回解密后的数据
  if (encrypted) {
    return { data: JSON.parse(getDecryptedValue(key, data)) };
  } else if (
    _.includes(['GetRowByID', 'GetRowDetail', 'GetFilterRows', 'GetRowRelationRows'], actionName) &&
    !['meihua.mingdao.com', 'www.mingdao.com'].includes(location.host)
  ) {
    let dataStr = JSON.stringify(data);
    const encryptedArray = dataStr.match(/\$\$encryptedStart\$\$.*?\$\$.*?\$\$encryptedEnd/g) || [];

    encryptedArray.forEach(item => {
      const [decryptKey, encryptedValue] = item
        .split(/\$\$encryptedStart\$\$(.*?)\$\$(.*?)\$\$encryptedEnd/)
        .filter(o => o);

      dataStr = dataStr.replace(
        item,
        getDecryptedValue(decryptKey, encryptedValue).replace(/\r/g, '\\r').replace(/\n/g, '\\n'),
      );
    });

    return {
      data: JSON.parse(dataStr),
    };
  }

  return response;
};

/**
 * 5分钟自动延期登录状态
 */
const throttledCheckLogin = _.throttle(() => loginApi.checkLogin({}, { silent: true }), 5 * 60 * 1000, {
  leading: false,
  trailing: true,
});

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
  const controller = options.abortController || new AbortController();
  const ajaxOptions = options.ajaxOptions || {};
  const method = ajaxOptions.type || 'POST';
  const responseType = ajaxOptions.responseType || 'json';
  const isSync = ajaxOptions.sync;
  const customParseResponse = options.customParseResponse; // 自定义解析返回内容
  const isReadableStream = options.isReadableStream; // 流式响应
  const { url, headers, data } = disposeRequestParams(controllerName, actionName, requestData || {}, ajaxOptions);

  // 私有部署 非主站接口 5分钟自动延期登录状态
  if (_.get(md.global.Config, 'IsLocal') && url.indexOf('wwwapi') === -1 && _.get(md, 'global.Account.accountId')) {
    throttledCheckLogin();
  }

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
        return interfaceDataDecryption(responseData).data;
      }
    } else {
      !options.silent && alert(responseData.exception, 2);
    }
  }

  // 流式接口
  if (isReadableStream) {
    return fetch(url, {
      signal: controller.signal,
      method,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  const promise = new Promise(async (resolve, reject) => {
    const { key, moduleType, sourceId } = getLocalizationKey(controllerName, actionName, requestData);
    let version;

    if (!_.get(window, 'shareState.shareId') && !window.isWeixin && key && sourceId) {
      const localSource = await localForage.getItem(`${key}_${sourceId}`);

      if (localSource && !localStorage.getItem('IS_DEV_MODE')) {
        if (!localSource.time || moment().diff(moment(localSource.time), 's') > 30) {
          const versionData = await versionApi.getVersion({ moduleType, sourceId: sourceId.split('_')[0] });

          version = versionData.version;

          if (version === localSource.version) {
            insertLocalData({ key, moduleType, sourceId, version, data: _.cloneDeep(localSource.data) }); // 更新时间
            resolve(localSource.data);
            return;
          }
        } else {
          resolve(localSource.data);
          return;
        }
      }
    }

    window.clearLocalDataTime({ controllerName, actionName, requestData });

    axios({
      method,
      url,
      headers,
      params: method === 'GET' ? data : {},
      data: method === 'POST' ? data : {},
      withCredentials: !ajaxOptions.url,
      signal: controller.signal,
      responseType,
    })
      .then(response => {
        if (customParseResponse) {
          resolve(response.data);
          return;
        }

        const responseData = response.data || { state: -1, exception: _l('解析返回结果错误') };

        if (responseData.exception) {
          !options.silent && alert(responseData.exception, 2);
          reject({ errorCode: responseData.state, errorMessage: responseData.exception, errorData: responseData });
        } else {
          const { data } = interfaceDataDecryption(responseData, actionName);

          !_.get(window, 'shareState.shareId') &&
            insertLocalData({ key, moduleType, sourceId, version, data: _.cloneDeep(data) });
          resolve(data);
        }
      })
      .catch(error => {
        if (customParseResponse) {
          reject(error.response);
          return;
        }

        if (get(error, 'response.status') === 401 && !/^localhost:/.test(location.host) && !window.isPublicApp) {
          import('src/router/navigateTo').then(({ navigateToLogin }) => {
            navigateToLogin({ needSecondCheck: true });
          });
          reject(error.response);
          return;
        }

        if (
          error.response &&
          error.response.status === 402 &&
          error.response.data &&
          error.response.data.state === 13 &&
          error.response.data.data
        ) {
          if (_.get(md, 'global.Account.accountId') && location.href.indexOf('mobile') === -1) {
            import('../pages/PageHeader/components/NetState').then(netState => {
              netState.default(interfaceDataDecryption(error.response.data).data);
            });
          }
        }

        reject({
          ...getErrorMessage(
            error.response,
            baseAxios.isCancel(error) ? 'abort' : '',
            get(error, 'response.data.exception'),
          ),
          errorData: baseAxios.isCancel(error) ? {} : get(error, 'response.data'),
        });
      });
  });

  promise.abort = () => {
    controller.abort();
  };

  return promise;
};

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
