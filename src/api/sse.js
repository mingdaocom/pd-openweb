export default {
  /**
   * 对话方式配置AI助手
   * @param {Object} args 请求参数
   * @param {boolean} args.isFirst
   * @param {array} args.messageList 消息列表
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  dialogueSetupAssistant: function (args, options = {}) {
    return mdyAPI('sse/Assistant', 'DialogueSetupAssistant', args, options);
  },
  /**
   * 发送消息
   * @param {Object} args 请求参数
   * @param {string} args.assistantId 助手Id
   * @param {string} args.threadId 线程Id
   * @param {string} args.content 内容
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  chat: function (args, options = {}) {
    return mdyAPI('sse/Assistant', 'Chat', args, options);
  },
  /**
   * 检查人脸识别认证码状态
   * @param {Object} args 请求参数
   * @param {string} args.state 临时状态码
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkFaceCertSSE: function (args, options = {}) {
    return mdyAPI('sse/Certification', 'CheckFaceCertSSE', args, options);
  },
  /**
   * AI生成代码块
   * @param {Object} args 请求参数
   * @param {integer} args.codeType 1 是js  2是python
   * @param {array} args.messageList 消息列表
   * @param {} args.lang
   * @param {array} args.params 自定义提示参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  generateCodeBlock: function (args, options = {}) {
    return mdyAPI('sse/Code', 'GenerateCodeBlock', args, options);
  },
  /**
   * 对话配置自定义字段
   * @param {Object} args 请求参数
   * @param {array} args.messageList 消息列表
   * @param {} args.lang
   * @param {array} args.params 自定义提示参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setupCustomField: function (args, options = {}) {
    return mdyAPI('sse/Code', 'SetupCustomField', args, options);
  },
};
