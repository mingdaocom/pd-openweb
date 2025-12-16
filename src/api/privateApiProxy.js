export default {
  /**
   * 获取ApiProxy配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getApiProxy: function (args, options = {}) {
    return mdyAPI('PrivateApiProxy', 'GetApiProxy', args, options);
  },
  /**
   * 修改ApiProxy配置
   * @param {Object} args 请求参数
   * @param {} args.type
   * @param {string} args.ip IP
   * @param {string} args.port 端口
   * @param {boolean} args.openIdentityValidate 是否开启身份验证
   * @param {string} args.username 用户名
   * @param {string} args.password 密码（需要RSA加密传输）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editApiProxy: function (args, options = {}) {
    return mdyAPI('PrivateApiProxy', 'EditApiProxy', args, options);
  },
  /**
   * 删除ApiProxy配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeApiProxy: function (args, options = {}) {
    return mdyAPI('PrivateApiProxy', 'RemoveApiProxy', args, options);
  },
};
