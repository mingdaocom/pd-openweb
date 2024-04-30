import base, { controllerName } from './base';
/**
 * custom
*/
var custom = {
  /**
   * 获取自定义页面
   * @param {Object} args 请求参数
   * @param {string} [args.appId] appId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getPage: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/getPage';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'customgetPage', args, $.extend(base, options));
  },
  /**
   * 根据表id获取自定义页面配置的统计图
   * @param {Object} args 请求参数
   * @param {string} [args.worksheetId] 表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getReportsByWorksheetId: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/getReportsByWorksheetId';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'customgetReportsByWorksheetId', args, $.extend(base, options));
  },
  /**
   * 保存自定义页面
   * @param {Object} args 请求参数
   * @param {保存自定义页面} {adjustScreen:强转适应屏幕(boolean),appId:appId(string),components:组件列表(array),config:参数，仅供前端使用(object),version:版本(integer),}*savePageRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  savePage: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/savePage';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'customsavePage', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 保存自定义页面配置说明和强转适应屏幕
   * @param {Object} args 请求参数
   * @param {更新自定义页面} {adjustScreen:强转适应屏幕(boolean),appId:appId(string),config:参数，仅供前端使用(object),desc:页面说明(string),}*updatePageRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updatePage: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/updatePage';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'customupdatePage', JSON.stringify(args), $.extend(base, options));
  },
};
export default custom;