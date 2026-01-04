import { get } from 'lodash';
import moment from 'moment';

/**
 * 设置 md_pss_id
 * @param {string} id
 */
export const setPssId = (id, verification = false) => {
  if (id) {
    const isLocal = get(window, 'md.global.Config.IsLocal');
    const sessionCookieExpireMinutes = get(window, 'md.global.Config.SessionCookieExpireMinutes');
    const httpOnly = get(window, 'md.global.Config.HttpOnly');

    if (isLocal && sessionCookieExpireMinutes) {
      const expireDate = moment().add(sessionCookieExpireMinutes, 'm').toDate();
      window.setCookie('md_pss_id', id, expireDate);
    } else if (
      verification ||
      window.isDingTalk ||
      window.isMiniProgram ||
      window.isFeiShu ||
      process.env.NODE_ENV === 'development' ||
      location.href.indexOf('localhost') > -1
    ) {
      window.setCookie('md_pss_id', id);
    }

    if (window.top !== window.self || httpOnly) {
      window.localStorage.setItem('md_pss_id', id);
    }
  }
};

/**
 * 获取 md_pss_id
 * @returns {string} md_pss_id
 */
export const getPssId = () => {
  const storagePssId = window.localStorage.getItem('md_pss_id');
  const cookiePssId = window.getCookie('md_pss_id');

  return cookiePssId || storagePssId;
};

/**
 * 删除 md_pss_id
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');
  window.localStorage.removeItem('md_pss_id');
};
