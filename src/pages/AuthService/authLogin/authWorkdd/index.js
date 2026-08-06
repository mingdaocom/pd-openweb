import { pathCompletion } from 'src/utils/common';
import { setPssId } from 'src/utils/pssId';
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
} from 'src/utils/sso';

const { code, state, url, p, pc_slide = '', ...otherParam } = getRequest();
const isPcSlide = pc_slide.includes('true');
const isMobile = browserIsMobile();

if (code) {
  if (checkLogin()) {
    if (checkOriginUrl(url)) {
      location.replace(decodeURIComponent(url));
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/DingDingAppLogin',
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
            if (checkOriginUrl(url)) {
              location.replace(decodeURIComponent(url));
            } else {
              location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
            }
          });
        } else {
          login();
        }
      },
      error: login,
    });
  }
} else {
  const otherParamString = formatOtherParam(otherParam);
  const newUrl = addOtherParam(url, otherParamString);

  if (checkLogin()) {
    if (checkOriginUrl(newUrl)) {
      location.replace(decodeURIComponent(newUrl));
    } else {
      location.replace(pathCompletion(isMobile ? `/mobile` : `/app`));
    }
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];

    function onFail(err) {
      window.alert(JSON.stringify(err));
    }

    ajax.post({
      url: __api_server__.main + 'Login/GetDingDingCorpInfo',
      data: {
        projectId,
      },
      async: true,
      success: result => {
        const { corpId, state, clientWorkingPattern } = result.data;

        if (corpId) {
          dd.ready(function () {
            dd.runtime.permission.requestAuthCode({
              corpId: corpId,
              onSuccess: function (result) {
                const { code } = result;
                const dingdingLoginUrl = pathCompletion(
                  `/auth/workdd?state=${state}&url=${newUrl ? encodeURIComponent(newUrl) : ''}&code=${code}&pc_slide=${pc_slide}`,
                );

                if (dd.pc && !isPcSlide) {
                  if (clientWorkingPattern === 1) {
                    document.body.innerText = '已在默认浏览器打开';
                    window.open(dingdingLoginUrl);
                    window.close();
                    dd.biz.navigation.quit({ message: '' });
                  } else {
                    location.replace(dingdingLoginUrl);
                  }
                } else {
                  location.replace(dingdingLoginUrl);
                }
              },
              onFail: onFail,
            });
          });
          dd.error(function (error) {
            onFail(error);
          });
        } else {
          login();
        }
      },
      error: login,
    });
  }
}
