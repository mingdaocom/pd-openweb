import qs from 'query-string';
import { getPssId } from 'src/utils/platform/auth/pssId';

/**
 * 通过临时 Object URL 下载 Blob，并在触发下载后释放资源。
 */
export function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 根据运行环境为文件下载地址补充合适的认证参数。
 */
export const downloadFile = url => {
  if (window.isDingTalk) {
    const [, search] = decodeURIComponent(url).split('?');
    const { validation } = qs.parse(search);
    return addToken(url, validation ? true : false);
  } else {
    return addToken(url, md.global.Config.HttpOnly || window.self !== window.top ? false : true);
  }
};

/**
 * 在需要显式认证的下载地址中追加当前会话标识。
 * @param {string} url
 * @returns {string} url
 */
export const addToken = (url, verificationId = true) => {
  const id = window.getCookie('md_pss_id') || window.localStorage.getItem('md_pss_id');

  if (verificationId && id && !md.global.Account.isPortal) {
    return url;
  }

  if (url.includes('?')) {
    return `${url}&md_pss_id=${getPssId()}`;
  } else {
    return `${url}?md_pss_id=${getPssId()}`;
  }
};
