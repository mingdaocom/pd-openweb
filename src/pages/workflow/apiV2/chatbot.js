import base, { controllerName } from './base';
/**
 * chatbot
*/
const chatbot = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateConversation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/updateConversation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotupdateConversation', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  shareToConversation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/shareToConversation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotshareToConversation', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  resetConversation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/resetConversation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotresetConversation', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  ocr: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/ocr';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotocr', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getOwner: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/getOwner';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotgetOwner', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getMessageList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/getMessageList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotgetMessageList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getConversationList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/getConversationList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotgetConversationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  getAllConversationList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/getAllConversationList';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotgetAllConversationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  feedback: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/feedback';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotfeedback', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  clearConversation: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/clearConversation';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotclearConversation', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  handleAIRequest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/chatbot/HandleAIRequest';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'chatbotHandleAIRequest', args, $.extend({}, base, options));
  },
};
export default chatbot;