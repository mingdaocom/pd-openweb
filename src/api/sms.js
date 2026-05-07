export default {
  /**
   * 添加 Twilio 服务商
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.keySid API Key Sid（需RSA加密传输）
   * @param {string} args.keySecret API Key Secret（需RSA加密传输）
   * @param {string} args.verifyServiceSid 验证码服务 Sid
   * @param {string} args.messagingServiceSid 自定义内容服务 Sid
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addTwilioProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'AddTwilioProvider', args, options);
  },
  /**
   * 修改 Twilio 服务商
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.id 服务商Id
   * @param {string} args.keySid API Key Sid（需RSA加密传输）
   * @param {string} args.keySecret API Key Secret（需RSA加密传输）
   * @param {array} args.secretUnmodifyKeys 密钥信息中不修改的Key列表：KeySid、KeySecret
   * @param {string} args.verifyServiceSid 验证码服务 Sid
   * @param {string} args.messagingServiceSid 自定义内容服务 Sid
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editTwilioProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'EditTwilioProvider', args, options);
  },
  /**
   * 删除 Twilio 服务商
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.id 服务商Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeTwilioProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'RemoveTwilioProvider', args, options);
  },
  /**
   * 获取 Twilio 服务商
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTwilioProvider: function (args, options = {}) {
    return mdyAPI('Sms', 'GetTwilioProvider', args, options);
  },
  /**
   * 获取 Twilio 服务商基本信息（前端页面集成状态显示需要）
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTwilioProviderBaseInfo: function (args, options = {}) {
    return mdyAPI('Sms', 'GetTwilioProviderBaseInfo', args, options);
  },
};
