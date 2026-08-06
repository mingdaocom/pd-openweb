export default {
  /**
  * 获取 Zendesk Widget JWT
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWidgetJwt: function (args, options = {}) {
     
     return mdyAPI('Zendesk', 'GetWidgetJwt', args, options);
   },
  /**
  * 获取 Zendesk SSO JWT
  * @param {Object} args 请求参数
  * @param {string} args.appKey 应用Id
  * @param {string} args.code 访问令牌
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSsoJwt: function (args, options = {}) {
     
     return mdyAPI('Zendesk', 'GetSsoJwt', args, options);
   },
};
