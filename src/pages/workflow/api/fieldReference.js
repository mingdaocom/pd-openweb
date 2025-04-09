import base, { controllerName } from './base';
/**
 * fieldReference
*/
var fieldReference = {
  /**
   * 刷新网络下所有流程
   * @param {Object} args 请求参数
   * @param {string} [args.access_token] 令牌
   * @param {RequestFieldReference} {init:刷新(boolean),relationId:网络id 或者应用id(string),relationType:类型 0： 网络，2：应用(integer),}*request
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   */
  initProcessFieldReference: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/fieldReference/initProcessFieldReference';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'fieldReferenceinitProcessFieldReference', JSON.stringify(args), $.extend(base, options));
  },
};
export default fieldReference;