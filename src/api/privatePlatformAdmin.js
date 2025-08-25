export default {
  /**
   * 获取平台管理员列表
   * @param {Object} args 请求参数
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.keywords 关键词
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPlatformAdmins: function (args, options = {}) {
    return mdyAPI('PrivatePlatformAdmin', 'GetPlatformAdmins', args, options);
  },
  /**
   * 添加平台管理员
   * @param {Object} args 请求参数
   * @param {array} args.accountIds 账号Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addPlatformAdmins: function (args, options = {}) {
    return mdyAPI('PrivatePlatformAdmin', 'AddPlatformAdmins', args, options);
  },
  /**
   * 删除平台管理员
   * @param {Object} args 请求参数
   * @param {array} args.accountIds 账号Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removePlatformAdmins: function (args, options = {}) {
    return mdyAPI('PrivatePlatformAdmin', 'RemovePlatformAdmins', args, options);
  },
};
