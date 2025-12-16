import { get } from 'lodash';
import moment from 'moment';

/**
 * Cookies 写入
 * @param {string} name - Cookie名称
 * @param {string} value - Cookie值
 * @param {Date} expire - 过期时间
 */
window.setCookie = function setCookie(name, value, expire) {
  if (get(window, 'md.global.Config.HttpOnly') && name === 'md_pss_id') {
    safeLocalStorageSetItem(name, value);
    return;
  }

  // 过期时间处理
  const expiration = expire ? moment(expire).toDate() : moment().add(10, 'days').toDate();
  const secure = location.protocol.indexOf('https') > -1 ? 'Secure;' : '';
  const cookieString = [
    `expires=${expiration.toGMTString()}`,
    'path=/',
    `domain=${document.domain.indexOf('mingdao.com') === -1 ? '' : '.mingdao.com'}`,
    'SameSite=Lax',
  ].join(';');

  document.cookie = `${name}=${escape(value)};${secure}${cookieString}`;
};

/**
 * Cookies 读取
 * @param {string} name - Cookie名称
 * @returns {string|null} - Cookie值
 */
window.getCookie = function getCookie(name) {
  if (get(window, 'md.global.Config.HttpOnly') && name === 'md_pss_id') {
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
