import base, { controllerName } from './base';
/**
 * event
*/
const event = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  unsubscribe: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/event/unsubscribe';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'eventunsubscribe', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  subscribe: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/event/subscribe';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'eventsubscribe', args, $.extend({}, base, options));
  },
};
export default event;