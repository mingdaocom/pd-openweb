export default {
  /**
   * 根据 AccountId 获取用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 用户Id集
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserListByAccountId: function (args, options = {}) {
    return mdyAPI('User', 'GetUserListByAccountId', args, options);
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
    return mdyAPI('User', 'GetUserCard', args, options);
  },
  /**
  * 获取用户名片层账号基本信息
  * @param {Object} args 请求参数
  * @param {string} args.onProjectId 使用的模块所在组织Id（可空），如应用
  * @param {string} args.appId 所在应用
如果是外部门户用户，则会读取可见字段配置
  * @param {string} args.accountId 账号Id
  * @param {boolean} args.refresh 是否刷新读取
为true则不走缓存
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getAccountBaseInfo: function (args, options = {}) {
    return mdyAPI('User', 'GetAccountBaseInfo', args, options);
  },
  /**
  * 验证对方用户是否是安全用户，优先确保是联系人
校验对方用户是否有付费组织；是否经过个人身份认证；以上有一项通过则返回True
  * @param {Object} args 请求参数
  * @param {string} args.onProjectId 使用的模块所在组织Id（可空），如应用
  * @param {string} args.appId 所在应用
如果是外部门户用户，则会读取可见字段配置
  * @param {string} args.accountId 账号Id
  * @param {boolean} args.refresh 是否刷新读取
为true则不走缓存
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  checkAccountSecured: function (args, options = {}) {
    return mdyAPI('User', 'CheckAccountSecured', args, options);
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
    return mdyAPI('User', 'GetAccountDetail', args, options);
  },
  /**
  * mentionsInput 使用，@出来的用户和群组
用于任何实体 AT 快速搜索
  * @param {Object} args 请求参数
  * @param {integer} args.search 搜索类型
1：为用户搜索；2为群组搜索
  * @param {string} args.keywords 关键词
  * @param {string} args.currentProjectId 当前组织（可不传）
主数据所属组织，比如行记录
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getUsersByKeywords: function (args, options = {}) {
    return mdyAPI('User', 'GetUsersByKeywords', args, options);
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
  * @param {integer} args.oftenMetionedType 最常协作类型：-1：遵循用户的设置；0：系统推荐；1：用户自定义
  * @param {string} args.projectId 当前网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getOftenMetionedUser: function (args, options = {}) {
    return mdyAPI('User', 'GetOftenMetionedUser', args, options);
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
  * @param {} args.dataRange
  * @param {string} args.firstLetter 过滤的首字母
  * @param {array} args.filterAccountIds 过滤的需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeMyself 是否在前面插入我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {array} args.appointedAccountIds 指定的账户列表
  * @param {array} args.appointedDepartmentIds 指定的部门列表
  * @param {array} args.appointedOrganizeIds 指定的组织角色列表
  * @param {boolean} args.takeTotalCount 是否获取 总数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getContactUserList: function (args, options = {}) {
    return mdyAPI('User', 'GetContactUserList', args, options);
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
    return mdyAPI('User', 'GetProjectResignedUserList', args, options);
  },
  /**
  * 根据人员筛选条件获取人员列表
包括：指定部门、指定人员、指定组织角色，或者动态范围
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {} args.dataRange
  * @param {string} args.firstLetter 过滤的首字母
  * @param {array} args.filterAccountIds 过滤的需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeMyself 是否在前面插入我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {array} args.appointedAccountIds 指定的账户列表
  * @param {array} args.appointedDepartmentIds 指定的部门列表
  * @param {array} args.appointedOrganizeIds 指定的组织角色列表
  * @param {boolean} args.takeTotalCount 是否获取 总数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getProjectContactUserListByApp: function (args, options = {}) {
    return mdyAPI('User', 'GetProjectContactUserListByApp', args, options);
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
    return mdyAPI('User', 'GetLeaveUserList', args, options);
  },
  /**
   * 提醒填写工作电话
   * @param {Object} args 请求参数
   * @param {array} args.accountIds 账户Ids
   * @param {} args.type
   * @param {string} args.projectId 网络Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendNotice: function (args, options = {}) {
    return mdyAPI('User', 'SendNotice', args, options);
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
    return mdyAPI('User', 'ValidateUserIsProjectAdmin', args, options);
  },
  /**
   * 检查当前用户是否有好友
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  validateUserHaveFriend: function (args, options = {}) {
    return mdyAPI('User', 'ValidateUserHaveFriend', args, options);
  },
  /**
   * 分页获取 Normal 用户列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex pageIndex
   * @param {integer} args.pageSize pageSize
   * @param {string} args.keywords 关键词
   * @param {} args.sortUserType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pagedNormalUserList: function (args, options = {}) {
    return mdyAPI('User', 'PagedNormalUserList', args, options);
  },
  /**
   * 获取 已删除的用户列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex pageIndex
   * @param {integer} args.pageSize pageSize
   * @param {string} args.keywords 关键词
   * @param {integer} args.keywordsType 关键词查询 类型（多字段[默认]=0、名称=1、工号=2）
   * @param {integer} args.sort 排序字段（默认 0=离职时间 倒序）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pagedRemovedUsers: function (args, options = {}) {
    return mdyAPI('User', 'PagedRemovedUsers', args, options);
  },
  /**
   * 获取用户列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex pageIndex
   * @param {integer} args.pageSize pageSize
   * @param {string} args.keywords 关键词
   * @param {integer} args.keywordsType 关键词查询 类型（多字段[默认]=0、名称=1、工号=2）
   * @param {} args.userStatus
   * @param {} args.sortField
   * @param {} args.sortType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserList: function (args, options = {}) {
    return mdyAPI('User', 'GetUserList', args, options);
  },
  /**
   * 获取联系人在组织中的状态
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织Id
   * @param {string} args.userContact 用户的联系方式
   * @param {string} args.departmentId 部门Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserOrgState: function (args, options = {}) {
    return mdyAPI('User', 'GetUserOrgState', args, options);
  },
  /**
  * 网络管理 - 获取网络下用户列表（projectId不存在加载好友，projectId存在加载公司通讯录）
当 dataRange=project时 projectId不能为空
用于【网络管理/管理后台 - 不受通讯录规则限制】通讯录简化弹层
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键司
  * @param {string} args.projectId 网络Id
  * @param {} args.dataRange
  * @param {string} args.firstLetter 过滤的首字母
  * @param {array} args.filterAccountIds 过滤的需要排除的帐号
  * @param {array} args.prefixAccountIds 需要插在前面的帐号，排在未指定和我自己后面
  * @param {boolean} args.includeUndefinedAndMyself 是否在前面插入未指定和我自己
  * @param {boolean} args.includeMyself 是否在前面插入我自己
  * @param {boolean} args.includeSystemField 是否包含系统预设账户
比如当前用户、当前用户的下属、未指定、工作流、公开表单、API等
  * @param {array} args.appointedAccountIds 指定的账户列表
  * @param {array} args.appointedDepartmentIds 指定的部门列表
  * @param {array} args.appointedOrganizeIds 指定的组织角色列表
  * @param {boolean} args.takeTotalCount 是否获取 总数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getProjectContactUserList: function (args, options = {}) {
    return mdyAPI('User', 'GetProjectContactUserList', args, options);
  },
  /**
   * 获取 待审批 或 已拒绝 的用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {} args.userStatus
   * @param {} args.sortField
   * @param {} args.sortType
   * @param {string} args.keywords 关键司
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getApprovalUser: function (args, options = {}) {
    return mdyAPI('User', 'GetApprovalUser', args, options);
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
    return mdyAPI('User', 'ResetPassword', args, options);
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
    return mdyAPI('User', 'BatchResetPassword', args, options);
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
   * @param {array} args.orgRoleIds 组织角色ids
   * @param {boolean} args.useMultiJobs 使用 多职位（false 则 未使用；true 代表使用，则 只使用新 部门职位关系属性 入库）
   * @param {array} args.departmentJobIdMaps 任职信息（第一个 代表主部门）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateUser: function (args, options = {}) {
    return mdyAPI('User', 'UpdateUser', args, options);
  },
  /**
   * 设置 用户信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账号Id
   * @param {string} args.companyName 公司名
   * @param {string} args.jobNumber Job号
   * @param {string} args.contactPhone 联系号码
   * @param {string} args.workSiteId 工作地点
   * @param {boolean} args.useMultiJobs 使用 多职位（false 则 未使用；true 代表使用，则 只使用新 部门职位关系属性 入库）
   * @param {array} args.departmentIds 部门（第一个为主部门）
   * @param {array} args.jobIds 职位ids
   * @param {array} args.departmentJobIdMaps 任职信息（第一个 代表主部门）
   * @param {array} args.orgRoleIds 组织角色ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateUserCard: function (args, options = {}) {
    return mdyAPI('User', 'UpdateUserCard', args, options);
  },
  /**
   * 从组织中 移除用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeUser: function (args, options = {}) {
    return mdyAPI('User', 'RemoveUser', args, options);
  },
  /**
   * 批量 从组织中 移除用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeUsers: function (args, options = {}) {
    return mdyAPI('User', 'RemoveUsers', args, options);
  },
  /**
   * 从已 离职 中 恢复用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  recoveryUser: function (args, options = {}) {
    return mdyAPI('User', 'RecoveryUser', args, options);
  },
  /**
   * 批量更新 用户部门
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Ids
   * @param {array} args.departmentIds 部门ids 第一个为主部门
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateDepartmentForUsers: function (args, options = {}) {
    return mdyAPI('User', 'UpdateDepartmentForUsers', args, options);
  },
  /**
   * 批量更新  用户职位
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Ids
   * @param {array} args.jobIds 职位ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateJobForUsers: function (args, options = {}) {
    return mdyAPI('User', 'UpdateJobForUsers', args, options);
  },
  /**
   * 批量更新  用户工作地点
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Ids
   * @param {string} args.worksiteId 工作地点id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorkSiteForUsers: function (args, options = {}) {
    return mdyAPI('User', 'UpdateWorkSiteForUsers', args, options);
  },
  /**
   * 审批同意 用户 加入 组织
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账户Id
   * @param {string} args.departmentId 部门Id
   * @param {array} args.departmentIds 新部门Ids（第一个为主部门）
   * @param {string} args.workSiteId 工作地点
   * @param {string} args.jobId 职位
   * @param {array} args.jobIds 职位Ids
   * @param {array} args.orgRoleIds 组织角色Id
   * @param {string} args.jobNumber 工号
   * @param {string} args.contactPhone 联系号码
   * @param {boolean} args.useMultiJobs 使用 多职位（false 则 未使用；true 代表使用，则 只使用新 部门职位关系属性 入库）
   * @param {array} args.departmentJobIdMaps 任职信息（第一个 代表主部门）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  agreeUserJoin: function (args, options = {}) {
    return mdyAPI('User', 'AgreeUserJoin', args, options);
  },
  /**
   * 审批同意 用户加入 组织
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  agreeUsersJoin: function (args, options = {}) {
    return mdyAPI('User', 'AgreeUsersJoin', args, options);
  },
  /**
   * 审批拒绝 用户 加入 组织
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {string} args.accountId 账户Id
   * @param {string} args.refuseMessage 拒绝消息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refuseUserJoin: function (args, options = {}) {
    return mdyAPI('User', 'RefuseUserJoin', args, options);
  },
  /**
   * 批量 审批拒绝 用户加入 组织
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络Id
   * @param {array} args.accountIds 账户Id
   * @param {string} args.refuseMessage 拒绝消息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refuseUsersJoin: function (args, options = {}) {
    return mdyAPI('User', 'RefuseUsersJoin', args, options);
  },
};
