
/**
 * 设置 md_pss_id
 * @param {string} id
 */
export const setPssId = id => {
  if (id) {
    window.setCookie('md_pss_id', id);
    window.localStorage.setItem('md_pss_id', id);
  }
}

/**
 * 获取 md_pss_id
 * @returns {string} md_pss_id
 */
export const getPssId = id => {
  const storagePssId = window.localStorage.getItem('md_pss_id');
  const cookiePssId = window.getCookie('md_pss_id');
  if (cookiePssId && storagePssId !== cookiePssId) {
    window.localStorage.setItem('md_pss_id', cookiePssId);
  }
  return cookiePssId || storagePssId;
}

/**
 * 删除 md_pss_id
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');
  window.localStorage.removeItem('md_pss_id');
}
