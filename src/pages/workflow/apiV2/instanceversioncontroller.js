import base, { controllerName } from './base';
/**
 * instanceversioncontroller
*/
const instanceversioncontroller = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  resetInstanceList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/resetInstanceList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1instanceresetInstanceList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getTodoList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1instancegetTodoList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getTodoListFilter: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoListFilter';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1instancegetTodoListFilter', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  endInstanceList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/endInstanceList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1instanceendInstanceList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  batch_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1instancebatch', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  resetInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/resetInstance';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1instanceresetInstance', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  get: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1instanceget', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  getWorkItem: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getWorkItem';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1instancegetWorkItem', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.archivedId] null
   * @param {Object} options 配置参数
   */
  getTodoCount: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/getTodoCount';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1instancegetTodoCount', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  endInstance: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/instance/endInstance';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1instanceendInstance', args, $.extend({}, base, options));
  },
};
export default instanceversioncontroller;