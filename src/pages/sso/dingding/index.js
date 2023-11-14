import { ajax, login, browserIsMobile, getRequest, getCurrentTime, checkLogin, replenishRet } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';
import _ from 'lodash';
import preall from 'src/common/preall';

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
    url: __api_server__.main + 'Login/DingDingAppLogin',
    data: {
      code,
      state,
      apkId: i,
    },
    async: true,
    succees: result => {
      const { accountResult, sessionId } = result.data;
      if (accountResult === 1) {
        preall({ type: 'function' });
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
    error: login,
  });
}
