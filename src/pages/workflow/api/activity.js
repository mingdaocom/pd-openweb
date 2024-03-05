import base, { controllerName } from './base';
/**
 * activity
*/
var activity = {
  /**
   * 获取串行待执行列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {int} [args.pageIndex] 页数
   * @param {int} [args.pageSize] 每页数量
   * @param {String} [args.processId] *编辑版流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/activity/getList';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'activitygetList', args, $.extend(base, options));
  },
  /**
   * 移除卡住的
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestConsumerActivity} {id:列表返回的id(string),processId:编辑版流程id(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  remove: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/activity/remove';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'activityremove', JSON.stringify(args), $.extend(base, options));
  },
};
export default activity;