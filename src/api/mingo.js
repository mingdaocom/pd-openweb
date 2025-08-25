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
};
