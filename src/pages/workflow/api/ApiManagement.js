import base, { controllerName } from './base';
/**
 * ApiManagement
*/
var ApiManagement = {
  /**
   * 导入/升级前的验证
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestCheckUpgrade} {fileName:文件名称(string),id:升级对应的packId/  导入传空(string),password:密码(string),projectId:网络id(string),url:文件URL(string),}*checkUpgradeRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  check: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/ApiManagement/Check';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'ApiManagementCheck', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 导出api
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestExportApi} {apiIds:选择的apiIds(array),id:package id(string),password:密码(string),projectId:网络id(string),}*exportApiRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  export: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/ApiManagement/export';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'ApiManagementexport', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 导出api
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestImportApi} {id:批次id(string),packageId:连接id(string),projectId:网络id(string),}*importApiRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  importApi: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/ApiManagement/import';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'ApiManagementimport', JSON.stringify(args), $.extend(base, options));
  },
};
export default ApiManagement;