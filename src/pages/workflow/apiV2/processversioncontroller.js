import base, { controllerName } from './base';
/**
 * processversioncontroller
*/
const processversioncontroller = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  restoreProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/restoreProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processrestoreProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  removeProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/removeProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v1processremoveProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.processListType] *null
   * @param {string} [args.relationId] *null
   * @param {integer} [args.pageSize] null
   * @param {integer} [args.pageIndex] null
   * @param {string} [args.keyWords] null
   * @param {Object} options 配置参数
   */
  list: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/list';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processlist', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.relationId] *null
   * @param {integer} [args.pageSize] null
   * @param {integer} [args.pageIndex] null
   * @param {string} [args.keyWords] null
   * @param {Object} options 配置参数
   */
  listAll: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/listAll';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processlistAll', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {Object} options 配置参数
   */
  getProcessUseCount: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessUseCount';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessUseCount', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.relationId] *null
   * @param {integer} [args.relationType] null
   * @param {Object} options 配置参数
   */
  getProcessRole: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessRole';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessRole', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.companyId] *null
   * @param {string} [args.apkId] *null
   * @param {integer} [args.enabled] *null
   * @param {integer} [args.processListType] *null
   * @param {string} [args.keyWords] *null
   * @param {string} [args.sortId] *null
   * @param {boolean} [args.isAsc] *null
   * @param {integer} [args.pageIndex] *null
   * @param {integer} [args.pageSize] *null
   * @param {string} [args.createrIds] *null
   * @param {Object} options 配置参数
   */
  getProcessByCompanyId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/getProcessByCompanyId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processgetProcessByCompanyId', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {integer} [args.relationType] *null
   * @param {string} [args.relationId] *null
   * @param {Object} options 配置参数
   */
  count_1: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v1/process/count';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v1processcount', args, $.extend({}, base, options));
  },
};
export default processversioncontroller;