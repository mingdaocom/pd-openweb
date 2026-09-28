import { setPssId } from 'src/utils/platform/auth/pssId';
import { pathCompletion } from 'src/utils/platform/navigation/path';
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
} from 'src/utils/services/auth/sso';

const { code, state, url, p, ...otherParam } = getRequest();
const isMobile = browserIsMobile();

if (code) {
  if (checkLogin()) {
    const safeUrl = checkOriginUrl(url);

    if (safeUrl) {
      location.replace(safeUrl);
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
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
            const safeUrl = checkOriginUrl(url);

            if (safeUrl) {
              location.replace(safeUrl);
            } else {
              location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
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
    const safeUrl = checkOriginUrl(newUrl);

    if (safeUrl) {
      location.replace(safeUrl);
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
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
          pathCompletion(`/auth/workwx?url=${newUrl ? encodeURIComponent(newUrl) : ''}`),
          {
            hasDomain: true,
            localHasDomain: true,
          },
        );

        if (agentId) {
          location.replace(
            `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`,
          );
        } else {
          location.replace(
            `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`,
          );
        }
      },
      error: login,
    });
  }
}
