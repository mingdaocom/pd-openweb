import base, { controllerName } from './base';
/**
 *
*/
var x = {
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'HEAD';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'POST';
    return $.api(controllerName, '', JSON.stringify(args), $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'PUT';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'PATCH';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'DELETE';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'OPTIONS';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * index
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  index: function(args, options) {
    base.ajaxOptions.url = base.server() + '/';
    base.ajaxOptions.type = 'TRACE';
    return $.api(controllerName, '', args, $.extend(base, options));
  },
  /**
   * 下载文件
   * @param {Object} args 请求参数
   * @param {string} [args.id] *id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  downLoad: function(args, options) {
    base.ajaxOptions.url = base.server() + '/downLoad/{id}';
    base.ajaxOptions.type = 'GET';
    return $.api(controllerName, 'downLoad{id}', args, $.extend(base, options));
  },
};
export default x;
