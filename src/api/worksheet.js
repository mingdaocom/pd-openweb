export default {
  /**
   * 获取视图权限
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getViewPermission: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetViewPermission', args, options);
  },
  /**
   * 获取应用角色用户扩展属性
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.customLink 客户自定义登录链接参数值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppExtendAttr: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetAppExtendAttr', args, options);
  },
  /**
   * 获取工作表的扩展属性选项控件信息
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表Id
   * @param {boolean} args.isPortal
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getExtendAttrOptionalControl: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetExtendAttrOptionalControl', args, options);
  },
  /**
   * 保存应用角色用户扩展属性
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.userControlId 用户控件
   * @param {array} args.extendAttrs 扩展字段属性
   * @param {array} args.extendAndAttrs 扩展且字段属性
   * @param {integer} args.status 状态【9：关闭 1：正常】
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveAppExtendAttr: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveAppExtendAttr', args, options);
  },
  /**
   * 复制表格
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.name 名称
   * @param {string} args.projectId 网络id
   * @param {boolean} args.isCopyBtnName 是否复制按钮名称
   * @param {boolean} args.isCopyDesc 是否复制描述
   * @param {boolean} args.isCopyAdmin 是否复制管理员
   * @param {boolean} args.isCopyRows 是否复制行数据
   * @param {string} args.appId 应用id
   * @param {string} args.appSectionId 分组id
   * @param {array} args.relationControlIds 复制的关联控件ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyWorksheet: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyWorksheet', args, options);
  },
  /**
   * 修改表格行记录名
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.entityName 记录名
   * @param {string} args.appID 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateEntityName: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateEntityName', args, options);
  },
  /**
   * 修改工作表开发者备注
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.developerNotes 记录名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editDeveloperNotes: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditDeveloperNotes', args, options);
  },
  /**
   * 更新 工作表别名
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.alias 别名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetAlias: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetAlias', args, options);
  },
  /**
   * 修改表格描述
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.dec 描述
   * @param {string} args.resume
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetDec: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetDec', args, options);
  },
  /**
   * 修改表格视图分享范围
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.rowId 行Id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.viewId 视图Id
   * @param {} args.shareRange
   * @param {} args.objectType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetShareRange: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetShareRange', args, options);
  },
  /**
   * 工作表详情
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetInfo: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetInfo', args, options);
  },
  /**
   * 获取工作表基本信息
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetBaseInfo: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetBaseInfo', args, options);
  },
  /**
   * 审批、填写获取子表信息及控件权限
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {string} args.controlId 子表的控件id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {string} args.linkId 工作流填写链接id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetInfoByWorkItem: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetInfoByWorkItem', args, options);
  },
  /**
   * 获取工作表分享链接
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {} args.objectType
   * @param {string} args.rowId 行Id
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.password 密码code
   * @param {string} args.validTime 有效时间
   * @param {string} args.pageTitle 页面标题
   * @param {boolean} args.isEdit 是否为编辑,获取url时不传，编辑时传true
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetShareUrl: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetShareUrl', args, options);
  },
  /**
  * 根据shareid得到worksheetid
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.shareId 对外分享标识
  * @param {string} args.password 密码
  * @param {string} args.printId 打印模板id
  * @param {} args.langType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getShareInfoByShareId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetShareInfoByShareId', args, options);
  },
  /**
   * 获取工作表校准间隔时间
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRefreshRowsMinute: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRefreshRowsMinute', args, options);
  },
  /**
   * 行详情
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {boolean} args.getTemplate 是否获取模板
   * @param {string} args.shareId 分享页获取关联记录iD
   * @param {boolean} args.checkView 是否验证视图
   * @param {string} args.relationWorksheetId 关联控件ID
   * @param {string} args.discussId 讨论ID
   * @param {integer} args.langType //语言类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowByID: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowByID', args, options);
  },
  /**
   * 获取 附件详情
   * @param {Object} args 请求参数
   * @param {string} args.attachmentShareId 附件分享Id
   * @param {} args.getType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentDetail: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetAttachmentDetail', args, options);
  },
  /**
   * 获取 附件分享Id
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.viewId 视图Id
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.rowId 行记录Id
   * @param {string} args.controlId 控件Id
   * @param {string} args.fileId 附件Id
   * @param {string} args.instanceId 实例Id
   * @param {string} args.workId 工作Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachmentShareId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetAttachmentShareId', args, options);
  },
  /**
   * 获取记录详情
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {boolean} args.getTemplate 是否获取模板
   * @param {string} args.shareId 分享页获取关联记录iD
   * @param {boolean} args.checkView 是否验证视图
   * @param {string} args.relationWorksheetId 关联控件ID
   * @param {string} args.discussId 讨论ID
   * @param {integer} args.langType //语言类型
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowDetail: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowDetail', args, options);
  },
  /**
   * 校验行记录编辑锁
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.rowId
   * @param {boolean} args.getRowUpdateTime
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkRowEditLock: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CheckRowEditLock', args, options);
  },
  /**
   * 获取行记录编辑锁
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.rowId
   * @param {boolean} args.getRowUpdateTime
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowEditLock: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowEditLock', args, options);
  },
  /**
   * 取消行记录编辑锁
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.rowId
   * @param {boolean} args.getRowUpdateTime
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  cancelRowEditLock: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CancelRowEditLock', args, options);
  },
  /**
   * 根据工作流实例信息获取工作表信息
   * @param {Object} args 请求参数
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorkItem: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorkItem', args, options);
  },
  /**
   * 获取记录关联记录
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {string} args.controlId 控件id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {boolean} args.getWorksheet 是否获取工作表信息
   * @param {string} args.sortId
   * @param {boolean} args.isAsc
   * @param {string} args.shareId 分享ID
   * @param {string} args.keywords 关键词
   * @param {string} args.linkId 链接分享id
   * @param {string} args.viewId
   * @param {array} args.filterControls
   * @param {boolean} args.getRules
   * @param {} args.getType
   * @param {array} args.fastFilters 快递筛选
   * @param {string} args.instanceId
   * @param {string} args.workId
   * @param {string} args.appId
   * @param {string} args.discussId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowRelationRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowRelationRows', args, options);
  },
  /**
   * 添加行
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.receiveControls 该行所有的cell
   * @param {array} args.receiveRows 批量新增所有rows
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {} args.masterRecord
   * @param {string} args.pushUniqueId 推送ID
   * @param {string} args.verifyCode 验证码【根据配置来校验是否必填】
   * @param {integer} args.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param {string} args.draftRowId 草稿ID
   * @param {string} args.clientId 未登录用户临时登录凭据
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addWorksheetRow: function (args, options = {}) {
    return mdyAPI('Worksheet', 'AddWorksheetRow', args, options);
  },
  /**
   * 保存草稿箱记录
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.receiveControls 该行所有的cell
   * @param {array} args.receiveRows 批量新增所有rows
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {} args.masterRecord
   * @param {string} args.pushUniqueId 推送ID
   * @param {string} args.verifyCode 验证码【根据配置来校验是否必填】
   * @param {integer} args.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param {string} args.draftRowId 草稿ID
   * @param {string} args.clientId 未登录用户临时登录凭据
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveDraftRow: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveDraftRow', args, options);
  },
  /**
   * 批量添加行
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.receiveControls 该行所有的cell
   * @param {array} args.receiveRows 批量新增所有rows
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {} args.masterRecord
   * @param {string} args.pushUniqueId 推送ID
   * @param {string} args.verifyCode 验证码【根据配置来校验是否必填】
   * @param {integer} args.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param {string} args.draftRowId 草稿ID
   * @param {string} args.clientId 未登录用户临时登录凭据
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addWSRowsBatch: function (args, options = {}) {
    return mdyAPI('Worksheet', 'AddWSRowsBatch', args, options);
  },
  /**
   * 修改行
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {array} args.newOldControl 要修改的cell
   * @param {string} args.viewId 视图Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {string} args.pushUniqueId 推送ID
   * @param {integer} args.rowStatus 1：正常 21：草稿箱
   * @param {} args.updateType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetRow: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetRow', args, options);
  },
  /**
   * 验证字段唯一性
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.controlId 需要验证的控件id
   * @param {} args.controlType
   * @param {string} args.controlValue 新输入的值
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkFieldUnique: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CheckFieldUnique', args, options);
  },
  /**
   * 批量修改
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {} args.cells
   * @param {string} args.viewId 视图Id
   * @param {array} args.rowIds 行id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.isAll 是否全部
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快递筛选
   * @param {array} args.navGroupFilters 导航分组筛选
   * @param {array} args.filtersGroup
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {string} args.pushUniqueId 推送ID
   * @param {array} args.controls 批量编辑
   * @param {} args.updateType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetRows', args, options);
  },
  /**
   * 编辑记录关联记录
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {array} args.rowIds 行ids
   * @param {boolean} args.isAdd isAdd
   * @param {string} args.controlId 控件Id
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {} args.updateType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateRowRelationRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateRowRelationRows', args, options);
  },
  /**
   * 编辑
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.fromRowId 老的上级RowId
   * @param {string} args.toRowId 新的上级RowId
   * @param {array} args.rowIds 行ids
   * @param {string} args.controlId 关联控件ID
   * @param {string} args.viewId 视图Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  replaceRowRelationRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'ReplaceRowRelationRows', args, options);
  },
  /**
   * 刷新汇总控件
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {array} args.rowIds 行ids
   * @param {boolean} args.isAdd isAdd
   * @param {string} args.controlId 控件Id
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {} args.updateType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refreshSummary: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RefreshSummary', args, options);
  },
  /**
   * 批量刷新行记录
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {} args.cells
   * @param {string} args.viewId 视图Id
   * @param {array} args.rowIds 行id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.isAll 是否全部
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快递筛选
   * @param {array} args.navGroupFilters 导航分组筛选
   * @param {array} args.filtersGroup
   * @param {string} args.btnId 自定义按钮ID
   * @param {string} args.btnRemark 按钮备注
   * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
   * @param {string} args.btnRowId 点击按钮对应的行记录ID
   * @param {string} args.pushUniqueId 推送ID
   * @param {array} args.controls 批量编辑
   * @param {} args.updateType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  refreshWorksheetRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RefreshWorksheetRows', args, options);
  },
  /**
   * 删除行
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.rowIds 行id
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.isAll 是否全选
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快速筛选
   * @param {array} args.navGroupFilters 导航分组筛选
   * @param {array} args.filtersGroup
   * @param {boolean} args.thoroughDelete 彻底删除
   * @param {} args.deleteType
   * @param {string} args.pushUniqueId 推送ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteWorksheetRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteWorksheetRows', args, options);
  },
  /**
   * 恢复行
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.rowIds 行ids
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.restoreRelation 恢复关联
   * @param {string} args.copyRelationControlId
   * @param {boolean} args.isAll 是否全选
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快速筛选
   * @param {string} args.pushUniqueId 推送ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  restoreWorksheetRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RestoreWorksheetRows', args, options);
  },
  /**
   * 彻底删除
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.rowIds 行ids
   * @param {string} args.appId 应用Id
   * @param {boolean} args.isAll 是否全选
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快速筛选
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeWorksheetRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RemoveWorksheetRows', args, options);
  },
  /**
  * 过滤查找
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getFilterRows: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFilterRows', args, options);
  },
  /**
  * 工作表查询默认值获取
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
  * @param {string} args.id 工作表查询id
  * @param {boolean} args.getAllControls 是否返回所有控件返回值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getFilterRowsByQueryDefault: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFilterRowsByQueryDefault', args, options);
  },
  /**
  * 获取行记录总数
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getFilterRowsTotalNum: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFilterRowsTotalNum', args, options);
  },
  /**
   * 工作表最下方统计
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.filterControls 查询列
   * @param {array} args.columnRpts 列排序
   * @param {} args.searchType
   * @param {string} args.keyWords 关键词
   * @param {string} args.controlId
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {array} args.fastFilters
   * @param {array} args.navGroupFilters 导航分组筛选
   * @param {array} args.filtersGroup 筛选组件
   * @param {object} args.requestParams 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFilterRowsReport: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFilterRowsReport', args, options);
  },
  /**
   * 获取日志
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {integer} args.pageSize 页大小
   * @param {integer} args.pageIndex 页码
   * @param {string} args.rowId 行id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLogs: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetLogs', args, options);
  },
  /**
   * 获取工作表操作日志
   * @param {Object} args 请求参数
   * @param {integer} args.pageSize 分页大小
   * @param {integer} args.pageIndex 当前页
   * @param {integer} args.objectType 日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 记录id
   * @param {array} args.filterUniqueIds 根据唯一码筛选
   * @param {array} args.controlIds 筛选控件或属性ID
   * @param {array} args.opeartorIds 筛选操作人
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 结束时间
   * @param {string} args.lastMark 最后标记时间
   * @param {boolean} args.isGlobaLog 是否为全局日志获取记录日志
   * @param {integer} args.requestType 日志操作类型 1：手动 2：工作流 3：按钮
   * @param {string} args.archiveId 归档ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetOperationLogs: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetOperationLogs', args, options);
  },
  /**
   * 获取子表日志详情
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行记录id
   * @param {string} args.uniqueId 唯一id
   * @param {string} args.createTime 创建时间
   * @param {} args.log
   * @param {string} args.lastMark 最后标记时间
   * @param {integer} args.objectType 对象类型
   * @param {integer} args.requestType 请求类型
   * @param {integer} args.pageIndex 当前页
   * @param {integer} args.pageSize 页大小
   * @param {string} args.archiveId 归档ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getDetailTableLog: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetDetailTableLog', args, options);
  },
  /**
   * 批量获取工作表日志
   * @param {Object} args 请求参数
   * @param {integer} args.pageSize 分页大小
   * @param {integer} args.pageIndex 当前页
   * @param {integer} args.objectType 日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 记录id
   * @param {array} args.filterUniqueIds 根据唯一码筛选
   * @param {array} args.controlIds 筛选控件或属性ID
   * @param {array} args.opeartorIds 筛选操作人
   * @param {string} args.startDate 开始时间
   * @param {string} args.endDate 结束时间
   * @param {string} args.lastMark 最后标记时间
   * @param {boolean} args.isGlobaLog 是否为全局日志获取记录日志
   * @param {integer} args.requestType 日志操作类型 1：手动 2：工作流 3：按钮
   * @param {string} args.archiveId 归档ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  batchGetWorksheetOperationLogs: function (args, options = {}) {
    return mdyAPI('Worksheet', 'BatchGetWorksheetOperationLogs', args, options);
  },
  /**
   * 工作表记录分享范围修改
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.viewId 视图Id
   * @param {string} args.rowId 行id
   * @param {} args.shareRange
   * @param {} args.objectType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateWorksheetRowShareRange: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateWorksheetRowShareRange', args, options);
  },
  /**
   * 获取记录短链
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.rowIds 行ids
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowsShortUrl: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowsShortUrl', args, options);
  },
  /**
   * 复制行记录
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.rowIds 行ids
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.restoreRelation 恢复关联
   * @param {string} args.copyRelationControlId
   * @param {boolean} args.isAll 是否全选
   * @param {array} args.excludeRowIds 需要排除的rowIds
   * @param {array} args.filterControls 筛选条件
   * @param {string} args.keyWords 搜索关键字
   * @param {array} args.fastFilters 快速筛选
   * @param {string} args.pushUniqueId 推送ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyRow: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyRow', args, options);
  },
  /**
   * 获取分组导航
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.filterControls 查询列
   * @param {array} args.columnRpts 列排序
   * @param {} args.searchType
   * @param {string} args.keyWords 关键词
   * @param {string} args.controlId
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {array} args.fastFilters
   * @param {array} args.navGroupFilters 导航分组筛选
   * @param {array} args.filtersGroup 筛选组件
   * @param {object} args.requestParams 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getNavGroup: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetNavGroup', args, options);
  },
  /**
   * 获取工作表归档列表
   * @param {Object} args 请求参数
   * @param {integer} args.type 1：行记录日志
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetArchives: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetArchives', args, options);
  },
  /**
   * 保存筛选器
   * @param {Object} args 请求参数
   * @param {string} args.name 筛选器名称
   * @param {string} args.worksheetId 工作表id
   * @param {integer} args.type 视图类型 1：个人 2：公共
   * @param {array} args.items
   * @param {string} args.filterId 筛选条件编号
   * @param {string} args.appId 应用Id
   * @param {integer} args.module 1:工作表 2:统计
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveWorksheetFilter: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveWorksheetFilter', args, options);
  },
  /**
   * 获取可见筛选器
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.controlId 控件ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetFilters: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetFilters', args, options);
  },
  /**
   * 获取筛选器详情
   * @param {Object} args 请求参数
   * @param {string} args.filterId 筛选器Id
   * @param {array} args.items FilterSort
   * @param {string} args.projectId 网络Id
   * @param {string} args.worksheetId 工作表ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetFilterById: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetFilterById', args, options);
  },
  /**
   * 删除筛选器
   * @param {Object} args 请求参数
   * @param {string} args.filterId 筛选器Id
   * @param {string} args.appId 应用ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteWorksheetFilter: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteWorksheetFilter', args, options);
  },
  /**
   * 筛选器排序
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.filterIds 筛选器Id
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sortWorksheetFilters: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SortWorksheetFilters', args, options);
  },
  /**
   * 保存视图
   * @param {Object} args 请求参数
   * @param {string} args.name 视图名称
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.sortCid 排序字段Id
   * @param {integer} args.sortType 排序类型
   * @param {integer} args.rowHeight 行高 0：紧凑 1：中等 2：高 3：超高
   * @param {array} args.controls controls
   * @param {array} args.filters filters
   * @param {array} args.fastFilters fastfilters
   * @param {array} args.moreSort 排序
   * @param {array} args.navGroup 导航分组
   * @param {array} args.displayControls 显示字段
   * @param {array} args.showControls Web显示字段
   * @param {array} args.controlsSorts 字段排序
   * @param {array} args.layersName 层级名称
   * @param {boolean} args.customDisplay 是否配置自定义显示列
   * @param {string} args.viewId 视图id
   * @param {string} args.appId 应用Id
   * @param {boolean} args.unRead unRead
   * @param {integer} args.viewType 0:列表 1：看板 2：层级
   * @param {integer} args.childType 1：单表层级 2：多表层级
   * @param {string} args.viewControl 视图维度ID(分组ID)
   * @param {array} args.viewControls 多表层级视图控件
   * @param {string} args.coverCid 封面字段
   * @param {integer} args.coverType 0：填满 1：完整显示
   * @param {boolean} args.showControlName 显示控件名称
   * @param {object} args.advancedSetting 视图高级配置
   * @param {array} args.editAttrs 编辑属性
   * @param {array} args.editAdKeys 编辑AdvancedSetting属性keys
   * @param {string} args.pluginId 视图插件id
   * @param {string} args.pluginName 视图插件名称
   * @param {string} args.pluginIcon 视图插件图标
   * @param {string} args.pluginIconColor 插件插件图标颜色
   * @param {integer} args.pluginSource 插件来源
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveWorksheetView: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveWorksheetView', args, options);
  },
  /**
   * 获取可见视图
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.viewId
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetViews: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetViews', args, options);
  },
  /**
   * 获取视图详情
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.viewId
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetViewById: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetViewById', args, options);
  },
  /**
   * 删除视图
   * @param {Object} args 请求参数
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {integer} args.status 9：删除 999：彻底删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteWorksheetView: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteWorksheetView', args, options);
  },
  /**
   * 恢复视图
   * @param {Object} args 请求参数
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {integer} args.status 9：删除 999：彻底删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  restoreWorksheetView: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RestoreWorksheetView', args, options);
  },
  /**
   * 获取工作表API
   * @param {Object} args 请求参数
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyWorksheetView: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyWorksheetView', args, options);
  },
  /**
   * 视图排序
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.viewIds 视图Id
   * @param {string} args.appId 应用Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sortWorksheetViews: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SortWorksheetViews', args, options);
  },
  /**
   * 复制视图配置
   * @param {Object} args 请求参数
   * @param {string} args.viewId 视图Id
   * @param {array} args.copyKeys 用户选中的配置
   * @param {string} args.worksheetId 工作表Id
   * @param {array} args.targetViewIds 目标视图Id集合
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyWorksheetViewConfig: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyWorksheetViewConfig', args, options);
  },
  /**
   * 批量生成视图别名
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editGenerateViewDefaultAlias: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditGenerateViewDefaultAlias', args, options);
  },
  /**
   * 编辑视图别名
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 表id
   * @param {array} args.views 视图别名信息
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editViewAlias: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditViewAlias', args, options);
  },
  /**
   * 获取按钮列表
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {string} args.viewId 视图ID
   * @param {string} args.rowId 行记录ID
   * @param {string} args.worksheetId 工作表ID
   * @param {string} args.btnId
   * @param {integer} args.status 状态 1：正常 9：回收站
   * @param {array} args.btnIds 批量获取按钮的id
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetBtns: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetBtns', args, options);
  },
  /**
   * 验证按钮是否满足行记录
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {string} args.viewId 视图ID
   * @param {string} args.rowId 行记录ID
   * @param {string} args.worksheetId 工作表ID
   * @param {string} args.btnId
   * @param {integer} args.status 状态 1：正常 9：回收站
   * @param {array} args.btnIds 批量获取按钮的id
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkWorksheetRowBtn: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CheckWorksheetRowBtn', args, options);
  },
  /**
   * 批量验证行记录是否满足按钮条件
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {string} args.viewId 视图ID
   * @param {string} args.rowId 行记录ID
   * @param {string} args.worksheetId 工作表ID
   * @param {string} args.btnId
   * @param {integer} args.status 状态 1：正常 9：回收站
   * @param {array} args.btnIds 批量获取按钮的id
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkWorksheetRowsBtn: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CheckWorksheetRowsBtn', args, options);
  },
  /**
   * 获取按钮详情
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用ID
   * @param {string} args.viewId 视图ID
   * @param {string} args.rowId 行记录ID
   * @param {string} args.worksheetId 工作表ID
   * @param {string} args.btnId
   * @param {integer} args.status 状态 1：正常 9：回收站
   * @param {array} args.btnIds 批量获取按钮的id
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetBtnByID: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetBtnByID', args, options);
  },
  /**
   * 操作按钮
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用iD
   * @param {string} args.viewId 视图ID
   * @param {string} args.btnId 按钮ID
   * @param {string} args.worksheetId 工作表ID
   * @param {} args.optionType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  optionWorksheetBtn: function (args, options = {}) {
    return mdyAPI('Worksheet', 'OptionWorksheetBtn', args, options);
  },
  /**
   * 保存按钮
   * @param {Object} args 请求参数
   * @param {string} args.btnId
   * @param {string} args.name
   * @param {string} args.worksheetId
   * @param {integer} args.showType 1:一直 2：满足筛选条件
   * @param {array} args.filters 筛选条件
   * @param {array} args.displayViews 显示视图
   * @param {integer} args.clickType 1：立即执行 2：二次确认 3：填写
   * @param {string} args.confirmMsg 确认信息
   * @param {string} args.sureName 确认按钮
   * @param {string} args.cancelName 取消按钮
   * @param {integer} args.writeObject 对象 1：本记录 2：关联记录
   * @param {integer} args.writeType 类型 1：填写字段 2：新建关联记录
   * @param {string} args.relationControl 关联记录ID
   * @param {string} args.addRelationControlId 新建关联记录ID
   * @param {integer} args.workflowType 1:执行 2：不执行
   * @param {string} args.workflowId 工作流ID
   * @param {array} args.writeControls 填写控件 type - 1：只读 2：填写 3：必填
   * @param {string} args.appId 应用ID
   * @param {string} args.color 颜色
   * @param {string} args.icon 图标
   * @param {string} args.desc 描述
   * @param {integer} args.isAllView
   * @param {array} args.editAttrs 编辑属性
   * @param {boolean} args.verifyPwd
   * @param {boolean} args.enableConfirm
   * @param {object} args.advancedSetting
   * @param {boolean} args.isBatch
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveWorksheetBtn: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveWorksheetBtn', args, options);
  },
  /**
   * 复制按钮
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用iD
   * @param {string} args.viewId 视图ID
   * @param {string} args.btnId 按钮ID
   * @param {string} args.worksheetId 工作表ID
   * @param {} args.optionType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyWorksheetBtn: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyWorksheetBtn', args, options);
  },
  /**
   * 获取规则列表
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.ruleId
   * @param {string} args.instanceId 通过工作流时必传
   * @param {string} args.workId 通过工作流时必传
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getControlRules: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetControlRules', args, options);
  },
  /**
   * 保存规则
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.ruleId
   * @param {array} args.ruleIds
   * @param {string} args.name
   * @param {boolean} args.disabled
   * @param {array} args.filters
   * @param {array} args.ruleItems
   * @param {array} args.editAttrs
   * @param {integer} args.type 0:交互  1：验证 2：锁定
   * @param {integer} args.checkType 0：前端  1：前后端
   * @param {integer} args.hintType 0：输入和提交 1：仅提交
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveControlRule: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveControlRule', args, options);
  },
  /**
   *
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.ruleId
   * @param {array} args.ruleIds
   * @param {string} args.name
   * @param {boolean} args.disabled
   * @param {array} args.filters
   * @param {array} args.ruleItems
   * @param {array} args.editAttrs
   * @param {integer} args.type 0:交互  1：验证 2：锁定
   * @param {integer} args.checkType 0：前端  1：前后端
   * @param {integer} args.hintType 0：输入和提交 1：仅提交
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sortControlRules: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SortControlRules', args, options);
  },
  /**
   * 保存表控件
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveWorksheetControls: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveWorksheetControls', args, options);
  },
  /**
   * 添加表控件
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addWorksheetControls: function (args, options = {}) {
    return mdyAPI('Worksheet', 'AddWorksheetControls', args, options);
  },
  /**
   * 获取表控件
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetControls: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetControls', args, options);
  },
  /**
   * 获取工作表字段智能建议
   * @param {Object} args 请求参数
   * @param {string} args.prompt 提示词
   * @param {} args.lang
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAiFieldRecommendation: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetAiFieldRecommendation', args, options);
  },
  /**
   * 批量获取表控件
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetsControls: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetsControls', args, options);
  },
  /**
   * 编辑控件别名
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editControlsAlias: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditControlsAlias', args, options);
  },
  /**
   * 生成控件默认别名
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.worksheetId 工作表id
   * @param {integer} args.version 版本号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editGenerateControlsDefaultAlias: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditGenerateControlsDefaultAlias', args, options);
  },
  /**
   * 保存表控件
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editWorksheetControls: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditWorksheetControls', args, options);
  },
  /**
   * 重置自动编号
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  resetControlIncrease: function (args, options = {}) {
    return mdyAPI('Worksheet', 'ResetControlIncrease', args, options);
  },
  /**
   * 删除autoid
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.relationWorksheetId 关联表的id
   * @param {boolean} args.getTemplate 是否获取Template
   * @param {boolean} args.getViews 是否获取Views
   * @param {string} args.appId 应用Id
   * @param {boolean} args.handleDefault 处理默认值
   * @param {} args.getControlType
   * @param {array} args.worksheetIds 批量工作表id
   * @param {boolean} args.handControlSource 是否处理关联的原始类型
   * @param {boolean} args.getRules 是否需要验证规则
   * @param {boolean} args.getSwitchPermit 是否获取功能开关
   * @param {boolean} args.getRelationSearch 获取查下记录控件
   * @param {integer} args.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteWorksheetAutoID: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteWorksheetAutoID', args, options);
  },
  /**
   * 编辑控件状态
   * @param {Object} args 请求参数
   * @param {string} args.sourceId 兼容老数据
   * @param {string} args.worksheetId WorksheetId
   * @param {integer} args.version 版本号
   * @param {array} args.controls 控件集合
   * @param {string} args.appId 应用ID
   * @param {string} args.controlId 控件ID
   * @param {array} args.controlIds 控件IDs
   * @param {integer} args.status 状态 1:恢复 999：彻底删除
   * @param {integer} args.initNum 初始化编号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editControlsStatus: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditControlsStatus', args, options);
  },
  /**
   * 获取字段和表引用关系
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.controlId 字段ID
   * @param {integer} args.type 类型 1：字段引用关系 2：工作表引用关系
   * @param {integer} args.module 模块 1：工作表 2：工作流
   * @param {integer} args.subModule 子模块 0：表示获取全部 101：字段 102：视图 103：业务规则 201：流程节点
   * @param {boolean} args.isRefresh 刷新引用关系
   * @param {string} args.appId 空表示所有引用，默认传当前应用ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetReferences: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetReferences', args, options);
  },
  /**
   * 获取系统打印列表
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.viewId
   * @param {array} args.rowIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPrintList: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetPrintList', args, options);
  },
  /**
   * 获取 表单组件
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFormComponent: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFormComponent', args, options);
  },
  /**
   * 获取单个打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.projectId
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.sortId
   * @param {boolean} args.isAsc
   * @param {string} args.keywords 关键词
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 通过工作流审批打印时必传
   * @param {string} args.workId 通过工作流审批打印时必传
   * @param {array} args.filterControls
   * @param {array} args.fastFilters 快递筛选
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPrint: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetPrint', args, options);
  },
  /**
   * 获取单个打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.projectId
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.sortId
   * @param {boolean} args.isAsc
   * @param {string} args.keywords 关键词
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 通过工作流审批打印时必传
   * @param {string} args.workId 通过工作流审批打印时必传
   * @param {array} args.filterControls
   * @param {array} args.fastFilters 快递筛选
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCodePrint: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetCodePrint', args, options);
  },
  /**
   * 新建生成打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.projectId
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {string} args.sortId
   * @param {boolean} args.isAsc
   * @param {string} args.keywords 关键词
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 通过工作流审批打印时必传
   * @param {string} args.workId 通过工作流审批打印时必传
   * @param {array} args.filterControls
   * @param {array} args.fastFilters 快递筛选
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPrintTemplate: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetPrintTemplate', args, options);
  },
  /**
   * 保存系统打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id 模板id (空=新建 非空=修改)
   * @param {} args.data
   * @param {array} args.saveControls 勾选保存的控件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrint: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrint', args, options);
  },
  /**
   * 编辑打印模板文件属性
   * @param {Object} args 请求参数
   * @param {string} args.id 模板id
   * @param {string} args.name 模板名称
   * @param {} args.allowDownloadPermission
   * @param {boolean} args.allowEditAfterPrint 允许编辑后打印
   * @param {array} args.advanceSettings 额外配置数据
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrintFile: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrintFile', args, options);
  },
  /**
   * 保存记录二维码打印模板配置
   * @param {Object} args 请求参数
   * @param {string} args.id 模板id
   * @param {string} args.projectId 组织id
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.name 模板名称
   * @param {integer} args.type 3-二维码打印 4-条码打印
   * @param {integer} args.range 使用范围
   * @param {array} args.views 视图id
   * @param {} args.config
   * @param {array} args.advanceSettings 额外配置
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveRecordCodePrintConfig: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveRecordCodePrintConfig', args, options);
  },
  /**
   * 修改打印模板名称
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.name
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrintName: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrintName', args, options);
  },
  /**
   * 修改打印模板范围
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.worksheetId
   * @param {} args.range
   * @param {array} args.viewsIds 视图Ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrintRange: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrintRange', args, options);
  },
  /**
   * 修改打印模板筛选条件
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {array} args.filters 筛选条件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrintFilter: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrintFilter', args, options);
  },
  /**
   * 修改打印模板排序
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.worksheetId
   * @param {array} args.sortItems
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPrintTemplateSort: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditPrintTemplateSort', args, options);
  },
  /**
   * 删除打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deletePrint: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeletePrint', args, options);
  },
  /**
   * 复制打印模板
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyPrint: function (args, options = {}) {
    return mdyAPI('Worksheet', 'CopyPrint', args, options);
  },
  /**
   * 获取 工作表 索引字段配置
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getRowIndexes: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetRowIndexes', args, options);
  },
  /**
   * 新增 工作表行内容表索引
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.customeIndexName 自定义索引名称
   * @param {array} args.indexFields 索引字段
   * @param {boolean} args.uniqueIndex 是否 唯一索引
   * @param {boolean} args.wildcardIndex 是否 通配符文本索引
   * @param {boolean} args.sparseIndex 是否 稀疏索引
   * @param {boolean} args.backgroundIndex 是否 后台索引
   * @param {string} args.appId AppId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addRowIndex: function (args, options = {}) {
    return mdyAPI('Worksheet', 'AddRowIndex', args, options);
  },
  /**
  * 更新 工作表行内容表索引
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.customeIndexName 自定义索引名称
  * @param {array} args.indexFields 索引字段
  * @param {boolean} args.uniqueIndex 是否 唯一索引
  * @param {boolean} args.wildcardIndex 是否 通配符文本索引
  * @param {boolean} args.sparseIndex 是否 稀疏索引
  * @param {boolean} args.backgroundIndex 是否 后台索引
  * @param {string} args.indexConfigId 索引配置Id
（系统级索引可为空）
  * @param {string} args.appId AppId
  * @param {boolean} args.isSystemIndex 是否 系统级索引
  * @param {string} args.systemIndexName 系统级索引名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  updateRowIndex: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateRowIndex', args, options);
  },
  /**
   * 更新 工作表行内容表索引名称
   * @param {Object} args 请求参数
   * @param {string} args.appId AppId
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.indexConfigId 索引配置Id
   * @param {string} args.customeIndexName 自定义索引名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateRowIndexCustomeIndexName: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateRowIndexCustomeIndexName', args, options);
  },
  /**
   * 移除 工作表行内容表索引
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用Id
   * @param {string} args.worksheetId 工作表Id
   * @param {string} args.indexConfigId 索引配置Id
   * @param {boolean} args.isSystemIndex 是否 系统级索引
   * @param {string} args.systemIndexName 系统级索引名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeRowIndex: function (args, options = {}) {
    return mdyAPI('Worksheet', 'RemoveRowIndex', args, options);
  },
  /**
   * 获取链接行记录
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.id
   * @param {string} args.password
   * @param {} args.langType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLinkDetail: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetLinkDetail', args, options);
  },
  /**
   * 获取工作表创建记录表单提交设置信息
   * @param {Object} args 请求参数
   * @param {string} args.workSheetId 工作表Id
   * @param {string} args.appId 应用id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFormSubmissionSettings: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFormSubmissionSettings', args, options);
  },
  /**
   * 更新工作表创建记录表单设置信息
   * @param {Object} args 请求参数
   * @param {string} args.workSheetId 工作表id
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 组织id
   * @param {object} args.advancedSetting 配置项数据
   * @param {array} args.editAdKeys 编辑AdvancedSetting属性keys
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editWorksheetSetting: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditWorksheetSetting', args, options);
  },
  /**
   * 获取功能系统开关配置
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSwitch: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetSwitch', args, options);
  },
  /**
   * 更新系统配置开关（单个）
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {boolean} args.state 开关
   * @param {} args.type
   * @param {} args.roleType
   * @param {array} args.viewIds
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSwitch: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditSwitch', args, options);
  },
  /**
   * 更新系统配置开关（批量）
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {array} args.switchList
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  batchEditSwitch: function (args, options = {}) {
    return mdyAPI('Worksheet', 'BatchEditSwitch', args, options);
  },
  /**
   * 获取功能系统开关（包含管理员判断）
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用管理员
   * @param {string} args.worksheetId 工作表id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSwitchPermit: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetSwitchPermit', args, options);
  },
  /**
   * 获取工作表信息
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.appId 应用id
   * @param {integer} args.version 版本  1=v1  2=v2
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetApiInfo: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetApiInfo', args, options);
  },
  /**
   * 获取应用下选项集
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCollectionsByAppId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetCollectionsByAppId', args, options);
  },
  /**
   * 保存选项集
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveOptionsCollection: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveOptionsCollection', args, options);
  },
  /**
   * 更新选项集所属应用
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateOptionsCollectionAppId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'UpdateOptionsCollectionAppId', args, options);
  },
  /**
   * 删除选项集
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteOptionsCollection: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteOptionsCollection', args, options);
  },
  /**
   * 获取选项集详细数据
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCollectionByCollectId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetCollectionByCollectId', args, options);
  },
  /**
   * 批量获取选项集
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCollectionsByCollectIds: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetCollectionsByCollectIds', args, options);
  },
  /**
   * 获取选项集引用的控件列表
   * @param {Object} args 请求参数
   * @param {string} args.collectionId
   * @param {array} args.collectionIds
   * @param {string} args.appId
   * @param {string} args.worksheetId
   * @param {array} args.options
   * @param {string} args.name
   * @param {boolean} args.colorful
   * @param {boolean} args.enableScore
   * @param {integer} args.status 0或者1：正常 9：停用,999：删除
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getQuoteControlsById: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetQuoteControlsById', args, options);
  },
  /**
   * 获取添加选项接集接口信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addOrUpdateOptionSetApiInfo: function (args, options = {}) {
    return mdyAPI('Worksheet', 'AddOrUpdateOptionSetApiInfo', args, options);
  },
  /**
   * 获取选项接集列表接口信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  optionSetListApiInfo: function (args, options = {}) {
    return mdyAPI('Worksheet', 'OptionSetListApiInfo', args, options);
  },
  /**
  * 工作表OCR识别
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.controlId ocr控件id
  * @param {array} args.data ocr映射url数组(不管单个还是多个批量,都是数组)
remark:待识别文件url ，图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  ocr: function (args, options = {}) {
    return mdyAPI('Worksheet', 'Ocr', args, options);
  },
  /**
   * get单个工作表查询
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getQuery: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetQuery', args, options);
  },
  /**
   * worksheetId 批量获取工作表查询
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getQueryBySheetId: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetQueryBySheetId', args, options);
  },
  /**
   * 保存工作表查询
   * @param {Object} args 请求参数
   * @param {string} args.id id 新建为空，修改传原值
   * @param {string} args.worksheetId 本表id
   * @param {string} args.controlId 默认值控件id
   * @param {string} args.sourceId 来源id （这里值得工作表id）
   * @param {integer} args.sourceType 1 = 本表，2 = 他表
   * @param {array} args.items 筛选条件
   * @param {array} args.configs 映射字段
   * @param {integer} args.moreType 0 = 获取第一条时，按配置来，1= 不赋值
   * @param {array} args.moreSort 排序
   * @param {integer} args.queryCount 查询条数
   * @param {integer} args.resultType 结果类型 0=查询到记录，1=仅查询到一条记录，2=查询到多条记录，3=未查询到记录
   * @param {integer} args.eventType 0 = 常规字段默认值，1 = 表单事件
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveQuery: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveQuery', args, options);
  },
  /**
   * 保存筛选组件
   * @param {Object} args 请求参数
   * @param {string} args.filtersGroupId 筛选组件ID
   * @param {string} args.name 名称
   * @param {boolean} args.enableBtn 开启搜索按钮
   * @param {array} args.filters filters
   * @param {object} args.advancedSetting 视图高级配置
   * @param {string} args.appId 应用ID
   * @param {array} args.filtersGroupIds 批量获取和删除使用
   * @param {string} args.pageId 自定义页面ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveFiltersGroup: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveFiltersGroup', args, options);
  },
  /**
   * 获取筛选组件
   * @param {Object} args 请求参数
   * @param {string} args.filtersGroupId 筛选组件ID
   * @param {string} args.name 名称
   * @param {boolean} args.enableBtn 开启搜索按钮
   * @param {array} args.filters filters
   * @param {object} args.advancedSetting 视图高级配置
   * @param {string} args.appId 应用ID
   * @param {array} args.filtersGroupIds 批量获取和删除使用
   * @param {string} args.pageId 自定义页面ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFiltersGroupByIds: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetFiltersGroupByIds', args, options);
  },
  /**
   * 删除筛选组件
   * @param {Object} args 请求参数
   * @param {string} args.filtersGroupId 筛选组件ID
   * @param {string} args.name 名称
   * @param {boolean} args.enableBtn 开启搜索按钮
   * @param {array} args.filters filters
   * @param {object} args.advancedSetting 视图高级配置
   * @param {string} args.appId 应用ID
   * @param {array} args.filtersGroupIds 批量获取和删除使用
   * @param {string} args.pageId 自定义页面ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteFiltersGroupByIds: function (args, options = {}) {
    return mdyAPI('Worksheet', 'DeleteFiltersGroupByIds', args, options);
  },
  /**
   * 执行api查询
   * @param {Object} args 请求参数
   * @param {object} args.data 执行api查询数据
   * @param {string} args.projectId 组织id
   * @param {string} args.workSheetId 工作表id
   * @param {string} args.controlId 控件id
   * @param {string} args.apiTemplateId api模板id
   * @param {string} args.apkId 应用id
   * @param {string} args.formId 公开表单id
   * @param {string} args.apiEventId 动作事件id（不传默认识别为api查询字段）
   * @param {string} args.authId 授权账户Id
   * @param {integer} args.actionType 事件执行类型 调用api 8 调用封装业务流程 13
   * @param {string} args.pushUniqueId 推送Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  excuteApiQuery: function (args, options = {}) {
    return mdyAPI('Worksheet', 'ExcuteApiQuery', args, options);
  },
  /**
   * 获取api模板消息信息
   * @param {Object} args 请求参数
   * @param {string} args.apiTemplateId api模板id
   * @param {integer} args.type 是否为请求参数模板 1-请求模板 2-响应模板 不传-请求响应
   * @param {integer} args.actionType 事件执行类型 调用api 8 调用封装业务流程 13
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getApiControlDetail: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetApiControlDetail', args, options);
  },
  /**
   * 更新附件排序
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 表id
   * @param {string} args.rowId
   * @param {string} args.controlId 附件控件id
   * @param {string} args.viewId
   * @param {array} args.fileIds 附件ids（排好序的）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sortAttachment: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SortAttachment', args, options);
  },
  /**
   * 更新记录附件名
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId 工作表id
   * @param {string} args.rowId 行id
   * @param {} args.getType
   * @param {string} args.viewId 视图Id
   * @param {string} args.appId 应用Id
   * @param {string} args.instanceId 流程实例id
   * @param {string} args.workId 运行节点id
   * @param {boolean} args.getTemplate 是否获取模板
   * @param {string} args.shareId 分享页获取关联记录iD
   * @param {boolean} args.checkView 是否验证视图
   * @param {string} args.relationWorksheetId 关联控件ID
   * @param {string} args.discussId 讨论ID
   * @param {integer} args.langType //语言类型
   * @param {string} args.fileId
   * @param {string} args.fileName
   * @param {string} args.controlId 附件的控件id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAttachmentName: function (args, options = {}) {
    return mdyAPI('Worksheet', 'EditAttachmentName', args, options);
  },
  /**
   * 获取导出excel配置
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.viewId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getExportConfig: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetExportConfig', args, options);
  },
  /**
   * 保存导出配置
   * @param {Object} args 请求参数
   * @param {string} args.worksheetId
   * @param {string} args.viewId
   * @param {array} args.exportExtIds 导出特殊列配置
   * @param {array} args.controlIds 需要导出的控件ids
   * @param {} args.type
   * @param {} args.exportFieldType
   * @param {boolean} args.getColumnRpt 是否导出列统计
   * @param {boolean} args.edited 是否允许修改
   * @param {array} args.sortRelationCids 强制排序导出的关联控件id集合
   * @param {boolean} args.isNumber 控件是否以数值格式导出
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  saveExportConfig: function (args, options = {}) {
    return mdyAPI('Worksheet', 'SaveExportConfig', args, options);
  },
  /**
   * 获取工作表币种类型
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetCurrencyInfos: function (args, options = {}) {
    return mdyAPI('Worksheet', 'GetWorksheetCurrencyInfos', args, options);
  },
};
