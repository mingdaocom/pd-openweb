

import { ajax, login, browserIsMobile, getRequest, getCurrentTime, checkLogin } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';

const { code, state, i, ret } = getRequest();
const isMobile = browserIsMobile();

if (checkLogin()) {
  if (ret) {
    location.href = `/${decodeURIComponent(ret)}`;
  } else {
    if (i) {
      location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
    } else {
      location.href = isMobile ? `/mobile/appHome` : `/app/my`;
    }
  }
} else {
  ajax.post({
    url: __api_server__ + 'Login/DingDingAppLogin',
    data: {
      code,
      state,
      apkId: i,
    },
    async: true,
    succees: (result) => {
      const { accountResult, sessionId } = result.data;
      if (accountResult === 1) {
        // const date = new Date();
        // date.setTime(date.getTime()+24 * 60 * 60 * 1000);
        // setCookie('md_pss_id', sessionId, date);
        // localStorage.setItem('md_pss_id_exp', getCurrentTime(date));
        setPssId(sessionId);
        if (ret) {
          location.href = `/${decodeURIComponent(ret)}`;
        } else {
          if (i) {
            location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
          } else {
            location.href = isMobile ? `/mobile/appHome` : `/app/my`;
          }
        }
      } else {
        alert('登录失败');
        login();
      }
    },
    error: login
  });
}

