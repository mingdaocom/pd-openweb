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
      url: __api_server__.main + 'Login/FeishuAppLoginByApp',
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
      url: __api_server__.main + 'Login/GetFeishuCorpInfoByApp',
      data: {
        projectId,
      },
      async: true,
      success: result => {
        const { agentId, state, callBackUrl, isLark } = result.data;
        const defaultCallBackUrl = isLark ? 'https://accounts.larksuite.com' : 'https://open.feishu.cn/open-apis';
        const redirect_uri = encodeURIComponent(
          pathCompletion(`/auth/feishu?url=${newUrl ? encodeURIComponent(newUrl) : ''}&open_in_browser=true`, {
            hasDomain: true,
            localHasDomain: true,
          }),
        );
        location.replace(
          `${
            callBackUrl || defaultCallBackUrl
          }/authen/v1/index?redirect_uri=${redirect_uri}&app_id=${agentId}&state=${state}`,
        );
      },
      error: login,
    });
  }
}
