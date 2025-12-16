import base, { controllerName } from './base';
/**
 * resource
*/
const resource = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  moveProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/moveProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'resourcemoveProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/getProcessList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'resourcegetProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getCountByResourceId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/getProcessCount';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'resourcegetProcessCount', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  addProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/addProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'resourceaddProcess', args, $.extend({}, base, options));
  },
};
export default resource;