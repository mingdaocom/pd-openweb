export default {
  /**
   * 获取语言识别临时token
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFederationToken: function (args, options = {}) {
    return mdyAPI('Mingo', 'GetFederationToken', args, options);
  },
  /**
   * 获取聊天历史记录
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getHistoryRecord: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('Mingo', 'GetHistoryRecord', args, options);
  },
  /**
   * 获取单个聊天历史记录
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getChat: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('Mingo', 'GetChat', args, options);
  },
  /**
   * 保存聊天记录
   * @param {Object} args 请求参数
   * @param {string} args.chatId 对话ID
   * @param {string} args.title 对话标题
   * @param {string} args.updateTime 更新时间
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveRecord: function (args, options = {}) {
    return mdyAPI('Mingo', 'SaveRecord', args, options);
  },
  /**
   * 删除聊天记录
   * @param {Object} args 请求参数
   * @param {string} args.chatId 对话ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteRecord: function (args, options = {}) {
    return mdyAPI('Mingo', 'DeleteRecord', args, options);
  },
  /**
   * 获取AI智能推荐的工作表
   * @param {Object} args 请求参数
   * @param {string} args.appId Appid
   * @param {boolean} args.isReload 是否重新加载
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRecommendedSheets: function (args, options = {}) {
    return mdyAPI('Mingo', 'GetRecommendedSheets', args, options);
  },
  /**
   * 获取AI智能推荐的工作表名称和图标
   * @param {Object} args 请求参数
   * @param {string} args.appId Appid
   * @param {string} args.requirements 用户输入需求
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRecommendedSheetSummaries: function (args, options = {}) {
    return mdyAPI('Mingo', 'GetRecommendedSheetSummaries', args, options);
  },
  /**
   * AI创建示例数据 推荐创建方向
   * @param {Object} args 请求参数
   * @param {string} args.appId Appid
   * @param {string} args.worksheetId WorksheetId
   * @param {} args.langType
   * @param {boolean} args.isReload 是否重新加载
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRecommendedDirections: function (args, options = {}) {
    return mdyAPI('Mingo', 'GetRecommendedDirections', args, options);
  },
  /**
   * 识别内容创建记录 H5使用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.worksheetId WorksheetId
   * @param {} args.langType
   * @param {array} args.messageList 用户输入对话
   * @param {boolean} args.isSmartFill 是否使用智能填充
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  generateRecordByMobile: function (args, options = {}) {
    return mdyAPI('Mingo', 'GenerateRecordByMobile', args, options);
  },
  /**
   * AI生成应用或工作表描述
   * @param {Object} args 请求参数
   * @param {string} args.appId Appid
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.name 应用或者工作表名称
   * @param {integer} args.type 1 是应用  2工作表的
   * @param {} args.langType
   * @param {string} args.desc 上次填写的描述
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  generateAppOrWorksheetDescription: function (args, options = {}) {
    return mdyAPI('Mingo', 'GenerateAppOrWorksheetDescription', args, options);
  },
  /**
   * AI创建对话机器人
   * @param {Object} args 请求参数
   * @param {string} args.appId Appid
   * @param {string} args.robotDescription 机器人的描述
   * @param {integer} args.type 1 生成推荐描述，2生成机器人信息 3生成机器人提示词
   * @param {} args.langType
   * @param {boolean} args.isReload 是否重新加载
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  generateChatRobotInfo: function (args, options = {}) {
    return mdyAPI('Mingo', 'GenerateChatRobotInfo', args, options);
  },
};
