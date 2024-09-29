import EventEmitter from 'events';
import JSEncrypt from 'jsencrypt';
import React from 'react';
import update from 'immutability-helper';
import _, { get } from 'lodash';
import { TinyColor } from '@ctrl/tinycolor';
import { Dialog, Support } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import 'src/pages/PageHeader/components/NetState/index.less';
import { PUBLIC_KEY, VersionProductHelpLink } from './enum';
import { getPssId } from 'src/util/pssId';
import qs from 'query-string';
import qiniuAjax from 'src/api/qiniu';
import projectAjax from 'src/api/project';
import { captcha } from 'ming-ui/functions';
import accountAjax from 'src/api/account';
import actionLogAjax from 'src/api/actionLog';
import appManagementApi from 'src/api/appManagement';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { SYS_COLOR, SYS_CHART_COLORS } from 'src/pages/Admin/settings/config';
import { AT_ALL_TEXT } from 'src/components/comment/config';
import Emotion from 'src/components/emotion/emotion';
import moment from 'moment';
import RegExpValidator from 'src/util/expression';

export const emitter = new EventEmitter();

// 判断选项颜色是否为浅色系
export const isLightColor = (color = '') => {
  const SPECIAL_DARK_COLORS = ['ff9300', 'fa8c16', '808080', '4caf50', 'fa8c16', '08c9c9', 'fad714', 'faad14'];

  return SPECIAL_DARK_COLORS.find(l => l === new TinyColor(color).toHex()) ? false : new TinyColor(color).isLight();
};

// 获取当前网络信息
export const getCurrentProject = (id, isExternalProject) => {
  if (!id) return {};

  const externalProjects = _.get(md, ['global', 'Account', 'externalProjects']) || [];
  const projects = (_.get(md, ['global', 'Account', 'projects']) || []).concat(
    isExternalProject ? externalProjects : [],
  );
  let info = _.find(projects, item => item.projectId === id);

  if (!info && isExternalProject) {
    return getSyncLicenseInfo(id);
  }

  return info || {};
};

// 加密
export const encrypt = text => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(PUBLIC_KEY);
  return encrypt.encrypt(encodeURIComponent(text));
};

// 获取advancedSetting属性转化为对象
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

