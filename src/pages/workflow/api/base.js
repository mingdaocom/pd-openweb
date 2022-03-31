export const controllerName = 'Workflow';

export default {
  server: () => __api_server__.workflow || md.global.Config.WorkFlowUrl,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
