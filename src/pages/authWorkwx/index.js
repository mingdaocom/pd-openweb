import { ajax, login, browserIsMobile, getRequest, checkLogin } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';

const { code, state, url, p } = getRequest();
const isMobile = browserIsMobile();

if (code) {
  if (checkLogin()) {
    if (url) {
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
      succees: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          // const date = new Date();
          // date.setTime(date.getTime()+24 * 60 * 60 * 1000);
          // setCookie('md_pss_id', sessionId, date);
          setPssId(sessionId);
          if (url) {
            location.href = decodeURIComponent(url);
          } else {
            location.href = isMobile ? `/mobile` : `/app`;
          }
        }
      },
      error: login,
    });
  }
} else {
  if (checkLogin()) {
    if (url) {
      location.href = url;
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
      succees: result => {
        const { corpId, state } = result.data;
        const redirect_uri = encodeURIComponent(
          `${location.origin}/auth/workwx?url=${url ? encodeURIComponent(url) : ''}`,
        );
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
      },
      error: login,
    });
  }
}
