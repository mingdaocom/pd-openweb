define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取用户最常使用标签
    * @param {Object} args 请求参数
    * @param {string} args.accountId 账号id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getUserOftenCategory: function (args, options) {
      return $.api('Category', 'GetUserOftenCategory', args, options);
    },

    /**
    * 搜索
    * @param {Object} args 请求参数
    * @param {string} args.keywords 关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    autoCompleteCategory: function (args, options) {
      return $.api('Category', 'AutoCompleteCategory', args, options);
    },

  };
});
