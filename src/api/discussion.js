export default {
  /**
  * 添加讨论
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 源ID
  * @param {} args.sourceType 类型
  * @param {string} args.message 消息
  * @param {string} args.replyId 被回复的讨论id
  * @param {string} args.attachments 本地附件
  * @param {string} args.knowledgeAtts 知识附件
  * @param {string} args.appId 基础模块或第三方应用的 appId
  * @param {} args.location 坐标位置
  * @param {string} args.extendsId 扩展ID(工作表:appId|viewId)
  * @param {} args.entityType 0 = 全部，2=外部讨论
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addDiscussion: function (args, options = {}) {
     
     return $.api('Discussion', 'AddDiscussion', args, options);
   },
  /**
  * 获取指定源讨论
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 源ID
  * @param {} args.sourceType 类型
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {boolean} args.isFocus 是否只取自己相关
  * @param {} args.entityType 0 = 全部，1 = 不包含外部讨论，2=外部讨论
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussions: function (args, options = {}) {
     
     return $.api('Discussion', 'GetDiscussions', args, options);
   },
  /**
  * 获取讨论数量
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 源ID
  * @param {} args.sourceType 类型
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {boolean} args.isFocus 是否只取自己相关
  * @param {} args.entityType 0 = 全部，1 = 不包含外部讨论，2=外部讨论
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussionsCount: function (args, options = {}) {
     
     return $.api('Discussion', 'GetDiscussionsCount', args, options);
   },
  /**
  * 删除讨论
  * @param {Object} args 请求参数
  * @param {string} args.discussionId 讨论id
  * @param {} args.sourceType 源类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeDiscussion: function (args, options = {}) {
     
     return $.api('Discussion', 'RemoveDiscussion', args, options);
   },
  /**
  * 获取单条讨论的msg
  * @param {Object} args 请求参数
  * @param {string} args.discussionId 讨论id
  * @param {} args.sourceType 源类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDiscussionMsg: function (args, options = {}) {
     
     return $.api('Discussion', 'GetDiscussionMsg', args, options);
   },
  /**
  * 获取源附件（不分页）
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 讨论id
  * @param {} args.sourceType 源类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSourceAtts: function (args, options = {}) {
     
     return $.api('Discussion', 'GetSourceAtts', args, options);
   },
};
