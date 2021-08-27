define(function (require, exports, module) {
  module.exports = {
    /**
    * 导出公司员工列表
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    exportProjectUserList: function (args, options) {
      return $.api('Download', 'ExportProjectUserList', args, options);
    },

    /**
    * 下载自定义图标
    * @param {Object} args 请求参数
    * @param {array} args.fileNames 自定义图标名称
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    customIcon: function (args, options) {
      return $.api('Download', 'CustomIcon', args, options);
    },

  };
});
