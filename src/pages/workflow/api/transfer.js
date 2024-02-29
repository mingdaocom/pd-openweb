import base, { controllerName } from './base';
/**
 * transfer
*/
var transfer = {
  /**
   * 获取交接数量
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestTransfer} {accountId:需要交接人员id(string),companyId:网络id(string),init:刷新(boolean),types:1待办 2流程 ([1,2])(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  count: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/count';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'transfercount', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取交接列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestTransfer} {accountId:需要交接人员id(string),companyId:网络id(string),init:刷新(boolean),types:1待办 2流程 ([1,2])(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/getList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'transfergetList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 操作交接
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestTransferUpdate} {accountId:需要交接人员id(string),companyId:网络id(string),ids:列表上的ids 不传就是交接所有(array),transferAccountId:交接给谁(string),type:1待办 2流程(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  update: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/transfer/update';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'transferupdate', JSON.stringify(args), $.extend(base, options));
  },
};
export default transfer;