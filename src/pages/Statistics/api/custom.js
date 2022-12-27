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
    return $.api(controllerName, 'customgetPage', args, $.extend(base, options));
  },
  /**
   * 保存自定义页面
   * @param {Object} args 请求参数
   * @param {保存自定义页面} {appId:appId(string),components:组件列表(array),version:版本(integer),}*savePageRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  savePage: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/savePage';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'customsavePage', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * 保存自定义页面配置说明和强转适应屏幕
   * @param {Object} args 请求参数
   * @param {更新自定义页面} {adjustScreen:强转适应屏幕(boolean),appId:appId(string),desc:页面说明(string),}*updatePageRequest
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  updatePage: function(args, options) {
    base.ajaxOptions.url = base.server() + '/custom/updatePage';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, 'customupdatePage', JSON.stringify(args), $.extend(base, options));
  },
};
export default custom;
