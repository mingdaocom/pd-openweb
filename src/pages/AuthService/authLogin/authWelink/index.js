import { setPssId } from 'src/utils/pssId';
import {
  ajax,
  browserIsMobile,
  checkLogin,
  checkOriginUrl,
  getGlobalMeta,
  getRequest,
  getScript,
  login,
} from 'src/utils/sso';

const { url, p } = getRequest();
const isMobile = browserIsMobile();

if (checkLogin()) {
  if (checkOriginUrl(url)) {
    location.replace(decodeURIComponent(url));
  } else {
    location.replace(isMobile ? `/mobile` : `/app`);
  }
} else {
  const hosts = location.host.split('.');
  const projectId = p || hosts[0];
  getScript('https://open-doc.welink.huaweicloud.com/docs/jsapi/2.0.3/hwh5-cloudonline.js', () => {
    HWH5.getAuthCode()
      .then(data => {
        ajax.post({
          url: __api_server__.main + 'Login/WelinkAppLoginByApp',
          data: {
            projectId,
            code: data.code,
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
                  location.replace(isMobile ? `/mobile` : `/app`);
                }
              });
            }
          },
          error: login,
        });
      })
      .catch(error => {
        console.log('获取异常', error);
      });
  });
}
