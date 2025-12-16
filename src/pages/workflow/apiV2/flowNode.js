import base, { controllerName } from './base';
/**
 * flowNode
*/
const flowNode = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  webHookTestRequest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/webHookTestRequest';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodewebHookTestRequest', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateFlowNodeName: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/updateFlowNodeName';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodeupdateFlowNodeName', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  updateCodeTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/updateCodeTemplate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodeupdateCodeTemplate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  saveNode: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/saveNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodesaveNode', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  nodeDesc: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/nodeDesc';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodenodeDesc', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  jsonToControls: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/jsonToControls';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodejsonToControls', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  delete: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/delete';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodedelete', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  deleteSMSTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/deleteSMSTemplate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodedeleteSMSTemplate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  createSMSTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/createSMSTemplate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodecreateSMSTemplate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  createCodeTemplate: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/createCodeTemplate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodecreateCodeTemplate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  codeTest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/codeTest';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodecodeTest', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  basicAuthTest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/basicAuthTest';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodebasicAuthTest', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  aigcTest: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/aigcTest';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodeaigcTest', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  add: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/add';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'flowNodeadd', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.instanceId] *null
   * @param {integer} [args.count] *null
   * @param {Object} options 配置参数
   */
  get_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/get';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodeget', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {string} [args.selectNodeId] *null
   * @param {Object} options 配置参数
   */
  getWebHookData: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getWebHookData';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetWebHookData', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {integer} [args.type] *null
   * @param {boolean} [args.schedule] *null
   * @param {boolean} [args.tool] *null
   * @param {Object} options 配置参数
   */
  getUserAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getUserAppDtos';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetUserAppDtos', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.selectNodeId] *null
   * @param {Object} options 配置参数
   */
  getSubProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getSubProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetSubProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.appId] null
   * @param {integer} [args.appType] null
   * @param {string} [args.selectNodeId] *null
   * @param {string} [args.controlId] *null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {Object} options 配置参数
   */
  getStartEventDeploy: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getStartEventDeploy';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetStartEventDeploy', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.selectNodeId] *null
   * @param {string} [args.nodeId] *null
   * @param {Object} options 配置参数
   */
  getNodeFormProperty: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getNodeFormProperty';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetNodeFormProperty', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {integer} [args.flowNodeType] *null
   * @param {string} [args.selectNodeId] *null
   * @param {string} [args.fields] *null
   * @param {string} [args.appId] *null
   * @param {string} [args.actionId] *null
   * @param {string} [args.instanceId] *null
   * @param {string} [args.version] null
   * @param {Object} options 配置参数
   */
  getNodeDetail: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getNodeDetail';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetNodeDetail', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getNodeDetailHistory: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getNodeDetailHistory';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetNodeDetailHistory', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {integer} [args.type] *null
   * @param {integer} [args.enumDefault] *null
   * @param {string} [args.sourceAppId] *null
   * @param {string} [args.dataSource] *null
   * @param {string} [args.selectNodeId] *null
   * @param {boolean} [args.current] *null
   * @param {integer} [args.filterType] *null
   * @param {boolean} [args.tool] *null
   * @param {Object} options 配置参数
   */
  getFlowNodeAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getFlowNodeAppDtos';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetFlowNodeAppDtos', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {integer} [args.type] *null
   * @param {integer} [args.enumDefault] *null
   * @param {string} [args.sourceAppId] *null
   * @param {string} [args.dataSource] *null
   * @param {string} [args.selectNodeId] *null
   * @param {string} [args.conditionId] *null
   * @param {boolean} [args.tool] *null
   * @param {Object} options 配置参数
   */
  getFlowAppDtos: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getFlowAppDtos';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetFlowAppDtos', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.type] *null
   * @param {string} [args.source] *null
   * @param {string} [args.keyword] *null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {Object} options 配置参数
   */
  getCodeTemplateList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getCodeTemplateList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetCodeTemplateList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {string} [args.selectNodeId] *null
   * @param {integer} [args.callBackType] *null
   * @param {Object} options 配置参数
   */
  getCallBackNodeNames: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getCallBackNodeNames';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetCallBackNodeNames', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.appType] *null
   * @param {string} [args.appId] *null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {string} [args.selectNodeId] *null
   * @param {Object} options 配置参数
   */
  getAppTemplateControls: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getAppTemplateControls';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetAppTemplateControls', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {integer} [args.pageIndex] null
   * @param {integer} [args.pageSize] null
   * @param {string} [args.sortId] *null
   * @param {boolean} [args.isAsc] *null
   * @param {Object} options 配置参数
   */
  getAllSMSTemplateList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getAllSMSTemplateList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetAllSMSTemplateList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] *null
   * @param {string} [args.nodeId] *null
   * @param {string} [args.instanceId] *null
   * @param {Object} options 配置参数
   */
  getAgentNodeDetailHistory: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/flowNode/getAgentNodeDetailHistory';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'flowNodegetAgentNodeDetailHistory', args, $.extend({}, base, options));
  },
};
export default flowNode;