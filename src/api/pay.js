define(function (require, exports, module) {
  module.exports = {
    /**
    * Alipay Notify Url
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    alipayNotify: function (args, options) {
      return $.api('Pay', 'AlipayNotify', args, options);
    },

  };
});