// 数值转换
export const formatNumberFromInput = (value, pointReturnEmpty = true) => {
  value = (value || '')
    .replace('。', '.')
    .replace(/[^-\d.]/g, '')
    .replace(/^\./g, '')
    .replace(/^-/, '$#$')
    .replace(/-/g, '')
    .replace('$#$', '-')
    .replace(/^-\./, '-')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.');

  if (pointReturnEmpty && value === '.') {
    value = '';
  }
  return value;
};

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
  const bIsMiniProgram = sUserAgent.match(/miniprogram/i) == 'miniprogram';
  const value = bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsApp || bIsMiniProgram;

  if (sUserAgent.includes('dingtalk') || sUserAgent.includes('wxwork')) {
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
export const getToken = (files, type = 0, args = {}) => {
  if (!md.global.Account.accountId) {
    return qiniuAjax.getFileUploadToken({ files, type, ...args });
  } else {
    return qiniuAjax.getUploadToken({ files, type, ...args });
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
 * 获取应用界面特性是否可见
 */
export const getAppFeaturesVisible = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = qs.parse(location.search.substr(1));

  return {
    s: s !== 'no', // 回首页按钮
    tb: tb !== 'no', // 应用分组
    tr: tr !== 'no', // 导航右侧内容（应用扩展信息）
    ln: ln !== 'no', // 左侧导航
    rp: rp !== 'no', // chart
    td: td !== 'no', // 待办
    ss: ss !== 'no', // 超级搜索
    ac: ac !== 'no', // 账户
    ch: ch !== 'no', // 消息侧边栏
  };
};

/**
 * 获取应用界面特性路径
 */
export const getAppFeaturesPath = () => {
  const { s, tb, tr, ln, rp, td, ss, ac, ch } = getAppFeaturesVisible();

  return [
    s ? '' : 's=no',
    tb ? '' : 'tb=no',
    tr ? '' : 'tr=no',
    ln ? '' : 'ln=no',
    rp ? '' : 'rp=no',
    td ? '' : 'td=no',
    ss ? '' : 'ss=no',
    ac ? '' : 'ac=no',
    ch ? '' : 'ch=no',
  ]
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
 * @param {string} backgroundColor - 背景色，格式为 '#RRGGBB'
 * @returns {number} - 文字颜色判断值
 */
export function getColorCountByBg(backgroundColor) {
  const parseHex = hex => parseInt(hex, 16);
  const [r, g, b] = [backgroundColor.slice(1, 3), backgroundColor.slice(3, 5), backgroundColor.slice(5, 7)].map(
    parseHex,
  );

  return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * 调用 app 内的方式
 */
export function mdAppResponse(param) {
  return new Promise((resolve, reject) => {
    // 注册监听
    window.MD_APP_RESPONSE = base64 => {
      const decodedData = window.atob(base64);
      resolve(JSON.parse(decodeURIComponent(escape(decodedData))));
    };
    // 触发监听的回调函数
    const string = JSON.stringify(param);
    const base64 = window.btoa(string);
    if (window.isMacOs) {
      window.webkit.messageHandlers.MD_APP_REQUEST.postMessage(base64);
    } else {
      window.Android.MD_APP_REQUEST(base64);
    }
  });
}

/**
 * 升级版本dialog
 */
export const upgradeVersionDialog = options => {
  const hint = options.hint || _l('当前版本无法使用此功能');
  const explainText = options.explainText;
  const versionType = options.versionType ? options.versionType : undefined;
  const isExternal = _.isEmpty(getCurrentProject(options.projectId)); // 是否为外协人员
  const helpLink = VersionProductHelpLink[options.featureId] || options.helpLink; // 帮助链接
  const removeFooter = options.removeFooter;
  const descFunc = () => {
    return (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{hint}</div>
        {!md.global.Config.IsLocal && !md.global.Account.isPortal && !isExternal && options.explainText && (
          <div className="explain">{explainText}</div>
        )}
      </div>
    );
  };
  const onOkFunc = () => {
    !options.projectId
      ? (location.href = `/price`)
      : options.isFree
      ? purchaseMethodFunc({ projectId: options.projectId, select: versionType })
      : options.onOk
      ? options.onOk()
      : navigateTo(`/admin/upgradeservice/${options.projectId}${versionType ? '/' + versionType : ''}`);
  };

  if (options.dialogType === 'content') {
    return (
      <div className="upgradeWrap">
        {descFunc()}
      </div>
    );
  }

  Dialog.confirm({
    className: options.className || 'upgradeVersionDialogBtn',
    title: '',
    description: descFunc(),
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
    if (window.isPublicApp) {
      return {};
    }
    const info = projectAjax.getProjectLicenseInfo({ projectId }, { ajaxOptions: { sync: true } });

    projectInfo = { ...info, projectId };
    md.global.Account.externalProjects = (md.global.Account.externalProjects || []).concat(projectInfo);
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
export function buriedUpgradeVersionDialog(projectId, featureId, extra, onOk) {
  const { Versions = [] } = md.global || {};
  const { licenseType } = getSyncLicenseInfo(projectId);
  const { explainText = '', dialogType } = extra || {};
  let upgradeName, versionType;

  if (!md.global.Config.IsLocal) {
    const TYPE_NAME = { 1: _l('标准版'), 2: _l('专业版'), 3: _l('旗舰版') };
    const getFeatureType = versionIdV2 => {
      const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === versionIdV2) || {};
      return {
        versionName: TYPE_NAME[versionIdV2],
        versionType: versionIdV2,
        type: (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type,
      };
    };
    const usableVersion = [getFeatureType('1'), getFeatureType('2'), getFeatureType('3')].filter(
      item => item.type === '1',
    )[0];

    upgradeName = usableVersion.versionName;
    versionType = usableVersion.versionType;
  }

  return upgradeVersionDialog({
    projectId,
    featureId,
    isFree: licenseType === 0 || licenseType === 2,
    explainText:
      md.global.Config.IsLocal || md.global.Account.isPortal
        ? _l('请升级版本')
        : !!explainText
        ? explainText
        : _l('请升级至%0解锁开启', upgradeName),
    versionType,
    dialogType,
    onOk,
  });
}

/**
 * 解决 JavaScript 原生 toFixed 方法精度问题
 */
export function toFixed(num, dot = 0) {
  if (_.isObject(num) || _.isNaN(Number(num))) {
    console.error(num, '不是数字');
    return '';
  }
  if (dot === 0) {
    return String(Math.round(num));
  }
  if (dot < 0 || dot > 20) {
    return String(num);
  }
  const strOfNum = String(num);
  if (!/\./.test(strOfNum)) {
    return strOfNum + '.' + _.padEnd('', dot, '0');
  }
  const decimal = ((strOfNum.match(/\.(\d+)/) || '')[1] || '').length;
  if (decimal === dot) {
    return strOfNum;
  } else if (decimal < dot) {
    return strOfNum + _.padEnd('', dot - decimal, '0');
  } else {
    const isNegative = num < 0;
    if (isNegative) {
      num = Math.abs(num);
    }
    let data = String(Math.round(num * Math.pow(10, dot)));
    data = _.padStart(data, dot, '0');
    return (isNegative ? '-' : '') + Math.floor(data / Math.pow(10, dot)) + '.' + data.slice(-1 * dot);
  }
}

/**
 * 验证登录密码
 * @param {Object} options - 选项对象
 * @param {string} options.projectId - 网络 ID
 * @param {string} options.password - 登录密码
 * @param {boolean} options.closeImageValidation - 是否前3次关闭图像验证
 * @param {boolean} options.isNoneVerification - 是否一小时内免验证
 * @param {boolean} options.checkNeedAuth - 检测是否免验证
 * @param {string} options.customActionName - 自定义 AJAX API 接口名称
 * @param {boolean} options.ignoreAlert - 忽略报错
 * @param {Function} options.success - 验证成功的回调函数
 * @param {Function} options.fail - 验证失败的回调函数
 */
export function verifyPassword({
  projectId = '',
  password = '',
  closeImageValidation = false,
  isNoneVerification = false,
  checkNeedAuth = false,
  customActionName = '',
  ignoreAlert = false,
  success = () => {},
  fail = () => {},
}) {
  const ERROR_CODE = {
    6: _l('密码不正确'),
    8: _l('验证码错误'),
  };
  const cb = function (res) {
    if (res.ret !== 0) {
      return;
    }

    accountAjax[
      customActionName
        ? customActionName
        : checkNeedAuth || closeImageValidation
        ? 'checkAccountIdentity'
        : 'checkAccount'
    ](
      checkNeedAuth
        ? { projectId }
        : {
            projectId,
            isNoneVerification,
            ticket: res.ticket,
            randStr: res.randstr,
            captchaType: md.global.getCaptchaType(),
            password: encrypt(password),
          },
    ).then(statusCode => {
      if (statusCode === 1) {
        success();
      } else if (statusCode === 10) {
        captchaFuc();
      } else if (checkNeedAuth && _.includes([6, 9], statusCode)) {
        fail(statusCode === 6 ? 'showPasswordAndNoneVerification' : 'showPassword');
      } else {
        !ignoreAlert && alert(ERROR_CODE[statusCode] || _l('操作失败'), 2);
        fail();
      }
    });
  };
  const captchaFuc = () => {
    if (md.global.getCaptchaType() === 1) {
      new captcha(cb);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb, { needFeedBack: false }).show();
    }
  };

  // 前3次关闭图像验证
  if (closeImageValidation || checkNeedAuth) {
    cb({ ret: 0 });
  } else {
    captchaFuc();
  }
}

/**
 * 格式化数字字符串，去除无效的零，保留有效数字。
 * @param {string} str - 要格式化的字符串。
 * @returns {string} - 格式化后的字符串。
 */
export function formatStrZero(str = '') {
  const numStr = String(str).match(/[,\.\d]+/) || [''];
  const num = numStr[0].replace(/(?:\.0*|(\.\d+?)0+)$/, '$1');

  return String(str).replace(numStr[0], num);
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

    name = String(name).replace(/\d*$/, maxNumber + 1);
  }

  return name;
};

/**
 * 添加行为日志。
 * @param {string} type - 日志类型，可选值为 'app', 'worksheet', 'customPage', 'worksheetRecord', 'printRecord',
 * 'printWord', 'pintTemplate', 'printQRCode', 'printBarCode', 'batchPrintWord', 'previewFile'。
 * @param {string} entityId - 实体 ID。(根据访问类型不同， 传不同模块id：浏览应用，entityId =应用id，
 * 浏览自定义页面，entityId = 页面id。其他的浏览行为 =worksheetId）
 * @param {Object} params - 额外的参数，用于记录日志的详细信息。
 */
export const addBehaviorLog = (type, entityId, params = {}) => {
  if (!get(md, 'global.Account.accountId')) return;

  const typeObj = {
    app: 1, // 应用
    worksheet: 2, // 工作表
    customPage: 3, // 自定义页面
    worksheetRecord: 4, // 工作表记录
    printRecord: 5, // 打印了记录
    printWord: 6, // 使用了word模板打印
    pintTemplate: 7, // 使用了模板打印了记录
    printQRCode: 8, // 打印了二维码
    printBarCode: 9, // 打印了条形码
    batchPrintWord: 10, // 批量word打印
    previewFile: 11, // 文件预览
  };

  // 调用 actionLogAjax.addLog 方法记录行为日志
  actionLogAjax.addLog({ type: typeObj[type], entityId, params });
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
 * 解析字符串为数字
 * @param {string} numStr - 要解析的字符串
 * @returns {number|undefined} - 解析结果，如果解析失败则返回 undefined
 */
export function parseNumber(numStr) {
  const result = Number(numStr);
  return isFinite(result) ? result : undefined;
}

/**
 * 十六进制颜色转为RGBA
 * @param {string} hex - 十六进制颜色代码，例如 '#RRGGBB'
 * @param {number} opacity - 透明度，范围从 0 到 1，默认为 1
 * @returns {string} - RGBA格式的颜色，例如 'rgba(R, G, B, A)'
 */
export const hexToRgba = (hex, opacity = 1) => {
  // 提取RGB部分并转换为十进制
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // 返回RGBA格式的颜色
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * 获取组织管理颜色配置。
 * @param {string} projectId - 网络ID
 * @returns {Object} - 包含图表颜色和主题颜色配置的对象。
 */
export const getProjectColor = projectId => {
  const { PorjectColor, Account } = md.global;
  const { projects = [] } = Account;
  const currentProjectId = localStorage.getItem('currentProjectId');
  const id = projectId || currentProjectId || _.get(projects[0], 'projectId');
  const data = _.find(PorjectColor, { projectId: id });

  if (data) {
    const mapColor = colors =>
      colors.map(item => {
        const data = _.find(SYS_CHART_COLORS, { id: item.id });
        return {
          ...data,
          enable: item.enable,
        };
      });
    data.chartColor.system = _.isEmpty(data.chartColor.system) ? SYS_CHART_COLORS : mapColor(data.chartColor.system);
    data.themeColor.system = _.isEmpty(data.themeColor.system) ? SYS_COLOR : data.themeColor.system;

    return data;
  } else {
    return {
      chartColor: {
        custom: [],
        system: SYS_CHART_COLORS,
      },
      themeColor: {
        custom: [],
        system: SYS_COLOR,
      },
    };
  }
};

/**
 * 获取组织管理主题色。
 * @param {string} projectId - 网络ID
 * @returns {[]} - 包含系统色和自定义色的颜色数组。
 */
export const getThemeColors = projectId => {
  // 获取项目颜色配置
  const { themeColor } = getProjectColor(projectId);
  // 过滤并映射系统色，去除未启用的项
  const systemColorList = (themeColor.system || []).filter(item => item.enable !== false).map(item => item.color);
  // 过滤并映射自定义色，去除未启用的项
  const customColorList = (themeColor.custom || []).filter(item => item.enable !== false).map(item => item.color);
  // 合并系统色和自定义色的颜色数组
  return systemColorList.concat(customColorList);
};

/**
 * 设置应用的 favicon。
 * @param {string} iconUrl - 图标的 URL。
 * @param {string} iconColor - 用于设置图标的颜色。
 */
export const setFavicon = (iconUrl, iconColor) => {
  fetch(iconUrl)
    .then(res => res.text())
    .then(data => {
      if (iconUrl.indexOf('_preserve.svg') === -1) {
        data = btoa(data.replace(/fill=\".*?\"/g, '').replace(/\<svg/, `<svg fill="${iconColor}"`));
      } else {
        data = btoa(data.replace(/\<svg/, `<svg fill="${iconColor}"`));
      }

      $('[rel="icon"]').attr('href', `data:image/svg+xml;base64,${data}`);
    });
};

/**
 * 替换动态/任务等内容中的链接
 * @param  {string} args.message        替换前的 html
 * @param  {object[]} args.rUserList      @ 到的帐号列表
 * @param  {object[]} args.rGroupList     @ 到的群组列表
 * @param  {object[]} args.categories     打的话题
 * @param  {boolean} args.noLink     只生成文本，不生成链接
 * @param  {boolean} args.filterFace     不显示表情
 * @return {string}                替换后的 html
 */
export const createLinksForMessage = function (args) {
  let message = args.message.replace(/\n/g, '<br>');
  let rUserList = args.rUserList;
  let rGroupList = args.rGroupList;
  let categories = args.categories;
  let noLink = args.noLink;
  let filterFace = args.filterFace;
  let sourceType = args.sourceType;
  let replaceStr = '';
  let j;
  const replaceMessageCustomTag = function (message, tagName, replaceHtmlFunc, filterCustom) {
    let startTag, endTag;

    if (!message) return message;
    if (typeof tagName === 'string') {
      startTag = '[' + tagName + ']';
      endTag = '[/' + tagName + ']';
    } else if (Array.isArray(tagName)) {
      startTag = tagName[0];
      endTag = tagName[1];
    } else {
      return message;
    }

    if (message.indexOf(startTag) > -1) {
      const customRegExp = new RegExp(
        '(' +
          startTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') +
          ')([0-9a-zA-Z-]*\\|?.*?)' +
          endTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
        'gi',
      );

      if (filterCustom) {
        message = message.replace(customRegExp, '');
      } else {
        message = message.replace(customRegExp, function ($0, $1, $2) {
          let customStr = $2;
          let splitterIndex = customStr.indexOf('|');
          if (splitterIndex === -1) {
            return replaceHtmlFunc ? replaceHtmlFunc(customStr, _l('无法解析') + tagName) : '';
          }
          let customId = customStr.substr(0, splitterIndex);
          let customName = customStr.substr(splitterIndex + 1);
          return replaceHtmlFunc ? replaceHtmlFunc(customId, customName) : customName;
        });
      }
    }

    return message;
  };

  message = message.replace(/\[all\]atAll\[\/all\]/gi, '<a>@' + AT_ALL_TEXT[sourceType] + '</a>');

  if (rUserList && rUserList.length > 0) {
    for (j = 0; j < rUserList.length; j++) {
      let rUser = rUserList[j];
      replaceStr = '';
      let name = htmlEncodeReg(rUser.name || rUser.fullname);
      let aid = rUser.aid || rUser.accountId;
      if (name) {
        if (noLink) {
          replaceStr += ' @' + name + ' ';
        } else {
          if (md.global.Account.isPortal || (aid || '').indexOf('a#') > -1) {
            // 外部门户
            replaceStr += ' <a>@' + name + '</a> ';
          } else {
            replaceStr +=
              ' <a data-accountid="' + aid + '" target="_blank" href="/user_' + aid + '">@' + name + '</a> ';
          }
        }
      }
      let userRegExp = new RegExp('\\[aid]' + aid + '\\[/aid]', 'gi');
      message = message.replace(userRegExp, replaceStr);
    }
  }
  if (rGroupList && rGroupList.length > 0) {
    for (j = 0; j < rGroupList.length; j++) {
      let rGroup = rGroupList[j];
      replaceStr = '';
      if (rGroup.groupName) {
        if (noLink) {
          replaceStr += '@' + htmlEncodeReg(rGroup.groupName);
        } else {
          if (rGroup.isDelete) {
            replaceStr +=
              ' <span class="DisabledColor" title="群组已删除">@' + htmlEncodeReg(rGroup.groupName) + '</span> ';
          } else {
            replaceStr +=
              ' <a target="_blank" data-groupid="' +
              rGroup.groupID +
              '" href="/group/groupValidate?gID=' +
              rGroup.groupID +
              '">@' +
              htmlEncodeReg(rGroup.groupName) +
              '</a> ';
          }
        }
      }
      let groupRegExp = new RegExp('\\[gid]' + rGroup.groupID + '\\[/gid]', 'gi');
      message = message.replace(groupRegExp, replaceStr);
    }
  }

  const getReplaceHtmlFunc = function (getLink, getPlain) {
    return function (customId, customName) {
      if (noLink) {
        return getPlain ? getPlain(customId) : customName;
      }
      return getLink(customId, customName);
    };
  };

  // TODO: 了解此处各字符串是否已由后台encode
  // 话题
  let findCategory = function (id) {
    if (categories) {
      for (let i = 0, l = categories.length; i < l; i++) {
        if (categories[i].catID === id) {
          return categories[i];
        }
      }
    }
  };
  message = replaceMessageCustomTag(
    message,
    'cid',
    getReplaceHtmlFunc(
      function (id, name) {
        const category = findCategory(id);
        name = category ? category.catName : _l('未知话题');
        return '<a target="_blank" href="/feed?catId=' + id + '">#' + htmlEncodeReg(name) + '#</a>';
      },
      function (id, name) {
        const category = findCategory(id);
        name = category ? category.catName : _l('未知话题');
        return '#' + htmlEncodeReg(name) + '#';
      },
    ),
  );
  // 任务
  message = replaceMessageCustomTag(
    message,
    'tid',
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/task/task_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 项目
  message = replaceMessageCustomTag(
    message,
    'fid',
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/task/folder_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 日程
  message = replaceMessageCustomTag(
    message,
    ['[CALENDAR]', '[CALENDAR]'],
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/calendar/detail_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 问答中心
  message = replaceMessageCustomTag(
    message,
    ['[STARTANSWER]', '[ENDANSWER]'],
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/feeddetail?itemID=' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 文档版本
  message = replaceMessageCustomTag(
    message,
    ['[docversion]', '[docversion]'],
    getReplaceHtmlFunc(function (id, name) {
      return (
        '<a href="/feeddetail?itemID=' +
        id +
        '" target="_blank">' +
        (htmlEncodeReg(name.split('|')[0]) || '文件') +
        '</a>'
      );
    }),
  );

  if ((typeof filterFace === 'undefined' || !filterFace) && !noLink) {
    message = Emotion.parse(message);
  }

  message = message.replace(/<br( \/)?>/g, '\n'); // .replace(/<[^>]+>/g, '');

  if (!noLink) {
    message = message.replace(/\n/g, '<br>');
    let urlReg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=])?[^ <>\[\]*(){},\u4E00-\u9FA5]+/gi;

    message = message.replace(urlReg, function (m) {
      return '<a target="_blank" href="' + m + '">' + m + '</a>';
    });
  }

  // 外部用户
  if ((args.accountId || '').indexOf('a#') > -1) {
    message = message.replace(new RegExp(`\\[aid\\]${args.accountId}\\[\\/aid\\]`, 'g'), args.accountName);
  }

  return message;
};

// 验证网络是否到期异步
export const expireDialogAsync = function (projectId) {
  return new Promise((resolve, reject) => {
    // 个人
    if (!projectId) {
      resolve();
    } else {
      if (getCurrentProject(projectId, true).licenseType === 0) {
        upgradeVersionDialog({
          projectId,
          explainText: _l('请升级至付费版解锁开启'),
          isFree: true,
        });
        reject();
      } else {
        resolve();
      }
    }
  });
};

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

/**
 * base64 字符串转 blob
 * @param {*} b64Data
 * @param {*} contentType
 * @param {*} sliceSize
 * @returns
 */
export const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

/**
 * 获取翻译数据
 * @param {*} appId 应用id
 * @param {*} parentId 父级id (应用项id)
 * @param {*} id 项目id (应用项id、分组id、视图id、...)
 * @param {*} data 翻译包数据
 * @returns { name、description、hintText、... }
 */
export const getTranslateInfo = (appId, parentId, id, data) => {
  const langData = data || window[`langData-${appId}`] || [];
  const findCondition = { correlationId: id };
  if (parentId) {
    findCondition.parentId = parentId;
  }
  const info = _.find(langData, findCondition);
  return info ? info.data || {} : {};
};

/**
 * 获取应用的翻译包数据
 */
export const getAppLangDetail = appDetail => {
  const { langInfo } = appDetail;
  const appId = appDetail.id;
  return new Promise((reslove, reject) => {
    if (langInfo && langInfo.appLangId && langInfo.version !== window[`langVersion-${appId}`]) {
      appManagementApi
        .getAppLangDetail({
          projectId: appDetail.projectId,
          appId,
          appLangId: langInfo.appLangId,
        })
        .then(lang => {
          window[`langData-${appId}`] = lang.items;
          window[`langVersion-${appId}`] = langInfo.version;
          reslove(lang);
        });
    } else {
      reslove();
    }
  });
};

/**
 * 获取时区
 */
const getTimeZone = () => {
  const serverZone = md.global.Config.DefaultTimeZone; // 服务器时区
  const userZone = md.global.Account.timeZone === 1 ? new Date().getTimezoneOffset() * -1 : md.global.Account.timeZone; // 用户时区

  return { serverZone, userZone };
};

/**
 * 日期时间转为用户时区时间
 */
export const dateConvertToUserZone = date => {
  if (!date) return '';

  const { serverZone, userZone } = getTimeZone();

  return moment(date)
    .add(userZone - serverZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 日期时间转为服务器时区时间
 */
export const dateConvertToServerZone = date => {
  if (!date) return '';

  const { serverZone, userZone } = getTimeZone();

  return moment(date)
    .add(serverZone - userZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 数值千分位显示
 */
export const formatNumberThousand = value => {
  const content = (value || _.isNumber(value) ? value : '').toString();
  const reg = content.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
  return content.replace(reg, '$1,');
};
