import base, { controllerName } from './base';
/**
 * delegation
*/
const delegation = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  update_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationupdate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {Object} options 配置参数
   */
  getList_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/getList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationgetList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getListByPrincipals: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/getListByPrincipals';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationgetListByPrincipals', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getListByCompanyId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/getListByCompanyId';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationgetListByCompanyId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  add_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'delegationadd', args, $.extend({}, base, options));
  },
};
export default delegation;