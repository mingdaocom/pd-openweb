export default {
  /**
   * 获取网络的微软Entra设置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorkMicrosoftProjectSettingInfo: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'GetWorkMicrosoftProjectSettingInfo', args, options);
  },
  /**
   * 微软Entra授权后完成租户id设置
   * @param {Object} args 请求参数
   * @param {string} args.state state
   * @param {string} args.tenantId 租户ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setWorkMicrosoftTenantId: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'SetWorkMicrosoftTenantId', args, options);
  },
  /**
   * 编辑网络的微软Entra自建应用集成设置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.groupId 组ID
   * @param {boolean} args.enable 是否启用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editMicrosoftProjectSetting: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'EditMicrosoftProjectSetting', args, options);
  },
  /**
   * 开启/关闭只允许微软Entra登录
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {integer} args.status 1代表开通；2代表关闭
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setEntraOnlyLogin: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'SetEntraOnlyLogin', args, options);
  },
  /**
   * 微软Entra自建应用集成通讯录同步到明道云
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {object} args.userMaps 明道用户和微信的手动映射关系
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  syncMicrosoftToMingByApp: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'SyncMicrosoftToMingByApp', args, options);
  },
  /**
   * 检测微软Entra自建应用集成通讯录同步到明道云
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkMicrosoftToMingByApp: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'CheckMicrosoftToMingByApp', args, options);
  },
  /**
   * 获取微软Entra通讯录
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.keywords
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMicrosoftStructureInfo: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'GetMicrosoftStructureInfo', args, options);
  },
  /**
   * 获取微软Entra和明道云用户绑定关系列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.platformKeyword
   * @param {string} args.tpKeyword
   * @param {integer} args.pageIndex
   * @param {integer} args.pageSize
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMicrosoftUserRelations: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'GetMicrosoftUserRelations', args, options);
  },
  /**
   * 解绑微软Entra用户和明道云用户关系
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.mdAccountId
   * @param {string} args.tpUserId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  unbindMicrosoftUserRelation: function (args, options = {}) {
    return mdyAPI('WorkMicrosoft', 'UnbindMicrosoftUserRelation', args, options);
  },
};
