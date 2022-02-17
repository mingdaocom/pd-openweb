module.exports = {
  /**
  * 群组通用邀请，搜索
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keyword 关键词
  * @param {array} args.firstLetters 首字母过滤
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupsSearch: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupsSearch', args, options);
   },
  /**
  * 获取群组列表，包括名称和是否官方
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络 Id，不能和 excludeProjectId 同时存在
  * @param {string} args.excludeProjectIds 排除掉的网络 Id，逗号分割，不能和 projectId 同时存在
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupsNameAndIsVerified: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupsNameAndIsVerified', args, options);
   },
  /**
  * 获取最常使用的群组
  * @param {Object} args 请求参数
  * @param {integer} args.top 数量
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   selectGroupMostFrequent: function (args, options = {}) {
     
     return $.api('Group', 'SelectGroupMostFrequent', args, options);
   },
  /**
  * 群组选择组件后台方法
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络 Id
  * @param {boolean} args.withRadio 是否包括全员广播
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   selectGroup: function (args, options = {}) {
     
     return $.api('Group', 'SelectGroup', args, options);
   },
  /**
  * 获取群组列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {} args.status 群组状态
  * @param {} args.searchGroupType 群组范围
  * @param {} args.sortFiled 排序字段
  * @param {} args.sortType 排序方式
  * @param {} args.groupType 群组类型
  * @param {array} args.firstLetters 首字母
  * @param {boolean} args.containHidden 是否包含隐藏群组
  * @param {string} args.projectId 网络id
  * @param {boolean} args.withMapDepartment 是否含官方群组对应的部门
  * @param {} args.dataRange 数据范围
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroups: function (args, options = {}) {
     
     return $.api('Group', 'GetGroups', args, options);
   },
  /**
  * 获取通讯录群组
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {array} args.filterAccountIds 过滤哪些accountId
  * @param {boolean} args.inProject 是否是网络群组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactGroups: function (args, options = {}) {
     
     return $.api('Group', 'GetContactGroups', args, options);
   },
  /**
  * 加载群组成员（用户已加入此群组）
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {} args.type 用户类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupUsers: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupUsers', args, options);
   },
  /**
  * 关键词搜索群组内有效成员
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.keywords 关键词
  * @param {array} args.filterAccountIds 过滤哪些用户
  * @param {string} args.projectId 如果projectid不为空，则只查询属于这个网络内的人员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupEffectUsers: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupEffectUsers', args, options);
   },
  /**
  * 加载群组默认头像
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupAvatarSelectList: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupAvatarSelectList', args, options);
   },
  /**
  * 获取群组信息
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {boolean} args.withUser 是否含成员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupInfo: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupInfo', args, options);
   },
  /**
  * 群组名片
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroupCardInfo: function (args, options = {}) {
     
     return $.api('Group', 'GetGroupCardInfo', args, options);
   },
  /**
  * 添加群组
  * @param {Object} args 请求参数
  * @param {string} args.groupName 群组名称
  * @param {string} args.groupAbout 群组描述
  * @param {string} args.groupAvatar 群组头像
  * @param {boolean} args.isApproval 是否需要审批
  * @param {string} args.projectId 网络id
  * @param {string} args.mapDepartmentId 关联部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addGroup: function (args, options = {}) {
     
     return $.api('Group', 'AddGroup', args, options);
   },
  /**
  * 添加讨论组
  * @param {Object} args 请求参数
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addDiscussionGroup: function (args, options = {}) {
     
     return $.api('Group', 'AddDiscussionGroup', args, options);
   },
  /**
  * 设置管理员
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAdmin: function (args, options = {}) {
     
     return $.api('Group', 'AddAdmin', args, options);
   },
  /**
  * 申请加入群组
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyJoinGroup: function (args, options = {}) {
     
     return $.api('Group', 'ApplyJoinGroup', args, options);
   },
  /**
  * 审批通过
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   passJoinGroup: function (args, options = {}) {
     
     return $.api('Group', 'PassJoinGroup', args, options);
   },
  /**
  * 退出群组
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exitGroup: function (args, options = {}) {
     
     return $.api('Group', 'ExitGroup', args, options);
   },
  /**
  * 开启群组
  * @param {Object} args 请求参数
  * @param {array} args.groupIds 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   openGroup: function (args, options = {}) {
     
     return $.api('Group', 'OpenGroup', args, options);
   },
  /**
  * 关闭群组
  * @param {Object} args 请求参数
  * @param {array} args.groupIds 群组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   closeGroup: function (args, options = {}) {
     
     return $.api('Group', 'CloseGroup', args, options);
   },
  /**
  * 更新群组push消息
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {boolean} args.isPushNotice 是否开启推送
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupPushNotice: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupPushNotice', args, options);
   },
  /**
  * 更改群头像
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {string} args.avatar 头像
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupAvatar: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupAvatar', args, options);
   },
  /**
  * 修改群名称
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {string} args.groupName 名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupName: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupName', args, options);
   },
  /**
  * 修改群公告
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群组id
  * @param {string} args.groupAbout 公告
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupAbout: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupAbout', args, options);
   },
  /**
  * 修改群审批
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {boolean} args.isApproval 是否开启审批
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupApproval: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupApproval', args, options);
   },
  /**
  * 修改群是否隐藏
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {boolean} args.isHidden 是否隐藏
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupHidden: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupHidden', args, options);
   },
  /**
  * 群组转换
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.projectId 是否隐藏
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupToPost: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupToPost', args, options);
   },
  /**
  * 修改官方群
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {boolean} args.isVerified 是否官方群
  * @param {string} args.mapDepartmentId 关联的部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupVerified: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupVerified', args, options);
   },
  /**
  * 禁言
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {boolean} args.isForbidSpeak 是否开启禁言
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupForbidSpeak: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupForbidSpeak', args, options);
   },
  /**
  * 禁止邀请
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {boolean} args.isForbidInvite 是否禁止邀请
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateGroupForbidInvite: function (args, options = {}) {
     
     return $.api('Group', 'UpdateGroupForbidInvite', args, options);
   },
  /**
  * 删除群组（解散）
  * @param {Object} args 请求参数
  * @param {array} args.groupIds 群id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeGroup: function (args, options = {}) {
     
     return $.api('Group', 'RemoveGroup', args, options);
   },
  /**
  * 移除管理员
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeAdmin: function (args, options = {}) {
     
     return $.api('Group', 'RemoveAdmin', args, options);
   },
  /**
  * 移除群组用户
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUser: function (args, options = {}) {
     
     return $.api('Group', 'RemoveUser', args, options);
   },
  /**
  * 拒绝用户加入
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseUser: function (args, options = {}) {
     
     return $.api('Group', 'RefuseUser', args, options);
   },
  /**
  * 取消邀请
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelInviteUser: function (args, options = {}) {
     
     return $.api('Group', 'CancelInviteUser', args, options);
   },
  /**
  * 验证用户是否加入群组
  * @param {Object} args 请求参数
  * @param {string} args.groupId 群id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   valideUserJoinGroup: function (args, options = {}) {
     
     return $.api('Group', 'ValideUserJoinGroup', args, options);
   },
};
