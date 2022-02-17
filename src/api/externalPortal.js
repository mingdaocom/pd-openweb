module.exports = {
  /**
  * 根据域名获取门户配置
  * @param {Object} args 请求参数
  * @param {string} args.domainName 域名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPortalSetByDomain: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetPortalSetByDomain', args, options);
   },
  /**
  * 根据AppId获取门户配置
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPortalSetByAppId: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetPortalSetByAppId', args, options);
   },
  /**
  * 根据AppId获取基础配置
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getBaseSetByAppId: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetBaseSetByAppId', args, options);
   },
  /**
  * 根据AppId获取登录页配置
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLoginPageSetByAppId: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetLoginPageSetByAppId', args, options);
   },
  /**
  * 根据AppId获取门户启用状态
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPortalEnableState: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetPortalEnableState', args, options);
   },
  /**
  * 校验域名
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.domainName 门户自定义域名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateDomianName: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'ValidateDomianName', args, options);
   },
  /**
  * 获取短信签名
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSmsSignatrue: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetSmsSignatrue', args, options);
   },
  /**
  * 启用/关闭外部门户
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {boolean} args.isEnable 是否启用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   onOffPortal: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'OnOffPortal', args, options);
   },
  /**
  * 保存门户基础配置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.domainName 自定义域名
  * @param {} args.loginMode 登录/注册方式 Phone:手机 WeChat:微信
  * @param {} args.allowUserType 允许注册访问的用户类型 任何人=3 审核的用户=6 定向邀请的用户=9
  * @param {} args.noticeScope 通知作用域   Admin:管理员
  * @param {string} args.wxAppId 微信AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editBaseSet: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'EditBaseSet', args, options);
   },
  /**
  * 保存门户登录页配置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.pageTitle 登录页名称
  * @param {} args.logoImageBucket LogoImage BucketType 私信=1  BUG反馈层=2  文档=3  图片=4（0:属于无效类型）
  * @param {string} args.logoImagePath 登录页 LogoImage 相对路径
  * @param {} args.pageMode 登录页面结构 居中=3 左右=6
  * @param {} args.backGroundType 背景类型  纯色=3 背景图=6
  * @param {string} args.backColor 背景色
  * @param {} args.backImageBucket BackImage BucketType 私信=1  BUG反馈层=2  文档=3  图片=4（0:属于无效类型）
  * @param {string} args.backImagePath 背景图片相对路径
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editLoginPageSet: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'EditLoginPageSet', args, options);
   },
  /**
  * 保存消息设置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.smsSignature 短信签名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveMessageSet: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'SaveMessageSet', args, options);
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
     
     return $.api('ExternalPortal', 'EditIsSendMsgs', args, options);
   },
  /**
  * 获取外部人员列表基础配置信息
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserTemple: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetUserTemple', args, options);
   },
  /**
  * 获取待收集信息
  * @param {Object} args 请求参数
  * @param {boolean} args.getSystem 是否获取系统字段，这里只会添加（name,phone）
  * @param {string} args.exAccountId 外部账户Id
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserCollect: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetUserCollect', args, options);
   },
  /**
  * 获取用户详情
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.rowId
  * @param {string} args.exAccountId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserDetail: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetUserDetail', args, options);
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
     
     return $.api('ExternalPortal', 'GetUserActionLogs', args, options);
   },
  /**
  * 获取查看量
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {integer} args.type 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   dateHistogram: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'DateHistogram', args, options);
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
     
     return $.api('ExternalPortal', 'ImportExAccounts', args, options);
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
     
     return $.api('ExternalPortal', 'AddExAccounts', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSimple: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('ExternalPortal', 'GetSimple', args, options);
   },
  /**
  * 开发测试方法
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addSimple: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('ExternalPortal', 'AddSimple', args, options);
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
     
     return $.api('ExternalPortal', 'ReinviteExAccount', args, options);
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
     
     return $.api('ExternalPortal', 'SaveUserDetailForBackgroud', args, options);
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
     
     return $.api('ExternalPortal', 'SaveUserDetail', args, options);
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
     
     return $.api('ExternalPortal', 'EditExAccountsRole', args, options);
   },
  /**
  * 修改外部用户状态
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {} args.newState 新状态
  * @param {string} args.rowId 行Id
  * @param {string} args.exAccountId 外部用户Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editExAccountState: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'EditExAccountState', args, options);
   },
  /**
  * 批量(审核)同意的用户
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.roleId 角色Id
  * @param {array} args.rowIds 行Id
  * @param {array} args.exAccountIds 外部账户Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   auditPassExAccountToNewRole: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'AuditPassExAccountToNewRole', args, options);
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
     
     return $.api('ExternalPortal', 'RefusePassExAccount', args, options);
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
     
     return $.api('ExternalPortal', 'RemoveUsers', args, options);
   },
  /**
  * 获取用户字段配置
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserControls: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetUserControls', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 兼容老数据
  * @param {string} args.worksheetId WorksheetId
  * @param {integer} args.version 版本号
  * @param {array} args.controls 控件集合
  * @param {string} args.appId 应用ID
  * @param {string} args.controlId 控件ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveUserControls: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'SaveUserControls', args, options);
   },
  /**
  * 获取显示列
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getViewShowControls: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetViewShowControls', args, options);
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
     
     return $.api('ExternalPortal', 'EditViewShowControls', args, options);
   },
  /**
  * 获取外部用户分类数量
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExAccountCategoryCount: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetExAccountCategoryCount', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {integer} args.potralStatus 状态  0 = 所有用户（不包含待审核），3 = 未审核
  * @param {string} args.worksheetId 工作表id
  * @param {} args.getType
  * @param {array} args.filterControls 查询列
  * @param {array} args.fastFilters 快速筛选
  * @param {array} args.navGroupFilters 导航分组筛选
  * @param {array} args.sortControls 排序列
  * @param {string} args.keyWords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {} args.searchType 搜索类型
  * @param {} args.status 状态
  * @param {boolean} args.isUnRead 是否已读
  * @param {boolean} args.isGetWorksheet 是否查询工作表的详情
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {string} args.relationWorksheetId relationWorksheetId
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
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterRows: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetFilterRows', args, options);
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
     
     return $.api('ExternalPortal', 'GetDetail', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUsers: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetUsers', args, options);
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
     
     return $.api('ExternalPortal', 'GetUsersByApp', args, options);
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
     
     return $.api('ExternalPortal', 'RemoveUsersByPorject', args, options);
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
   getByProject: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetByProject', args, options);
   },
  /**
  * 获取外部门户的角色列表
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExRoles: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetExRoles', args, options);
   },
  /**
  * 新增外部角色
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.name 名称
  * @param {string} args.description 描述
  * @param {integer} args.permissionWay 角色类型（0:自定义、10:只读、50::成员、100:管理员）
  * @param {string} args.projectId 网络id
  * @param {array} args.sheets 工作表权限集合
  * @param {array} args.userIds 角色成员id集合
  * @param {array} args.pages 自定义页面
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addExRole: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'AddExRole', args, options);
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
     
     return $.api('ExternalPortal', 'EditDefaultExRole', args, options);
   },
  /**
  * 配置外部角色权限
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.roleId 角色id
  * @param {} args.appRoleModel 角色配置实体
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppExRole: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'EditAppExRole', args, options);
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
     
     return $.api('ExternalPortal', 'RemoveExRole', args, options);
   },
  /**
  * 发送外部门户验证码
  * @param {Object} args 请求参数
  * @param {string} args.account 账号手机号
  * @param {string} args.appId 应用ID
  * @param {} args.verifyCodeType 类型短信或语音
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendVerifyCode: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'SendVerifyCode', args, options);
   },
  /**
  * 外部门户验证码登录与注册
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {string} args.appId 应用ID
  * @param {string} args.state 微信登录成功之后返回的临时状态码
用于反向存储微信相关信息，具备有效期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   login: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'Login', args, options);
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
     
     return $.api('ExternalPortal', 'InfoLogin', args, options);
   },
  /**
  * 返回外部门户微信登录跳转地址
  * @param {Object} args 请求参数
  * @param {string} args.wxAppId 微信公众号应用ID
  * @param {string} args.appId 应用ID
  * @param {string} args.projectId 网络ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTpLoginUrlInfo: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'GetTpLoginUrlInfo', args, options);
   },
  /**
  * 外部门户微信登录
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {string} args.state 状态码，防止回放
  * @param {string} args.wxAppId 微信公众号应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   tpLogin: function (args, options = {}) {
     
     return $.api('ExternalPortal', 'TpLogin', args, options);
   },
};
