import base, { controllerName } from './base';
/**
 * activity
*/
const activity = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  remove_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/activity/remove';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'activityremove', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {Object} options 配置参数
   */
  getList_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/activity/getList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'activitygetList', args, $.extend({}, base, options));
  },
};
export default activity;