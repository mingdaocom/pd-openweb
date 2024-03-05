export default {
  /**
  * 获取预览链接
  * @param {Object} args 请求参数
  * @param {string} args.id 文件id
  * @param {string} args.path 文件路径
  * @param {string} args.ext 文件后缀
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPreviewLink: function (args, options = {}) {
     
     return $.api('Chat', 'GetPreviewLink', args, options);
   },
  /**
  * 获取卡片详情
  * @param {Object} args 请求参数
  * @param {string} args.task 任务Id，多个用 “|” 分割 (taskId1|taskId2)
  * @param {string} args.post 动态Id，多个用 “|” 分割 (postId1|postId2)
  * @param {string} args.calendar 日程Id，多个用 “|” 分割 (calendarId1|calendarId2)
  * @param {string} args.kcfile 文件Id，多个用 “|” 分割 (fileId1|fileId2)
  * @param {string} args.worksheet 工作表Id，多个用 “|” 分割 (worksheetId1|worksheetId2)
  * @param {string} args.worksheetrow 工作表记录Id，需要带上工作表Id，表与行Id用&gt;分割，多个用 “|” 分割 (worksheet1Id&gt;worksheet1RowId|worksheet2Id&gt;worksheet2RowId)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCardDetails: function (args, options = {}) {
     
     return $.api('Chat', 'GetCardDetails', args, options);
   },
  /**
  * 专供聊天服务接口
获取群组信息以及部分用户信息
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupInfo: function (args, options = {}) {
     
     return $.api('Chat', 'GetGroupInfo', args, options);
   },
  /**
  * 获取群文件列表
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {string} args.fromUser 发送者Id
  * @param {string} args.start 查询开始时间
  * @param {string} args.end 查询结束时间
  * @param {string} args.keywords 搜索关键词
  * @param {integer} args.pageIndex 第几页
  * @param {integer} args.pageSize 每页显示多少条
  * @param {integer} args.fileType 文件类型 -1:所有 1:纯文本 2:图片 3:语音 4:附件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupFileList: function (args, options = {}) {
     
     return $.api('Chat', 'GetGroupFileList', args, options);
   },
  /**
  * 获取用户聊天文件列表
  * @param {Object} args 请求参数
  * @param {string} args.withUser 账号id
  * @param {string} args.fromUser 已废弃
  * @param {string} args.sendBy 谁发的
  * @param {string} args.start 查询开始时间
  * @param {string} args.end 查询结束时间
  * @param {string} args.keywords 搜索关键词
  * @param {integer} args.pageIndex 第几页
  * @param {integer} args.pageSize 每页显示多少条
  * @param {integer} args.fileType 文件类型 -1:所有 1:纯文本 2:图片 3:语音 4:附件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserFileList: function (args, options = {}) {
     
     return $.api('Chat', 'GetUserFileList', args, options);
   },
  /**
  * 获取群组详情中tab计数
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.groupId 群组id
  * @param {integer} args.loadTabType 1 成员列表, 2 文件列表, 4 消息列表 ; 并集加起来, 如：成员数和消息列表,则是 1+4=5
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupCountByTabName: function (args, options = {}) {
     
     return $.api('Chat', 'GetGroupCountByTabName', args, options);
   },
  /**
  * 获取用户侧边栏数据
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.withUser 账号id
  * @param {integer} args.loadTabType 2 文件列表, 4 消息列表 ; 并集加起来, 如,成员数和消息列表,则是 2+4=6
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserCountByTabName: function (args, options = {}) {
     
     return $.api('Chat', 'GetUserCountByTabName', args, options);
   },
  /**
  * 发送文件到消息
  * @param {Object} args 请求参数
  * @param {array} args.files 文件列表
  * @param {string} args.message 消息
  * @param {string} args.toAccountId 接收者id
  * @param {string} args.toGroupId 接收群id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendFileToChat: function (args, options = {}) {
     
     return $.api('Chat', 'SendFileToChat', args, options);
   },
  /**
  * 发送卡片到消息
  * @param {Object} args 请求参数
  * @param {array} args.cards 卡片列表
  * @param {string} args.message 消息
  * @param {string} args.toAccountId 接收者id
  * @param {string} args.toGroupId 接收群id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendCardToChat: function (args, options = {}) {
     
     return $.api('Chat', 'SendCardToChat', args, options);
   },
  /**
  * 获取聊天Session列表
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索关键词
  * @param {integer} args.size pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getChatList: function (args, options = {}) {
     
     return $.api('Chat', 'GetChatList', args, options);
   },
  /**
  * 将chat附件转换为其他模块的附件
  * @param {Object} args 请求参数
  * @param {string} args.qiniuUrl 七牛文件地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   convertToOtherAttachment: function (args, options = {}) {
     
     return $.api('Chat', 'ConvertToOtherAttachment', args, options);
   },
};
