import base, { controllerName } from './base';
/**
 * DataLimit
*/
const DataLimit = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  GetUageLimits: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/DataLimit/GetUageLimits';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'DataLimitGetUageLimits', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  EditUageLimit: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/DataLimit/EditUageLimit';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'DataLimitEditUageLimit', args, $.extend({}, base, options));
  },
};
export default DataLimit;