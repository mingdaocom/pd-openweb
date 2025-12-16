import base, { controllerName } from './base';
/**
 * processapicontroller
*/
const processapicontroller = {
  /**
   * null
   * @param {string} [args.process_id] *null
   * @param {Object} options 配置参数
   */
  getProcessApiInfo: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/processes/{process_id}';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowprocesses{process_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.process_id] *null
   * @param {Object} options 配置参数
   */
  getProcessApiInfo_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/processes/{process_id}';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3processes{process_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getProcessListApi: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/processes';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3processes', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getProcessListApi_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/processes';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowprocesses', args, $.extend({}, base, options));
  },
};
export default processapicontroller;