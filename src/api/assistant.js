export default {
  /**
  * 获取知识库列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键字
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {integer} args.sort 排序0默认  1是按大小 2按文件数量
  * @param {boolean} args.isAsc 是否顺序 true 是 false 否
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListKnowledgeBase: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetListKnowledgeBase', args, options);
   },
  /**
  * 获取知识库详情
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getKnowledgeBase: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetKnowledgeBase', args, options);
   },
  /**
  * 添加或修改知识库
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.projectId 网络id
  * @param {string} args.name 名称
  * @param {string} args.appId Appid
  * @param {string} args.worksheetId WorksheetId
  * @param {string} args.viewId ViewId
  * @param {array} args.attachmentIds 附件控件ids
  * @param {string} args.filter 筛选条件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   upsertKnowledgeBase: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'UpsertKnowledgeBase', args, options);
   },
  /**
  * 删除知识库
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteKnowledgeBase: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'DeleteKnowledgeBase', args, options);
   },
  /**
  * 获取工作表待上传知识库文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListAllowUploadFile: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetListAllowUploadFile', args, options);
   },
  /**
  * 上传知识库文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {array} args.fileIds 页码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   uploadFile: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'UploadFile', args, options);
   },
  /**
  * 获取知识库文件总大小
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getKnowledgeFileTotalSize: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Assistant', 'GetKnowledgeFileTotalSize', args, options);
   },
  /**
  * 获取知识库文件列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListKnowledgeFile: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetListKnowledgeFile', args, options);
   },
  /**
  * 删除知识库文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.knowledgeFileId 知识库文件id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteKnowledgeFile: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'DeleteKnowledgeFile', args, options);
   },
  /**
  * 获取可创建的AI助手的剩余额度
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAIAssistantLimitNumber: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Assistant', 'GetAIAssistantLimitNumber', args, options);
   },
  /**
  * 获取AI助手列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键字
  * @param {integer} args.status 状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getList: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetList', args, options);
   },
  /**
  * 获取AI助手详情
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.assistantId 助手Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   get: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'Get', args, options);
   },
  /**
  * 添加或修改助手
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.projectId 网络id
  * @param {string} args.icon 图标
  * @param {string} args.iconColor icon
  * @param {string} args.name 名称
  * @param {string} args.description 描述
  * @param {string} args.instructions 指令
  * @param {string} args.knowledgeBaseId 知识库id
  * @param {string} args.preamble 开场白
  * @param {array} args.exampleQuestions 示例提问
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   upsert: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'Upsert', args, options);
   },
  /**
  * 设置助手状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.assistantId 助手Id
  * @param {integer} args.status 状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setStatus: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'SetStatus', args, options);
   },
  /**
  * 删除知识库
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.assistantId 助手Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   delete: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'Delete', args, options);
   },
  /**
  * 获取一个的threadId
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.assistantId 助手Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getThread: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetThread', args, options);
   },
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
     
     return mdyAPI('Assistant', 'DialogueSetupAssistant', args, options);
   },
  /**
  * AI智能生成开场白和示例提问
  * @param {Object} args 请求参数
  * @param {string} args.name 助手名称
  * @param {string} args.description 描述
  * @param {string} args.instructions 指令
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   generateAssistantPreamble: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GenerateAssistantPreamble', args, options);
   },
  /**
  * 获取AI助手简要详情
  * @param {Object} args 请求参数
  * @param {string} args.assistantId 助手Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSimpleInfo: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'GetSimpleInfo', args, options);
   },
  /**
  * 重置一个新的线程id
  * @param {Object} args 请求参数
  * @param {string} args.assistantId 助手Id
  * @param {string} args.threadId 原始线程id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetThread: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'ResetThread', args, options);
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
     
     return mdyAPI('Assistant', 'Chat', args, options);
   },
  /**
  * 停止回复
  * @param {Object} args 请求参数
  * @param {string} args.assistantId 助手Id
  * @param {string} args.threadId 线程Id
  * @param {string} args.runId runId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   stopReply: function (args, options = {}) {
     
     return mdyAPI('Assistant', 'StopReply', args, options);
   },
  /**
  * 获取历史消息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getListAssistantMessage: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Assistant', 'GetListAssistantMessage', args, options);
   },
};
