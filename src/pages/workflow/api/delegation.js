import base, { controllerName } from './base';
/**
 * delegation
*/
var delegation = {
  /**
   * 添加委托
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {添加委托} {companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),trustee:受委托人(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  add: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/add';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'delegationadd', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 获取委托列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/getList';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'delegationgetList', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 根据委托人获取委托列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {获取委托列表} {companyId:公司ID(string),principals:多个委托人(array),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getListByPrincipals: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/getListByPrincipals';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'delegationgetListByPrincipals', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 编辑委托
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {编辑委托} {companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),id:委托ID(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),status:状态 1正常，0结束(integer),trustee:受委托人(string),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  update: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/delegation/update';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'delegationupdate', JSON.stringify(args), $.extend(base, options));
  },
};
export default delegation;
