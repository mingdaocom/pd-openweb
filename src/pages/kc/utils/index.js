import React from 'react';
import { assign, isEmpty, isObject, trim } from 'lodash';
import _ from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import Dialog from 'ming-ui/components/Dialog';
import { NODE_SORT_BY, NODE_SORT_TYPE, PICK_TYPE, ROOT_PERMISSION_TYPE } from '../constant/enum';

function smi(i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}

function hashString(string) {
  let hash = 0;
  for (let ii = 0; ii < string.length; ii++) {
    hash = Math.trunc(31 * hash + string.charCodeAt(ii));
  }
  return smi(hash);
}
export function getRootByPath(path) {
  let result = {};
  if (/^my([/?].*)?$/.test(path)) {
    result = {
      type: PICK_TYPE.MY,
      queryPath: path.match(/^my(.*)$/)[1],
    };
  } else if (/^recent([/?].*)?$/.test(path)) {
    result = {
      type: PICK_TYPE.RECENT,
      queryPath: path.match(/^recent(.*)$/)[1],
    };
  } else if (/^recycled([/?].*)?$/.test(path)) {
    result = assign({}, getRootByPath(path.match(/^recycled\/(.*)$/)[1]), {
      isRecycle: true,
    });
  } else if (/^stared([/?].*)?$/.test(path)) {
    result = {
      type: PICK_TYPE.STARED,
      queryPath: path.match(/^stared(.*)$/)[1],
    };
  } else if (/^[a-zA-Z0-9]{24}([/?].*)?$/.test(path)) {
    result = {
      type: PICK_TYPE.ROOT,
      queryPath: path,
    };
  } else {
    result = {
      type: -9999,
    };
  }
  if (location.search && qs.parse(location.search.slice(1)).q) {
    result.keywords = qs.parse(location.search.slice(1)).q;
    result.isSearch = true;
  }
  if (result.queryPath) {
    result.queryPath = unescape(result.queryPath);
  }
  return result;
}

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  let key;
  // Test for A's keys different from B.
  for (key in objA) {
    if ({}.hasOwnProperty.call(objA, key) && (!{}.hasOwnProperty.call(objB, key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if ({}.hasOwnProperty.call(objB, key) && !{}.hasOwnProperty.call(objA, key)) {
      return false;
    }
  }
  return true;
}

/**
 * 将文件大小转换成可读的格式，即 123.4 MB 这种类型
 * @param  {Number} size  文件以 byte 为单位的大小
 * @param  {Array}  accuracy 小数点后保留的位数
 * @param  {String} space 数字和单位间的内容，默认为一个空格
 * @param  {Array}  units 自定义文件大小单位的数组，从 B 开始
 * @return {String}       可读的格式
 */
export function humanFileSize(size, accuracy = 0, space = ' ', units = ['B', 'KB', 'MB', 'GB', 'TB']) {
  if (!size) {
    return '0' + space + units[0];
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(accuracy) * 1 + space + units[i];
}

export function IdItem(item) {
  return assign(this, item);
}
IdItem.prototype.hashCode = function hashCode() {
  return this.id ? hashString(this.id) : 0;
};
IdItem.prototype.equals = function equals(item) {
  return this === item || (this && item && this.id === item.id);
};

/*
 * 获取root name 和 link
 */
export function getRootNameAndLink(baseUrl, root) {
  if (root === PICK_TYPE.STARED) {
    return { name: _l('星标文件'), link: baseUrl + '/stared' };
  } else if (root === PICK_TYPE.RECENT) {
    return { name: _l('最近使用'), link: baseUrl + '/recent' };
  } else if (typeof root === 'object') {
    return { name: root.name, link: baseUrl + '/' + root.id };
  } else {
    return { name: _l('我的文件'), link: baseUrl + '/my' };
  }
}

/**
 * 移除文件名中的非法字符
 * @param  {String} str 传入的字符串
 */
export function validateFileName(str, shouldAlert = true, out = null, options = {}) {
  str = trim(str);
  if (!str) {
    if (shouldAlert) {
      alert(_l('名称不能为空'), 3);
    }
    if (out) {
      out.validName = null;
    }
    return false;
  }
  const maxLength = options.extLength ? 255 - options.extLength : 255;
  if (str.length > maxLength) {
    if (shouldAlert) {
      alert(_l('文件名过长'), 3);
    }
    if (out) {
      out.validName = str.slice(0, maxLength);
    }
    return false;
  }
  const illegalChars = /[/\\:*?"<>|]/g;
  const valid = !illegalChars.test(str);
  if (!valid) {
    if (shouldAlert) {
      alert(_l('名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
    }
    if (out) {
      out.validName = str.replace(illegalChars, '') || null;
    }
  }
  return valid;
}

export function getRootId(root) {
  return isObject(root) ? root.id : '';
}

export function getParentId(folder, root) {
  if (folder && !isEmpty(folder)) {
    return folder.id;
  } else if (isObject(root)) {
    return root.id;
  }
  return '';
}

export function getParentName(folder, root) {
  if (folder && !isEmpty(folder)) {
    return folder.name;
  } else if (isObject(root)) {
    return root.name;
  }
  return '';
}

export function getLocationType(folder, root) {
  if (folder && !isEmpty(folder)) {
    return PICK_TYPE.NODE;
  }
  return typeof root === 'object' ? PICK_TYPE.ROOT : root;
}

export function getPermission(root) {
  if (typeof root !== 'object') {
    return true;
  }
  return root.permission === ROOT_PERMISSION_TYPE.OWNER || root.permission === ROOT_PERMISSION_TYPE.ADMIN;
}

/** 获取某个字段的默认排序类型 */
export function getDefaultSortType(sortBy) {
  if (sortBy === NODE_SORT_BY.NAME) {
    return NODE_SORT_TYPE.ASC;
  }
  return NODE_SORT_TYPE.DESC;
}

/**
 * 确认弹层
 * @param  {String}  header           标题
 * @param  {String}  content          内容
 * @param  {String}  ckText           复选框文字
 * @param  {String}  minorContent     注脚
 * @param  {Boolean|String} yesText   确认按钮的内容，如果为 false 不显示确认按钮
 * @param  {Boolean|String} noText    取消按钮的内容，如果为 false 不显示取消按钮
 * @return {Promise}                  [description]
 */
export function confirm(header, content, showClose, ckText, minorContent, yesText = undefined, noText = undefined) {
  return new Promise((resolve, reject) => {
    const container = {};
    if (yesText === false) {
      container.removeOkBtn = true;
    } else {
      container.onOk = checked => resolve(checked);
      container.okText = yesText;
    }
    if (noText === false) {
      container.removeCancelBtn = true;
    } else {
      container.onCancel = () => reject();
      container.cancelText = noText;
    }

    Dialog.confirm({
      dialogClasses: Math.random(),
      title: header,
      children: <div dangerouslySetInnerHTML={{ __html: content }}></div>,
      ...container,
    });
  });
}

/**
 * 时间格式化成特定的格式
 * @param  {String|Date|Moment} time 时间
 * @return {String}                  可读的格式
 */
export function humanDateTime(time) {
  time = moment(time);
  const todayStart = moment().startOf('day');
  const diff = todayStart.diff(time);
  if (diff < 0) {
    return '今天 ' + time.format('HH:mm');
  } else if (diff < 86400000) {
    return '昨天 ' + time.format('HH:mm');
  }
  return time.format('YYYY-MM-DD');
}

/**
 * URL安全的Base64编码
 **/
export function getUrlBase64Encode(str) {
  return btoa(str).replace(/\//g, '_').replace(/\+/g, '-');
}

/**
 * 获取文件扩展名
 * @param  {String}  name        文件名
 * @param  {Boolean} toLowerCase 是否转换为小写
 * @return {String}              扩展名
 */
export function getFileExt(name, toLowerCase = false) {
  if (!name || name.indexOf('.') === -1) {
    return '';
  }
  const arr = name.split('.');
  const ext = arr[arr.length - 1];
  if (ext) {
    return toLowerCase ? ext.toLowerCase() : ext;
  }
  return '';
}

/**
 * 根据扩展名获取图标名称
 * @param  {String} ext 扩展名
 * @return {String} 图标名
 */
export function getFileIconNameByExt(ext) {
  if (ext === false) {
    return 'folder';
  }
  switch (ext && ext.toLowerCase()) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
      return 'img';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'doc':
    case 'docx':
    case 'dot':
      return 'word';
    case 'ppt':
    case 'pptx':
    case 'pps':
      return 'ppt';
    case 'url':
      return 'link';
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
      return ext.toLowerCase();
    default:
      return 'doc';
  }
}

export function isOffice(fileExt) {
  var fileExts = ['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) !== -1;
  }
  return false;
}

export function isWpsPreview(fileExt, isEdit) {
  var fileExts = [
    'doc',
    'dot',
    'wps',
    'wpt',
    'docx',
    'dotx',
    'docm',
    'dotm',
    'rtf',
    'txt',
    'xls',
    'xlt',
    'et',
    'xlsx',
    'xltx',
    'csv',
    'xlsm',
    'xltm',
    'ett',
    'ppt',
    'pptx',
    'pptm',
    'ppsx',
    'ppsm',
    'pps',
    'potx',
    'potm',
    'dpt',
    'dps',
    'pot',
    'ofd',
  ];
  if (isEdit) {
    fileExts = fileExts.filter(v => !_.includes(['rtf', 'txt', 'csv'], v)).concat('pdf');
  }
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) !== -1;
  }
  return false;
}

export function defaultWpsPreview(ext) {
  const fileExts = ['wps', 'wpt', 'et', 'dpt', 'dps'];
  return ext && fileExts.indexOf(ext.toLowerCase()) !== -1;
}

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
  return `${config[bucketName] || md.global.FileStoreConfig.pictureHost}/`;
};
