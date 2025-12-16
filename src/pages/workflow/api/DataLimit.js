import base, { controllerName } from './base';

/**
 * DataLimit
 */
const DataLimit = {
  /**
   * 修改额度
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestUpdateDailyLimit} {adds:null(array),dels:null(array),edits:null(array),projectId:null(string),size:null(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  EditUageLimit: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/DataLimit/EditUageLimit';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'DataLimitEditUageLimit', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取额度管理列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestGetDailyLimitList} {entityIds:应用ids(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),projectId:网络id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  GetUageLimits: function (args, options) {
    base.ajaxOptions.url = base.server(options) + '/DataLimit/GetUageLimits';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'DataLimitGetUageLimits', JSON.stringify(args), $.extend(base, options));
  },
};
export default DataLimit;
