export default {
  /**
   * 获取缓存版本
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getVersion: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('Version', 'GetVersion', args, options);
  },
};
