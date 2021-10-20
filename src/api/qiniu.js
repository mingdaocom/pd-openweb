define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取七牛上传 token
    * @param {Object} args 请求参数
    * @param {array} args.files 批量上传文件token 请求对象
    * @param {} args.type token 用途  0 =普通，1= 用户头像，2=群组头像，3 = 聊天群组头像,4 = 网络logo，5 = 自定义图标
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
    * @param {array} args.files 批量上传文件token 请求对象
    * @param {} args.type token 用途  0 =普通，1= 用户头像，2=群组头像，3 = 聊天群组头像,4 = 网络logo，5 = 自定义图标
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getFileUploadToken: function (args, options) {
      return $.api('Qiniu', 'GetFileUploadToken', args, options);
    },

  };
});
