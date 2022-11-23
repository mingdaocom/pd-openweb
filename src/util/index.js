import EventEmitter from 'events';
import JSEncrypt from 'jsencrypt';
import React from 'react';
import update from 'immutability-helper';
import { get, upperFirst, isString } from 'lodash';
import { Dialog } from 'ming-ui';
import 'src/pages/PageHeader/components/NetState/index.less';
import { LIGHT_COLOR, PUBLIC_KEY, APPLICATION_ICON } from './enum';
import { getPssId } from 'src/util/pssId';
import qs from 'query-string';
import { getUploadToken, getFileUploadToken } from 'src/api/qiniu';
import { getProjectLicenseInfo } from 'src/api/project';

export const emitter = new EventEmitter();

export function getProject(projectId) {
  if (projectId === 'external' && browserIsMobile()) {
    return { projectId, companyName: _l('外部协作') };
  }
  const projects = md.global.Account.projects;
  if (projectId) {
    const project = _.find(projects, { projectId });
    if (project) {
      return project;
    }
  }
  return projects[0];
}

// 判断选项颜色是否为浅色系
export const isLightColor = (color = '') => _.includes(LIGHT_COLOR, color.toUpperCase());

export const getCurrentProject = id => {
  const projects = _.get(md, ['global', 'Account', 'projects']) || [];
  return _.find(projects, item => item.projectId === id) || {};
};

export const enumObj = obj => {
  _.keys(obj).forEach(key => (obj[obj[key]] = key));
  return obj;
};

export const encrypt = text => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(encodeURIComponent(text));
};

export const getAdvanceSetting = (data, key) => {
  const setting = get(data, ['advancedSetting']) || {};
  if (!key) return setting;
  let value = get(setting, key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return '';
  }
};

// 更新advancedSetting数据
export const handleAdvancedSettingChange = (data, obj) => {
  return {
    ...data,
    advancedSetting: update(data.advancedSetting || {}, { $apply: item => ({ ...item, ...obj }) }),
  };
};

/**
 * 导入本目录下所有组件
 * @param {*} r
 */
export const exportAll = r => {
  const componentConfig = {};
  r.keys().forEach(item => {
    const key = item.match(/\/(\w*)\./)[1];
    const component = r(item);
    const capitalKey = upperFirst(key);
    if (isString(component)) {
      componentConfig[capitalKey] = component;
    } else {
      componentConfig[capitalKey] = component.default || component[key];
    }
  });
  return componentConfig;
};

export const setItem = (key, value) => {
  if (!key || !value) return;
  safeLocalStorageSetItem(key, JSON.stringify(value));
};

export const getItem = key => {
  try {
    const str = localStorage.getItem(key);
    return JSON.parse(str);
  } catch (error) {
    console.log(error);
  }
};

export const formatNumberFromInput = value => {
  value = value
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

  if (value === '.') {
    value = '';
  }
  return value;
};

/**
 * 应用图标
 * for chatlist, inbox
 */
export const applicationIcon = (type, size = 'middle') => {
  if (APPLICATION_ICON[type] === undefined) {
    throw new Error('type is not found in DICT');
  }
  const className = APPLICATION_ICON[type];
  return `<span class='${className} circle ${size}' data-date="${new Date().getDate()}"></span>`;
};

/**
 * 获取字符串字节数
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

/**
 * 翻译中替换{0} {1} 方法
 * @param  {string} str 要替换的字符串
 * @param  {object} args 如果只有第二个参数，并且是对象，根据对象的 key 替换 str 中相应的{key}
 * @return {string}
 */
export const langFormat = (str, ...args) => {
  let result = str;
  let reg;
  if (!result || !args.length) {
    return result;
  }
  if (args.length === 1 && typeof args[0] === 'object') {
    for (let key in args[0]) {
      if ({}.hasOwnProperty.call(args[0], key) && args[0][key] !== undefined) {
        reg = new RegExp('({)' + key + '(})', 'g');
        result = result.replace(reg, args[0][key]);
      }
    }
  } else {
    for (let i = 0; i < args.length; i++) {
      if (args[i] !== undefined) {
        reg = new RegExp('({)' + i + '(})', 'g');
        result = result.replace(reg, args[i]);
      }
    }
  }
  return result;
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

/**
 * 判断是否是视频格式
 * @param {string} fileExt
 * @returns {boolean}
 */
export const isVideo = fileExt => {
  let fileExts = ['.mov', '.mp4', '.avi', '.mkv', '.3gp', '.3g2', '.m4v', '.rm', '.rmvb', '.webm'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) >= 0;
  }
  return false;
};

/**
 * 随机生成一个字符串
 * @param {number} length 长度
 * @param {string} customStr 自定义字符串
 * @return {string} 随机字符串
 */
