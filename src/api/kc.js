export default {
  /**
  * 获取根目录(共享文件夹)列表
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.rootFilterType 根节点过滤类型
  * @param {} args.status 状态
  * @param {string} args.projectId 网络 Id，不能和 excludeProjectIds 同时存在
  * @param {array} args.excludeProjectIds 排除掉的网络 Id，逗号分割，不能和 p rojectId 同时存在
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRoots: function (args, options = {}) {
     
     return $.api('Kc', 'GetRoots', args, options);
   },
  /**
  * 获取根目录详情
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRootDetail: function (args, options = {}) {
     
     return $.api('Kc', 'GetRootDetail', args, options);
   },
  /**
  * 获取根文件夹
  * @param {Object} args 请求参数
  * @param {array} args.id 节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRootInfoByIds: function (args, options = {}) {
     
     return $.api('Kc', 'GetRootInfoByIds', args, options);
   },
  /**
  * 添加根目录(共享文件夹)
  * @param {Object} args 请求参数
  * @param {string} args.name 根节点名称
  * @param {array} args.members 正常的明道云用户
  * @param {boolean} args.star 是否标星
  * @param {string} args.projectId 所归属的网络
  * @param {array} args.invitedMembers 被邀请的未注册用户
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRoot: function (args, options = {}) {
     
     return $.api('Kc', 'AddRoot', args, options);
   },
  /**
  * 根目录标星
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {boolean} args.star 是否标星
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   starRoot: function (args, options = {}) {
     
     return $.api('Kc', 'StarRoot', args, options);
   },
  /**
  * 删除根目录(共享文件夹)
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRoot: function (args, options = {}) {
     
     return $.api('Kc', 'RemoveRoot', args, options);
   },
  /**
  * 退出/移除根目录成员
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.memberId 成员id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRootMember: function (args, options = {}) {
     
     return $.api('Kc', 'RemoveRootMember', args, options);
   },
  /**
  * 添加根目录成员
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {array} args.memberIds 要添加的成员List
  * @param {object} args.inviteAccount 被邀请的用户Dictionary
  * @param {string} args.apkId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRootMembers: function (args, options = {}) {
     
     return $.api('Kc', 'AddRootMembers', args, options);
   },
  /**
  * 更新根目录的成员的权限
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.memberId 成员id
  * @param {} args.permission 更改为的权限
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateMemberPermission: function (args, options = {}) {
     
     return $.api('Kc', 'UpdateMemberPermission', args, options);
   },
  /**
  * 托付根目录的拥有者
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.memberId 被托付的成员AccountId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateRootOwner: function (args, options = {}) {
     
     return $.api('Kc', 'UpdateRootOwner', args, options);
   },
  /**
  * 更改根目录的名称
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.name 更改的名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateRootName: function (args, options = {}) {
     
     return $.api('Kc', 'UpdateRootName', args, options);
   },
  /**
  * 更改被邀请的状态
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.memberId 成员id
  * @param {} args.memberStatus 状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateMemberStatus: function (args, options = {}) {
     
     return $.api('Kc', 'UpdateMemberStatus', args, options);
   },
  /**
  * 重发邀请
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.memberId 成员id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resendInvite: function (args, options = {}) {
     
     return $.api('Kc', 'ResendInvite', args, options);
   },
  /**
  * 获取共享文件夹下节点列表
  * @param {Object} args 请求参数
  * @param {} args.rootType 节点所属类型
  * @param {string} args.parentId 父id
  * @param {string} args.keywords 关键词
  * @param {} args.status 节点状态
  * @param {} args.sortBy 节点排序字段
  * @param {} args.sortType 排序类型
  * @param {integer} args.skip 页码
  * @param {integer} args.limit 页大小
  * @param {} args.nodeType 节点类型
  * @param {array} args.filterIDs 过滤的id
  * @param {boolean} args.isFromFolderSelect 是否是选择文件夹
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNodes: function (args, options = {}) {
     
     return $.api('Kc', 'GetNodes', args, options);
   },
  /**
  * 全局搜索，包括我的文件和所有根目录
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {} args.sortBy 节点排序字段
  * @param {} args.sortType 排序类型
  * @param {integer} args.skip 页码
  * @param {integer} args.limit 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   globalSearch: function (args, options = {}) {
     
     return $.api('Kc', 'GlobalSearch', args, options);
   },
  /**
  * 获取列表中文件夹总数和其中的文件总大小
  * @param {Object} args 请求参数
  * @param {} args.rootType 节点所属类型
  * @param {string} args.keywords 关键词
  * @param {string} args.parentId 父id
  * @param {} args.status 节点状态
  * @param {} args.sortBy 节点排序字段
  * @param {} args.sortType 排序类型
  * @param {integer} args.skip 页码
  * @param {integer} args.limit 页大小
  * @param {array} args.filterIDs 过滤的id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNodesTotalFolderCountAndFileSize: function (args, options = {}) {
     
     return $.api('Kc', 'GetNodesTotalFolderCountAndFileSize', args, options);
   },
  /**
  * 获取节点详情
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.path 路径
  * @param {} args.actionType 查看类型是分享地址还是从知识中心读取
  * @param {string} args.versionId 版本Id
  * @param {boolean} args.isOldest 获取最老的版本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNodeDetail: function (args, options = {}) {
     
     return $.api('Kc', 'GetNodeDetail', args, options);
   },
  /**
  * 添加节点
  * @param {Object} args 请求参数
  * @param {string} args.name 名称
  * @param {} args.type 节点类型
  * @param {string} args.parentId 父id
  * @param {string} args.rootId 根文件夹id
  * @param {} args.source 来源
  * @param {integer} args.size 大小
  * @param {string} args.filePath 地址
  * @param {string} args.originLinkUrl 原始链接
  * @param {string} args.des 描述
  * @param {boolean} args.allowDown 是否允许下载
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addNode: function (args, options = {}) {
     
     return $.api('Kc', 'AddNode', args, options);
   },
  /**
  * 上传新版本
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.name 名称
  * @param {string} args.versionDes 版本描述
  * @param {string} args.filePath 路径
  * @param {integer} args.size 大小
  * @param {string} args.ext 后缀
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addMultiVersionFile: function (args, options = {}) {
     
     return $.api('Kc', 'AddMultiVersionFile', args, options);
   },
  /**
  * 删除多版本文件
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.versionId 版本id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteVersionFile: function (args, options = {}) {
     
     return $.api('Kc', 'DeleteVersionFile', args, options);
   },
  /**
  * 获取多版本文件
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMultiVersionFile: function (args, options = {}) {
     
     return $.api('Kc', 'GetMultiVersionFile', args, options);
   },
  /**
  * 获取node节点详情url
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDetailUrl: function (args, options = {}) {
     
     return $.api('Kc', 'GetDetailUrl', args, options);
   },
  /**
  * 更新节点
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {string} args.name 名称
  * @param {boolean} args.isDownloadable 是否可下载
  * @param {boolean} args.isEditable 是否可编辑
  * @param {} args.visibleType 分享类型
  * @param {string} args.newLinkUrl 链接地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateNode: function (args, options = {}) {
     
     return $.api('Kc', 'UpdateNode', args, options);
   },
  /**
  * 节点标星
  * @param {Object} args 请求参数
  * @param {string} args.id 节点id
  * @param {boolean} args.star 是否节点标星
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   starNode: function (args, options = {}) {
     
     return $.api('Kc', 'StarNode', args, options);
   },
  /**
  * 根据 Id 列表删除或彻底删除节点
  * @param {Object} args 请求参数
  * @param {array} args.ids 要删除的 id 列表
  * @param {boolean} args.isPermanent 是否彻底删除
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeNode: function (args, options = {}) {
     
     return $.api('Kc', 'RemoveNode', args, options);
   },
  /**
  * 根据父节点 Id 和搜索条件删除或彻底删除节点
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.parentId 父id
  * @param {boolean} args.isPermanent 是否彻底删除
  * @param {} args.locationType 节点类型
  * @param {array} args.excludeNodeIds 排查哪些节点
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeNodeByParentId: function (args, options = {}) {
     
     return $.api('Kc', 'RemoveNodeByParentId', args, options);
   },
  /**
  * 还原回收站中的节点
  * @param {Object} args 请求参数
  * @param {array} args.ids 节点id列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restoreNode: function (args, options = {}) {
     
     return $.api('Kc', 'RestoreNode', args, options);
   },
  /**
  * 根据父节点 Id 和搜索条件还原回收站中的节点
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.parentId 父id
  * @param {} args.locationType 所属类型
  * @param {array} args.excludeNodeIds 排查的节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restoreNodeByParentId: function (args, options = {}) {
     
     return $.api('Kc', 'RestoreNodeByParentId', args, options);
   },
  /**
  * 根据节点 Id 移动节点
  * @param {Object} args 请求参数
  * @param {array} args.ids 被移动的节点 id
  * @param {string} args.toId 移动到的节点或根节点 id
  * @param {} args.toType 移动到的节点根目录类型
  * @param {} args.handleNameType 重名时选择节点操作方式
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   moveNode: function (args, options = {}) {
     
     return $.api('Kc', 'MoveNode', args, options);
   },
  /**
  * 全选移动节点
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.parentId 父节点id
  * @param {} args.fromType 源所属类型
  * @param {string} args.toId 目标id
  * @param {} args.toType 目标类型
  * @param {} args.existNameExecuteType 操作类型
  * @param {array} args.excludeNodeIds 排除的节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   moveNodeByParentId: function (args, options = {}) {
     
     return $.api('Kc', 'MoveNodeByParentId', args, options);
   },
  /**
  * 根据节点 Id 复制节点
  * @param {Object} args 请求参数
  * @param {array} args.ids 节点id
  * @param {string} args.toId 目标id
  * @param {} args.toType 目标类型
  * @param {} args.handleNameType 操作类型
  * @param {boolean} args.copySource CopySource
  * @param {string} args.des 文件流转时的描述
  * @param {boolean} args.isShareFolder 如果是分享文件夹的话，文件夹下的每个节点只判断是否可以下载
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyNode: function (args, options = {}) {
     
     return $.api('Kc', 'CopyNode', args, options);
   },
  /**
  * 全选复制节点
  * @param {Object} args 请求参数
  * @param {string} args.keywords 关键词
  * @param {string} args.parentId 父节点id
  * @param {} args.fromType 源所属类型
  * @param {string} args.toId 目标id
  * @param {} args.toType 目标类型
  * @param {} args.existNameExecuteType 操作类型
  * @param {array} args.excludeNodeIds 排除的节点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyNodeByParentId: function (args, options = {}) {
     
     return $.api('Kc', 'CopyNodeByParentId', args, options);
   },
  /**
  * 获取节点日志
  * @param {Object} args 请求参数
  * @param {string} args.id 节点 Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNodeLogDetail: function (args, options = {}) {
     
     return $.api('Kc', 'GetNodeLogDetail', args, options);
   },
  /**
  * 获取根节点日志
  * @param {Object} args 请求参数
  * @param {string} args.id 根节点 Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRootLogDetail: function (args, options = {}) {
     
     return $.api('Kc', 'GetRootLogDetail', args, options);
   },
  /**
  * 获取“我的文件”日志
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyLogDetail: function (args, options = {}) {
     
     return $.api('Kc', 'GetMyLogDetail', args, options);
   },
  /**
  * 增加阅读数
  * @param {Object} args 请求参数
  * @param {string} args.id 节点 Id
  * @param {string} args.versionId 版本 Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addNodeViewCount: function (args, options = {}) {
     
     return $.api('Kc', 'AddNodeViewCount', args, options);
   },
  /**
  * 增加下载数
  * @param {Object} args 请求参数
  * @param {string} args.id 节点 Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addNodeDownloadCount: function (args, options = {}) {
     
     return $.api('Kc', 'AddNodeDownloadCount', args, options);
   },
  /**
  * 获取当前使用的流量和可用流量总数
  * @param {Object} args 请求参数
  * @param {} args.fromType 来源模块 工作表控件模块=9
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUsage: function (args, options = {}) {
     
     return $.api('Kc', 'GetUsage', args, options);
   },
  /**
  * 获取当前用户使用的总空间，已用存储空间 = “我的文件”+拥有者为该用户的共享文件夹（包括企业和个人）。
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTotalUsedSize: function (args, options = {}) {
     
     return $.api('Kc', 'GetTotalUsedSize', args, options);
   },
};
