import { setPssId } from 'src/utils/pssId';
import {
  addOtherParam,
  ajax,
  browserIsMobile,
  checkLogin,
  checkOriginUrl,
  formatOtherParam,
  getGlobalMeta,
  getRequest,
  login,
} from 'src/utils/sso';

const { code, state, url, p, ...otherParam } = getRequest();
const isMobile = browserIsMobile();

if (code) {
  if (checkLogin()) {
    if (checkOriginUrl(url)) {
      location.href = decodeURIComponent(url);
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinAppLoginByApp',
      data: {
        code,
        state,
      },
      async: true,
      success: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          getGlobalMeta().then(() => {
            setPssId(sessionId);
            if (checkOriginUrl(url)) {
              location.href = decodeURIComponent(url);
            } else {
              location.href = isMobile ? `/mobile` : `/app`;
            }
          });
        }
      },
      error: login,
    });
  }
} else {
  const otherParamString = formatOtherParam(otherParam);
  const newUrl = addOtherParam(url, otherParamString);
  if (checkLogin()) {
    if (checkOriginUrl(newUrl)) {
      location.href = newUrl;
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];
    ajax.post({
      url: __api_server__.main + 'Login/GetWorkWeiXinCorpInfoByApp',
      data: {
        projectId,
      },
      async: true,
      success: result => {
        const { corpId, agentId, state } = result.data;
        const redirect_uri = encodeURIComponent(
          `${location.origin}/auth/workwx?url=${newUrl ? encodeURIComponent(newUrl) : ''}`,
        );
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
      },
      error: login,
    });
  }
}
