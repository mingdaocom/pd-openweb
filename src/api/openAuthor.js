export default {
  /**
   * 组织三方应用开关
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSetting: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('OpenAuthor', 'GetSetting', args, options);
  },
  /**
   * 设置三方应用开关
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.enabled 是否启用
   * @param {boolean} args.patEnabled 是否允许使用个人访问令牌
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSetting: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'EditSetting', args, options);
  },
  /**
   * 查询 CLI 访问策略开关。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCliAccessPolicySetting: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetCliAccessPolicySetting', args, options);
  },
  /**
   * 编辑 CLI 访问策略开关。
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织 Id。
   * @param {boolean} args.enabled 是否开启 CLI 访问策略。
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editCliAccessPolicySetting: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'EditCliAccessPolicySetting', args, options);
  },
  /**
   * 获取组织三方应用列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.keywords
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppConfigs: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetAppConfigs', args, options);
  },
  /**
   * 获取组织三方应用详情
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.keywords
   * @param {string} args.oAuthAppId 三方应用id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppConfig: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetAppConfig', args, options);
  },
  /**
   * 编辑组织三方应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.appId 应用id
   * @param {string} args.keywords
   * @param {string} args.oAuthAppId 授权应用id
   * @param {integer} args.status 状态，0 = 关闭，1 = 开启
   * @param {integer} args.scopeType 应用访问范围配置方式，1 = 全部应用可访问，2 = 指定应用可访问
   * @param {array} args.appIds 指定应用ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAppConfigs: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'EditAppConfigs', args, options);
  },
  /**
   * 个人已经授权过的应用列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  userGrantedList: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'UserGrantedList', args, options);
  },
  /**
   * 终止个人授权应用
   * @param {Object} args 请求参数
   * @param {string} args.id 个人授权记录id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  closeUserGranted: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'CloseUserGranted', args, options);
  },
  /**
   * 获取当前用户的个人访问令牌列表
   * @param {Object} args 请求参数
   * @param {integer} args.status 状态过滤，0=全部，1=生效中，2=已过期，3=已失效（如组织关闭了 PAT 功能）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPATs: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetPATs', args, options);
  },
  /**
   * 获取用户组织下的个人访问令牌列表
   * @param {Object} args 请求参数
   * @param {integer} args.status 状态过滤，0=全部，1=生效中，2=已过期，3=已失效（如组织关闭了 PAT 功能）
   * @param {string} args.projectId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPATsByProject: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetPATsByProject', args, options);
  },
  /**
   * 获取令牌详情
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'GetPAT', args, options);
  },
  /**
   * 创建个人访问令牌（返回原始 Token，仅此一次）
   * @param {Object} args 请求参数
   * @param {string} args.name 令牌名称
   * @param {string} args.projectId 允许访问的组织 id
   * @param {integer} args.entityScopeType 组织范围类型，1 = 现在和将来所有组织，2 = 指定组织
   * @param {array} args.projectIds 指定组织 id 列表
   * @param {array} args.scopeCodes 权限范围代码列表
   * @param {integer} args.appScopeType 应用范围类型：1=所有应用，2=指定应用
   * @param {array} args.appIds 指定应用时的应用 id 列表（AppScopeType=2 时有效）
   * @param {integer} args.validityType 有效期类型：0=永久有效，1=相对天数，2=自定义时间
   * @param {integer} args.days 相对天数（ValidityType=1 时有效，例如 1、7、30）
   * @param {string} args.customTime 自定义截止时间（ValidityType=2 时有效）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createPAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'CreatePAT', args, options);
  },
  /**
   * 编辑个人访问令牌配置（组织范围不允许编辑）
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {string} args.name 令牌名称
   * @param {array} args.scopeCodes 权限范围代码列表
   * @param {integer} args.appScopeType 应用范围类型，1 = 现在和将来所有应用，2 = 指定应用
   * @param {array} args.appIds 指定应用 id 列表
   * @param {integer} args.validityType 有效期类型，0 = 永久有效，1 = 相对天数，2 = 自定义时间
   * @param {integer} args.days 相对天数
   * @param {string} args.customTime 自定义截止时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updatePAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'UpdatePAT', args, options);
  },
  /**
   * 修改个人访问令牌名称
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {string} args.newName 新名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  renamePAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'RenamePAT', args, options);
  },
  /**
   * 重置个人访问令牌，生成新令牌并使旧令牌失效。
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  resetPAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'ResetPAT', args, options);
  },
  /**
   * 将个人访问令牌立即置为已过期。
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  expirePAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'ExpirePAT', args, options);
  },
  /**
   * 删除个人访问令牌
   * @param {Object} args 请求参数
   * @param {string} args.id 令牌 id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deletePAT: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'DeletePAT', args, options);
  },
  /**
   * 测试：自省 PAT，验证令牌有效性并返回权限信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  introspectPATTest: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('OpenAuthor', 'IntrospectPATTest', args, options);
  },
  /**
   * 测试clientId获取应用信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOAuthAppInfoByClientIdTest: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('OpenAuthor', 'GetOAuthAppInfoByClientIdTest', args, options);
  },
  /**
   * 测试用户发起授权前的检查
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  userAuthorizeCheckTest: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'UserAuthorizeCheckTest', args, options);
  },
  /**
   * 测试用户发起授权
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  userAuthorizeTest: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'UserAuthorizeTest', args, options);
  },
  /**
   * 测试临时授权码换取令牌
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  issueTokenTest: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'IssueTokenTest', args, options);
  },
  /**
   * 测试刷新令牌
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refreshTokenTest: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'RefreshTokenTest', args, options);
  },
  /**
   * 测试令牌验证
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  introspectTokenTest: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('OpenAuthor', 'IntrospectTokenTest', args, options);
  },
};
