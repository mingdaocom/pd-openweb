__webpack_public_path__ = window.__webpack_public_path__;

import { lang } from 'src/util/enum';
import { getPssId } from 'src/util/pssId';
import langConfig from './langConfig';
import { antAlert, destroyAlert } from 'src/util/antdWrapper';
import _ from 'lodash';
import moment from 'moment';

/**
 * Cookies 写入
 */
window.setCookie = function setCookie(name, value, expire) {
  if (_.get(window, 'md.global.Config.HttpOnly')) {
    safeLocalStorageSetItem(name, value);
    return;
  }

  // 过期时间处理
  let expireDate;
  if (!expire) {
    let nextyear = new Date();
    nextyear.setFullYear(nextyear.getFullYear(), nextyear.getMonth() + 1, nextyear.getDate() + 10);
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

/**
 * Cookies 读取
 */
window.getCookie = function getCookie(name) {
  if (_.get(window, 'md.global.Config.HttpOnly')) {
    return localStorage.getItem(name) || null;
  }

  let arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
  if (arr != null) {
    return unescape(arr[2]);
  }
  return null;
};

/**
 * Cookies 删除
 */
window.delCookie = function delCookie(name) {
  let exp = new Date();
  exp.setTime(exp.getTime() - 10000);
  if (getCookie(name) == null) {
    return;
  }
  let cval = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'))[2];
  if (cval != null) {
    if (document.domain.indexOf('.mingdao.com') == -1) {
      document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString() + ';path=/';
    } else {
      document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString() + ';path=/;domain=.mingdao.com';
    }
  }
};

/**
 * 多语言翻译
 */
window._l = function() {
  let args = arguments;
  let key = args[0];
  let content = key;

  // 翻译文件内存在这个key
  if (typeof mdTranslation !== 'undefined' && mdTranslation[key]) {
    content = mdTranslation[key];
  }

  // 含0% 1% 的内容参数替换
  if (args.length > 1) {
    for (let i = 1; i < args.length; i++) {
      content = content.replace(new RegExp('%' + (i - 1), 'g'), args[i]);
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
window.md = {};
md.staticglobal = md.global = {
  Account: {
    accountId: '',
    hrVisible: true,
  },
  /** 有新的更新 */
  updated: false,
  /** 存储地址配置 */
  FileStoreConfig: {
    uploadHost: 'https://upload.qiniup.com/',
    documentHost: 'https://d1.mingdaoyun.cn/',
    pictureHost: 'https://p1.mingdaoyun.cn/',
    mediaHost: 'https://m1.mingdaoyun.cn/',
    pubHost: 'https://fp1.mingdaoyun.cn/',
  },
  Config: {
    ServiceTel: '400-665-6655',
    IsLocal: true,
  },
  /** 内部各应用的 ID */
  APPInfo: {
    taskAppID: 'ab99d0bb-3249-46f9-8a60-6952cb76cac2',
    taskFolderAppID: '66d51996-6a56-41ba-be15-0d388b548f00',
    calendarAppID: '42c96ef1-3ab6-4269-9824-e21436f34a38',
    worksheetAppID: '1e31c859-1605-4d8d-b3be-437ff871f02d',
    worksheetRowAppID: 'c8bc1b25-2bbe-4334-b1e3-be1b207f3126',
  },
  AjaxRequestQueue: [],
  getCaptchaType: () => {

    return window.localStorage.getItem('captchaType')
      ? parseInt(window.localStorage.getItem('captchaType'))
      : navigator.userAgent.toLowerCase().match(/miniprogram|wechatdevtools|wxwork/) || !window.TencentCaptcha
      ? 1
      : md.global.Config.CaptchaType || 0;
  },
  domainSuffix: 'mingdao.com',
  SysSettings: {
    passwordRegex: /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/,
    passwordRegexTip: '',
    hideHelpTip: true,
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

const isWeiXin = navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0;

customAlert();

if (isWeiXin) {
  document.addEventListener('WeixinJSBridgeReady', () => {
    customAlert();
  });
}

// import mdNotification from 'ming-ui/functions/notify';
// window.mdNotification = mdNotification; // TODO 测试用

/**
 * 文件方法扩展
 */
window.File = typeof File === 'undefined' ? {} : File;
/** 获取后缀名 */
File.GetExt = function(fileName) {
  let t = (fileName || '').split('.');
  return t.length > 1 ? t[t.length - 1] : '';
};
/* 获取文件名 */
File.GetName = function(fileName) {
  let t = (fileName || '').split('.');
  t.pop();
  return t.length >= 1 ? t.join('.') : '';
};
File.isValid = function(fileExt) {
  let fileExts = ['.exe', '.vbs', '.bat', '.cmd', '.com', '.url'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) === -1;
  }
  return true;
};
File.isPicture = function(fileExt) {
  let fileExts = ['.jpg', '.gif', '.png', '.jpeg', '.bmp', '.webp', '.heic', '.svg', '.tif', '.tiff'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) !== -1;
    // return fileExt == ".jpg" || fileExt == '.gif' || fileExt == '.png' || fileExt == 'jpeg';
  }
  return false;
};

/**
 * 返回表示“加载中”的 HTML 字符串
 * @deprecated 使用 utils 模块中的方法
 * @param {string} modifier 加载圈圈的大小，big 或 small 或 middle，默认 middle
 */
window.LoadDiv = function(modifier) {
  let size;
  if (modifier === 'big') {
    size = 36;
  } else if (modifier === 'small') {
    size = 16;
  } else {
    modifier = 'middle';
    size = 24;
  }
  let strokeWidth = Math.floor(size / 8);
  let r = Math.floor(size / 2);
  let cx = r + strokeWidth;
  let cy = cx;
  return (
    '<div class="TxtCenter TxtMiddle mTop10 mBottom10 w100"><div class="divCenter MdLoader MdLoader--' +
    modifier +
    '"><svg class="MdLoader-circular"><circle class="MdLoader-path" stroke-width="' +
    strokeWidth +
    '" cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    r +
    '"></circle></svg></div></div>'
  );
};

/**
 * 兼容parse报错
 */
window.safeParse = (str, type) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    if (!(_.isUndefined(str) || str === '')) {
      if (!(typeof str === 'string' && str.startsWith('deleteRowIds'))) {
        console.error(err);
      }
    }
    return type === 'array' ? [] : {};
  }
};

window.safeLocalStorageSetItem = (...args) => {
  try {
    window.localStorage.setItem(...args);
  } catch (err) {
    console.log(err);
  }
};

window.safeParseArray = str => {
  return window.safeParse(str, 'array');
};

/**
 * 格式化时间
 * @param {string} dateStr 具体的日期字符串，格式为 yyyy-MM-dd HH:mm:ss
 * @returns {string} 相对的时间，如15分钟前
 */
window.createTimeSpan = dateStr => {
  let dateTime = moment(dateStr).toDate();

  let year = dateTime.getFullYear();
  let month = dateTime.getMonth();
  let day = dateTime.getDate();
  let hour = dateTime
    .getHours()
    .toString()
    .padStart(2, '0');
  let minute = dateTime
    .getMinutes()
    .toString()
    .padStart(2, '0');

  let now = new Date();

  let today = new Date();
  today.setFullYear(now.getFullYear());
  today.setMonth(now.getMonth());
  today.setDate(now.getDate());
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  let milliseconds = 0;
  let timeSpanStr;
  if (dateTime - today >= 0) {
    milliseconds = now - dateTime;
    if (milliseconds < 1000 && milliseconds < 60000) {
      timeSpanStr = _l('刚刚');
    } else if (milliseconds > 1000 && milliseconds < 60000) {
      timeSpanStr = Math.floor(milliseconds / 1000) + _l('秒前');
    } else if (milliseconds > 60000 && milliseconds < 3600000) {
      timeSpanStr = Math.floor(milliseconds / 60000) + _l('分钟前');
    } else {
      timeSpanStr = _l('今天') + ' ' + hour + ':' + minute;
    }
  } else {
    milliseconds = today - dateTime;
    if (milliseconds < 86400000) {
      timeSpanStr = _l('昨天') + ' ' + hour + ':' + minute;
    } else if (milliseconds > 86400000 && year == today.getFullYear()) {
      timeSpanStr = _l('%0月%1日', month + 1, day) + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = _l('%0年%1月%2日', year, month + 1, day) + ' ' + hour + ':' + minute;
    }
  }
  return timeSpanStr;
};

/**
 * 订阅发布模式，用于Chat和PageHead的数据传递
 */
(function($) {
  if (!$) return;
  let o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };
})(jQuery);

/** 通用请求 */
(function($) {
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
        Object.keys(paramObj).forEach(function(key, i) {
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
        Object.keys(paramObj).forEach(function(key, i) {
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
      ? function() {}
      : function(msg, level) {
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

    if (window.share) {
      headers.share = window.share;
      headers.Authorization = '';
    }

    // 公开的
    const isPublicFrom = location.href.indexOf('/public/form/') > -1;
    const clientId = window.clientId || sessionStorage.getItem('clientId');

    if (location.href.indexOf('/public/') > -1 && clientId && (!isPublicFrom || controllerName === 'PublicWorksheet')) {
      headers.clientId = clientId;
    }

    if (window.publicAppAuthorization) {
      headers.shareAuthor = window.publicAppAuthorization;
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
            converters: {
              'text json': function(result) {
                result = result.replace(/"controlName":"(.*?)"/g, ($1, $2) => `"controlName":"${lang()[$2] || $2}"`);
                return JSON.parse(result);
              },
            },
          },
          ajaxOptions,
        ),
      );

      let ajaxPromise = ajax
        .then(undefined, function(jqXHR, textStatus) {
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
                let textErrorMessage = $(jqXHR.responseText)
                  .find('#textErrorMessage')
                  .val();
                if (textErrorMessage) {
                  /* TODO: 处理服务端返回的错误信息*/
                }
              } catch (htmlError) {}
            }
          }
        })
        .then(function(res) {
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
        .then(function() {
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
        ajaxPromise.abort = function() {
          ajax.abort.apply(ajax, arguments);
        };
      } else {
        ajaxPromise = ajaxPromise.always(function() {
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

      promise.abort = function(statusText) {
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

  requestApi.abortAll = function() {
    ajaxQueue.clearQueue();
    requesting = {};
  };

  $.api = requestApi;
})(jQuery);

/**
 * 加载多语言文件
 */
(function() {
  const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const currentLang = langConfig.find(item => item.key === lang);

  if (!!currentLang) {
    let xhrObj = new XMLHttpRequest();
    xhrObj.open('GET', currentLang.path, false);
    xhrObj.send('');
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = xhrObj.responseText;
    document.head.appendChild(script);
  }
})();

/**
 * 兼容企业微信windows客户端低版本没有prepend方法报错的问题
 */
(function(arr) {
  arr.forEach(function(item) {
    item.prepend =
      item.prepend ||
      function() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function(argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      };
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

// 兼容钉钉内核63 问题
if (!Object.fromEntries) {
  Object.fromEntries = function(entries) {
    let entriesObj = {};

    if (Array.isArray(entries)) {
      (entries || []).forEach(element => {
        entriesObj[element[0]] = element[1];
      });
    }

    return entriesObj;
  };
}
