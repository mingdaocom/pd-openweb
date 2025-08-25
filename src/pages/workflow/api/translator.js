import base, { controllerName } from './base';
/**
 * translator
*/
var translator = {
  /**
   * 获取流程翻译详情
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.processId] *流程id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessTranslator: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/translator/getProcessTranslator';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'translatorgetProcessTranslator', args, $.extend(base, options));
  },
  /**
   * 获取应用下的流程列表
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {string} [args.all] 是否全量拉取
   * @param {string} [args.apkId] *应用id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  getProcessTranslatorList: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/translator/getProcessTranslatorList';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'translatorgetProcessTranslatorList', args, $.extend(base, options));
  },
};
export default translator;