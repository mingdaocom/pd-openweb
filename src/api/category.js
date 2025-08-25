export default {
  /**
   * 搜索
   * @param {Object} args 请求参数
   * @param {string} args.keywords 关键词
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  autoCompleteCategory: function (args, options = {}) {
    return mdyAPI('Category', 'AutoCompleteCategory', args, options);
  },
};
