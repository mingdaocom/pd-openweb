export default {
  /**
   * 获取Ocr配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOcr: function (args, options = {}) {
    return mdyAPI('PrivateOcr', 'GetOcr', args, options);
  },
  /**
   * 修改Ocr配置
   * @param {Object} args 请求参数
   * @param {integer} args.type 类型 1:自主集成  2:Tengxunyun
   * @param {string} args.secretId 密钥Id
   * @param {string} args.secretKey 密钥Key（需要RSA加密传输）
   * @param {string} args.baseUrl 服务地址（仅自主集成类型需要）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editOcr: function (args, options = {}) {
    return mdyAPI('PrivateOcr', 'EditOcr', args, options);
  },
  /**
   * 删除Ocr配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeOcr: function (args, options = {}) {
    return mdyAPI('PrivateOcr', 'RemoveOcr', args, options);
  },
};
