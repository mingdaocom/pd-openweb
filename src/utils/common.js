import dayjs from 'dayjs';
import EventEmitter from 'events';
import JSEncrypt from 'jsencrypt';
import _, { get } from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import appManagementAjax from 'src/api/appManagement';
import qiniuAjax from 'src/api/qiniu';
import webCache from 'src/api/webCache';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { PUBLIC_KEY } from './enum';
import RegExpValidator from './expression';
import { getPssId } from './pssId';

export const emitter = new EventEmitter();

window.onresize = () => emitter.emit('WINDOW_RESIZE');

/** LRU 存储 */
export function saveLRUWorksheetConfig(key, id, value) {
  if (_.isObject(value)) {
    throw new Error('只支持存储字符串');
  }
  const maxSaveNum = 30;
  let data = {};
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
    }
  }
  const newData = _.assign({}, data, { [id]: value });
  if (Object.keys(newData).length > maxSaveNum) {
    delete newData[Object.keys(newData).pop];
  }
  safeLocalStorageSetItem(key, JSON.stringify(newData));
}

/** LRU 存储 */
export function clearLRUWorksheetConfig(key, id) {
  let data = {};
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
    }
  }
  delete data[id];
  safeLocalStorageSetItem(key, JSON.stringify(data));
}
/** LRU 读取 */
export function getLRUWorksheetConfig(key, id) {
  let data = [];
  if (localStorage.getItem(key)) {
    try {
      data = JSON.parse(localStorage.getItem(key));
    } catch (err) {
      console.error(err);
      return;
    }
  }
  return data[id];
}

/**
 * 后端 key value 存储服务
 * 存
 */
