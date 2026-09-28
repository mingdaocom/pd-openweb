import base, { controllerName } from './base';
/**
 * workflowinstancev3controller
*/
const workflowinstancev3controller = {
  /**
   * null
   * @param {string} [args.instance_id] *null
   * @param {Object} options 配置参数
   */
  urge: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/{instance_id}/urge';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowinstance{instance_id}urge', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instance_id] *null
   * @param {Object} options 配置参数
   */
  terminate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/{instance_id}/terminate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowinstance{instance_id}terminate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instance_id] *null
   * @param {Object} options 配置参数
   */
  revoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/{instance_id}/revoke';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowinstance{instance_id}revoke', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instance_id] *null
   * @param {Object} options 配置参数
   */
  returnInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/{instance_id}/return';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowinstance{instance_id}return', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  batch: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowinstancebatch', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instance_id] *null
   * @param {string} [args.workId] null
   * @param {Object} options 配置参数
   */
  detail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/{instance_id}';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowinstance{instance_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.type] null
   * @param {string} [args.keyword] null
   * @param {string} [args.processId] null
   * @param {string} [args.appId] null
   * @param {integer} [args.status] null
   * @param {string} [args.startDate] null
   * @param {string} [args.endDate] null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {Object} options 配置参数
   */
  list: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/instance/list';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowinstancelist', args, $.extend({}, base, options));
  },
};
export default workflowinstancev3controller;