define(function (require, exports, module) {
  module.exports = {
    /**
    * 批量初始化网络成员（内部使用）
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {string} args.companyName 网络名称
    * @param {string} args.profession 职业
    * @param {string} args.createAccountId 创建者
    * @param {string} args.emailSuffix 邮箱后缀
    * @param {string} args.filePath 文件路径
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    importUser: function (args, options) {
      return $.api('ImportUserTool', 'ImportUser', args, options);
    },

  };
});
