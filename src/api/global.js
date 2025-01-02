export default {
  /**
  * 获取全局依赖的数据
  * @param {Object} args 请求参数
  * @param {string} args.token API token
  * @param {string} args.projectId 组织id
  * @param {} args.lang
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGlobalMeta: function (args, options = {}) {
     
     return mdyAPI('Global', 'GetGlobalMeta', args, options);
   },
  /**
  * 获取系统额外配置信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSystemConfiguration: function (args, options = {}) {
     
     return mdyAPI('Global', 'GetSystemConfiguration', args, options);
   },
};
