import base, { controllerName } from './base';
/**
 * app
*/
var app = {
  /**
   * 获取时间
   * @param {Object} args 请求参数
   * @param {string} [args.contrastType] 周期对比
   * @param {string} [args.isSecond] 是否显示时分秒
   * @param {string} [args.rangeType] *日期类型
   * @param {string} [args.rangeValue] 多少天
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getDate: function(args, options) {
    base.ajaxOptions.url = base.server() + '/app/getDate';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'appgetDate', args, $.extend(base, options));
  },
  /**
   * 获取工作表控件
   * @param {Object} args 请求参数
   * @param {string} [args.appId] *工作表ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getTemplate: function(args, options) {
    base.ajaxOptions.url = base.server() + '/app/getReportConfigDetail';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'appgetReportConfigDetail', args, $.extend(base, options));
  },
};
module.exports = app;