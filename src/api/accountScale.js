define(function (require, exports, module) {
  module.exports = {
    /**
    * 记录用户选择的规模
    * @param {Object} args 请求参数
    * @param {} args.type 类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addAccountScale: function (args, options) {
      return $.api('AccountScale', 'AddAccountScale', args, options);
    },

  };
});
