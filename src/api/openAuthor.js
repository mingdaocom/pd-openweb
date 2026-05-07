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
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSetting: function (args, options = {}) {
    return mdyAPI('OpenAuthor', 'EditSetting', args, options);
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
