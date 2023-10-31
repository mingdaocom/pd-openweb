import preall from 'src/common/preall';
import loginAjax from 'src/api/login';
import { browserIsMobile, getRequest } from 'src/util';

// const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isMobile = browserIsMobile();
const { url } = getRequest();

const checkLogin = () => {
  let isLoing = false;
  loginAjax
    .checkLogin(
      {},
      {
        ajaxOptions: { async: false },
      },
    )
    .then(res => {
      isLoing = res;
    });
  return isLoing;
};

function start() {
  const appId = md.global.Config.WorkWXApp;
  const random = parseInt(Math.random() * 1000000000000);
  if (checkLogin()) {
    if (url) {
      location.href = url;
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    const redirect_uri = encodeURIComponent(`${location.origin}/sso/workweixin?source=wxwork&url=${url || ''}`);
    location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${random}#wechat_redirect`;
  }
}

preall({ type: 'function' }, { allownotlogin: true });
start();
