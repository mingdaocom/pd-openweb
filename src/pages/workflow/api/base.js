import _ from 'lodash';
export const controllerName = 'Workflow';

export default {
  server: (options = {}) => {
    if (options.isIntegration) {
      return __api_server__.integration || md.global.Config.IntegrationAPIUrl;
    } else {
      return __api_server__.workflow || md.global.Config.WorkFlowUrl;
    }
  },
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
