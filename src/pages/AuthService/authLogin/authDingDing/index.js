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
      location.replace(decodeURIComponent(url));
    } else {
      location.replace(isMobile ? `/mobile` : `/app`);
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/DingDingAppLogin',
      data: {
        code,
        state,
        type: 2,
      },
      async: true,
      success: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          getGlobalMeta().then(() => {
            setPssId(sessionId);
            if (checkOriginUrl(url)) {
              location.replace(decodeURIComponent(url));
            } else {
              location.replace(isMobile ? `/mobile` : `/app`);
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
      location.replace(newUrl);
    } else {
      location.replace(isMobile ? `/mobile` : `/app`);
    }
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];
    ajax.post({
      url: __api_server__.main + 'Login/GetDingDingCorpInfo',
      data: {
        projectId,
      },
      async: true,
      success: result => {
        const { clientId, state } = result.data;
        const defaultCallBackUrl = 'https://login.dingtalk.com/oauth2/auth';
        const redirect_uri = encodeURIComponent(
          `${location.origin}/auth/dingding?url=${newUrl ? encodeURIComponent(newUrl) : ''}`,
        );
        location.replace(
          `${defaultCallBackUrl}?redirect_uri=${redirect_uri}&response_type=code&client_id=${clientId}&scope=openid&state=${state}&prompt=consent`,
        );
      },
      error: login,
    });
  }
}
