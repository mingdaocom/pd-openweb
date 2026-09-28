import { get } from 'lodash';
import { setLocalStorageItemSafely } from 'src/utils/platform/storage/safe';

const getLocalStorage = () => get(window, 'localStorage');

/**
 * 按运行环境将登录会话标识写入 Cookie，并在 iframe 或 HttpOnly 场景同步到本地存储。
 * @param {string} id
 */
export const setPssId = (id, verification = false) => {
  if (id) {
    const httpOnly = get(window, 'md.global.Config.HttpOnly');
    const isLocal = get(window, 'md.global.Config.IsLocal');

    if (
      verification ||
      window.isDingTalk ||
      window.isMiniProgram ||
      window.isFeiShu ||
      process.env.NODE_ENV === 'development' ||
      location.href.indexOf('theportal.cn') > -1 ||
      location.href.indexOf('localhost') > -1 ||
      location.href.indexOf('share.mingdao.net') > -1 ||
      (!isLocal && location.href.indexOf('mingdaoyun.cn') > -1) ||
      location.href.indexOf('open_in_browser') > -1
    ) {
      window.setCookie('md_pss_id', id);
    }

    const localStorage = getLocalStorage();

    if ((window.top !== window.self || httpOnly) && localStorage) {
      setLocalStorageItemSafely('md_pss_id', id);
    }
  }
};

/**
 * 优先从 Cookie、其次从本地存储读取登录会话标识。
 * @returns {string} md_pss_id
 */
export const getPssId = () => {
  const localStorage = getLocalStorage();
  const storagePssId = localStorage ? localStorage.getItem('md_pss_id') : '';
  const cookiePssId = window.getCookie('md_pss_id');

  return cookiePssId || storagePssId;
};

/**
 * 同时清除 Cookie 与本地存储中的登录会话标识。
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');

  const localStorage = getLocalStorage();

  if (localStorage) {
    localStorage.removeItem('md_pss_id');
  }
};
