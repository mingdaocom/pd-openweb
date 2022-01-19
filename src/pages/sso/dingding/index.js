

import { ajax, login, browserIsMobile, getRequest, getCurrentTime, checkLogin, replenishRet } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';

const { code, state, i, ret, pc_slide = '' } = getRequest();
const isPcSlide = pc_slide.includes('true');
const isMobile = browserIsMobile();

if (checkLogin()) {
  if (ret) {
    location.href = `/${replenishRet(ret, pc_slide)}`;
  } else {
    if (i) {
      location.href = isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
    } else {
      location.href = isMobile || isPcSlide ? `/mobile/appHome` : `/app/my`;
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
          location.href = `/${replenishRet(ret, pc_slide)}`;
        } else {
          if (i) {
            location.href = isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
          } else {
            location.href = isMobile || isPcSlide ? `/mobile/appHome` : `/app/my`;
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

