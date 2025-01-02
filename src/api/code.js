export default {
  /**
  * 根据url生二维码
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createQrCodeImage: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Code', 'CreateQrCodeImage', args, options);
   },
  /**
  * 生成验证码
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createVerifyCodeImage: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Code', 'CreateVerifyCodeImage', args, options);
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
     
     return mdyAPI('Code', 'GenerateCodeBlock', args, options);
   },
  /**
  * 获取AI聊天历史记录
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGenerateCodeRecord: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Code', 'GetGenerateCodeRecord', args, options);
   },
  /**
  * 保存ai聊天记录
  * @param {Object} args 请求参数
  * @param {string} args.workflowId 工作流Id
  * @param {string} args.nodeId 1 是js  2是python
  * @param {array} args.messageList 消息列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveGenerateCodeRecord: function (args, options = {}) {
     
     return mdyAPI('Code', 'SaveGenerateCodeRecord', args, options);
   },
};
