define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取二维码
    * @param {Object} args 请求参数
    * @param {} args.signMode 模式 1：只扫码，2：扫脸
    * @param {string} args.workId 流程 Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getQrCode: function (args, options) {
      return $.api('CodeAuth', 'GetQrCode', args, options);
    },

    /**
    * 获取扫码结果
    * @param {Object} args 请求参数
    * @param {string} args.state 随机码
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getQrCodeResult: function (args, options) {
      return $.api('CodeAuth', 'GetQrCodeResult', args, options);
    },

    /**
    * 获取默认图片
    * @param {Object} args 请求参数
    * @param {string} args.workId 流程Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDefaultPicUrl: function (args, options) {
      return $.api('CodeAuth', 'GetDefaultPicUrl', args, options);
    },

  };
});
