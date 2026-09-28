import base, { controllerName } from './base';
/**
 * instanceversion3controller
*/
const instanceversion3controller = {
  /**
   * null
   * @param {string} [args.worksheetId] *null
   * @param {string} [args.rowId] *null
   * @param {Object} options 配置参数
   */
  getTodoList3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/{worksheetId}/rows/{rowId}/approval/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflow{worksheetId}rows{rowId}approvallist', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.worksheetId] *null
   * @param {string} [args.rowId] *null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  get3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/{worksheetId}/rows/{rowId}/approval/{instanceId}';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflow{worksheetId}rows{rowId}approval{instanceId}', args, $.extend({}, base, options));
  },
};
export default instanceversion3controller;