export const getRandomString = (length, customStr) => {
  let chars = customStr
    ? customStr.split('')
    : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

export const isUrlRequest = url => {
  if (/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return true;
  if (/^\//.test(url)) return true;
  return false;
};

export const downloadFile = url => {
  if (window.isDingTalk) {
    const [path, search] = decodeURIComponent(url).split('?');
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
  const value = bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsApp;

  if (sUserAgent.includes('dingtalk')) {
    // 钉钉设备针对侧边栏打开判断为 mobile 环境
    const { pc_slide = '' } = getRequest();
    return pc_slide.includes('true') ? true : value;
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
    case 'ppt':
    case 'pptx':
    case 'pps':
      extType = 'ppt';
      break;
    case 'mov':
    case 'mp4':
    case 'flv':
    case 'rm':
    case 'rmvb':
    case 'avi':
    case 'mkv':
    case '3gp':
    case '3g2':
    case 'm4v':
      extType = 'mp4';
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
    case 'html':
    case 'indd':
    case 'iso':
    case 'key':
    case 'ma':
    case 'max':
    case 'mp3':
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
  ext = /^\w+$/.test(ext) ? ext.toLowerCase() : File.GetExt(ext).toLowerCase();
  return 'fileIcon-' + getIconNameByExt(ext);
};

/**
 * 获取仓库对应的文件存放地址
 * @returns {string} bucketName 仓库名
 */
export const getUrlByBucketName = bucketName => {
  var config = {
    mdoc: md.global.FileStoreConfig.documentHost,
    mdpic: md.global.FileStoreConfig.pictureHost,
    mdmedia: md.global.FileStoreConfig.mediaHost,
    mdpub: md.global.FileStoreConfig.pubHost,
  };
  return config[bucketName] || md.global.FileStoreConfig.pictureHost;
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

// 从 html 代码创建元素
export function createElementFromHtml(html) {
  const con = document.createElement('div');
  con.innerHTML = html;
  return con.firstElementChild;
}

/**
 * 获取上传token
 */
export const getToken = (files, type = 0) => {
  if (!md.global.Account.accountId) {
    return getFileUploadToken({ files });
  } else {
    return getUploadToken({ files, type });
  }
};

/**
 * jQuery Promise 转为标准 Promise
 */
export function jP2Promise(jPFunction) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      jPFunction(...args)
        .then(resolve)
        .fail(reject)
        .always(Promise.finally);
    });
  };
}

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
 * 获取应用界面特性是否可见
 */
export const getAppFeaturesVisible = () => {
  const { s, tb, tr, ln, rp } = qs.parse(location.search.substr(1));

  return {
    s: s !== 'no',
    tb: tb !== 'no',
    tr: tr !== 'no',
    ln: ln !== 'no',
    rp: rp !== 'no',
  };
};

/**
 * 获取应用界面特性路径
 */
export const getAppFeaturesPath = () => {
  const { s, tb, tr, ln, rp } = getAppFeaturesVisible();

  return [s ? '' : 's=no', tb ? '' : 'tb=no', tr ? '' : 'tr=no', ln ? '' : 'ln=no', rp ? '' : 'rp=no']
    .filter(o => o)
    .join('&');
};

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
    m += s1.split('.')[1].length;
  } catch (e) {}
  try {
    m += s2.split('.')[1].length;
  } catch (e) {}
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
    t1 = arg1.toString().split('.')[1].length;
  } catch (e) {}
  try {
    t2 = arg2.toString().split('.')[1].length;
  } catch (e) {}
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
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
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

/**
 * 根据背景色判断文字颜色
 */
export function getColorCountByBg(backgroundColor) {
  const RgbValue =
    'rgb(' +
    parseInt('0x' + backgroundColor.slice(1, 3)) +
    ',' +
    parseInt('0x' + backgroundColor.slice(3, 5)) +
    ',' +
    parseInt('0x' + backgroundColor.slice(5, 7)) +
    ')';
  const RgbValueArry = RgbValue.replace('rgb(', '').replace(')', '').split(',');
  return RgbValueArry[0] * 0.299 + RgbValueArry[1] * 0.587 + RgbValueArry[2] * 0.114;
}

export function replaceNotNumber(value) {
  return value
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');
}

/**
 * 调用 app 内的方式
 */
export function mdAppResponse(param) {
  const ua = navigator.userAgent;
  const isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  return new Promise((resolve, reject) => {
    // 注册监听
    window.MD_APP_RESPONSE = base64 => {
      const decodedData = window.atob(base64);
      resolve(JSON.parse(decodeURIComponent(escape(decodedData))));
    };
    // 触发监听的回调函数
    const string = JSON.stringify(param);
    const base64 = window.btoa(string);
    if (isIOS) {
      window.webkit.messageHandlers.MD_APP_REQUEST.postMessage(base64);
    } else {
      window.Android.MD_APP_REQUEST(base64);
    }
  });
}

/**
 * 获取路由参数
 */
