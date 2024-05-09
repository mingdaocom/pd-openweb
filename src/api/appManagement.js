export default {
  /**
  * 使用情况统计分析
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.departmentId 部门id
  * @param {boolean} args.depFlag true表示仅当强部门，false表示部门树
  * @param {string} args.appId 应用id
  * @param {integer} args.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {string} args.dateDemension &#34;1h&#34;:1小时 &#34;1d&#34;:1天 &#34;1w&#34;:1周 &#34;1M&#34;:1月 &#34;1q&#34;:1季度 &#34;1y&#34;:1年
  * @param {boolean} args.isApp 表示是否是应用的使用分析
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   allUsageOverviewStatistics: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AllUsageOverviewStatistics', args, options);
   },
  /**
  * 应用汇总概览
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.keyWord 关键字搜索
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.sortFiled 排序字段
  * @param {boolean} args.sorted 排序方式 true--asc false--desc
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appUsageOverviewStatistics: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AppUsageOverviewStatistics', args, options);
   },
  /**
  * 不同维度使用情况统计(按应用，按成员)
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {integer} args.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.dimension 维度 1-应用 2-用户
  * @param {string} args.sortFiled 排序字段（返回结果的列名，例如:appAccess）
  * @param {boolean} args.sorted 排序方式
  * @param {string} args.keyword 关键词查询
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   usageStatisticsForDimension: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'UsageStatisticsForDimension', args, options);
   },
  /**
  * 获取应用日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.queryType
  * @param {array} args.operators 操作人id数组
  * @param {array} args.appIds 应用id数组
  * @param {array} args.worksheetIds 工作表id数组
  * @param {array} args.modules 所属日志模块
  * @param {array} args.operationTypes 操作类型
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {array} args.columnNames 列名称
  * @param {string} args.menuName 菜单名称
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {boolean} args.confirmExport 是否确认导出(超量的情况下传)
  * @param {boolean} args.isSingle 是否是单个应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGlobalLogs: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetGlobalLogs', args, options);
   },
  /**
  * 获取应用下工作表信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {array} args.appIds 应用ids
  * @param {boolean} args.isFilterCustomPage 是否过滤自定义页面
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetsUnderTheApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetWorksheetsUnderTheApp', args, options);
   },
  /**
  * 开启密码锁
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId
  * @param {string} args.password
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addLock: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddLock', args, options);
   },
  /**
  * map解锁
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId
  * @param {string} args.password
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unlock: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'Unlock', args, options);
   },
  /**
  * 修改锁定密码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId
  * @param {string} args.password
  * @param {string} args.newPassword
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLockPassword: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditLockPassword', args, options);
   },
  /**
  * 重新锁定
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId 应用id
  * @param {boolean} args.getSection 是否获取分组信息
  * @param {boolean} args.getManager 是否获取管理员列表信息
  * @param {boolean} args.getProject 获取组织信息
  * @param {boolean} args.getLang 是否获取应用语种信息
  * @param {boolean} args.isMobile 是否是移动端
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetLock: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'ResetLock', args, options);
   },
  /**
  * 关闭应用锁
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId 应用id
  * @param {boolean} args.getSection 是否获取分组信息
  * @param {boolean} args.getManager 是否获取管理员列表信息
  * @param {boolean} args.getProject 获取组织信息
  * @param {boolean} args.getLang 是否获取应用语种信息
  * @param {boolean} args.isMobile 是否是移动端
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   closeLock: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CloseLock', args, options);
   },
  /**
  * 校验升级文件
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.url 文件url
  * @param {string} args.password 密码
  * @param {string} args.fileName 文件名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkUpgrade: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CheckUpgrade', args, options);
   },
  /**
  * 获取表升级详情
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.appId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetUpgrade: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetWorksheetUpgrade', args, options);
   },
  /**
  * 升级
  * @param {Object} args 请求参数
  * @param {string} args.id 批次id
  * @param {string} args.appId 应用id
  * @param {string} args.url 导入文件链接（不带token的）
  * @param {array} args.worksheets 勾选的升级的表
  * @param {array} args.workflows 勾选升级的流
  * @param {array} args.pages 勾选升级的页面
  * @param {array} args.roles 勾选升级的角色
  * @param {boolean} args.backupCurrentVersion 备份当前版本
  * @param {boolean} args.matchOffice 是否匹配用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   upgrade: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'Upgrade', args, options);
   },
  /**
  * 获取应用升级记录
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUpgradeLogs: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetUpgradeLogs', args, options);
   },
  /**
  * 获取mdy密码
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.url 文件url不带token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMdyInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetMdyInfo', args, options);
   },
  /**
  * 获取应用语种列表
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppLangs: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppLangs', args, options);
   },
  /**
  * 创建应用语言
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {array} args.langTypes
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createAppLang: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CreateAppLang', args, options);
   },
  /**
  * 删除应用语言
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.id
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteAppLang: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'DeleteAppLang', args, options);
   },
  /**
  * 获取应用语言详情
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.appLangId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppLangDetail: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppLangDetail', args, options);
   },
  /**
  * 编辑应用语言详情
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.langId
  * @param {string} args.id
  * @param {string} args.parentId
  * @param {string} args.correlationId
  * @param {} args.type
  * @param {object} args.data
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppLang: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAppLang', args, options);
   },
  /**
  * 机器翻译
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.comparisonLangId
  * @param {string} args.targetLangId
  * @param {} args.fillType
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   machineTranslation: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'MachineTranslation', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppStructureForER: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppStructureForER', args, options);
   },
  /**
  * 添加角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.name 名称
  * @param {boolean} args.hideAppForMembers 该角色成员不可见当前应用
  * @param {string} args.description 描述
  * @param {integer} args.permissionWay 角色类型（0:自定义、10:只读、50::成员、100:管理员）
  * @param {string} args.projectId 网络id
  * @param {array} args.sheets 工作表权限集合
  * @param {array} args.userIds 角色成员id集合
  * @param {array} args.pages 自定义页面
  * @param {array} args.extendAttrs 用户扩展权限字段
  * @param {} args.generalAdd
  * @param {} args.gneralShare
  * @param {} args.generalImport
  * @param {} args.generalExport
  * @param {} args.generalDiscussion
  * @param {} args.generalSystemPrinting
  * @param {} args.generalAttachmentDownload
  * @param {} args.generalLogging
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddRole', args, options);
   },
  /**
  * 删除角色(并把人员移动到其他角色)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.resultRoleId 目标角色id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RemoveRole', args, options);
   },
  /**
  * 添加角色成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {array} args.userIds 用户
  * @param {array} args.departmentIds 部门
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {array} args.jobIds 职位ids
  * @param {string} args.projectId 网络id
  * @param {} args.enableGeneralAdd
  * @param {} args.enableGneralShare
  * @param {} args.enableGeneralImport
  * @param {} args.enableGeneralExport
  * @param {} args.enableGeneralDiscussion
  * @param {} args.enableGeneralSystemPrinting
  * @param {} args.enableGeneralAttachmentDownload
  * @param {} args.enableGeneralLogging
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRoleMembers: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddRoleMembers', args, options);
   },
  /**
  * 移除角色成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {boolean} args.selectAll 是否全选
  * @param {array} args.userIds 用户
  * @param {array} args.departmentIds 部门
  * @param {array} args.jobIds 职位
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRoleMembers: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RemoveRoleMembers', args, options);
   },
  /**
  * 设置 角色负责人
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.projectId 网络id
  * @param {string} args.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
  * @param {integer} args.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setRoleCharger: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'SetRoleCharger', args, options);
   },
  /**
  * 取消设置 角色负责人
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.projectId 网络id
  * @param {string} args.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
  * @param {integer} args.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelRoleCharger: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CancelRoleCharger', args, options);
   },
  /**
  * 退出应用单个角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   quitAppForRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'QuitAppForRole', args, options);
   },
  /**
  * 退出应用下所有角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   quitRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'QuitRole', args, options);
   },
  /**
  * 配置角色权限
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {} args.appRoleModel
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAppRole', args, options);
   },
  /**
  * 把人员移动到其他角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.sourceAppRoleId 来源角色id
  * @param {array} args.resultAppRoleIds 目标角色id
  * @param {boolean} args.selectAll 是否全选
  * @param {array} args.userIds 用户id集合
  * @param {array} args.departmentIds 部门id集合
  * @param {array} args.jobIds 职位id集合
  * @param {string} args.projectId 网络id
  * @param {array} args.departmentTreeIds 部门树
  * @param {array} args.projectOrganizeIds 网络角色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUserToRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RemoveUserToRole', args, options);
   },
  /**
  * 设置 开启/关闭 普通成员 是否可见角色列表
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {} args.status
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateMemberStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'UpdateMemberStatus', args, options);
   },
  /**
  * 设置 开启/关闭 应用角色通知
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用 Id
  * @param {boolean} args.notify 通知
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppRoleNotify: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'UpdateAppRoleNotify', args, options);
   },
  /**
  * 设置 开启/关闭 Debug模式
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用 Id
  * @param {boolean} args.isDebug 通知
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppDebugModel: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'UpdateAppDebugModel', args, options);
   },
  /**
  * 当前用户 设置调试的 角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用 Id
  * @param {array} args.roleIds 调试/模拟的 角色Ids（不传 则退出 调试）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setDebugRoles: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'SetDebugRoles', args, options);
   },
  /**
  * 复制角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {string} args.roleName 新角色名称
  * @param {boolean} args.copyPortalRole 是否是复制的外部门户角色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CopyRole', args, options);
   },
  /**
  * 复制角色到外部门户
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色Id
  * @param {string} args.roleName 角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyRoleToExternalPortal: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CopyRoleToExternalPortal', args, options);
   },
  /**
  * 复制外部门户角色到内部
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色Id
  * @param {string} args.roleName 角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyExternalRolesToInternal: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CopyExternalRolesToInternal', args, options);
   },
  /**
  * 角色排序
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {array} args.roleIds 排序后的角色ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sortRoles: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'SortRoles', args, options);
   },
  /**
  * 获取 应用角色设置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {boolean} args.notOnSettingPage 不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppRoleSetting: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppRoleSetting', args, options);
   },
  /**
  * 获取应用下所用角色基本信息（不含具体权限）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolesWithUsers: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetRolesWithUsers', args, options);
   },
  /**
  * 分页获取 全部成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {string} args.keywords 查询 关键词（现仅 支持 成员名称）
  * @param {integer} args.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
  * @param {array} args.sort 排序参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTotalMember: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetTotalMember', args, options);
   },
  /**
  * 获取 成员的 角色Id和名称
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.memberId
  * @param {} args.memberType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolesByMemberId: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetRolesByMemberId', args, options);
   },
  /**
  * 分页获取 外协成员
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOutsourcingMembers: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetOutsourcingMembers', args, options);
   },
  /**
  * 获取 角色列表（包含 我加入的角色标识）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {boolean} args.allJoinRoles 查看所有加入的角色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppRoleSummary: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppRoleSummary', args, options);
   },
  /**
  * 获取 调试模式 的可选角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDebugRoles: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetDebugRoles', args, options);
   },
  /**
  * 根据角色 分页获取 角色下的用户集
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.roleId 角色Id
  * @param {integer} args.pageIndex 分页面码 = 默认1
  * @param {integer} args.pageSize 分页 页大小
  * @param {string} args.keywords 查询 关键词（现仅 支持 成员名称）
  * @param {integer} args.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
  * @param {array} args.sort 排序参数  （其中 FieldType值为： 默认[时间] = 0、时间 = 10、类型 = 20）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMembersByRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetMembersByRole', args, options);
   },
  /**
  * 批量编辑用户角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {array} args.dstRoleIds 目标角色Ids
  * @param {} args.selectMember
  * @param {boolean} args.selectAll 是否全选
  * @param {boolean} args.isOutsourcing 是否全选外协
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchEditMemberRole: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'BatchEditMemberRole', args, options);
   },
  /**
  * 批量成员退出应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {} args.selectMember
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchMemberQuitApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'BatchMemberQuitApp', args, options);
   },
  /**
  * 获取应用下某个角色的具体权限信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRoleDetail: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetRoleDetail', args, options);
   },
  /**
  * 获取应用下所有工作表信息生成添加角色模板
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAddRoleTemplate: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAddRoleTemplate', args, options);
   },
  /**
  * 获取网络下用户为应用管理员的应用信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.type
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {boolean} args.getLock 是否获取锁定应用（默认不获取）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppForManager: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppForManager', args, options);
   },
  /**
  * 网络下用户为管理员的应用集合
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getManagerApps: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetManagerApps', args, options);
   },
  /**
  * 刷新权限缓存
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refresh: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'Refresh', args, options);
   },
  /**
  * 获取网络下应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 应用状态  0=关闭 1=启用  可空
  * @param {} args.order
  * @param {integer} args.pageIndex 页数（从1开始）
  * @param {integer} args.pageSize 每页显示数
  * @param {string} args.keyword 搜索关键字（支持名称和拥有者名称）
  * @param {integer} args.sourceType 来源 默认0=全部，2=过滤分发平台
  * @param {} args.filterType
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {integer} args.filterDBType 数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）
  * @param {string} args.dbInstanceId 数据库实例id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsForProject: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppsForProject', args, options);
   },
  /**
  * 分页获取网络下应用信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 应用状态  0=关闭 1=启用  可空
  * @param {} args.order
  * @param {integer} args.pageIndex 页数（从1开始）
  * @param {integer} args.pageSize 每页显示数
  * @param {string} args.keyword 搜索关键字（支持名称和拥有者名称）
  * @param {integer} args.sourceType 来源 默认0=全部，2=过滤分发平台
  * @param {} args.filterType
  * @param {boolean} args.containsLinks 是否包含链接类型
  * @param {integer} args.filterDBType 数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）
  * @param {string} args.dbInstanceId 数据库实例id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsByProject: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppsByProject', args, options);
   },
  /**
  * 获取应用信息（批量）
  * @param {Object} args 请求参数
  * @param {array} args.appIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApps: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetApps', args, options);
   },
  /**
  * 获取导出相关功能模块token
  * @param {Object} args 请求参数
  * @param {} args.tokenType
  * @param {string} args.worksheetId
  * @param {string} args.viewId
  * @param {string} args.projectId 网络id ，TokenType = 4或6时，这个必穿
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getToken: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetToken', args, options);
   },
  /**
  * 更新应用状态
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id（原应用包id）
  * @param {integer} args.status 状态  0=关闭 1=启用 2=删除
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAppStatus', args, options);
   },
  /**
  * 检测是否是网络后台应用管理员
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkIsAppAdmin: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CheckIsAppAdmin', args, options);
   },
  /**
  * 验证用户是否在应用管理员中
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAppAdminForUser: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CheckAppAdminForUser', args, options);
   },
  /**
  * 把自己加入应用管理员(后台)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRoleMemberForAppAdmin: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddRoleMemberForAppAdmin', args, options);
   },
  /**
  * 移动分组下项到另外一个分组（如果是同一应用下应用id相同即可）
  * @param {Object} args 请求参数
  * @param {string} args.sourceAppId 来源应用id
  * @param {string} args.resultAppId 目标应用id
  * @param {string} args.sourceAppSectionId 来源应用分组id
  * @param {string} args.resultAppSectionId 目标应用分组id
  * @param {array} args.workSheetsInfo 基础信息集合
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeWorkSheetAscription: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RemoveWorkSheetAscription', args, options);
   },
  /**
  * 删除应用分组下项(工作表，自定义页面)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 组织id
  * @param {string} args.appSectionId 应用分组id
  * @param {string} args.workSheetId id
  * @param {integer} args.type 类型 0=工作表，1=自定义页面
  * @param {boolean} args.isPermanentlyDelete 是否永久删除 true-表示永久删除 false-表示到回收站
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeWorkSheetForApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RemoveWorkSheetForApp', args, options);
   },
  /**
  * 分页获取应用项回收站列表
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {string} args.keyword 关键字搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppItemRecoveryList: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppItemRecoveryList', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {string} args.id 应用项回收站记录id
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appItemRecovery: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AppItemRecovery', args, options);
   },
  /**
  * 修改分组下实体名称和图标
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 应用分组id
  * @param {string} args.workSheetId id
  * @param {string} args.workSheetName 名称
  * @param {string} args.icon 图标
  * @param {integer} args.type 类型
  * @param {string} args.urlTemplate 链接
  * @param {object} args.configuration 链接配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorkSheetInfoForApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditWorkSheetInfoForApp', args, options);
   },
  /**
  * 变更应用拥有者
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.memberId 新的应用拥有者
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppOwner: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'UpdateAppOwner', args, options);
   },
  /**
  * 应用分组下新增项
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId SectionId
  * @param {string} args.name 名称
  * @param {string} args.icon Logo
  * @param {integer} args.type 类型 0=工作表 1=自定义页面
  * @param {integer} args.createType 创建类型（创建自定义页面得时候需要传）0-表示普通 1-表示外部链接
  * @param {string} args.urlTemplate 链接
  * @param {object} args.configuration 链接配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkSheet: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddWorkSheet', args, options);
   },
  /**
  * 新增工作表（级联数据源及子表）
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 原始工作表id
  * @param {string} args.name
  * @param {integer} args.worksheetType 1：普通表 2：子表
  * @param {boolean} args.createLayer 直接创建层级视图
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addSheet: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddSheet', args, options);
   },
  /**
  * 转换工作表
  * @param {Object} args 请求参数
  * @param {string} args.sourceWorksheetId 来源工作表id
  * @param {string} args.worksheetId 子表id
  * @param {string} args.name 子表名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   changeSheet: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'ChangeSheet', args, options);
   },
  /**
  * 复制自定义页面
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId SectionId
  * @param {string} args.name 名称
  * @param {string} args.id 自定义页面id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyCustomPage: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CopyCustomPage', args, options);
   },
  /**
  * 新增应用授权
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {integer} args.type 权限范围类型 1=全部，2=只读
  * @param {boolean} args.viewNull 不传视图id不返回数据配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAuthorize: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddAuthorize', args, options);
   },
  /**
  * 获取应用授权
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAuthorizes: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAuthorizes', args, options);
   },
  /**
  * 编辑应用授权类型
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appKey 应用key
  * @param {integer} args.type 权限范围类型 1=全部，2=只读
  * @param {boolean} args.viewNull 不传视图id不返回数据配置
  * @param {integer} args.status 授权状态 1-开启 2-关闭 3-删除
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAuthorizeStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAuthorizeStatus', args, options);
   },
  /**
  * 删除应用授权类型
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appKey 应用key
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteAuthorizeStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'DeleteAuthorizeStatus', args, options);
   },
  /**
  * 编辑备注
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.appKey
  * @param {string} args.remark 备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAuthorizeRemark: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAuthorizeRemark', args, options);
   },
  /**
  * 获取绑定的微信公众号信息
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWeiXinBindingInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetWeiXinBindingInfo', args, options);
   },
  /**
  * 获取当前应用的的申请信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.size 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppApplyInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppApplyInfo', args, options);
   },
  /**
  * 申请加入应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.remark 申请说明
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAppApply: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddAppApply', args, options);
   },
  /**
  * 更新应用申请状态
  * @param {Object} args 请求参数
  * @param {array} args.ids 申请信息的id
  * @param {string} args.appId 应用id
  * @param {integer} args.status 状态 2=通过，3=拒绝
  * @param {string} args.roleId 角色id（拒绝时可空）
  * @param {string} args.remark 备注，拒绝理由
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppApplyStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditAppApplyStatus', args, options);
   },
  /**
  * 获取icon（包含系统和自定义）
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIcon: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetIcon', args, options);
   },
  /**
  * 添加自定义图标
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.data icon数据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addCustomIcon: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddCustomIcon', args, options);
   },
  /**
  * 删除自定义图标
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteCustomIcon: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'DeleteCustomIcon', args, options);
   },
  /**
  * 获取自定义图标
  * @param {Object} args 请求参数
  * @param {array} args.fileNames 自定义图标名称
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
  * @param {boolean} args.iconType 图标类型 true-表示系统图标 false-自定义图标
  * @param {array} args.categories 分类数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCustomIconByProject: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetCustomIconByProject', args, options);
   },
  /**
  * 获取分类和首页信息
  * @param {Object} args 请求参数
  * @param {boolean} args.isCategory 是否只加载分类信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsCategoryInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppsCategoryInfo', args, options);
   },
  /**
  * 获取分类下应用库模板列表
  * @param {Object} args 请求参数
  * @param {string} args.categoryId 分类id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppsLibraryInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppsLibraryInfo', args, options);
   },
  /**
  * 安装应用
  * @param {Object} args 请求参数
  * @param {string} args.libraryId 应用库id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   installApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'InstallApp', args, options);
   },
  /**
  * 获取单个应用库模板详情
  * @param {Object} args 请求参数
  * @param {string} args.libraryId 应用库id
  * @param {string} args.projectId 网络ud
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppLibraryDetail: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppLibraryDetail', args, options);
   },
  /**
  * 获取应用库FileUrl Token
  * @param {Object} args 请求参数
  * @param {string} args.libraryId
  * @param {string} args.projectId 安装目标网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLibraryToken: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetLibraryToken', args, options);
   },
  /**
  * 获取日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.keyword 搜索关键字
  * @param {integer} args.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
  * @param {string} args.start 开始时间
  * @param {string} args.end 结束时间
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLogs: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetLogs', args, options);
   },
  /**
  * 获取导出记录
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExportsByApp: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetExportsByApp', args, options);
   },
  /**
  * 导出密码
  * @param {Object} args 请求参数
  * @param {string} args.id 日志id
  * @param {string} args.appId 应用id
  * @param {integer} args.passwordType 0 = 导出密码，1 = 锁定密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExportPassword: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetExportPassword', args, options);
   },
  /**
  * 创建工作流CSM
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorkflow: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'AddWorkflow', args, options);
   },
  /**
  * 获取应用实体分享信息
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 分享来源id （页面id，图标id等）
  * @param {} args.sourceType
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEntityShare: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetEntityShare', args, options);
   },
  /**
  * 修改应用实体分享信息
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 分享来源id （页面id，图标id等）
  * @param {integer} args.sourceType 分享类型  21 =自定义页面，31 = 图表
  * @param {integer} args.status 状态  0 = 关闭，1 =启用
  * @param {string} args.password 密码
  * @param {string} args.validTime 有效时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editEntityShareStatus: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'EditEntityShareStatus', args, options);
   },
  /**
  * 获取分享基础信息
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.id 分享id
  * @param {string} args.password 密码
  * @param {string} args.clientId 客户端id
  * @param {} args.langType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEntityShareById: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetEntityShareById', args, options);
   },
  /**
  * 删除应用备份文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {string} args.id 应用备份操作日志Id
  * @param {string} args.fileName 应用备份的文件名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteBackupFile: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'DeleteBackupFile', args, options);
   },
  /**
  * 分页获取应用备份还原操作日志
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用Id
  * @param {boolean} args.isBackup 是否为获取备份文件列表，true表示获取备份文件列表，false表示获取操作日志列表
  * @param {string} args.accountId 操作人
  * @param {string} args.startTime 开始时间
  * @param {string} args.endTime 结束时间
  * @param {} args.orderType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pageGetBackupRestoreOperationLog: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'PageGetBackupRestoreOperationLog', args, options);
   },
  /**
  * 获取应用数量信息
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppSupportInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetAppSupportInfo', args, options);
   },
  /**
  * 重命名应用备份文件
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {string} args.id 应用备份操作日志Id
  * @param {string} args.fileName 备份新名称
  * @param {string} args.fileOldName 备份新名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   renameBackupFileName: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'RenameBackupFileName', args, options);
   },
  /**
  * 获取有效备份文件信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getValidBackupFileInfo: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'GetValidBackupFileInfo', args, options);
   },
  /**
  * 还原应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {string} args.appId 应用id
  * @param {string} args.id 备份还原操作日志id
  * @param {boolean} args.autoEndMaintain 是否自动结束应用维护状态
  * @param {boolean} args.backupCurrentVersion 备份当前版本
  * @param {boolean} args.isRestoreNew 是否还原为新应用
  * @param {boolean} args.containData 是否还原数据
  * @param {string} args.fileUrl 文件链接
  * @param {string} args.fileName 文件名称
  * @param {string} args.dbInstanceId 数据库实例id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restore: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'Restore', args, options);
   },
  /**
  * 备份应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {boolean} args.containData 是否备份数据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   backup: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'Backup', args, options);
   },
  /**
  * 校验还原文件
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.fileUrl
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkRestoreFile: function (args, options = {}) {
     
     return mdyAPI('AppManagement', 'CheckRestoreFile', args, options);
   },
};
