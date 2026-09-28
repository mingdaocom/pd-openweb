import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import qiniuAjax from 'src/api/qiniu';

/**
 * 获取访问令牌后通过统一 API 发起 POST 请求。
 */
export async function postWithToken(url, tokenArgs = {}, body = {}, axiosConfig = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      throw '获取token失败';
    }
  }

  return window.mdyAPI(
    '',
    '',
    Object.assign({}, body, {
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    }),
    {
      customParseResponse: axiosConfig.responseType === 'blob',
      ajaxOptions: {
        url,
        responseType: axiosConfig.responseType,
      },
    },
  );
}

/**
 * 获取访问令牌后通过统一 API 发起 GET 请求。
 */
export async function getWithToken(url, tokenArgs = {}, body = {}) {
  let token;

  if (!_.get(window, 'shareState.shareId')) {
    token = await appManagementAjax.getToken(tokenArgs);

    if (!token) {
      throw '获取token失败';
    }
  }

  return window.mdyAPI(
    '',
    '',
    {
      ...body,
      token,
      accountId: md.global.Account.accountId,
      clientId: window.clientId || sessionStorage.getItem('clientId'),
    },
    {
      ajaxOptions: {
        type: 'GET',
        url,
      },
    },
  );
}

/**
 * 根据登录状态调用对应接口获取七牛上传凭证。
 */
export const getToken = (files, type = 0, args = {}, options = {}) => {
  if (!md.global.Account.accountId) {
    return qiniuAjax.getFileUploadToken({ files, type, ...args }, options);
  } else {
    return qiniuAjax.getUploadToken({ files, type, ...args }, options);
  }
};
