import _ from 'lodash';
export const controllerName = 'Workflow';

export default {
  server: (options = {}) => {
    const isPlugin = location.href.indexOf('workflowplugin') > -1;

    if (options.isIntegration) {
      return __api_server__.integration || md.global.Config.IntegrationAPIUrl;
    } else if (options.isPlugin || (isPlugin && !options.isWorkflow)) {
      return __api_server__.workflowPlugin || md.global.Config.WorkflowPluginUrl;
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
