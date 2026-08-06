import { ajax, getRequest, login } from 'src/utils/sso';

const { code } = getRequest();

ajax.post({
  url: __api_server__.main + 'Zendesk/GetSsoJwt',
  data: {
    code,
    appKey: '9eba86d207a0',
  },
  async: true,
  succees: data => {
    if (data.state) {
      document.getElementById('jwtInput').value = data.data;
      document.forms['jwtForm'].submit();
    }
  },
  error: login,
});
