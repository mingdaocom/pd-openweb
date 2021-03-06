/* eslint-disable no-bitwise */
import qs from 'query-string';
import moment from 'moment';
import base64 from 'js-base64';
import { assign, trim, isObject, isEmpty } from 'lodash';
import { PICK_TYPE, ROOT_PERMISSION_TYPE, NODE_SORT_TYPE, NODE_SORT_BY } from '../constant/enum';

const base64encode = base64.Base64.encode;

function smi(i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}

function hashString(string) {
  let hash = 0;
  for (let ii = 0; ii < string.length; ii++) {
    hash = (31 * hash + string.charCodeAt(ii)) | 0;
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
    // eslint-disable-line no-restricted-syntax
    if ({}.hasOwnProperty.call(objA, key) && (!{}.hasOwnProperty.call(objB, key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    // eslint-disable-line no-restricted-syntax
    if ({}.hasOwnProperty.call(objB, key) && !{}.hasOwnProperty.call(objA, key)) {
      return false;
    }
  }
  return true;
}

/**
 * ????????????????????????????????????????????? 123.4 MB ????????????
 * @param  {Number} size  ????????? byte ??????????????????
 * @param  {Array}  accuracy ???????????????????????????
 * @param  {String} space ???????????????????????????????????????????????????
 * @param  {Array}  units ?????????????????????????????????????????? B ??????
 * @return {String}       ???????????????
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
 * ??????root name ??? link
 */
export function getRootNameAndLink(baseUrl, root) {
  if (root === PICK_TYPE.STARED) {
    return { name: _l('????????????'), link: baseUrl + '/stared' };
  } else if (root === PICK_TYPE.RECENT) {
    return { name: _l('????????????'), link: baseUrl + '/recent' };
  } else if (typeof root === 'object') {
    return { name: root.name, link: baseUrl + '/' + root.id };
  } else {
    return { name: _l('????????????'), link: baseUrl + '/my' };
  }
}

/**
 * ????????????????????????????????? TODO: ????????????????????????????????????????????????
 * @param  {String} str ??????????????????
 */
export function validateFileName(str, shouldAlert = true, out = null, options = {}) {
  str = trim(str);
  if (!str) {
    if (shouldAlert) {
      alert(_l('??????????????????'), 3);
    }
    if (out) {
      out.validName = null;
    }
    return false;
  }
  const maxLength = options.extLength ? 255 - options.extLength : 255;
  if (str.length > maxLength) {
    if (shouldAlert) {
      alert(_l('???????????????'), 3);
    }
    if (out) {
      out.validName = str.slice(0, maxLength);
    }
    return false;
  }
  const illegalChars = /[\/\\:\*\?"<>\|]/g;
  const valid = !illegalChars.test(str);
  if (!valid) {
    if (shouldAlert) {
      alert(_l('?????????????????????????????????') + '\\ / : * ? " < > |', 3);
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

/** ??????????????????????????????????????? */
export function getDefaultSortType(sortBy) {
  if (sortBy === NODE_SORT_BY.NAME) {
    return NODE_SORT_TYPE.ASC;
  }
  return NODE_SORT_TYPE.DESC;
}

/**
 * ????????????
 * @param  {String}  header           ??????
 * @param  {String}  content          ??????
 * @param  {String}  ckText           ???????????????
 * @param  {String}  minorContent     ??????
 * @param  {Boolean|String} yesText   ????????????????????????????????? false ?????????????????????
 * @param  {Boolean|String} noText    ????????????????????????????????? false ?????????????????????
 * @return {Promise}                  [description]
 */
export function confirm(
  header,
  content,
  showClose = true,
  ckText = undefined,
  minorContent = undefined,
  yesText = undefined,
  noText = undefined,
  className = '',
) {
  const dfd = $.Deferred();
  const container = {
    dialogBoxID: Math.random(),
    header, // '??????',
    content, // '???????????????????????????',
    ckText,
    minorContent,
  };
  if (yesText === false) {
    container.yesFn = false;
  } else {
    container.yesFn = checked => dfd.resolve(checked);
    container.yesText = yesText;
  }
  if (noText === false) {
    container.noFn = false;
  } else {
    container.noFn = () => dfd.reject();
    container.noText = noText;
  }

  require(['mdDialog'], mdDialog => {
    mdDialog.index({
      showClose,
      className: className || null,
      container,
    });
  });
  return dfd.promise();
}

/**
 * ?????????????????????????????????
 * @param  {String|Date|Moment} time ??????
 * @return {String}                  ???????????????
 */
export function humanDateTime(time) {
  time = moment(time);
  const todayStart = moment().startOf('day');
  const diff = todayStart.diff(time);
  if (diff < 0) {
    return '?????? ' + time.format('HH:mm');
  } else if (diff < 86400000) {
    return '?????? ' + time.format('HH:mm');
  }
  return time.format('YYYY-MM-DD');
}

/**
 * URL?????????Base64??????
 **/
export function getUrlBase64Encode(str) {
  return base64encode(str).replace(/\//g, '_').replace(/\+/g, '-');
}

let isIe;
export function isIE() {
  isIe =
    isIe ||
    (function () {
      let undef;
      let rv = -1; // Return value assumes failure.
      const ua = window.navigator.userAgent;
      const msie = ua.indexOf('MSIE ');
      const trident = ua.indexOf('Trident/');

      if (msie > 0) {
        // IE 10 or older => return version number
        rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
      } else if (trident > 0) {
        // IE 11 (or newer) => return version number
        const rvNum = ua.indexOf('rv:');
        rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
      }

      return rv > -1 ? rv : undef;
    })();
  return isIe;
}

/**
 * ?????????????????????
 * @param  {String}  name        ?????????
 * @param  {Boolean} toLowerCase ?????????????????????
 * @return {String}              ?????????
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
 * ?????????????????????????????????
 * @param  {String} ext ?????????
 * @return {String} ?????????
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

export function wait(ms) {
  const dfd = $.Deferred();
  setTimeout(() => dfd.resolve(), ms);
  return dfd.promise();
}

export function isOffice(fileExt) {
  var fileExts = ['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) !== -1;
  }
  return false;
}
