import { ajax, login, browserIsMobile, getScript, getRequest, checkLogin } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';

const { url, p } = getRequest();
const isMobile = browserIsMobile();

if (checkLogin()) {
  if (url) {
    location.href = decodeURIComponent(url);
  } else {
    location.href = isMobile ? `/mobile` : `/app`;
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
          succees: result => {
            const { accountResult, sessionId } = result.data;
            if (accountResult === 1) {
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
      })
      .catch(error => {
        console.log('获取异常', error);
      });
  });
}
