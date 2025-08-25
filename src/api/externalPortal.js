export default {
  /**
   * 获取 登录地址
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLoginUrl: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetLoginUrl', args, options);
  },
  /**
   * 获取 门户配置
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPortalSetByAppId: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetPortalSetByAppId', args, options);
  },
  /**
   * 获取 门户应用ID
   * @param {Object} args 请求参数
   * @param {string} args.customeAddressSuffix 自定义地址后缀
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppIdByAddressSuffix: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetAppIdByAddressSuffix', args, options);
  },
  /**
   * 获取 用户协议
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserAgreement: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUserAgreement', args, options);
  },
  /**
   * 获取 隐私条款
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPrivacyTerms: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetPrivacyTerms', args, options);
  },
  /**
   * 根据AppId获取外部门户配置(含用户自定义字段)
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPortalSet: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetPortalSet', args, options);
  },
  /**
   * 根据AppId获取门户启用状态
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPortalEnableState: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetPortalEnableState', args, options);
  },
  /**
  * 根据 AppId
获取功能配置
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {string} args.customLink 客户自定义登录链接参数值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getConfig: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetConfig', args, options);
  },
  /**
   * 创建 外部门户讨论工作流
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createEPDiscussWorkFlow: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'CreateEPDiscussWorkFlow', args, options);
  },
  /**
   * 生成地址
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  initAddressExt: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'InitAddressExt', args, options);
  },
  /**
   * 编辑 外部门户的启用状态
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {boolean} args.isEnable 是否启用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editExPortalEnable: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditExPortalEnable', args, options);
  },
  /**
   * 修改是否发送短信
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {boolean} args.isSendMsgs
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editIsSendMsgs: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditIsSendMsgs', args, options);
  },
  /**
   * 保存外部门户配置(含外部用户自定义字段)
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {} args.portalSet
   * @param {} args.worksheetControls
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPortalSet: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditPortalSet', args, options);
  },
  /**
   * 编辑 门户自定义访问地址
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用 AppId
   * @param {string} args.customAddressSuffix 自定义地址后缀
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editCustomAddressSuffix: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditCustomAddressSuffix', args, options);
  },
  /**
   * 编辑 门户自定义扩展地址
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用 AppId
   * @param {array} args.addressExt 扩展地址
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editCustomAddressExt: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditCustomAddressExt', args, options);
  },
  /**
   * 发送 验证码（登录后）
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.account 手机号/邮箱
   * @param {string} args.appId 应用ID
   * @param {} args.codeType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendAccountVerifyCode: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'SendAccountVerifyCode', args, options);
  },
  /**
   * 检查 验证码
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {string} args.verifyCode 验证码
   * @param {string} args.account 账号：手机号/邮箱
   * @param {} args.handleType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkExAccountVerifyCode: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'CheckExAccountVerifyCode', args, options);
  },
  /**
   * 获取外部人员列表基础配置信息
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserTemple: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUserTemple', args, options);
  },
  /**
   * 获取待收集信息
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {boolean} args.getSystem 是否获取系统字段，这里只会添加（name,phone）
   * @param {string} args.exAccountId 外部账户Id
   * @param {} args.lang
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserCollect: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUserCollect', args, options);
  },
  /**
   * 获取外部用户日志
   * @param {Object} args 请求参数
   * @param {string} args.appId
   * @param {integer} args.pageIndex 当前页码
   * @param {integer} args.pageSize 页面尺寸
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 结束时间
   * @param {string} args.fullnameOrMobilePhone 用户名或手机号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUserActionLogs: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUserActionLogs', args, options);
  },
  /**
   *
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {integer} args.type 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  dateHistogram: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'DateHistogram', args, options);
  },
  /**
   * 通过Excel文件批量导入用户
   * @param {Object} args 请求参数
   * @param {string} args.fileUrl 七牛云的文件路径url
   * @param {string} args.appId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  importExAccounts: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'ImportExAccounts', args, options);
  },
  /**
   * 手动邀请用户
   * @param {Object} args 请求参数
   * @param {string} args.appId appId
   * @param {boolean} args.isSendMsgs 是否发送短信
   * @param {array} args.addExAccountInfos 用户信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addExAccounts: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'AddExAccounts', args, options);
  },
  /**
   * 重新邀请
   * @param {Object} args 请求参数
   * @param {string} args.appId appId
   * @param {array} args.exAccountIds 外部用户Ids
   * @param {array} args.rowIds 行Ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  reinviteExAccount: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'ReinviteExAccount', args, options);
  },
  /**
   * 后台保存外部用户信息
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用AppId
   * @param {string} args.rowId 行Id
   * @param {string} args.exAccountId 外部用户Id
   * @param {array} args.newCell 更改的控件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveUserDetailForBackgroud: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'SaveUserDetailForBackgroud', args, options);
  },
  /**
   * 保存外部用户信息
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用AppId
   * @param {string} args.rowId 行Id
   * @param {string} args.exAccountId 外部用户Id
   * @param {array} args.newCell 更改的控件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveUserDetail: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'SaveUserDetail', args, options);
  },
  /**
   * 批量更改用户角色
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.newRoleId 角色Id
   * @param {array} args.rowIds 行Id
   * @param {array} args.exAccountIds 外部用户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editExAccountsRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditExAccountsRole', args, options);
  },
  /**
   * 修改外部用户状态
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {array} args.rowIds 行Id
   * @param {array} args.exAccountIds 外部用户Id
   * @param {} args.newState
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editExAccountState: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditExAccountState', args, options);
  },
  /**
   * 激活用户
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {array} args.rowIds 行Id
   * @param {array} args.exAccountIds 外部用户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  activatExAccounts: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'ActivatExAccounts', args, options);
  },
  /**
   * 批量(审核)同意的用户
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.roleId 角色Id
   * @param {array} args.rowIds 行Id
   * @param {array} args.exAccountIds 外部账户Id
   * @param {array} args.newCell 修改的控件信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  auditPassExAccountToNewRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'AuditPassExAccountToNewRole', args, options);
  },
  /**
   * 批量(审核)拒绝的用户
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {array} args.rowIds 行Id
   * @param {array} args.exAccountIds 账户Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refusePassExAccount: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'RefusePassExAccount', args, options);
  },
  /**
   * 外部用户 注销
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editExAccountCancel: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditExAccountCancel', args, options);
  },
  /**
   * 外部用户 绑定新账户
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {string} args.verifyCode 验证码
   * @param {string} args.account 新手机号
   * @param {boolean} args.doubleBinding 双重绑定
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  bindExAccount: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'BindExAccount', args, options);
  },
  /**
   * 外部用户 修改新账户
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {string} args.verifyCode 验证码
   * @param {string} args.account 新手机号
   * @param {boolean} args.doubleBinding 双重绑定
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editExAccount: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditExAccount', args, options);
  },
  /**
   * 批量删除用户
   * @param {Object} args 请求参数
   * @param {string} args.appId
   * @param {array} args.exAccountIds
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeUsers: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'RemoveUsers', args, options);
  },
  /**
   * 获取显示列
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getViewShowControls: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetViewShowControls', args, options);
  },
  /**
   * 编辑显示列
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {array} args.controlIds 显示的字段id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editViewShowControls: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditViewShowControls', args, options);
  },
  /**
   * 获取外部用户分类数量
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getExAccountCategoryCount: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetExAccountCategoryCount', args, options);
  },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.worksheetId 工作表id
  * @param {} args.getType
  * @param {array} args.filterControls 查询列
  * @param {array} args.fastFilters 快速筛选
  * @param {array} args.navGroupFilters 导航分组筛选
  * @param {array} args.filtersGroup 筛选组件筛选
  * @param {array} args.sortControls 排序列
  * @param {string} args.keyWords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {} args.searchType
  * @param {} args.status
  * @param {boolean} args.isUnRead 是否已读
  * @param {boolean} args.isGetWorksheet 是否查询工作表的详情
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {string} args.relationWorksheetId relationWorksheetId
  * @param {string} args.relationViewId RelationViewId
  * @param {string} args.rowId 行id
  * @param {string} args.controlId 控件Id
  * @param {string} args.kanbanKey 全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,
  * @param {integer} args.layer 层级视图加载层数
  * @param {string} args.beginTime 开始时间 日历视图
  * @param {string} args.endTime 结束时间 日历视图
  * @param {integer} args.kanbanSize 页大小
  * @param {integer} args.kanbanIndex 页码
  * @param {string} args.formId 公开表单ID
  * @param {string} args.linkId 填写链接id
  * @param {string} args.reportId 统计图ID
  * @param {boolean} args.notGetTotal 不获取总记录数
  * @param {object} args.requestParams 请求参数
  * @param {integer} args.langType //语言类型
  * @param {integer} args.potralStatus 状态  0 = 所有用户（不包含待审核），3 = 未审核
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getFilterRows: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetFilterRows', args, options);
  },
  /**
   * 获取详情
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.rowId
   * @param {string} args.exAccountId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDetail: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetDetail', args, options);
  },
  /**
   * 获取网络下所有外部用户
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.appId 应用id
   * @param {string} args.keywords 搜索关键字
   * @param {string} args.createTimeStart 注册时间开始
   * @param {string} args.createTimeEnd 注册时间结束
   * @param {string} args.lastTimeStart 最近登录时间开始
   * @param {string} args.lastTimeTimeEnd 最近登录时间结束
   * @param {integer} args.pageIndex
   * @param {integer} args.pageSize
   * @param {integer} args.sortType 排序 0 =默认排序，10 = 注册时间正序，11=注册时间倒序，20 =登录时间正序，21 = 登录时间倒序
   * @param {boolean} args.isReturnTotal 是否返回 总计
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUsers: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUsers', args, options);
  },
  /**
   * 应用下选外部用户
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.keywords 搜索关键字
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 每页数量
   * @param {integer} args.sortType 排序 0 =默认排序，10 = 注册时间正序，11=注册时间倒序，20 =登录时间正序，21 = 登录时间倒序
   * @param {array} args.filterAccountIds 需要过滤的外部用户id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getUsersByApp: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetUsersByApp', args, options);
  },
  /**
   * 批量删除网络下外部用户
   * @param {Object} args 请求参数
   * @param {array} args.exAccountInfos 删除的用户信息
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeUsersByPorject: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'RemoveUsersByPorject', args, options);
  },
  /**
   * 获取所有设置了外部的应用信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {integer} args.pageIndex
   * @param {integer} args.pageSize
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppInfoByProject: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetAppInfoByProject', args, options);
  },
  /**
   * 获取外部门户的角色列表
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getExRoles: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetExRoles', args, options);
  },
  /**
   * 新增外部角色
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
  addExRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'AddExRole', args, options);
  },
  /**
   * 设置默认角色
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用程序Id
   * @param {string} args.defaultRoleId 角色Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editDefaultExRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditDefaultExRole', args, options);
  },
  /**
   * 配置外部角色权限
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.roleId 角色id
   * @param {} args.appRoleModel
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAppExRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'EditAppExRole', args, options);
  },
  /**
   * 删除外部角色(此角色的外部用户使用默认角色)
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.roleId 角色id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeExRole: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'RemoveExRole', args, options);
  },
  /**
   * 发送外部门户验证码
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.account 账号：手机号/邮箱
   * @param {string} args.appId 应用ID
   * @param {} args.lang
   * @param {} args.verifyCodeType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendVerifyCode: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'SendVerifyCode', args, options);
  },
  /**
   * 自动登录
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.autoLoginKey 自动密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  autoLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'AutoLogin', args, options);
  },
  /**
  * 外部门户验证码登录与注册
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {string} args.appId 应用ID
  * @param {string} args.state 微信登录成功之后返回的临时状态码
用于反向存储微信相关信息，具备有效期
  * @param {boolean} args.autoLogin 是否自动登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  login: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'Login', args, options);
  },
  /**
   * 外部门户密码登录与注册
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.account 账号
   * @param {string} args.password 前端RSA加密过后的密码
   * @param {string} args.appId 应用ID
   * @param {string} args.verifyCode 验证码
   * @param {boolean} args.autoLogin 是否自动登录
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pwdLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'PwdLogin', args, options);
  },
  /**
  * 外部门户两步验证登录
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.state 首次登录成功之后返回的临时状态码
用于反向存储用户相关信息，具备有效期
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {boolean} args.autoLogin 是否自动登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  twofactorLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'TwofactorLogin', args, options);
  },
  /**
  * 外部门户两步验证获取用户信息
  * @param {Object} args 请求参数
  * @param {string} args.state 首次登录成功之后返回的临时状态码
用于反向存储用户相关信息，具备有效期
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getTwofactorInfo: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetTwofactorInfo', args, options);
  },
  /**
   * 外部门户单点登录
   * @param {Object} args 请求参数
   * @param {string} args.unionId 第三方Id
   * @param {string} args.appId 外部门户所属应用Id
   * @param {string} args.state 第三方状态
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  exportalSSO: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'ExportalSSO', args, options);
  },
  /**
  * 收集信息与登录
  * @param {Object} args 请求参数
  * @param {string} args.state 验证码或者微信登录成功之后返回的临时状态码
用于反向存储账户相关信息，具备有效期
  * @param {array} args.receiveControls 用户填写信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  infoLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'InfoLogin', args, options);
  },
  /**
   * 返回外部门户微信登录跳转地址
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getTpLoginUrlInfo: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetTpLoginUrlInfo', args, options);
  },
  /**
   * 外部门户微信登录
   * @param {Object} args 请求参数
   * @param {string} args.code 授权码
   * @param {string} args.state 状态码，防止回放
   * @param {string} args.wxAppId 微信公众号应用Id
   * @param {boolean} args.pcScan 是否PC扫码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  tpLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'TpLogin', args, options);
  },
  /**
   * 返回外部门户平台二维码登录扫码地址
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSelfLoginScanUrl: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetSelfLoginScanUrl', args, options);
  },
  /**
  * 返回外部门户平台二维码扫码之后跳转登录地址
  * @param {Object} args 请求参数
  * @param {string} args.state 二维码所需的临时状态码
用于反向存储应用与用户相关信息，具备有效期
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getSelfTpLoginUrlInfo: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetSelfTpLoginUrlInfo', args, options);
  },
  /**
  * 返回外部门户微信公众号关注地址
  * @param {Object} args 请求参数
  * @param {string} args.state 二维码所需的临时状态码
用于反向存储应用与用户相关信息，具备有效期
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getTpLoginSubscribedScanUrl: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'GetTpLoginSubscribedScanUrl', args, options);
  },
  /**
  * 获取外部门户微信扫码登录结果
轮询
  * @param {Object} args 请求参数
  * @param {string} args.state 二维码所需的临时状态码
用于反向存储账户相关信息，具备有效期
  * @param {string} args.appId 应用ID
  * @param {boolean} args.autoLogin 是否自动登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  scanTpLogin: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'ScanTpLogin', args, options);
  },
  /**
   * 外部门户用户修改/找回密码
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.account 账号
   * @param {string} args.password 前端RSA加密过后的密码
   * @param {string} args.appId 应用ID
   * @param {string} args.verifyCode 验证码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  findPwd: function (args, options = {}) {
    return mdyAPI('ExternalPortal', 'FindPwd', args, options);
  },
};
