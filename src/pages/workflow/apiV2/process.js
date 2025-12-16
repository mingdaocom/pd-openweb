import base, { controllerName } from './base';
/**
 * process
*/
const process = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/update';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processupdate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateUseStatus: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/updateUseStatus';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processupdateUseStatus', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateOwner: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/updateOwner';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processupdateOwner', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  startProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/startProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processstartProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  startProcessByPBC: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/startProcessByPBC';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processstartProcessByPBC', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  startProcessById: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/startProcessById';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processstartProcessById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  saveProcessConfig: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/saveProcessConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processsaveProcessConfig', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  saveChatbotConfig: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/saveChatbotConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processsaveChatbotConfig', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  move: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/move';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processmove', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  deleteProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/deleteProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processdeleteProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  copyProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/copyProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processcopyProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  addProcess_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'processadd', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {boolean} [args.isPublish] null
   * @param {Object} options 配置参数
   */
  publish: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/publish';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processpublish', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  goBack: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/goBack';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgoBack', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getTriggerProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getTriggerProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetTriggerProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.storeId] *null
   * @param {Object} options 配置参数
   */
  getStore: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getStore';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetStore', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getProcessPublish: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessPublish';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessPublish', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.relationId] *null
   * @param {Object} options 配置参数
   */
  getProcessListApi_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessListApi';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessListApi', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getProcessConfig: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessConfig';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessConfig', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.appId] *null
   * @param {string} [args.triggerId] *null
   * @param {Object} options 配置参数
   */
  getProcessByTriggerId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessByTriggerId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessByTriggerId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getProcessById: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {string} [args.appId] *null
   * @param {string} [args.controlId] *null
   * @param {Object} options 配置参数
   */
  getProcessByControlId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessByControlId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessByControlId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.relationId] null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getProcessApiInfo_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getProcessApiInfo';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetProcessApiInfo', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {integer} [args.pageIndex] *null
   * @param {integer} [args.pageSize] *null
   * @param {Object} options 配置参数
   */
  getHistory: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getHistory';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetHistory', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.chatbotId] *null
   * @param {Object} options 配置参数
   */
  getChatbotConfig: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/getChatbotConfig';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processgetChatbotConfig', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.storeId] *null
   * @param {Object} options 配置参数
   */
  closeStorePush: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/process/closeStorePush';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'processcloseStorePush', args, $.extend({}, base, options));
  },
};
export default process;