module.exports = {
  /**
  * 分页 获取一般用户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex pageIndex
  * @param {integer} args.pageSize pageSize
  * @param {string} args.keywords 关键词
  * @param {} args.sortUserType 用户排序
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedNormalUserList: function (args, options = {}) {
     
     return $.api('User', 'PagedNormalUserList', args, options);
   },
  /**
  * 获取用户列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex pageIndex
  * @param {integer} args.pageSize pageSize
  * @param {string} args.keywords 关键词
  * @param {} args.userStatus 用户状态
  * @param {} args.sortField 用户排序
  * @param {} args.sortType 排序类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserList: function (args, options = {}) {
     
     return $.api('User', 'GetUserList', args, options);
   },
  /**
  * 获取待审批的用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.sortField 用户排序
  * @param {} args.sortType 排序类型
  * @param {string} args.keywords 关键司
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApprovalUser: function (args, options = {}) {
     
     return $.api('User', 'GetApprovalUser', args, options);
   },
  /**
  * 用户筛选
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserFilterData: function (args, options = {}) {
     
     return $.api('User', 'GetUserFilterData', args, options);
   },
  /**
  * 根据AccountId获取用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 用户Id集
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserListByAccountId: function (args, options = {}) {
     
     return $.api('User', 'GetUserListByAccountId', args, options);
   },
  /**
  * 获取网络内用户信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 用户Id
  * @param {boolean} args.setAcountPravite 是否设为私密
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserCard: function (args, options = {}) {
     
     return $.api('User', 'GetUserCard', args, options);
   },
  /**
  * 获取用户账号基本信息
  * @param {Object} args 请求参数
  * @param {string} args.onProjectId 页面所在组织Id（可空）
  * @param {string} args.accountId 账号Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountBaseInfo: function (args, options = {}) {
     
     return $.api('User', 'GetAccountBaseInfo', args, options);
   },
  /**
  * 获取用户详细信息
  * @param {Object} args 请求参数
  * @param {string} args.accountId 用户Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountDetail: function (args, options = {}) {
     
     return $.api('User', 'GetAccountDetail', args, options);
   },
  /**
  * mentionsInput 使用，@出来的用户和群组
用于任何实体 AT 快速搜索
  * @param {Object} args 请求参数
  * @param {integer} args.search 搜索类型
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUsersByKeywords: function (args, options = {}) {
     
     return $.api('User', 'GetUsersByKeywords', args, options);
   },
  /**
  * 获取当前用户经常协作的用户
用于工作表/任务 等默认最常协作联系人
  * @param {Object} args 请求参数
  * @param {integer} args.count 页大小（经常协作用户的数量，不包含 prefixAccountIds 和未指定/我自己的数量）
  * @param {array} args.filterAccountIds 需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {string} args.projectId 当前网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOftenMetionedUser: function (args, options = {}) {
     
     return $.api('User', 'GetOftenMetionedUser', args, options);
   },
  /**
  * 获取用户列表（projectId不存在加载好友，projectId存在加载公司通讯录）
当 dataRange=project时 projectId不能为空
用于通讯录简化弹层
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {} args.dataRange 查询范围，是所有协作者还是好友还是同事还是其他协作者
  * @param {string} args.firstLetter 首字母
  * @param {boolean} args.filterFriend 是否不包括我的好友
  * @param {string} args.filterProjectId 需要排除的网络
  * @param {array} args.filterAccountIds 需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {string} args.filterWorksheetId 工作表ID
  * @param {string} args.filterWorksheetControlId 工作表控件ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactUserList: function (args, options = {}) {
     
     return $.api('User', 'GetContactUserList', args, options);
   },
  /**
  * 获取网络下已离职的用户信息
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectResignedUserList: function (args, options = {}) {
     
     return $.api('User', 'GetProjectResignedUserList', args, options);
   },
  /**
  * 网络管理 - 获取网络下用户列表（projectId不存在加载好友，projectId存在加载公司通讯录）
当 dataRange=project时 projectId不能为空
用于网络管理通讯录简化弹层
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {} args.dataRange 查询范围，是所有协作者还是好友还是同事还是其他协作者
  * @param {string} args.firstLetter 首字母
  * @param {boolean} args.filterFriend 是否不包括我的好友
  * @param {string} args.filterProjectId 需要排除的网络
  * @param {array} args.filterAccountIds 需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {string} args.filterWorksheetId 工作表ID
  * @param {string} args.filterWorksheetControlId 工作表控件ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectContactUserList: function (args, options = {}) {
     
     return $.api('User', 'GetProjectContactUserList', args, options);
   },
  /**
  * 获取工作表人员筛选受限制人员列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {} args.dataRange 查询范围，是所有协作者还是好友还是同事还是其他协作者
  * @param {string} args.firstLetter 首字母
  * @param {boolean} args.filterFriend 是否不包括我的好友
  * @param {string} args.filterProjectId 需要排除的网络
  * @param {array} args.filterAccountIds 需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {string} args.filterWorksheetId 工作表ID
  * @param {string} args.filterWorksheetControlId 工作表控件ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectContactUserListByApp: function (args, options = {}) {
     
     return $.api('User', 'GetProjectContactUserListByApp', args, options);
   },
  /**
  * 获取已离职的用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {string} args.firstLetter 首字母
  * @param {array} args.filterAccountIds 过滤哪些账号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLeaveUserList: function (args, options = {}) {
     
     return $.api('User', 'GetLeaveUserList', args, options);
   },
  /**
  * 设置用户信息
  * @param {Object} args 请求参数
  * @param {string} args.fullname 姓名
  * @param {string} args.email 邮箱
  * @param {string} args.mobilePhone 手机号
  * @param {string} args.projectId 组织编号
  * @param {string} args.accountId 账号Id
  * @param {string} args.companyName 公司名
  * @param {string} args.jobNumber Job号
  * @param {string} args.contactPhone 联系号码
  * @param {string} args.workSiteId 工作地点
  * @param {array} args.departmentIds 部门Id（第一个为主部门）
  * @param {array} args.jobIds 职位Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUser: function (args, options = {}) {
     
     return $.api('User', 'UpdateUser', args, options);
   },
  /**
  * 设置用户信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账号Id
  * @param {string} args.companyName 公司名
  * @param {string} args.jobNumber Job号
  * @param {string} args.contactPhone 联系号码
  * @param {string} args.workSiteId 工作地点
  * @param {array} args.departmentIds 部门（第一个为主部门）
  * @param {array} args.jobIds 职位ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUserCard: function (args, options = {}) {
     
     return $.api('User', 'UpdateUserCard', args, options);
   },
  /**
  * 更新用户部门信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 用户Ids
  * @param {string} args.departmentId 部门Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUserDepartment: function (args, options = {}) {
     
     return $.api('User', 'UpdateUserDepartment', args, options);
   },
  /**
  * 更新用户部门信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 用户Ids
  * @param {array} args.departmentIds 新部门Ids（第一个为主部门）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateUsersDepartment: function (args, options = {}) {
     
     return $.api('User', 'UpdateUsersDepartment', args, options);
   },
  /**
  * 移除用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账户Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUser: function (args, options = {}) {
     
     return $.api('User', 'RemoveUser', args, options);
   },
  /**
  * 恢复用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账户Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   recoveryUser: function (args, options = {}) {
     
     return $.api('User', 'RecoveryUser', args, options);
   },
  /**
  * 审批同意用户加入公司
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账户Id
  * @param {string} args.departmentId 部门Id
  * @param {array} args.departmentIds 新部门Ids（第一个为主部门）
  * @param {string} args.workSiteId 工作地点
  * @param {string} args.jobId 职位
  * @param {array} args.jobIds 职位Ids
  * @param {string} args.jobNumber 工号
  * @param {string} args.contactPhone 联系号码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   agreeUserJoin: function (args, options = {}) {
     
     return $.api('User', 'AgreeUserJoin', args, options);
   },
  /**
  * 审批拒绝用户加入公司
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账户Id
  * @param {string} args.refuseMessage 拒绝消息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseUserJoin: function (args, options = {}) {
     
     return $.api('User', 'RefuseUserJoin', args, options);
   },
  /**
  * 提醒填写工作电话
  * @param {Object} args 请求参数
  * @param {array} args.accountIds 账户Ids
  * @param {} args.type 提醒方式
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendNotice: function (args, options = {}) {
     
     return $.api('User', 'SendNotice', args, options);
   },
  /**
  * 重置员工密码
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.accountId 账号Id
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetPassword: function (args, options = {}) {
     
     return $.api('User', 'ResetPassword', args, options);
   },
  /**
  * 批量重置员工密码
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账号Id
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchResetPassword: function (args, options = {}) {
     
     return $.api('User', 'BatchResetPassword', args, options);
   },
  /**
  * 批量更新用户所在部门
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账户Ids
  * @param {array} args.departmentIds 部门ids 第一个为主部门
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateDepartmentForUsers: function (args, options = {}) {
     
     return $.api('User', 'UpdateDepartmentForUsers', args, options);
   },
  /**
  * 批量更新用户职位
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账户Ids
  * @param {array} args.jobIds 职位ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateJobForUsers: function (args, options = {}) {
     
     return $.api('User', 'UpdateJobForUsers', args, options);
   },
  /**
  * 批量更新用户工作地点
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 账户Ids
  * @param {string} args.worksiteId 工作地点id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorkSiteForUsers: function (args, options = {}) {
     
     return $.api('User', 'UpdateWorkSiteForUsers', args, options);
   },
  /**
  * 根据ProjectId检测当前用户是不是网络管理员
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateUserIsProjectAdmin: function (args, options = {}) {
     
     return $.api('User', 'ValidateUserIsProjectAdmin', args, options);
   },
  /**
  * 检查当前用户是否有好友
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateUserHaveFriend: function (args, options = {}) {
     
     return $.api('User', 'ValidateUserHaveFriend', args, options);
   },
};
