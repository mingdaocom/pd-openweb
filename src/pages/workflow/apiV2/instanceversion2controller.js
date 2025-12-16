import base, { controllerName } from './base';
/**
 * instanceversion2controller
*/
const instanceversion2controller = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  pass2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/pass';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v2instancepass', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  overrule2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/overrule';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v2instanceoverrule', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getTodoList2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/getTodoList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v2instancegetTodoList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  batch2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v2instancebatch', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  get2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v2instanceget', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  getTodoCount2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/getTodoCount';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v2instancegetTodoCount', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {null} [args.request] *null
   * @param {Object} options 配置参数
   */
  cover: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v2/instance/cover';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v2instancecover', args, $.extend({}, base, options));
  },
};
export default instanceversion2controller;