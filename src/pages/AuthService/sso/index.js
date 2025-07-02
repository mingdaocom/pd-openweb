import { setPssId } from 'src/utils/pssId';
import {
  addOtherParam,
  ajax,
  browserIsMobile,
  checkLogin,
  checkOriginUrl,
  formatOtherParam,
  getRequest,
  login,
  replenishRet,
} from 'src/utils/sso';

const { t, i, ret, url, code, p, pc_slide = '', ...otherParam } = getRequest();
const isPcSlide = pc_slide.includes('true');
const isMobile = browserIsMobile();
const otherParamString = formatOtherParam(otherParam);
const newRet = addOtherParam(ret, otherParamString);

function start() {
  if (t == '-1') {
    // 小程序
    if (checkLogin()) {
      if (checkOriginUrl(url)) {
        location.href = decodeURIComponent(url);
      } else {
        location.href = isMobile ? `/mobile` : `/app`;
      }
    } else {
      ajax.post({
        url: __api_server__.main + 'Login/WorkWeiXinMiniProgramLogin',
        data: {
          code,
        },
        async: true,
        withCredentials: false,
        success: result => {
          const { accountResult, sessionId } = result.data;
          if (accountResult === 1) {
            setPssId(sessionId);
            if (checkOriginUrl(url)) {
              location.href = decodeURIComponent(url);
            } else {
              location.href = isMobile ? `/mobile` : `/app`;
            }
          } else {
            window.alert('登录失败');
            login();
          }
        },
        error: login,
      });
    }
  } else if (t == '1') {
    if (checkLogin()) {
      if (checkOriginUrl(newRet)) {
        location.href = newRet;
      } else {
        location.href = isMobile ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
      }
    } else {
      // 企业微信
      ajax.post({
        url: __api_server__.main + 'Login/GetWorkWeiXinCorpInfo',
        data: {
          apkId: i,
        },
        async: true,
        success: result => {
          const { corpId, state } = result.data;
          const redirect_uri = encodeURIComponent(`${location.origin}/sso/workweixin?ret=${newRet || ''}&i=${i || ''}`);
          location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirect_uri}&state=${state}&response_type=code&scope=snsapi_base#wechat_redirect`;
        },
        error: login,
      });
    }
  } else {
    const expDate = localStorage.getItem('md_pss_id_exp');

    if (checkLogin()) {
      // expDate && checkLogin() && isBefore(expDate)
      if (newRet) {
        location.href = `/${replenishRet(newRet, pc_slide)}`;
      } else {
        if (i) {
          location.href = isMobile || isPcSlide ? `/mobile/app/${i}#hideTabBar` : `/app/${i}`;
        } else {
          location.href = isMobile || isPcSlide ? `/mobile/dashboard` : `/dashboard`;
        }
      }
    } else {
      const hosts = location.host.split('.');
      const projectId = p || hosts[0];
      function onFail(err) {
        window.alert(JSON.stringify(err));
      }

      // 钉钉
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
                  const dingdingLoginUrl = `/sso/dingding?state=${state}&ret=${encodeURIComponent(newRet || '')}&i=${
                    i || ''
                  }&code=${code}&pc_slide=${pc_slide}`;
                  if (dd.pc && !isPcSlide) {
                    if (clientWorkingPattern === 1) {
                      document.body.innerText = '已在默认浏览器打开';
                      window.open(dingdingLoginUrl);
                    } else {
                      window.location = dingdingLoginUrl;
                    }
                  } else {
                    window.location = dingdingLoginUrl;
                  }
                },
                onFail: onFail,
              });
            });
            dd.error(function (error) {
              onFail(error);
            });
          }
        },
        error: login,
      });
    }
  }
}

start();
