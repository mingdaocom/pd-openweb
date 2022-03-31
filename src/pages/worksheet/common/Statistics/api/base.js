export const controllerName = 'Worksheet';

export default {
  // server: () => 'http://172.16.1.191:8086',
  server: () => __api_server__.report || md.global.Config.WsReportUrl,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
