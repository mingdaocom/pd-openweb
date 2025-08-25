export default {
  /**
   * 获取授权
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAccessToken: function (args, options = {}) {
    return mdyAPI('Plus', 'GetAccessToken', args, options);
  },
};
