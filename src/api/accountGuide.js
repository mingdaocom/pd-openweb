export default {
  /**
   * 设置引导
   * @param {Object} args 请求参数
   * @param {} args.userGuideSetting
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setAccountGuide: function (args, options = {}) {
    return mdyAPI('AccountGuide', 'SetAccountGuide', args, options);
  },
};
