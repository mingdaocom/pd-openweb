export default {
  /**
  * 添加讨论
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 源ID
  * @param {} args.sourceType
  * @param {string} args.message 消息
  * @param {string} args.replyId 被回复的讨论id
  * @param {string} args.attachments 本地附件
  * @param {string} args.knowledgeAtts 知识附件
  * @param {string} args.appId 基础模块或第三方应用的 appId
  * @param {} args.location
  * @param {string} args.extendsId 扩展ID(工作表:appId|viewId)
  * @param {} args.entityType
  * @param {object} args.extends 扩展参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addDiscussion: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'AddDiscussion', args, options);
   },
  /**
  * 获取指定源讨论
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 讨论来源ID
  * @param {} args.sourceType
  * @param {boolean} args.isFocus 是否只返回与当前用户相关的讨论
  * @param {boolean} args.containAttachment 是否只返回包含附件的讨论
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.entityType
  * @param {integer} args.focusType 与我相关类型is_focus传true 0:默认老逻辑全部 1:我发布的 2:我回复别人 3:别人回复我
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussions: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'GetDiscussions', args, options);
   },
  /**
  * 获取讨论数量
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 讨论来源ID
  * @param {} args.sourceType
  * @param {boolean} args.isFocus 是否只返回与当前用户相关的讨论
  * @param {boolean} args.containAttachment 是否只返回包含附件的讨论
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.entityType
  * @param {integer} args.focusType 与我相关类型is_focus传true 0:默认老逻辑全部 1:我发布的 2:我回复别人 3:别人回复我
  * @param {string} args.keywords 关键字
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussionsCount: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'GetDiscussionsCount', args, options);
   },
  /**
  * 删除讨论
  * @param {Object} args 请求参数
  * @param {string} args.discussionId 讨论id
  * @param {} args.sourceType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeDiscussion: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'RemoveDiscussion', args, options);
   },
  /**
  * 获取单条讨论的msg
  * @param {Object} args 请求参数
  * @param {string} args.discussionId 讨论id
  * @param {} args.sourceType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussionMsg: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'GetDiscussionMsg', args, options);
   },
  /**
  * 获取源附件（不分页）
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 讨论id
  * @param {} args.sourceType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSourceAtts: function (args, options = {}) {
     
     return mdyAPI('Discussion', 'GetSourceAtts', args, options);
   },
};
