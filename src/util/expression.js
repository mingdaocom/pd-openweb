import { get } from 'lodash';
const RegExpValidator = {};

// 验证一个字符串是email
RegExpValidator.isEmail = function (str) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(str);
};

// 验证一个字符串是网址
RegExpValidator.isURL = function (str) {
  const pattern = /^http(s)?:\/\/[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+[\/=\?%\-&_~`@[\]:+!]*([^<>])*$/;
  return pattern.exec(str);
};

// 验证密码格式是否符合
RegExpValidator.isPasswordValid = function (str) {
  const regex = _.get(md, 'global.SysSettings.passwordRegex')
    ? new RegExp(_.get(md, 'global.SysSettings.passwordRegex'))
    : /^(?=.*\d)(?=.*[a-zA-Z]).{8,20}$/;
  return regex.test(str);
};

// 判断是视频格式
RegExpValidator.isVideo = fileExt => {
  return /.*?\.(mov|mp4|avi|mkv|3gp|3g2|m4v|rm|rmvb|webm)$/.test((fileExt || '').toLowerCase());
};

// 验证一个字符串是否是链接
RegExpValidator.isUrlRequest = url => {
  if (/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return true;
  if (/^\//.test(url)) return true;
  return false;
};

/**
 * 获取文件拓展名
 * @param {string} fileName - 文件名
 * @returns {string} - 文件扩展名
 */
RegExpValidator.getExtOfFileName = (fileName = '') => {
  return get(String(fileName).match(/\.([0-9a-z\_A-Z]+)$/), '1') || '';
};

/**
 * 获取文件名（不包含扩展名）
 * @param {string} fileName - 文件名
 * @returns {string} - 文件名（不包含扩展名）
 */
RegExpValidator.getNameOfFileName = (fileName = '') => {
  return String(fileName).replace(/\.[0-9a-zA-Z]+$/, '');
};

/**
 * 检查文件扩展名是否有效
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 文件扩展名是否有效
 */
RegExpValidator.validateFileExt = function (fileExt = '') {
  return !/^\.(exe|vbs|bat|cmd|com|url)$/.test(String(fileExt).toLowerCase());
};

/**
 * 检查文件扩展名是否有效
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 文件扩展名是否有效
 */
RegExpValidator.fileIsPicture = function (fileExt = '') {
  return /^\.(jpg|gif|png|jpeg|bmp|webp|heic|heif|svg|tif|tiff)$/.test(String(fileExt).toLowerCase());
};

export default RegExpValidator;
