import { ajax, login, browserIsMobile, getRequest, checkLogin, formatOtherParam, addOtherParam } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';
import _ from 'lodash';
import preall from 'src/common/preall';

const { code, state, url, p, ...otherParam } = getRequest();
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
      url: __api_server__.main + 'Login/FeishuAppLoginByApp',
      data: {
        code,
        state,
      },
      async: true,
      succees: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          preall({ type: 'function' });
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
  const otherParamString = formatOtherParam(otherParam);
  const newUrl = addOtherParam(url, otherParamString);
  if (checkLogin()) {
    if (newUrl) {
      location.href = newUrl;
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];
    ajax.post({
      url: __api_server__.main + 'Login/GetFeishuCorpInfoByApp',
      data: {
        projectId,
      },
      async: true,
      succees: result => {
        const { agentId, state } = result.data;
        const redirect_uri = encodeURIComponent(
          `${location.origin}/auth/feishu?url=${newUrl ? encodeURIComponent(newUrl) : ''}`,
        );
        location.href = `https://open.feishu.cn/open-apis/authen/v1/index?redirect_uri=${redirect_uri}&app_id=${agentId}&state=${state}`;
      },
      error: login,
    });
  }
}
