import base, { controllerName } from './base';
/**
 * transfer
*/
const transfer = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  update: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'transferupdate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  initProcessExtends: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/initProcessExtends';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'transferinitProcessExtends', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/getList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'transfergetList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  count: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/count';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'transfercount', args, $.extend({}, base, options));
  },
};
export default transfer;