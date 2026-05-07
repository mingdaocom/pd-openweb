export default {
  /**
   * 获取集成服务列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {} args.type
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSystemIntegrationList: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'GetSystemIntegrationList', args, options);
  },
  /**
   * 获取集成服务详情
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {string} args.id 集成服务 Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSystemIntegration: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'GetSystemIntegration', args, options);
  },
  /**
   * 添加集成服务
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {object} args.configSetting 集成服务 接口配置信息
   * @param {} args.type
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addSystemIntegration: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'AddSystemIntegration', args, options);
  },
  /**
   * 更新集成服务
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {object} args.configSetting 集成服务 接口配置信息
   * @param {string} args.id 集成服务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateSystemIntegration: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'UpdateSystemIntegration', args, options);
  },
  /**
   * 删除集成服务
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {string} args.id 集成服务 Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deletSystemIntegration: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'DeletSystemIntegration', args, options);
  },
  /**
   * 关闭/开启集成服务
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id
   * @param {boolean} args.isOpen 是否开启
   * @param {string} args.id 集成服务id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  changeSystemIntegrationStatus: function (args, options = {}) {
    return mdyAPI('SystemIntegration', 'ChangeSystemIntegrationStatus', args, options);
  },
};
