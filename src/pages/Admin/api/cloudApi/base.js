export const controllerName = 'CloudApi';

export default {
  server: () => {
    return __api_server__.cloudapi || md.global.Config.CloudApiUrl;
  },
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
