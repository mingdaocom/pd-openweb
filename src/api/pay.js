export default {
  /**
  * 支付宝支付
跳转到支付页面
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   aliPay: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Pay', 'AliPay', args, options);
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
     return mdyAPI('Pay', 'AlipayReturn', args, options);
   },
  /**
  * Alipay Notify Url
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   alipayNotify: function (args, options = {}) {
     
     return mdyAPI('Pay', 'AlipayNotify', args, options);
   },
  /**
  * 微信支付
返回微信支付二维码
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   weChatPay: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Pay', 'WeChatPay', args, options);
   },
  /**
  * 微信支付回调通知
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   weChatNotify: function (args, options = {}) {
     
     return mdyAPI('Pay', 'WeChatNotify', args, options);
   },
  /**
  * 查询订单状态
前端轮询
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   weChatQueryOrder: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Pay', 'WeChatQueryOrder', args, options);
   },
};
