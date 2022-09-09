/**
 * 设置 md_pss_id
 * @param {string} id
 */
export const setPssId = (id, verification = false) => {
  if (id) {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (
      verification ||
      userAgent.includes('dingtalk') ||
      userAgent.includes('miniprogram') ||
      location.href.indexOf('theportal.cn') > -1 ||
      location.href.indexOf('localhost') > -1
    ) {
      window.setCookie('md_pss_id', id);
    }

    window.top !== window.self && safeLocalStorageSetItem('md_pss_id', id);
  }
};

/**
 * 获取 md_pss_id
 * @returns {string} md_pss_id
 */
export const getPssId = () => {
  const storagePssId = window.localStorage.getItem('md_pss_id');
  const cookiePssId = window.getCookie('md_pss_id');

  // 兼容旧的用户一直登录着未退出的特殊情况
  window.top === window.self && window.localStorage.removeItem('md_pss_id');
  return cookiePssId || storagePssId;
};

/**
 * 删除 md_pss_id
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');
  window.localStorage.removeItem('md_pss_id');
};
