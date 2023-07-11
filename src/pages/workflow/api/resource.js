import base, { controllerName } from './base';
/**
 * resource
*/
var resource = {
  /**
   * 资源配置添加流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {资源添加流程} {apkId:应用id(string),companyId:网络id(string),processIds:流程ids(array),resourceId:资源id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  addProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/addProcess';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'resourceaddProcess', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 资源配置获取流程数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {资源流程列表} {apkId:应用id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),processListType:列表类型(integer),resourceId:资源id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getCountByResourceId: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/getProcessCount';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'resourcegetProcessCount', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 资源配置获取流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {资源流程列表} {apkId:应用id(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),processListType:列表类型(integer),resourceId:资源id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/getProcessList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'resourcegetProcessList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 资源配置移动流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {资源移动流程} {companyId:网络id(string),moveToResourceId:移动到的资源id(string),processIds:流程ids(array),resourceId:资源id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  moveProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/resource/moveProcess';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'resourcemoveProcess', JSON.stringify(args), $.extend(base, options));
  },
};
export default resource;
