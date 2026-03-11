import base, { controllerName } from './base';
/**
 * chatbotsse
*/
const chatbotsse = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  startProcess_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/sse/startProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apissestartProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  chat: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/sse/chat';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'apissechat', args, $.extend({}, base, options));
  },
};
export default chatbotsse;