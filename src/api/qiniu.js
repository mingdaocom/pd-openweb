define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取七牛上传 token
    * @param {Object} args 请求参数
    * @param {} args.bucket 七牛空间类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getUploadToken: function (args, options) {
      return $.api('Qiniu', 'GetUploadToken', args, options);
    },

    /**
    * 获取七牛上传 token
    * @param {Object} args 请求参数
    * @param {} args.bucket 七牛空间类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getFileUploadToken: function (args, options) {
      return $.api('Qiniu', 'GetFileUploadToken', args, options);
    },

  };
});
