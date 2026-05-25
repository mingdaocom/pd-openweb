import { get } from 'lodash';

const getLocalStorage = () => get(window, 'localStorage');

/**
 * 设置 md_pss_id
 * @param {string} id
 */
export const setPssId = (id, verification = false) => {
  if (id) {
    const httpOnly = get(window, 'md.global.Config.HttpOnly');

    if (
      verification ||
      window.isDingTalk ||
      window.isMiniProgram ||
      window.isFeiShu ||
      process.env.NODE_ENV === 'development' ||
      location.href.indexOf('theportal.cn') > -1 ||
      location.href.indexOf('localhost') > -1 ||
      location.href.indexOf('share.mingdao.net') > -1 ||
      location.href.indexOf('mingdaoyun.cn') > -1 ||
      location.href.indexOf('open_in_browser') > -1
    ) {
      window.setCookie('md_pss_id', id);
    }

    const localStorage = getLocalStorage();

    if ((window.top !== window.self || httpOnly) && localStorage) {
      localStorage.setItem('md_pss_id', id);
    }
  }
};

/**
 * 获取 md_pss_id
 * @returns {string} md_pss_id
 */
export const getPssId = () => {
  const localStorage = getLocalStorage();
  const storagePssId = localStorage ? localStorage.getItem('md_pss_id') : '';
  const cookiePssId = window.getCookie('md_pss_id');

  return cookiePssId || storagePssId;
};

/**
 * 删除 md_pss_id
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');

  const localStorage = getLocalStorage();

  if (localStorage) {
    localStorage.removeItem('md_pss_id');
  }
};
