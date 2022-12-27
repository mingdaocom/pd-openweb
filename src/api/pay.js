export default {
  /**
  * 跳转到支付宝付款页面
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   alipay: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Pay', 'Alipay', args, options);
   },
  /**
  * Alipay Return Url
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   alipayReturn: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Pay', 'AlipayReturn', args, options);
   },
  /**
  * Alipay Notify Url
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   alipayNotify: function (args, options = {}) {
     
     return $.api('Pay', 'AlipayNotify', args, options);
   },
};
