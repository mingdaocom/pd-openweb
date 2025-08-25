export default {
  /**
   * 批量修改服务商信息
   * @param {Object} args 请求参数
   * @param {array} args.providers 服务商列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editProviders: function (args, options = {}) {
    return mdyAPI('Sms', 'EditProviders', args, options);
  },
  /**
   * 单个修改服务商信息
   * @param {Object} args 请求参数
   * @param {} args.provider
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'EditProvider', args, options);
  },
  /**
   * 修改服务商启用状态
   * @param {Object} args 请求参数
   * @param {string} args.name 服务商名称
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editProviderStatus: function (args, options = {}) {
    return mdyAPI('Sms', 'EditProviderStatus', args, options);
  },
  /**
   * 删除服务商
   * @param {Object} args 请求参数
   * @param {string} args.name 服务商名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'RemoveProvider', args, options);
  },
  /**
   * 获取服务商列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProviders: function (args, options = {}) {
    return mdyAPI('Sms', 'GetProviders', args, options);
  },
};
