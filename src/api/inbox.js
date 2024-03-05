export default {
  /**
  * 设置Inbox加星状态
  * @param {Object} args 请求参数
  * @param {string} args.inboxId 消息id
  * @param {} args.inboxFavorite
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setInboxFavorite: function (args, options = {}) {
     
     return $.api('Inbox', 'SetInboxFavorite', args, options);
   },
  /**
  * 获取消息
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.inboxFavorite
  * @param {string} args.keywords 关键词
  * @param {string} args.projectId 网络id
  * @param {} args.searchType
  * @param {} args.type
  * @param {} args.loadType
  * @param {string} args.creatorId 创建人Id
  * @param {string} args.startTime 开始时间
  * @param {string} args.endTime 结束时间
  * @param {boolean} args.clearUnread 是否清理未读数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getInboxMessage: function (args, options = {}) {
     
     return $.api('Inbox', 'GetInboxMessage', args, options);
   },
};
