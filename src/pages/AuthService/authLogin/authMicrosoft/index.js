import CryptoJS from 'crypto-js';
import { getPssId, setPssId } from 'src/utils/pssId';
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

const { code = '', state = '', url, p, appscheme, ...otherParam } = getRequest();
const isMobile = browserIsMobile();

function generateCodeVerifier() {
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return randomBytes.toString(CryptoJS.enc.Base64url);
}

function generateCodeChallenge(verifier) {
  const hash = CryptoJS.SHA256(verifier);
  return hash.toString(CryptoJS.enc.Base64url);
}
//跳转到移动端app
function toAppByScheme(appscheme, sessionId) {
  const schemeUrl = appscheme + '://ssocallback?sessionId=' + encodeURIComponent(sessionId); // 构建 scheme URL
  window.location.href = schemeUrl;
}
//登录成功的跳转
function loginSuccess(url, appscheme) {
  const sessionId = getPssId();
  if (appscheme && sessionId) {
    toAppByScheme(appscheme, sessionId);
    return;
  }
  if (checkOriginUrl(url)) {
    location.replace(decodeURIComponent(url));
  } else {
    location.replace(isMobile ? `/mobile` : `/app`);
  }
}

if (code) {
  const originalState = state.split('_appscheme_')[0];
  const appschemeFromState = state.split('_appscheme_')[1];
  if (checkLogin()) {
    loginSuccess(url, appschemeFromState);
  } else {
    // 获取 code_verifier
    const code_verifier = window.getCookie('microsoft_code_verifier');
    window.delCookie('microsoft_code_verifier');
    ajax.post({
      url: __api_server__.main + 'Login/WorkMicrosoftLoginByApp',
      data: {
        code,
        state: originalState,
        codeVerifier: code_verifier,
      },
      async: true,
      success: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          if (appschemeFromState && sessionId) {
            toAppByScheme(appschemeFromState, sessionId);
            return;
          }
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
  const otherParamString = formatOtherParam(otherParam);
  const newUrl = addOtherParam(url, otherParamString);
  if (checkLogin()) {
    loginSuccess(newUrl, appscheme);
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];
    ajax.post({
      url: __api_server__.main + 'Login/GetWorkMicrosoftInfo',
      data: {
        projectId,
      },
      async: true,
      success: result => {
        const { clientId, tenantId, state } = result.data;
        const code_verifier = generateCodeVerifier();
        window.setCookie('microsoft_code_verifier', code_verifier);
        const state_appscheme = appscheme ? `${state}_appscheme_${appscheme}` : `${state}`;
        const code_challenge = generateCodeChallenge(code_verifier);
        const isDevelopment =
          location.origin.includes('localhost') ||
          location.origin.includes('sandbox.mingdao.com') ||
          location.origin.includes('meihua.mingdao.com');
        const redirect_uri = encodeURIComponent(
          `${isDevelopment || !location.origin.includes('mingdao.com') ? location.origin : 'https://www.mingdao.com'}/auth/microsoft`,
        );
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect_uri}&response_mode=query&scope=openid&state=${state_appscheme}&code_challenge=${code_challenge}&code_challenge_method=S256`;
        location.href = authUrl;
      },
      error: login,
    });
  }
}
