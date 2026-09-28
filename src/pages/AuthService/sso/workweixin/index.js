import { setPssId } from 'src/utils/platform/auth/pssId';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import {
  ajax,
  browserIsMobile,
  checkLogin,
  checkOriginUrl,
  getGlobalMeta,
  getRequest,
  login,
} from 'src/utils/services/auth/sso';

const { code, i, s, ret, source, url, state } = getRequest();
const isMobile = browserIsMobile();

if (source === 'wxwork') {
  if (checkLogin()) {
    const safeUrl = checkOriginUrl(url);

    if (safeUrl) {
      location.replace(safeUrl);
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinH5Login',
      data: {
        code,
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
  if (checkLogin()) {
    const safeUrl = checkOriginUrl(ret);

    if (safeUrl) {
      location.replace(safeUrl);
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`));
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinAppLogin',
      data: {
        code,
        state,
        apkId: i,
        secretId: s,
      },
      async: true,
      success: result => {
        const { accountResult, sessionId } = result.data;

        if (accountResult === 1) {
          setPssId(sessionId);
          const safeUrl = checkOriginUrl(ret);

          if (safeUrl) {
            location.replace(safeUrl);
          } else {
            location.replace(pathCompletion(isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`));
          }
        } else {
          login();
        }
      },
      error: login,
    });
  }
}
