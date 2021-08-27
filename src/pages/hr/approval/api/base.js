import config from 'src/components/customWidget/src/config/stateConfig';

export const controllerName = 'Approval';

const base = {
  server: config.OARequest,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend(xhr) {
      xhr.setRequestHeader('accessToken', window.localStorage.getItem('plus_accessToken'));
    },
  },
};
export default base;
