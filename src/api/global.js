export default {
  /**
  * 获取全局依赖的数据
  * @param {Object} args 请求参数
  * @param {string} args.token API token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGlobalMeta: function (args, options = {}) {
     
     return $.api('Global', 'GetGlobalMeta', args, options);
   },
};
