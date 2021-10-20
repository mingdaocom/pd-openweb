define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取微信服务号二维码
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getWeiXinServiceNumberQRCode: function (args, options) {
      return $.api('Weixin', 'GetWeiXinServiceNumberQRCode', args, options);
    },

    /**
    * 检查是否绑定微信服务号
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    checkWeiXinServiceNumberBind: function (args, options) {
      return $.api('Weixin', 'CheckWeiXinServiceNumberBind', args, options);
    },

    /**
    * 设置或取消微信登录提醒
    * @param {Object} args 请求参数
    * @param {boolean} args.isOpen 是否取消
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setLoginWeixinNotify: function (args, options) {
      return $.api('Weixin', 'SetLoginWeixinNotify', args, options);
    },

    /**
    * 返回微信JS-SDK配置
返回时间戳签名等
    * @param {Object} args 请求参数
    * @param {string} args.url 地址
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getWeiXinConfig: function (args, options) {
      return $.api('Weixin', 'GetWeiXinConfig', args, options);
    },

  };
});
