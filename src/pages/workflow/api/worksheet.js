import base, { controllerName } from './base';
/**
 * worksheet
*/
var worksheet = {
  /**
   * 刷新网络下所有流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestFieldReference} {appId:空表示所有引用  默认传当前应用id(string),controlId:控件id(string),controlName:控件名称(string),isRefresh:刷新引用关系(boolean),worksheetId:工作表id(string),worksheetName:工作表名称(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getWorksheetReferences: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/worksheet/GetWorksheetReferences';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'worksheetGetWorksheetReferences', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 刷新网络下所有流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestFieldReference} {appId:空表示所有引用  默认传当前应用id(string),controlId:控件id(string),controlName:控件名称(string),isRefresh:刷新引用关系(boolean),worksheetId:工作表id(string),worksheetName:工作表名称(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getWorksheetReferences: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/worksheetReference/GetWorksheetReferences';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'worksheetReferenceGetWorksheetReferences', JSON.stringify(args), $.extend(base, options));
  },
};
export default worksheet;