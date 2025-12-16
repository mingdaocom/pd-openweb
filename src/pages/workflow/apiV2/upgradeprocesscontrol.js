import base, { controllerName } from './base';
/**
 * upgradeprocesscontrol
*/
const upgradeprocesscontrol = {
  /**
   * null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.name] null
   * @param {string} [args.key] null
   * @param {Object} options 配置参数
   */
  getGoodsRelationList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/workflow/api/getGoodsRelationList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'workflowapigetGoodsRelationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.name] null
   * @param {string} [args.key] null
   * @param {Object} options 配置参数
   */
  getGoodsRelationList_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/integration/api/getGoodsRelationList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiintegrationapigetGoodsRelationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.name] null
   * @param {string} [args.key] null
   * @param {Object} options 配置参数
   */
  getGoodsRelationList_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflow/api/getGoodsRelationList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowapigetGoodsRelationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.name] null
   * @param {string} [args.key] null
   * @param {Object} options 配置参数
   */
  getGoodsRelationList_3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/getGoodsRelationList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apigetGoodsRelationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.name] null
   * @param {string} [args.key] null
   * @param {Object} options 配置参数
   */
  getGoodsRelationList_4: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflowplugin/api/getGoodsRelationList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowpluginapigetGoodsRelationList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getGoodRelationById: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflow/api/getGoodRelationById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowapigetGoodRelationById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getGoodRelationById_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/workflow/api/getGoodRelationById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'workflowapigetGoodRelationById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getGoodRelationById_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/integration/api/getGoodRelationById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiintegrationapigetGoodRelationById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getGoodRelationById_3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/getGoodRelationById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apigetGoodRelationById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.id] *null
   * @param {Object} options 配置参数
   */
  getGoodRelationById_4: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflowplugin/api/getGoodRelationById';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowpluginapigetGoodRelationById', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.desc] *null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.processId] null
   * @param {Object} options 配置参数
   */
  getExportProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/integration/api/getExportProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiintegrationapigetExportProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.desc] *null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.processId] null
   * @param {Object} options 配置参数
   */
  getExportProcessList_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflowplugin/api/getExportProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowpluginapigetExportProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.desc] *null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.processId] null
   * @param {Object} options 配置参数
   */
  getExportProcessList_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflow/api/getExportProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowapigetExportProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.desc] *null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.processId] null
   * @param {Object} options 配置参数
   */
  getExportProcessList_3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/workflow/api/getExportProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'workflowapigetExportProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.desc] *null
   * @param {integer} [args.current] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.processId] null
   * @param {Object} options 配置参数
   */
  getExportProcessList_4: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/getExportProcessList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apigetExportProcessList', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.sourceId] *null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getExportProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflowplugin/api/getExportProcess';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowpluginapigetExportProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.sourceId] *null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getExportProcess_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/getExportProcess';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apigetExportProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.sourceId] *null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getExportProcess_2: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/workflow/api/getExportProcess';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiworkflowapigetExportProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.sourceId] *null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getExportProcess_3: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/api/integration/api/getExportProcess';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'apiintegrationapigetExportProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.sourceId] *null
   * @param {string} [args.processId] *null
   * @param {Object} options 配置参数
   */
  getExportProcess_4: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/workflow/api/getExportProcess';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'workflowapigetExportProcess', args, $.extend({}, base, options));
  },
};
export default upgradeprocesscontrol;