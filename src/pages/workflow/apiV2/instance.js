import base, { controllerName } from './base';
/**
 * instance
*/
const instance = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  transfer: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/transfer';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancetransfer', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  taskRevoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/taskRevoke';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancetaskRevoke', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  submit: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/submit';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancesubmit', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  signTask: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/sign';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancesign', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  revoke: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/revoke';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancerevoke', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  restart: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/restart';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancerestart', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  pass: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/pass';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instancepass', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  overrule: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/overrule';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceoverrule', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  operation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/operation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceoperation', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  forward: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/forward';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'instanceforward', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getOperationHistoryList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getOperationHistoryList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetOperationHistoryList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  getOperationDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getOperationDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetOperationDetail', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getInstance';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetInstance', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {integer} [args.status] null
   * @param {string} [args.startDate] null
   * @param {string} [args.endDate] null
   * @param {string} [args.title] null
   * @param {string} [args.instanceId] null
   * @param {string} [args.workId] null
   * @param {string} [args.archivedId] null
   * @param {string} [args.conversationId] null
   * @param {Object} options 配置参数
   */
  getHistoryList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getHistoryList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetHistoryList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getHistoryDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getHistoryDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetHistoryDetail', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getArchivedList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/getArchivedList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancegetArchivedList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  count_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/instance/count';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'instancecount', args, $.extend({}, base, options));
  },
};
export default instance;