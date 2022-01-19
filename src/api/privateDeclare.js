define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取申明
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDeclare: function (args, options) {
      return $.api('PrivateDeclare', 'GetDeclare', args, options);
    },

    /**
    * 修改申明
    * @param {Object} args 请求参数
    * @param {string} args.declareId 申明Id
    * @param {string} args.agreement 服务协议
    * @param {string} args.privacy 隐私政策
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editDeclare: function (args, options) {
      return $.api('PrivateDeclare', 'EditDeclare', args, options);
    },

    /**
    * 获取用户需要同意的申明
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getDeclareByAcountId: function (args, options) {
      return $.api('PrivateDeclare', 'GetDeclareByAcountId', args, options);
    },

    /**
    * 添加同意记录
    * @param {Object} args 请求参数
    * @param {string} args.declareId 申明Id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addDeclareAgreeLog: function (args, options) {
      return $.api('PrivateDeclare', 'AddDeclareAgreeLog', args, options);
    },

  };
});
