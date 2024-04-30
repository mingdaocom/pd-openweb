import loginController from 'src/api/login';
import workWeiXinController from 'src/api/workWeiXin';

// 在集成环境如果 ReturnUrl 包含 appId，去 sso 页面登录
export const ssoLogin = (returnUrl = '') => {
  const getAppId = pathname => {
    if (pathname.includes('mobile')) {
      const match = pathname.match(/\/mobile\/([^\/]+)\/([^\/]+)/);
      return match && match[2];
    } else if (pathname.includes('embed/view')) {
      const match = pathname.match(/\/embed\/view\/([^\/]+)/);
      return match && match[1];
    } else {
      const match = pathname.match(/\/app\/([^\/]+)/);
      return match && match[1];
    }
  };
  const isApp = window.isDingTalk || window.isWxWork || window.isWeLink || window.isFeiShu;
  if (isApp && returnUrl) {
    const { pathname, search } = new URL(returnUrl);
    const appId = getAppId(pathname);
    if (appId) {
      workWeiXinController
        .getIntergrationInfo({
          appId,
        })
        .then(data => {
          const { item1, item2 } = data;
          const url = encodeURIComponent(pathname + search);
          // 钉钉
          if (item1 === 1) {
            const url = encodeURIComponent(pathname.replace(/^\//, '') + search);
            location.href = `/sso/sso?t=2&p=${item2}&ret=${url}`;
          }
          // 企业微信
          if (item1 === 3) {
            location.href = `/auth/workwx?p=${item2}&url=${url}`;
          }
          // welink
          if (item1 === 4) {
            location.href = `/auth/welink?p=${item2}&url=${url}`;
          }
          // 飞书
          if (item1 === 6) {
            location.href = `/auth/feishu?p=${item2}&url=${url}`;
          }
        });
    }
  }
};

export const getWorkWeiXinCorpInfoByApp = (projectId, returnUrl = '') => {
  loginController
    .getWorkWeiXinCorpInfoByApp({
      projectId,
    })
    .then(result => {
      const { corpId, state, agentId, scanUrl } = result;
      const redirect_uri = encodeURIComponent(`${location.origin}/auth/workwx?url=${encodeURIComponent(returnUrl)}`);
      const url = `${scanUrl}/wwopen/sso/qrConnect?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&state=${state}`;
      location.href = url;
    });
};
