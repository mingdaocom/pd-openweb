import { setPssId } from 'src/utils/pssId';
import { ajax, browserIsMobile, checkLogin, checkOriginUrl, getGlobalMeta, getRequest, login } from 'src/utils/sso';

const { code, i, s, ret, source, url, state } = getRequest();
const isMobile = browserIsMobile();

if (source === 'wxwork') {
  if (checkLogin()) {
    if (checkOriginUrl(url)) {
      location.replace(decodeURIComponent(url));
    } else {
      location.replace(isMobile ? `/mobile` : `/app`);
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
  if (checkLogin()) {
    if (checkOriginUrl(ret)) {
      location.replace(ret);
    } else {
      location.replace(isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`);
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
          if (checkOriginUrl(ret)) {
            location.replace(ret);
          } else {
            location.replace(isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`);
          }
        } else {
          alert('登录失败');
          login();
        }
      },
      error: login,
    });
  }
}
