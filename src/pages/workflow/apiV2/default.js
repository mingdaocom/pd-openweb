import base, { controllerName } from './base';
/**
 * default
*/
const defaultApi = {
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  batchDeleteWorkflowNodes: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/nodes';
    base.ajaxOptions.type = 'DELETE';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}nodes', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {string} [args.node_id] *null
   * @param {Object} options 配置参数
   */
  deleteWorkflowNode: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/nodes/{node_id}';
    base.ajaxOptions.type = 'DELETE';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}nodes{node_id}', args, $.extend({}, base, options));
  },
};
export default defaultApi;
