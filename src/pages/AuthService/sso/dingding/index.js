import { pathCompletion } from 'src/utils/common';
import { setPssId } from 'src/utils/pssId';
import { ajax, browserIsMobile, checkLogin, getGlobalMeta, getRequest, login, replenishRet } from 'src/utils/sso';

const { code, state, i, ret, pc_slide = '' } = getRequest();
const isPcSlide = pc_slide.includes('true');
const isMobile = browserIsMobile();

if (checkLogin()) {
  if (ret) {
    location.replace(pathCompletion(`/${replenishRet(ret, pc_slide)}`));
  } else {
    if (i) {
      location.replace(pathCompletion(isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`));
    } else {
      location.replace(pathCompletion(isMobile || isPcSlide ? `/mobile/dashboard` : `/dashboard`));
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
    success: result => {
      const { accountResult, sessionId } = result.data;

      if (accountResult === 1) {
        getGlobalMeta().then(() => {
          setPssId(sessionId);
          if (ret) {
            location.replace(pathCompletion(`/${replenishRet(ret, pc_slide)}`));
          } else {
            if (i) {
              location.replace(pathCompletion(isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`));
            } else {
              if (i) {
                location.replace(pathCompletion(isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`));
              } else {
                location.replace(pathCompletion(isMobile || isPcSlide ? `/mobile/dashboard` : `/dashboard`));
              }
            }
          }
        });
      } else {
        login();
      }
    },
    error: login,
  });
}
