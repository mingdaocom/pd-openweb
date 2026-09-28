import { get } from 'lodash';

const RegExpValidator = {};

/**
 * 判断字符串是否符合常规电子邮箱格式。
 */
RegExpValidator.isEmail = function (str) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(str);
};

/**
 * 校验字符串是否为带 http 或 https 协议的完整网址。
 */
RegExpValidator.isURL = function (str) {
  const pattern = /^http(s)?:\/\/[A-Za-z0-9-]+\.[A-Za-z0-9-]+[/=?%\-&_~`@[\]:+!]*([^<>])*$/;
  return pattern.exec(str);
};

/**
 * 根据文件扩展名判断是否为受支持的视频格式。
 */
RegExpValidator.isVideo = fileExt => {
  return /.*?\.(mov|mp4|avi|mkv|3gp|3g2|m4v|rm|rmvb|webm)$/.test((fileExt || '').toLowerCase());
};

// 验证一个字符串是否是链接
RegExpValidator.isUrlRequest = url => {
  if (/^data:|^chrome-extension:|^(https?:)?\/\/|^[{}[\]#*;,'§$%&(=?`´^°<>]/.test(url)) return true;
  if (/^\//.test(url)) return true;
  return false;
};

/**
 * 判断字符串是否为 HTTP 或 HTTPS 绝对地址。
 */
RegExpValidator.isUrlRequest = url => {
  try {
    return ['http:', 'https:'].includes(new URL(String(url)).protocol);
  } catch {
    return false;
  }
};

/**
 * 从文件名末尾提取不带点号的扩展名。
 * @param {string} fileName - 文件名
 * @returns {string} - 文件扩展名
 */
RegExpValidator.getExtOfFileName = (fileName = '') => {
  return get(String(fileName).match(/\.([0-9a-z_A-Z]+)$/), '1') || '';
};

/**
 * 从路径或文件名中移除最后一个扩展名。
 * @param {string} fileName - 文件名
 * @returns {string} - 文件名（不包含扩展名）
 */
RegExpValidator.getNameOfFileName = (fileName = '') => {
  const base = String(fileName).split(/[\\/]/).pop();
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(0, dot) : base;
};

/**
 * 判断文件扩展名是否不在可执行或快捷方式黑名单中。
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 文件扩展名是否有效
 */
RegExpValidator.validateFileExt = function (fileExt = '') {
  return !/^\.(exe|vbs|bat|cmd|com|url)$/.test(String(fileExt).toLowerCase());
};

/**
 * 判断文件扩展名是否属于支持预览的图片格式。
 * @param {string} fileExt - 文件扩展名
 * @returns {boolean} - 是否属于支持的图片格式
 */
RegExpValidator.fileIsPicture = function (fileExt = '') {
  return /^\.(jpg|gif|png|jpeg|bmp|webp|heic|heif|svg|tif|tiff)$/.test(String(fileExt).toLowerCase());
};

export default RegExpValidator;
