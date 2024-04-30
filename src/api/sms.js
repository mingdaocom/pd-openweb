export default {
  /**
  * 修改服务商
  * @param {Object} args 请求参数
  * @param {array} args.providers 服务商列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editProviders: function (args, options = {}) {
     
     return mdyAPI('Sms', 'EditProviders', args, options);
   },
  /**
  * 获取服务商信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProviders: function (args, options = {}) {
     
     return mdyAPI('Sms', 'GetProviders', args, options);
   },
};
