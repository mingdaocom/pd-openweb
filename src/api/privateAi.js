export default {
  /**
   * 获取Ai配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAi: function (args, options = {}) {
    return mdyAPI('PrivateAi', 'GetAi', args, options);
  },
  /**
   * 修改Ai配置
   * @param {Object} args 请求参数
   * @param {integer} args.type 类型 1:自主集成  2:OpenAI
   * @param {string} args.model 模型名称
   * @param {string} args.key 密钥（需要RSA加密传输）
   * @param {string} args.baseUrl 服务地址（仅自主集成类型需要）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAi: function (args, options = {}) {
    return mdyAPI('PrivateAi', 'EditAi', args, options);
  },
  /**
   * 删除Ai配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeAi: function (args, options = {}) {
    return mdyAPI('PrivateAi', 'RemoveAi', args, options);
  },
};