export const parseSearchParams = searchParamsString => {
  return searchParamsString.split('?').reduce((searchParams, curKV) => {
    const [k, v] = curKV.split('=').map(decodeURIComponent);
    searchParams[k] = v;

    return searchParams;
  }, {});
};

/**
 * 升级版本dialog
 */
export const upgradeVersionDialog = options => {
  const hint = options.hint || _l('当前版本无法使用此功能');
  const explainText = options.explainText || _l('请升级至专业版或旗舰版解锁开启');
  const versionType = options.versionType ? options.versionType : undefined;

  if (options.dialogType === 'content') {
    return (
      <div>
        <div className="netStateWrap">
          <div className="imgWrap" />
          <div className="hint">{hint}</div>
          {(!md.global.Config.IsLocal || !md.global.Account.isPortal || options.explainText) && (
            <div className="explain">{explainText}</div>
          )}
        </div>
      </div>
    );
  }
  Dialog.confirm({
    className: options.className ? options.className : 'upgradeVersionDialogBtn',
    title: '',
    description: (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{hint}</div>
        {(!md.global.Config.IsLocal || !md.global.Account.isPortal || options.explainText) && (
          <div className="explain">{explainText}</div>
        )}
      </div>
    ),
    noFooter: true,
  });
};

/**
 * 获取网络信息
 */
const getSyncLicenseInfo = projectId => {
  const { projects = [], externalProjects = [] } = md.global.Account;
  let projectInfo = _.find(projects.concat(externalProjects), o => o.projectId === projectId) || {};

  if (_.isEmpty(projectInfo)) {
    getProjectLicenseInfo({ projectId }, { ajaxOptions: { async: false } }).then(res => {
      projectInfo = { ...res, projectId };
      md.global.Account.externalProjects = (md.global.Account.externalProjects || []).concat(projectInfo);
    });
  }

  return projectInfo;
};

/**
 *  获取功能状态 1: 正常 2: 升级
 */
export function getFeatureStatus(projectId, featureId) {
  if (!/^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/.test(projectId)) return;

  const { Versions = [] } = md.global || {};
  const { version = { versionIdV2: '-1' } } = getSyncLicenseInfo(projectId);
  const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === version.versionIdV2) || {};

  return (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type;
}

/**
 * 功能埋点授权显示升级版本内容dialogType： dialog弹层（默认） content 页面
 */
export function buriedUpgradeVersionDialog(projectId, featureId, dialogType) {
  const { Versions = [] } = md.global || {};
  const { licenseType } = getSyncLicenseInfo(projectId);
  let upgradeName, versionType;

  if (!md.global.Config.IsLocal) {
    const getFeatureType = versionIdV2 => {
      const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === versionIdV2) || {};
      return {
        versionName: versionInfo.Name,
        versionType: versionInfo.VersionIdV2,
        type: (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type,
      };
    };
    upgradeName = [getFeatureType('1'), getFeatureType('2'), getFeatureType('3')].filter(item => item.type === '1')[0]
      .versionName;
    versionType = [getFeatureType('1'), getFeatureType('2'), getFeatureType('3')].filter(item => item.type === '1')[0]
      .versionType;
  }

  if (dialogType === 'content') {
    return upgradeVersionDialog({
      projectId,
      isFree: licenseType === 0 || licenseType === 2,
      explainText:
        md.global.Config.IsLocal || md.global.Account.isPortal
          ? _l('请升级版本')
          : _l('请升级至%0解锁开启', upgradeName),
      dialogType,
      versionType,
    });
  } else {
    upgradeVersionDialog({
      projectId,
      isFree: licenseType === 0 || licenseType === 2,
      explainText:
        md.global.Config.IsLocal || md.global.Account.isPortal
          ? _l('请升级版本')
          : _l('请升级至%0解锁开启', upgradeName),
      versionType,
    });
  }
}

export function toFixed(num, dot = 0) {
  if (_.isObject(num) || _.isNaN(Number(num))) {
    console.error(num, '不是数字');
    return '';
  }
  if (dot === 0) {
    return String(num);
  }
  if (dot < 0 || dot > 20) {
    return String(num);
  }
  const strOfNum = String(num);
  if (!/\./.test(strOfNum)) {
    return strOfNum + '.' + ''.padEnd(dot, '0');
  }
  const decimal = (strOfNum.match(/\.(\d+)/)[1] || '').length;
  if (decimal === dot) {
    return strOfNum;
  } else if (decimal < dot) {
    return strOfNum + ''.padEnd(dot - decimal, '0');
  } else {
    const isNegative = num < 0;
    if (isNegative) {
      num = Math.abs(num);
    }
    let data = String(Math.round(num * Math.pow(10, dot)));
    data = data.padStart(dot, '0');
    return (isNegative ? '-' : '') + Math.floor(data / Math.pow(10, dot)) + '.' + data.slice(-1 * dot);
  }
}
