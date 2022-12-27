export default {
  /**
  * 发布动态
  * @param {Object} args 请求参数
  * @param {string} args.postMsg 内容
  * @param {} args.postType 类型（0:普通动态, 1:链接, 2:图片, 3:文档,4:问答,5:系统,7:投票,9:图文混传附件）
  * @param {} args.scope 分享范围，值是对象方式（shareProjectIds:分享到哪些网络,shareGroupIds:分享到哪些群,radioProjectId:置顶到哪个网络 如：{shareProjectIds:[projectId1,projectId2],shareGroupIds:groupId1,groupIds,radioProjectId:projectId}）
  * @param {string} args.appId 来源应用 Id
  * @param {string} args.remark 附加信息
  * @param {} args.showType 呈现类型（目前表示是否在动态墙中呈现 0：动态 1：只在知识门户）
  * @param {string} args.attachments 上传的附件
  * @param {string} args.knowledgeAttach 引用的知识中心附件
  * @param {boolean} args.addToKc 是否把上传的附件添加到知识中心
  * @param {string} args.addToKcParentId 添加到知识中心的父节点id
  * @param {string} args.addToKcRootId 添加到知识中心的根节点id
  * @param {} args.location 投票类型动态匿名投票是否所有人可见结果（目前没用，所有人都可见）
  * @param {string} args.linkUrl 链接类型动态的链接地址
  * @param {string} args.linkTitle 链接类型动态的标题
  * @param {string} args.linkDesc 链接类型动态的描述
  * @param {string} args.linkThumb 链接类型动态的缩略图
  * @param {string} args.voteOptions 投票类型动态的选项
  * @param {string} args.voteOptionFiles 投票类型动态的选项附件
  * @param {string} args.voteLastTime 投票类型动态的截止日期
  * @param {integer} args.voteLastHour 投票类型动态的截止小时
  * @param {integer} args.voteAvailableNumber 投票类型动态的可投项数
  * @param {boolean} args.voteAnonymous 投票类型动态是否匿名
  * @param {boolean} args.voteVisble 投票类型动态匿名投票是否所有人可见结果（目前没用，所有人都可见）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addPost: function (args, options = {}) {
     
     return $.api('Post', 'AddPost', args, options);
   },
  /**
  * 添加动态回复
  * @param {Object} args 请求参数
  * @param {string} args.message 内容
  * @param {string} args.postID 动态id
  * @param {string} args.replyID 原回复id
  * @param {string} args.replyAccountId 回复者id
  * @param {string} args.attachments 普通附件
  * @param {string} args.knowledgeAttach 知识附件
  * @param {boolean} args.isReshared 是否转发
  * @param {} args.scope 可见范围
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addPostComment: function (args, options = {}) {
     
     return $.api('Post', 'AddPostComment', args, options);
   },
  /**
  * 删除动态
  * @param {Object} args 请求参数
  * @param {string} args.postID 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removePost: function (args, options = {}) {
     
     return $.api('Post', 'RemovePost', args, options);
   },
  /**
  * 删除动态回复
  * @param {Object} args 请求参数
  * @param {string} args.postID 动态id
  * @param {string} args.commentID 回复id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removePostComment: function (args, options = {}) {
     
     return $.api('Post', 'RemovePostComment', args, options);
   },
  /**
  * 修改动态分享范围
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态Id
  * @param {} args.scope 改分享范围，值是对象方式（shareProjectIds:分享到哪些网络,shareGroupIds:分享到哪些群,radioProjectId:置顶到哪个网络 如：{shareProjectIds:[projectId1,projectId2],shareGroupIds:groupId1,groupIds,radioProjectId:projectId}）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPostShareScope: function (args, options = {}) {
     
     return $.api('Post', 'EditPostShareScope', args, options);
   },
  /**
  * 修改动态
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {} args.postType 类型
  * @param {} args.scope 发布范围，值是对象方式（shareProjectIds:分享到哪些网络,shareGroupIds:分享到哪些群,radioProjectId:置顶到哪个网络 如：{shareProjectIds:[projectId1,projectId2],shareGroupIds:groupId1,groupIds,radioProjectId:projectId}）
  * @param {string} args.postMsg 新的动态内容
  * @param {string} args.oldPostMsg 原始动态内容
  * @param {string} args.attachments 上传的附件
  * @param {string} args.knowledgeAttach 引用的知识中心附件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPost: function (args, options = {}) {
     
     return $.api('Post', 'EditPost', args, options);
   },
  /**
  * 获取动态详情
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {string} args.knowledgeId 在知识门户里的id
  * @param {string} args.projectId 网络 Id， 用于知识门户里的动态
  * @param {string} args.detail 控制视频大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPostDetail: function (args, options = {}) {
     
     return $.api('Post', 'GetPostDetail', args, options);
   },
  /**
  * 获取动态列表
  * @param {Object} args 请求参数
  * @param {} args.pPara 动态列表参数
  * @param {string} args.firstPostDateTime 创建时间大于此时间
  * @param {string} args.lastPostDateTime 创建时间小于此时间
  * @param {string} args.accountId 要查看的帐号id
  * @param {string} args.groupId 群组id
  * @param {string} args.listType 列表类型, 为 group,groups,project,ireply,fav,user,myself 中的一个
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页数量
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPostList: function (args, options = {}) {
     
     return $.api('Post', 'GetPostList', args, options);
   },
  /**
  * 获取动态类型
  * @param {Object} args 请求参数
  * @param {string} args.fType 来源type
  * @param {string} args.lType 列表类型, 为 group,groups,project,ireply,fav,user,myself 中的一个
  * @param {string} args.lastPostAutoID 创建时间大于此时间
  * @param {string} args.firstPostAutoID 创建时间小于此时间
  * @param {string} args.range 范围
  * @param {string} args.startDate 开始时间
  * @param {string} args.endDate 结束时间
  * @param {string} args.postType 动态类型
  * @param {string} args.catId 分类id
  * @param {string} args.tagId 标签id
  * @param {string} args.keywords 关键词
  * @param {string} args.pIndex 页码
  * @param {string} args.pSize 每页数量
  * @param {string} args.withAllCommentAttachmentsInPost 包括所有评论附件
  * @param {string} args.aid 账号id
  * @param {string} args.gid 群组id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPostListByLegacyPara: function (args, options = {}) {
     
     return $.api('Post', 'GetPostListByLegacyPara', args, options);
   },
  /**
  * 获取我回复他人的回复列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageSize 每页大小
  * @param {string} args.maxCommentId 从此条回复开始
  * @param {string} args.keywords 关键词
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIRepliedList: function (args, options = {}) {
     
     return $.api('Post', 'GetIRepliedList', args, options);
   },
  /**
  * 判断是否有查看动态的权限
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkPostPermission: function (args, options = {}) {
     
     return $.api('Post', 'CheckPostPermission', args, options);
   },
  /**
  * 获取链接预览消息
  * @param {Object} args 请求参数
  * @param {string} args.url 解析的Url
  * @param {integer} args.minWidth 解析到的图片要求最小宽度（0 代表没要求）
  * @param {integer} args.minHeight 解析到的图片要求最小高度（0 代表没要求）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLinkViewInfo: function (args, options = {}) {
     
     return $.api('Post', 'GetLinkViewInfo', args, options);
   },
  /**
  * 加载更多动态讨论
  * @param {Object} args 请求参数
  * @param {string} args.postID 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMorePostComments: function (args, options = {}) {
     
     return $.api('Post', 'GetMorePostComments', args, options);
   },
  /**
  * 获取某条动态讨论
  * @param {Object} args 请求参数
  * @param {string} args.commentID 评论id
  * @param {string} args.postID 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getReplyMessage: function (args, options = {}) {
     
     return $.api('Post', 'GetReplyMessage', args, options);
   },
  /**
  * 获取用户剩余积分
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserLeftMark: function (args, options = {}) {
     
     return $.api('Post', 'GetUserLeftMark', args, options);
   },
  /**
  * 获取置顶动态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络 Id， 不传为所有网络
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTopPosts: function (args, options = {}) {
     
     return $.api('Post', 'GetTopPosts', args, options);
   },
  /**
  * 添加置顶动态
  * @param {Object} args 请求参数
  * @param {string} args.postId 要置顶的动态id
  * @param {integer} args.hours 置顶的小时数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTopPost: function (args, options = {}) {
     
     return $.api('Post', 'AddTopPost', args, options);
   },
  /**
  * 取消动态置顶
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeTopPost: function (args, options = {}) {
     
     return $.api('Post', 'RemoveTopPost', args, options);
   },
  /**
  * 给动态点赞或取消
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {boolean} args.isLike 点赞还是取消点赞
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   like: function (args, options = {}) {
     
     return $.api('Post', 'Like', args, options);
   },
  /**
  * 收藏或取消收藏动态
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态id
  * @param {boolean} args.isFavorite 收藏还是取消收藏
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   favorite: function (args, options = {}) {
     
     return $.api('Post', 'Favorite', args, options);
   },
  /**
  * 获取[喜欢]的用户
  * @param {Object} args 请求参数
  * @param {string} args.postID 动态id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLikeUsers: function (args, options = {}) {
     
     return $.api('Post', 'GetLikeUsers', args, options);
   },
  /**
  * 给投票类型的动态投票
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态Id
  * @param {string} args.optionIndex 投票项索引（多个,分割
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   votePost: function (args, options = {}) {
     
     return $.api('Post', 'VotePost', args, options);
   },
  /**
  * 修改投票截止时间
  * @param {Object} args 请求参数
  * @param {string} args.postId 动态Id
  * @param {string} args.deadline 截至时间（2017-09-12 11:00:00）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editVoteDeadline: function (args, options = {}) {
     
     return $.api('Post', 'EditVoteDeadline', args, options);
   },
};
