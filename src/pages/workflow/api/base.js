export const controllerName = 'Workflow';

export default {
  server: () => md.global.Config.WorkFlowUrl,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
