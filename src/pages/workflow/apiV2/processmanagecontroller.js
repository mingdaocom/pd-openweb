import base, { controllerName } from './base';
/**
 * processmanagecontroller
*/
const processmanagecontroller = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateWarning: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateWarning';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateWarning', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateWaiting: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateWaiting';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateWaiting', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateRouterIndex: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/updateRouterIndex';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processupdateRouterIndex', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  reset: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/reset';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processreset', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  remove: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/remove';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processremove', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  init: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/init';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processinit', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getHistoryDifferenceByCompanyId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getHistoryDifferenceByCompanyId';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetHistoryDifferenceByCompanyId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getDifferenceProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetDifferenceProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getDifferenceProcessListByIds: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessListByIds';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetDifferenceProcessListByIds', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getDifferenceProcessCount: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceProcessCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processgetDifferenceProcessCount', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  batch: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processbatch', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {Object} options 配置参数
   */
  getWarning: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getWarning';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetWarning', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {Object} options 配置参数
   */
  getRouterList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getRouterList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetRouterList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getHistoryDifferenceByProcessId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getHistoryDifferenceByProcessId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetHistoryDifferenceByProcessId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getDifferenceByProcessId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceByProcessId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetDifferenceByProcessId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {Object} options 配置参数
   */
  getDifferenceByCompanyId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getDifferenceByCompanyId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetDifferenceByCompanyId', args, $.extend({}, base, options));
  },
};
export default processmanagecontroller;