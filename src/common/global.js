import { getPssId } from 'src/util/pssId';
import langConfig from './langConfig';
import { antAlert, destroyAlert } from 'src/util/antdWrapper';
import _ from 'lodash';
import moment from 'moment';

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

/**
 * 是否是钉钉环境下
 */
window.isDingTalk = window.navigator.userAgent.toLowerCase().includes('dingtalk');

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
    },
    getCaptchaType: () => {
      return window.localStorage.getItem('captchaType')
        ? parseInt(window.localStorage.getItem('captchaType'))
        : navigator.userAgent.toLowerCase().match(/miniprogram|wechatdevtools|wxwork/) || !window.TencentCaptcha
        ? 1
        : md.global.Config.CaptchaType || 0;
    },
    SysSettings: {
      passwordRegex: /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/,
      passwordRegexTip: '',
      hideHelpTip: true,
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

if (navigator.userAgent.toLowerCase().indexOf('micromessenger')) {
  document.addEventListener('WeixinJSBridgeReady', () => {
    customAlert();
  });
}

// import mdNotification from 'ming-ui/functions/notify';
// window.mdNotification = mdNotification; // TODO 测试用

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
 * 返回表示“加载中”的 HTML 字符串
 * @deprecated 使用 utils 模块中的方法
 * @param {string} modifier - 加载圈圈的大小，可选值为 'big'、'small' 或 'middle'，默认为 'middle'
 * @returns {string} - 表示“加载中”的 HTML 字符串
 */
window.LoadDiv = function (modifier = 'middle') {
  let size, strokeWidth, r, cx, cy;

  if (modifier === 'big') {
    size = 36;
  } else if (modifier === 'small') {
    size = 16;
  } else {
    modifier = 'middle';
    size = 24;
  }

  strokeWidth = Math.floor(size / 8);
  r = Math.floor(size / 2);
  cx = r + strokeWidth;
  cy = cx;

  return `
    <div class="TxtCenter TxtMiddle mTop10 mBottom10 w100">
      <div class="divCenter MdLoader MdLoader--${modifier}">
        <svg class="MdLoader-circular">
          <circle class="MdLoader-path" stroke-width="${strokeWidth}" cx="${cx}" cy="${cy}" r="${r}"></circle>
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
    if (str && !str.startsWith('deleteRowIds')) {
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
window.createTimeSpan = dateStr => {
  const dateTime = moment(dateStr);
  const now = moment();
  const diff = now.diff(dateTime);

  // 处理未来时间的情况
  if (diff < 0) return '';

  const milliseconds = diff;
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);

  const year = dateTime.format('YYYY');
  const month = dateTime.format('MM');
  const day = dateTime.format('DD');
  const hour = dateTime.format('HH');
  const minute = dateTime.format('mm');

  if (seconds < 60) {
    return _l('刚刚');
  } else if (minutes < 60) {
    return `${minutes}${_l('分钟前')}`;
  } else if (dateTime.isSame(now, 'd')) {
    return `${_l('今天')} ${hour}:${minute}`;
  } else if (dateTime.isSame(now.subtract(1, 'd'), 'd')) {
    return `${_l('昨天')} ${hour}:${minute}`;
  } else if (dateTime.format('YYYY') === now.format('YYYY')) {
    return `${_l('%0月%1日', month, day)} ${hour}:${minute}`;
  }

  return `${_l('%0年%1月%2日', year, month, day)} ${hour}:${minute}`;
};

/** 通用请求 */
(function ($) {
  /**
   * 根据错误码 / HTTP状态码获取错误信息
   * @param  {Number} statusCode 错误码或 HTTP 状态码
   * @return {String}            错误信息
   */
  function getErrorMessageByCode(statusCode) {
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401) {
        return '您可能未登录或登录超时，请先登录';
      } else if (statusCode === 403) {
        return '您的帐号没有足够的权限';
      } else if (statusCode === 404) {
        return '您请求的页面不存在';
      } else if (statusCode === 405) {
        return '您发起的请求方法不能被用于请求相应的资源';
      } else if (statusCode === 413) {
        return '您的请求因数据量过大而不被支持';
      } else if (statusCode === 414) {
        return '您的请求因 URL 过长而不被支持';
      } else if (statusCode === 421) {
        return '您发起的请求过于频繁，请稍后再试';
      }
      return '服务器无法理解该请求';
    }
    if (statusCode >= 500) {
      if (statusCode === 501) {
        return '服务端不支持此方法';
      } else if (statusCode === 502) {
        return '上游服务器发生异常，请稍候再试';
      } else if (statusCode === 503) {
        return '服务临时不可用，请稍后重试';
      } else if (statusCode === 504) {
        return '服务超时，请稍后重试';
      } else if (statusCode === 505) {
        return '服务器不支持您的 HTTP 版本';
      }
      return '服务端发生错误';
    }
  }

  function alertError(jqXHR, textStatus) {
    let errorCode, errorMessage;
    if (textStatus === 'abort') {
      errorCode = 1;
      errorMessage = '请求被取消';
    } else if (jqXHR.status === 0) {
      errorCode = 0;
      errorMessage = '请求服务器失败，请检查您的网络';
    } else if (jqXHR.status < 200 || jqXHR.status > 299) {
      errorCode = jqXHR.status;
      errorMessage = getErrorMessageByCode(jqXHR.status) || '发生未知错误';
      if (errorMessage && textStatus !== 'abort') {
        // 火狐在用户跳走时会弹 “请求服务器失败”
        if (errorCode !== 0 && !$.browser.mozilla) alert(errorMessage, 2);
      }

      return $.Deferred().reject({
        errorCode: errorCode,
        errorMessage: errorMessage,
      });
    }
  }

  window.needSetClientId = ({ clientId, controllerName } = {}) =>
    location.href.indexOf('/public/') > -1 &&
    clientId &&
    _.includes(['AppManagement', 'Worksheet', 'PublicWorksheet', 'report_api', 'HomeApp', 'Attachment', 'Kc'], controllerName);

  /** ajax 请求队列 */
  let ajaxQueue = $({});
  /** 正在请求中的 queueName */
  let requesting = {};

  /**
   * 请求 Ajax API 接口
   * @alias external:$.api
   * @param  {String} controllerName 模块名称
   * @param  {String} actionName     操作名称
   * @param  {Object} paramObj       请求参数
   * @param  {Object} options        额外配置
   * @param  {Boolean} options.silent 发生错误时不弹出提示
   * @param  {String} options.method HTTP 请求方法，默认为 POST
   * * @param  {String} options.fireImmediately 是否立即发送请求。默认走队列
   * @return {Promise}               返回结果的 promise
   */
  function requestApi(controllerName, actionName, paramObj, options) {
    options = options || {};
    let ajaxOptions = options.ajaxOptions || {};
    if (options && options.method) {
      ajaxOptions.type = options.method;
    }
    paramObj = paramObj || {};

    if (typeof paramObj !== 'string') {
      if ((ajaxOptions.type || '').toUpperCase() === 'GET') {
        Object.keys(paramObj).forEach(function (key, i) {
          let val = paramObj[key];
          if (typeof val === 'function') {
            val = val();
          }
          if (val && typeof val === 'object') {
            val = JSON.stringify(val);
          }
          paramObj[key] = val;
        });
      } else {
        // 如果参数值有方法，先执行方法
        Object.keys(paramObj).forEach(function (key, i) {
          let val = paramObj[key];
          if (typeof val === 'function') {
            val = val();
          }
          paramObj[key] = val;
        });
        paramObj = JSON.stringify(paramObj);
      }
    }

    let alert = options.silent
      ? function () {}
      : function (msg, level) {
          level = level || 3;
          window.alert({
            type: level,
            msg,
            key: 'server',
          });
        };

    let ajax;
    let dfd = $.Deferred();
    let promise = dfd.promise();
    let queue;
    let queueIndex;
    let queueName = controllerName + '.' + actionName;
    let fireImmediately = options.fireImmediately;
    let pssId = getPssId();
    let headers = {
      ...(!ajaxOptions.url ? { 'X-Requested-With': 'XMLHttpRequest' } : {}),
      Authorization: pssId ? `md_pss_id ${pssId}` : '',
      AccountId: md.global.Account && md.global.Account.accountId ? md.global.Account.accountId : '',
    };
    let serverPath = __api_server__.main;
    const clientId = window.clientId || sessionStorage.getItem('clientId');

    if (window.needSetClientId({ clientId, controllerName })) {
      headers.clientId = clientId;
    }

    if (window.publicAppAuthorization) {
      headers.shareAuthor = window.publicAppAuthorization;
      headers.clientId = undefined;
      const { global = {} } = md;
      const { Config = {}, SysSettings = {} } = global;
      const { IsLocal } = Config;
      const { templateLibraryTypes } = SysSettings;
      if (IsLocal && !/#isPrivateBuild/.test(location.hash) && templateLibraryTypes !== '2') {
        serverPath = 'https://www.mingdao.com/api/';
      }
    }

    if (window.access_token) {
      // 工作流&统计服务
      headers.access_token = access_token;
      // 主站服务
      headers.Authorization = `access_token ${access_token}`;
    }

    if (ajaxOptions.url) {
      delete headers.AccountId;
    }

    if (options.headersConfig) {
      $.extend(headers, options.headersConfig);
    }

    function doRequest(next) {
      if (!fireImmediately) {
        requesting[queueName] = true;
      }

      ajax = $.ajax(
        $.extend(
          {
            url: serverPath + encodeURIComponent(controllerName) + '/' + encodeURIComponent(actionName),
            type: 'POST',
            cache: false,
            data: paramObj,
            dataType: 'json',
            headers,
            contentType: 'application/json',
            xhrFields: !ajaxOptions.url
              ? {
                  withCredentials: true,
                }
              : null,
          },
          ajaxOptions,
        ),
      );

      let ajaxPromise = ajax
        .then(undefined, function (jqXHR, textStatus) {
          if (!jqXHR.responseText) {
            return alertError(jqXHR, textStatus);
          } else {
            try {
              const res = JSON.parse(jqXHR.responseText);
              if (jqXHR.status === 402 && res.state === 13 && res.data) {
                if (md.global.Account.accountId && location.href.indexOf('mobile') === -1) {
                  import('../pages/PageHeader/components/NetState').then(netState => {
                    netState.default(res.data);
                  });
                }
                return dfd.reject(_.pick(res, ['state', 'exception']));
              } else if (res.exception) {
                return $.Deferred().resolve(res);
              } else {
                return alertError(jqXHR, textStatus);
              }
            } catch (error) {
              try {
                let textErrorMessage = $(jqXHR.responseText).find('#textErrorMessage').val();
                if (textErrorMessage) {
                  /* TODO: 处理服务端返回的错误信息*/
                }
              } catch (htmlError) {}
            }
          }
        })
        .then(function (res) {
          let errorCode, errorMessage;
          if (typeof res !== 'object') {
            errorCode = -1;
            errorMessage = '解析返回结果错误';
          } else if (res.exception) {
            errorCode = res.state;
            errorMessage = res.exception;
          } else {
            return res.data;
          }
          alert(errorMessage || '未知错误', 2);
          return $.Deferred().reject({
            errorCode: errorCode,
            errorMessage: errorMessage,
          });
        })
        .then(function () {
          try {
            dfd.resolve.apply(this, arguments);
          } catch (err) {
            if (!ajaxQueue.queue(controllerName).length) {
              requesting[queueName] = false;
            }
            console.error(err);
          }
        }, dfd.reject);

      if (fireImmediately) {
        ajaxPromise.abort = function () {
          ajax.abort.apply(ajax, arguments);
        };
      } else {
        ajaxPromise = ajaxPromise.always(function () {
          if (next) {
            next();
          }
          if (!ajaxQueue.queue(controllerName).length) {
            requesting[queueName] = false;
          }
        });
      }

      return ajaxPromise;
    }

    if (options.fireImmediately) {
      promise.abort = doRequest().abort;
    } else {
      ajaxQueue.queue(queueName, doRequest);

      promise.abort = function (statusText) {
        // proxy abort to the ajax if it is active
        if (ajax) {
          return ajax.abort(statusText);
        }
        // if there wasn't already a ajax we need to remove from queue
        queue = ajaxQueue.queue(queueName);
        queueIndex = $.inArray(doRequest, queue);
        if (queueIndex > -1) {
          queue.splice(queueIndex, 1);
        }
        // and then reject the deferred
        dfd.reject(1);
        return promise;
      };

      if (!requesting[queueName]) {
        ajaxQueue.dequeue(queueName);
      }
    }

    return promise;
  }

  requestApi.abortAll = function () {
    ajaxQueue.clearQueue();
    requesting = {};
  };

  $.api = requestApi;
})(jQuery);

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

  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const currentLang = langConfig.find(item => item.key === lang);

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