export function KVSet(key, value, { needEncode = true, expireTime } = {}) {
  let newKey = key;
  let newValue = value;
  if (needEncode) {
    newKey = btoa(key);
    newValue = btoa(unescape(encodeURIComponent(value)));
  }
  return webCache.add({
    key: newKey,
    value: newValue,
    expireTime: expireTime || moment(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
  });
}

export const debouncedKVSet = _.debounce(KVSet, 1000);

/**
 * 后端 key value 存储服务
 * 取
 */

export function KVGet(key, { needEncode = true } = {}) {
  let newKey = key;
  if (needEncode) {
    newKey = btoa(key);
  }
  return webCache
    .get({ key: newKey })
    .then(res => (get(res, 'data') ? decodeURIComponent(escape(atob(get(res, 'data')))) : ''));
}

/**
 * 后端 key value 存储服务
 * 清空
 */

export function KVClear(key, { needEncode = true } = {}) {
  let newKey = key;
  if (needEncode) {
    newKey = btoa(key);
  }
  return webCache.clear({ key: newKey }, { silent: true });
}

export function saveTempRecordValueToLocal(key, id, value, max = 5) {
  if (window.isWxWork) {
    debouncedKVSet(`${md.global.Account.accountId}${id}-${key}`, value);
    return debouncedKVSet;
  }
  let savedIds = [];
  if (localStorage.getItem(key)) {
    try {
      savedIds = JSON.parse(localStorage.getItem(key)) || [];
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {
      console.error(err);
    }
  }
  savedIds.push(id);
  if (savedIds.length > max) {
    localStorage.removeItem(`${key}_${savedIds[0]}`, value);
    savedIds = savedIds.slice(1);
  }
  try {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  } catch (err) {
    console.error(err);
    Object.keys(localStorage)
      .filter(k => k.startsWith(key))
      .forEach(k => localStorage.removeItem(k));
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
    safeLocalStorageSetItem(`${key}_${id}`, value);
  }
}

export function removeTempRecordValueFromLocal(key, id) {
  if (window.isWxWork) {
    KVClear(`${md.global.Account.accountId}${id}-${key}`);
    return;
  }
  let savedIds = [];
  if (localStorage.getItem(key)) {
    try {
      savedIds = JSON.parse(localStorage.getItem(key)) || [];
      savedIds = savedIds.filter(sid => sid !== id);
    } catch (err) {
      console.error(err);
    }
  }
  if (savedIds && savedIds.length) {
    safeLocalStorageSetItem(key, JSON.stringify(savedIds));
  } else {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(`${key}_${id}`);
}

/**
 * 验证函数表达式基础语法
 */
export function validateFnExpression(expression, type = 'mdfunction') {
  try {
    expression = expression.replace(/\$(.+?)\$/g, '"1"');
    if (type === 'mdfunction') {
      expression = expression.replace(/[\r\r\n ]/g, '');
      expression = expression.replace(/([A-Z_]+)(?=\()/g, 'test');
      eval(`let test = function() {return '-';};${expression}`);
    } else if (type === 'javascript') {
      eval(`function test() {${expression} }`);
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function isKeyBoardInputChar(value) {
  return (
    `1234567890-=!@#$%^&*()_+[];',./{}|:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`.indexOf(value) > -1
  );
}

export function getScrollBarWidth() {
  let width;
  var scroll = document.createElement('div');
  scroll.style = 'position: absolute; left: -10000px; top: -10000px; width: 100px; height: 100px; overflow: scroll;';
  scroll.innerHTML = '<div style="width: 100px;height:200px"></div>';
  document.body.appendChild(scroll);
  width = scroll.offsetWidth - scroll.clientWidth;
  document.body.removeChild(scroll);
  return width || 10;
}

export function getRowGetType(from, { discussId } = {}) {
  let isInbox;
  if (typeof discussId !== 'undefined') {
    isInbox = from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND && !!discussId;
  } else {
    isInbox =
      from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND && location.search && location.search.indexOf('inboxId') > -1;
  }
  if (from == 21) {
    return 21;
  } else if (
    isInbox ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicPrint')
  ) {
    return 3;
  } else {
    return 1;
  }
}

export async function postWithToken(url, tokenArgs = {}, body = {}, axiosConfig = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      return Promise.reject('获取token失败');
    }
  }
  return window.mdyAPI(
    '',
    '',
    Object.assign({}, body, {
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    }),
    {
      customParseResponse: axiosConfig.responseType === 'blob',
      ajaxOptions: {
        url,
        responseType: axiosConfig.responseType,
      },
    },
  );
}

export async function getWithToken(url, tokenArgs = {}, body = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      return Promise.reject('获取token失败');
    }
  }

  return window.mdyAPI(
    '',
    '',
    {
      ...body,
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    },
    {
      ajaxOptions: {
        type: 'GET',
        url,
      },
    },
  );
}

export const getFilledRequestParams = (params, defaultRequestParams = {}) => {
  const request = getRequest();
  const requestParams = _.isObject(params.requestParams) ? { ...params.requestParams } : {};

  if (_.isEmpty(request)) {
    return params;
  }

  Object.keys(request).forEach(key => {
    if (_.isArray(request[key])) {
      requestParams[key.trim()] = request[key][request[key].length - 1];
    } else if (request[key] !== null) {
      requestParams[key.trim()] = request[key];
    }
  });

  return { ...params, requestParams: { ...defaultRequestParams, ...requestParams } };
};

export function appendDataToLocalPushUniqueId(data) {
  try {
    const defaultData = getDataFromLocalPushUniqueId();
    let pushUniqueId = _.get(md, 'global.Config.pushUniqueId');
    pushUniqueId = pushUniqueId.replace(/__(.+)/, '');
    if (pushUniqueId) {
      md.global.Config.pushUniqueId =
        pushUniqueId + (!data ? '' : `__${JSON.stringify(_.assign({}, defaultData, data))}`);
    }
  } catch (err) {
    console.error(err);
  }
}

export function resetLocalPushUniqueId() {
  appendDataToLocalPushUniqueId();
}

export function getDataFromLocalPushUniqueId() {
  return safeParse(((_.get(md, 'global.Config.pushUniqueId') || '').match(/__(.+)/) || [])[1]);
}

export function equalToLocalPushUniqueId(pushUniqueId) {
  return String(pushUniqueId).replace(/__(.+)/, '') === _.get(md, 'global.Config.pushUniqueId').replace(/__(.+)/, '');
}

/**
 *  日期公式计算
 * */

export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }
  if (!/^[+-]/.test(expression)) {
    expression = '+' + expression;
  }
  try {
    let result = dayjs(date);
    const regexp = /([/+/-]){1}(\d+(\.\d+)?)+([YQMwdhms]){1}/g;
    let match = regexp.exec(expression);
    while (match) {
      const operator = match[1];
      const number = Number(match[2]);
      const unit = match[4];
      if (/^[+-]$/.test(operator) && number && typeof number === 'number' && /^[YQMwdhms]$/.test(unit)) {
        result = result[operator === '+' ? 'add' : 'subtract'](Math.round(number), unit.replace(/Y/, 'y'));
      }
      match = regexp.exec(expression);
    }
    return { result };
  } catch (err) {
    return { error: err };
  }
}

/**
 * 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 * 调用：accMul(arg1,arg2)
 * 返回值：arg1乘以arg2的精确结果
 */
export function accMul(arg1, arg2) {
  let m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += (s1.split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
  }
  try {
    m += (s2.split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
  }
  return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}

/**
 * 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
 * 调用：accDiv(arg1,arg2)
 * 返回值：arg1除以arg2的精确结果
 */
export function accDiv(arg1, arg2) {
  let t1 = 0,
    t2 = 0,
    r1,
    r2;
  try {
    t1 = (arg1.toString().split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
  }
  try {
    t2 = (arg2.toString().split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
  }
  r1 = Number(arg1.toString().replace('.', ''));
  r2 = Number(arg2.toString().replace('.', ''));
  const res = (r1 / r2) * Math.pow(10, t2 - t1);
  if (res.toString().replace(/\d+\./, '').length > 9) {
    return parseFloat(res.toFixed(9));
  }
  return res;
}

/**
 * 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
 * 调用：accAdd(arg1,arg2)
 * 返回值：arg1加上arg2的精确结果
 */
export function accAdd(arg1, arg2) {
  let r1, r2, m;
  try {
    r1 = (arg1.toString().split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
    r1 = 0;
  }
  try {
    r2 = (arg2.toString().split('.')[1] || '').length;
  } catch (e) {
    console.log(e);
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2));
  return (arg1 * m + arg2 * m) / m;
}

/**
 * 说明：javascript的减法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的减法结果。
 * 调用：accSub(arg1,arg2)
 * 返回值：arg1减上arg2的精确结果
 */
export function accSub(arg1, arg2) {
  return accAdd(arg1, -arg2);
}

export function countChar(str = '', char) {
  if (!str || !char) {
    return 0;
  }
  try {
    return str.match(new RegExp(char, 'g')).length;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

/**
 * 获取字符串字节数
 * @param {string} self - 要计算字节数的字符串
 * @returns {number} - 字符串的字节数
 */
export const getStringBytes = self => {
  let strLength = 0;

  for (let i = 0; i < self.length; i++) {
    if (self.charAt(i) > '~') strLength += 2;
    else strLength += 1;
  }

  return strLength;
};

export const cutStringWithHtml = (self, len, rows) => {
  let str = '';
  let strLength = 0;
  let isA = false;
  let isPic = false;
  let isBr = false;
  let brCount = 0;
  for (let i = 0; i < self.length; i++) {
    let letter = self.substring(i, i + 1);
    let nextLetter = self.substring(i + 1, i + 2);
    let nextnextLetter = self.substring(i + 2, i + 3);

    if (letter == '<' && nextLetter == 'a') {
      // a标签包含
      isA = true;
    } else if (letter == '<' && nextLetter == 'b' && nextnextLetter == 'r') {
      // 换行符
      isBr = true;
      brCount++;
    } else if (letter == '<') {
      // 图片
      isPic = true;
    }

    if (brCount == Number(rows)) {
      break;
    }
    str += letter;
    if (!isA && !isPic && !isBr) {
      if (self.charAt(i) > '~') {
        strLength += 2;
      } else {
        strLength += 1;
      }
    }

    if (isPic) {
      if (letter == '>') {
        isPic = false;
      } else {
        continue;
      }
    }
    if (isA) {
      if (letter == '>' && self.substring(i - 1, i) == 'a') {
        isA = false;
      } else {
        continue;
      }
    }

    if (isBr) {
      if (letter == '>' && self.substring(i - 1, i) == 'r') {
        isBr = false;
      } else {
        continue;
      }
    }

    if (strLength >= len) {
      break;
    }
  }
  return str;
};

// 加密
export const encrypt = text => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(encodeURIComponent(text));
};

/**
 * 编码 html 字符串，只编码 &<>"'/
 * @param  {string} str
 * @return {string}
 */
export const htmlEncodeReg = str => {
  const encodeHTMLRules = { '&': '&#38;', '<': '&lt;', '>': '&gt;', '"': '&#34;', "'": '&#39;', '/': '&#47;' };
  const matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return encodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 解码 html 字符串，只解码 '&#38;','&amp;','&#60;','&#62;','&#34;','&#39;','&#47;','&lt;','&gt;','&quot;'
 * @param  {string} str
 * @return {string}
 */
export const htmlDecodeReg = str => {
  const decodeHTMLRules = {
    '&#38;': '&',
    '&amp;': '&',
    '&#60;': '<',
    '&#62;': '>',
    '&#34;': '"',
    '&#39;': "'",
    '&#47;': '/',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
  };
  const matchHTML = /&#(38|60|62|34|39|47);|&(amp|lt|gt|quot);/g;
  return str
    ? str.toString().replace(matchHTML, function (m) {
        return decodeHTMLRules[m] || m;
      })
    : '';
};

/**
 * 将文件大小转换成可读的格式，即 123.4 MB 这种类型
 * @param  {Number} size  文件以 byte 为单位的大小
 * @param  {Array}  accuracy 小数点后保留的位数
 * @param  {String} space 数字和单位间的内容，默认为一个空格
 * @param  {Array}  units 自定义文件大小单位的数组，默认为 ['B', 'KB', 'MB', 'GB', 'TB']
 * @return {String}       可读的格式
 */
export const formatFileSize = (size, accuracy, space, units) => {
  units = units || ['B', 'KB', 'MB', 'GB', 'TB'];
  space = space || ' ';
  accuracy = (accuracy && typeof accuracy === 'number' && accuracy) || 0;
  if (!size) {
    return '0' + space + units[0];
  }
  let i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(accuracy) * 1 + space + units[i];
};

export const downloadFile = url => {
  if (window.isDingTalk) {
    const [, search] = decodeURIComponent(url).split('?');
    const { validation } = qs.parse(search);
    return addToken(url, validation ? true : false);
  } else {
    return addToken(url);
  }
};

/**
 * 下载地址和包含 md.global.Config.AjaxApiUrl 的 url 添加 token
 * @param {string} url
 * @returns {string} url
 */
export const addToken = (url, verificationId = true) => {
  const id = window.getCookie('md_pss_id') || window.localStorage.getItem('md_pss_id');
  if (verificationId && id && !md.global.Account.isPortal) {
    return url;
  }
  if (url.includes('?')) {
    return `${url}&md_pss_id=${getPssId()}`;
  } else {
    return `${url}?md_pss_id=${getPssId()}`;
  }
};

/**
 * 判断当前设备是否为移动端
 */
export const browserIsMobile = () => {
  const sUserAgent = navigator.userAgent.toLowerCase();
  const bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  const bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  const bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  const bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  const bIsAndroid = sUserAgent.match(/android/i) == 'android';
  const bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  const bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';
  const bIsApp = sUserAgent.match(/mingdao application/i) == 'mingdao application';
  const bIsMiniProgram = sUserAgent.match(/miniprogram/i) == 'miniprogram';
  const isHuawei = sUserAgent.match(/mobile huaweibrowser/i) == 'mobile huaweibrowser';
  const isHarmony = sUserAgent.match(/penharmony/i) == 'penharmony';
  const isAndroid = sUserAgent.match(/android/i) == 'android';

  const value =
    bIsIphoneOs ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsAndroid ||
    bIsCE ||
    bIsWM ||
    bIsApp ||
    bIsMiniProgram ||
    isHuawei ||
    isHarmony ||
    isAndroid;

  if (sUserAgent.includes('dingtalk') || sUserAgent.includes('wxwork') || sUserAgent.includes('feishu')) {
    // 钉钉和微信设备针对侧边栏打开判断为 mobile 环境
    const { pc_slide = '' } = getRequest();
    return pc_slide.includes('true') || sessionStorage.getItem('dingtalk_pc_slide') ? true : value;
  } else {
    return value;
  }
};

/**
 * 获取URL里的参数，返回一个参数对象
 * @param  {string} str url中 ? 之后的部分，可以包含 ?
 * @return {object}
 */
export const getRequest = str => {
  str = str || location.search;
  str = str
    .replace(/^\?/, '')
    .replace(/#.*$/, '')
    .replace(/(^&|&$)/, '');

  return qs.parse(str);
};

/**
 * 根据拓展名获取拓展名对应的 icon 名
 * @param  {string} ext 拓展名
 * @return {string}          背景图片 icon 名
 */
export const getIconNameByExt = ext => {
  let extType = null;
  switch (ext && ext.toLowerCase()) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'tif':
    case 'tiff':
      extType = 'img';
      break;
    case 'xls':
    case 'xlsx':
      extType = 'excel';
      break;
    case 'doc':
    case 'docx':
    case 'dot':
      extType = 'word';
      break;
    case 'md':
      extType = 'md';
      break;
    case 'js':
    case 'ts':
    case 'java':
    case 'py':
    case 'rb':
    case 'cpp':
    case 'c':
    case 'html':
    case 'css':
    case 'php':
    case 'swift':
    case 'go':
    case 'rust':
    case 'lua':
    case 'sql':
    case 'pl':
    case 'sh':
    case 'json':
    case 'xml':
    case 'cs':
    case 'vb':
    case 'scala':
    case 'perl':
    case 'r':
    case 'matlab':
    case 'groovy':
    case 'jsp':
    case 'jsx':
    case 'tsx':
    case 'sass':
    case 'less':
    case 'scss':
    case 'coffee':
    case 'asm':
    case 'bat':
    case 'powershell':
    case 'h':
    case 'hpp':
    case 'm':
    case 'mm':
    case 'd':
    case 'kt':
    case 'ini':
    case 'yml':
      extType = 'code';
      break;
    case 'ppt':
    case 'pptx':
    case 'pps':
      extType = 'ppt';
      break;
    case 'mov':
    case 'mp4':
    case 'mpg':
    case 'flv':
    case 'f4v':
    case 'rm':
    case 'rmvb':
    case 'avi':
    case 'mkv':
    case 'wmv':
    case '3gp':
    case '3g2':
    case 'swf':
    case 'm4v':
      extType = 'mp4';
      break;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ape':
    case 'alac':
    case 'wavpack':
    case 'm4a':
    case 'aac':
    case 'ogg':
    case 'vorbis':
    case 'opus':
    case 'au':
    case 'mmf':
    case 'aif':
      extType = 'mp3';
      break;
    case 'mmap':
    case 'xmind':
    case 'cal':
    case 'zip':
    case 'rar':
    case '7z':
    case 'pdf':
    case 'txt':
    case 'ai':
    case 'psd':
    case 'vsd':
    case 'aep':
    case 'apk':
    case 'ascx':
    case 'db':
    case 'dmg':
    case 'dwg':
    case 'eps':
    case 'exe':
    case 'indd':
    case 'iso':
    case 'key':
    case 'ma':
    case 'max':
    case 'numbers':
    case 'obj':
    case 'pages':
    case 'prt':
    case 'rp':
    case 'skp':
    case 'xd':
      extType = ext.toLowerCase();
      break;
    case 'url':
      extType = 'link';
      break;
    case 'mdy':
      extType = 'mdy';
      break;
    default:
      extType = 'doc';
  }
  return extType;
};

/**
 * 根据文件名获取相应图标的背景图片 css 类名
 * @param  {string} filename 文件名
 * @return {string}          背景图片 css 类名
 */
export const getClassNameByExt = ext => {
  if (ext === false) {
    return 'fileIcon-folder';
  }
  /*
   * 之前方法针对的是普通附件，普通附件的 ext 属性是带 "." 的，知识文件不带点，这里简单的加个匹配判断
   * 传入的参数没有 "." 时，直接把它用作拓展名
   */
  ext = ext || '';
  ext = /^\w+$/.test(ext) ? ext.toLowerCase() : RegExpValidator.getExtOfFileName(ext).toLowerCase();
  return 'fileIcon-' + getIconNameByExt(ext);
};

/**
 * 获取光标位置
 */
export const getCaretPosition = ctrl => {
  let sel, sel2;
  let caretPos = 0;
  if (document.selection) {
    // IE Support
    ctrl.focus();
    sel = document.selection.createRange();
    sel2 = sel.duplicate();
    sel2.moveToElementText(ctrl);
    caretPos = -1;
    while (sel2.inRange(sel)) {
      sel2.moveStart('character');
      caretPos++;
    }
  } else if (ctrl.setSelectionRange) {
    // W3C
    ctrl.focus();
    caretPos = ctrl.selectionStart;
  }
  return caretPos;
};

/**
 * 设置光标位置
 */
export const setCaretPosition = (ctrl, caretPos) => {
  if (ctrl.createTextRange) {
    let range = ctrl.createTextRange();
    range.move('character', caretPos);
    range.select();
  } else if (caretPos) {
    ctrl.focus();
    ctrl.setSelectionRange(caretPos, caretPos);
  } else {
    ctrl.focus();
  }
};

/**
 * 获取上传token
 */
export const getToken = (files, type = 0, args = {}, options = {}) => {
  if (!md.global.Account.accountId) {
    return qiniuAjax.getFileUploadToken({ files, type, ...args }, options);
  } else {
    return qiniuAjax.getUploadToken({ files, type, ...args }, options);
  }
};

/**
 * 路由添加子路径
 */
export function addSubPathOfRoutes(routes, subPath) {
  if (!subPath) {
    return routes;
  }
  const newRoutes = _.cloneDeep(routes);
  Object.keys(newRoutes).forEach(key => {
    newRoutes[key].path = subPath + newRoutes[key].path;
  });
  return newRoutes;
}

/**
 * 根据索引获取不重复名称
 * @param {Array} data - 包含名称的对象数组
 * @param {string} name - 初始名称
 * @param {string} key - 用于比较的键名，默认为 'name'
 * @returns {string} - 不重复的名称
 */
export const getUnUniqName = (data, name = '', key = 'name') => {
  const nameExists = _.some(data, [key, name]);

  if (nameExists) {
    const maxNumber = _.max(
      _.filter(data, item => _.startsWith(item[key], String(name).replace(/\d*$/, ''))).map(item =>
        parseInt(item[key].replace(/^.*?(\d+)$/, '$1')),
      ),
    );

    name = String(name).replace(/\d*$/, (maxNumber || 0) + 1);
  }

  return name;
};

/**
 * 生成包含大写字母、小写字母和数字的随机密码。
 * @param {number} length - 密码长度。
 * @returns {string} - 随机生成的密码。
 */
export const generateRandomPassword = length => {
  const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
  };

  // 至少包含一个字符
  const password = _.flatMap(Object.values(chars), group => _.sample(group)).join('');

  // 生成剩余部分，并使用 Fisher-Yates 洗牌算法随机排序
  const remainingChars = _.times(length - 3, i => _.sample(Object.values(chars)[i % 3]));
  const shuffledPassword = _.shuffle([password, ...remainingChars]).join('');

  return shuffledPassword;
};

/**
 * regexFilter dom 转换方式过滤 html标签
 * 缺点：慢
 */
export function domFilterHtmlScript(html) {
  try {
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (err) {
    console.log(err);
    return html;
  }
}

// 提示邀请结果
export const existAccountHint = function (result) {
  const inviteNoticeMessage = function (title, accounts) {
    if (!accounts.length) return '';
    const USER_STATUS = {
      2: _l('（被拒绝加入，需从后台恢复权限）'),
      3: _l('（待审批）'),
      4: _l('（被暂停权限，需从后台恢复权限）'),
    };
    let noticeMessage = title + '：<br/>';

    accounts.forEach(item => {
      let message = '';
      if (item.account) {
        // 不存在的用户
        message = item.account;
      } else {
        // 已存在的用户
        let accountArr = [];
        if (item.email) {
          accountArr.push(item.email);
        }
        if (item.mobilePhone) {
          accountArr.push(item.mobilePhone);
        }
        let desc = accountArr.join(' / ') + (USER_STATUS[item.user] || '');
        message = item.fullname + (desc.length ? '：' + desc : '');
      }
      noticeMessage += '<div class="Font12 Gray_c LineHeight25">' + message + '</div>';
    });

    return noticeMessage;
  };
  const SendMessageResult = {
    Failed: 0,
    Success: 1,
    Limit: 2,
  };

  if (result.sendMessageResult === SendMessageResult.Failed) {
    alert(_l('邀请失败'), 2);
    return;
  }

  let accountInfos = []; // 成功
  let existAccountInfos = []; // 已存在
  let failedAccountInfos = []; // 失败
  let limitAccountInfos = []; // 邀请限制
  let forbidAccountInfos = []; // 账号来源类型受限

  (result.results || []).forEach(singleResult => {
    // 成功
    if (singleResult.accountInfos) {
      accountInfos = accountInfos.concat(singleResult.accountInfos);
    }

    // 已存在
    if (singleResult.existAccountInfos) {
      existAccountInfos = existAccountInfos.concat(singleResult.existAccountInfos);
    }

    // 失败
    if (singleResult.failedAccountInfos) {
      failedAccountInfos = failedAccountInfos.concat(singleResult.failedAccountInfos);
    }

    // 限制
    if (singleResult.limitAccountInfos) {
      limitAccountInfos = limitAccountInfos.concat(singleResult.limitAccountInfos);
    }

    // 账号来源类型受限
    if (singleResult.forbidAccountInfos) {
      forbidAccountInfos = forbidAccountInfos.concat(singleResult.forbidAccountInfos);
    }
  });

  let message = _l('邀请成功');
  let isNotice =
    existAccountInfos.length || failedAccountInfos.length || limitAccountInfos.length || forbidAccountInfos.length;

  if (isNotice) {
    message = inviteNoticeMessage(_l('以下用户邀请成功'), accountInfos);
    message += inviteNoticeMessage(_l('以下用户已存在，不能重复邀请'), existAccountInfos);
    message += inviteNoticeMessage(_l('以下用户超过邀请数量限制，无法邀请'), limitAccountInfos);
    message += inviteNoticeMessage(_l('以下用户邀请失败'), failedAccountInfos);
    message += inviteNoticeMessage(_l('以下用户账号来源类型受限'), forbidAccountInfos);
  }

  if (isNotice) {
    alert(message, 3);
  } else {
    alert(message);
  }

  return {
    accountInfos: accountInfos,
    existAccountInfos: existAccountInfos,
  };
};
