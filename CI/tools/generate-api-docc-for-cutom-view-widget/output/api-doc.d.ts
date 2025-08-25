export const apis: {

  /**
   * 工作表
   */
  worksheet: {

  /**
   * 获取视图权限
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   */
  getViewPermission: (params: {
    worksheetId: string;
    viewId: string;
    appId: string;
  }) => any


  /**
   * 获取应用角色用户扩展属性
   * @param params 参数
   * @param params.appId AppId
   * @param params.customLink 客户自定义登录链接参数值
   */
  getAppExtendAttr: (params: {
    appId: string;
    customLink: string;
  }) => any


  /**
   * 获取工作表的扩展属性选项控件信息
   * @param params 参数
   * @param params.worksheetId 工作表Id
   * @param params.isPortal 
   */
  getExtendAttrOptionalControl: (params: {
    worksheetId: string;
    isPortal: boolean;
  }) => any


  /**
   * 保存应用角色用户扩展属性
   * @param params 参数
   * @param params.appId 应用
   * @param params.worksheetId 工作表Id
   * @param params.userControlId 用户控件
   * @param params.extendAttrs 扩展字段属性
   * @param params.extendAndAttrs 扩展且字段属性
   * @param params.status 状态【9：关闭 1：正常】
   */
  saveAppExtendAttr: (params: {
    appId: string;
    worksheetId: string;
    userControlId: string;
    extendAttrs: Array;
    extendAndAttrs: Array;
    status: integer;
  }) => any


  /**
   * 复制表格
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.name 名称
   * @param params.projectId 网络id
   * @param params.isCopyBtnName 是否复制按钮名称
   * @param params.isCopyDesc 是否复制描述
   * @param params.isCopyAdmin 是否复制管理员
   * @param params.isCopyRows 是否复制行数据
   * @param params.appId 应用id
   * @param params.appSectionId 分组id
   * @param params.relationControlIds 复制的关联控件ID
   */
  copyWorksheet: (params: {
    worksheetId: string;
    name: string;
    projectId: string;
    isCopyBtnName: boolean;
    isCopyDesc: boolean;
    isCopyAdmin: boolean;
    isCopyRows: boolean;
    appId: string;
    appSectionId: string;
    relationControlIds: Array;
  }) => any


  /**
   * 修改表格行记录名
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.entityName 记录名
   * @param params.appID 应用Id
   */
  updateEntityName: (params: {
    worksheetId: string;
    entityName: string;
    appID: string;
  }) => any


  /**
   * 修改工作表开发者备注
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.developerNotes 记录名
   */
  editDeveloperNotes: (params: {
    worksheetId: string;
    developerNotes: string;
  }) => any


  /**
   * 更新 工作表别名
   * @param params 参数
   * @param params.appId AppId
   * @param params.worksheetId 工作表Id
   * @param params.alias 别名
   */
  updateWorksheetAlias: (params: {
    appId: string;
    worksheetId: string;
    alias: string;
  }) => any


  /**
   * 修改表格描述
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.dec 描述
   * @param params.resume 
   */
  updateWorksheetDec: (params: {
    worksheetId: string;
    dec: string;
    resume: string;
  }) => any


  /**
   * 修改表格视图分享范围
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.rowId 行Id
   * @param params.worksheetId 工作表id
   * @param params.viewId 视图Id
   */
  updateWorksheetShareRange: (params: {
    appId: string;
    rowId: string;
    worksheetId: string;
    viewId: string;
  }) => any


  /**
   * 工作表详情
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   */
  getWorksheetInfo: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
  }) => any


  /**
   * 获取工作表基本信息
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   */
  getWorksheetBaseInfo: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
  }) => any


  /**
   * 审批、填写获取子表信息及控件权限
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   * @param params.controlId 子表的控件id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   * @param params.linkId 工作流填写链接id
   */
  getWorksheetInfoByWorkItem: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
    controlId: string;
    instanceId: string;
    workId: string;
    linkId: string;
  }) => any


  /**
   * 获取工作表分享链接
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行Id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.password 密码code
   * @param params.validTime 有效时间
   * @param params.pageTitle 页面标题
   * @param params.isEdit 是否为编辑,获取url时不传，编辑时传true
   */
  getWorksheetShareUrl: (params: {
    worksheetId: string;
    rowId: string;
    viewId: string;
    appId: string;
    password: string;
    validTime: string;
    pageTitle: string;
    isEdit: boolean;
  }) => any


  /**
   * 根据shareid得到worksheetid
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.shareId 对外分享标识
   * @param params.password 密码
   * @param params.printId 打印模板id
   */
  getShareInfoByShareId: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    shareId: string;
    password: string;
    printId: string;
  }) => any


  /**
   * 获取工作表校准间隔时间
   * @param params 参数

   */
  getRefreshRowsMinute: (params: {

  }) => any


  /**
   * 行详情
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   * @param params.getTemplate 是否获取模板
   * @param params.shareId 分享页获取关联记录iD
   * @param params.checkView 是否验证视图
   * @param params.relationWorksheetId 关联控件ID
   * @param params.discussId 讨论ID
   */
  getRowByID: (params: {
    worksheetId: string;
    rowId: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    getTemplate: boolean;
    shareId: string;
    checkView: boolean;
    relationWorksheetId: string;
    discussId: string;
  }) => any


  /**
   * 获取 附件详情
   * @param params 参数
   * @param params.attachmentShareId 附件分享Id
   */
  getAttachmentDetail: (params: {
    attachmentShareId: string;
  }) => any


  /**
   * 获取 附件分享Id
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.viewId 视图Id
   * @param params.worksheetId 工作表Id
   * @param params.rowId 行记录Id
   * @param params.controlId 控件Id
   * @param params.fileId 附件Id
   * @param params.instanceId 实例Id
   * @param params.workId 工作Id
   */
  getAttachmentShareId: (params: {
    appId: string;
    viewId: string;
    worksheetId: string;
    rowId: string;
    controlId: string;
    fileId: string;
    instanceId: string;
    workId: string;
  }) => any


  /**
   * 获取记录详情
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   * @param params.getTemplate 是否获取模板
   * @param params.shareId 分享页获取关联记录iD
   * @param params.checkView 是否验证视图
   * @param params.relationWorksheetId 关联控件ID
   * @param params.discussId 讨论ID
   */
  getRowDetail: (params: {
    worksheetId: string;
    rowId: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    getTemplate: boolean;
    shareId: string;
    checkView: boolean;
    relationWorksheetId: string;
    discussId: string;
  }) => any


  /**
   * 校验行记录编辑锁
   * @param params 参数
   * @param params.worksheetId 
   * @param params.rowId 
   * @param params.getRowUpdateTime 
   */
  checkRowEditLock: (params: {
    worksheetId: string;
    rowId: string;
    getRowUpdateTime: boolean;
  }) => any


  /**
   * 获取行记录编辑锁
   * @param params 参数
   * @param params.worksheetId 
   * @param params.rowId 
   * @param params.getRowUpdateTime 
   */
  getRowEditLock: (params: {
    worksheetId: string;
    rowId: string;
    getRowUpdateTime: boolean;
  }) => any


  /**
   * 取消行记录编辑锁
   * @param params 参数
   * @param params.worksheetId 
   * @param params.rowId 
   * @param params.getRowUpdateTime 
   */
  cancelRowEditLock: (params: {
    worksheetId: string;
    rowId: string;
    getRowUpdateTime: boolean;
  }) => any


  /**
   * 根据工作流实例信息获取工作表信息
   * @param params 参数
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   */
  getWorkItem: (params: {
    instanceId: string;
    workId: string;
  }) => any


  /**
   * 获取记录关联记录
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.controlId 控件id
   * @param params.pageIndex 页码
   * @param params.pageSize 页大小
   * @param params.getWorksheet 是否获取工作表信息
   * @param params.sortId 
   * @param params.isAsc 
   * @param params.shareId 分享ID
   * @param params.keywords 关键词
   * @param params.linkId 链接分享id
   * @param params.viewId 
   * @param params.filterControls 
   * @param params.getRules 
   * @param params.fastFilters 快递筛选
   * @param params.instanceId 
   * @param params.workId 
   * @param params.appId 
   * @param params.discussId 
   */
  getRowRelationRows: (params: {
    worksheetId: string;
    rowId: string;
    controlId: string;
    pageIndex: integer;
    pageSize: integer;
    getWorksheet: boolean;
    sortId: string;
    isAsc: boolean;
    shareId: string;
    keywords: string;
    linkId: string;
    viewId: string;
    filterControls: Array;
    getRules: boolean;
    fastFilters: Array;
    instanceId: string;
    workId: string;
    appId: string;
    discussId: string;
  }) => any


  /**
   * 添加行
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.worksheetId 工作表id
   * @param params.receiveControls 该行所有的cell
   * @param params.receiveRows 批量新增所有rows
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.verifyCode 验证码【根据配置来校验是否必填】
   * @param params.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param params.draftRowId 草稿ID
   * @param params.clientId 未登录用户临时登录凭据
   */
  addWorksheetRow: (params: {
    ticket: string;
    randStr: string;
    worksheetId: string;
    receiveControls: Array;
    receiveRows: Array;
    viewId: string;
    appId: string;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    verifyCode: string;
    rowStatus: integer;
    draftRowId: string;
    clientId: string;
  }) => any


  /**
   * 保存草稿箱记录
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.worksheetId 工作表id
   * @param params.receiveControls 该行所有的cell
   * @param params.receiveRows 批量新增所有rows
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.verifyCode 验证码【根据配置来校验是否必填】
   * @param params.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param params.draftRowId 草稿ID
   * @param params.clientId 未登录用户临时登录凭据
   */
  saveDraftRow: (params: {
    ticket: string;
    randStr: string;
    worksheetId: string;
    receiveControls: Array;
    receiveRows: Array;
    viewId: string;
    appId: string;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    verifyCode: string;
    rowStatus: integer;
    draftRowId: string;
    clientId: string;
  }) => any


  /**
   * 批量添加行
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.worksheetId 工作表id
   * @param params.receiveControls 该行所有的cell
   * @param params.receiveRows 批量新增所有rows
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.verifyCode 验证码【根据配置来校验是否必填】
   * @param params.rowStatus 1：正常 21：草稿箱 22：提交草稿箱
   * @param params.draftRowId 草稿ID
   * @param params.clientId 未登录用户临时登录凭据
   */
  addWSRowsBatch: (params: {
    ticket: string;
    randStr: string;
    worksheetId: string;
    receiveControls: Array;
    receiveRows: Array;
    viewId: string;
    appId: string;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    verifyCode: string;
    rowStatus: integer;
    draftRowId: string;
    clientId: string;
  }) => any


  /**
   * 修改行
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.newOldControl 要修改的cell
   * @param params.viewId 视图Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.rowStatus 1：正常 21：草稿箱
   */
  updateWorksheetRow: (params: {
    worksheetId: string;
    rowId: string;
    newOldControl: Array;
    viewId: string;
    instanceId: string;
    workId: string;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    rowStatus: integer;
  }) => any


  /**
   * 验证字段唯一性
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.controlId 需要验证的控件id
   * @param params.controlValue 新输入的值
   */
  checkFieldUnique: (params: {
    worksheetId: string;
    controlId: string;
    controlValue: string;
  }) => any


  /**
   * 批量修改
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewId 视图Id
   * @param params.rowIds 行id
   * @param params.appId 应用Id
   * @param params.isAll 是否全部
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快递筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.controls 批量编辑
   */
  updateWorksheetRows: (params: {
    worksheetId: string;
    viewId: string;
    rowIds: Array;
    appId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    controls: Array;
  }) => any


  /**
   * 编辑记录关联记录
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.rowIds 行ids
   * @param params.isAdd isAdd
   * @param params.controlId 控件Id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   */
  updateRowRelationRows: (params: {
    worksheetId: string;
    rowId: string;
    rowIds: Array;
    isAdd: boolean;
    controlId: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
  }) => any


  /**
   * 编辑
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.fromRowId 老的上级RowId
   * @param params.toRowId 新的上级RowId
   * @param params.rowIds 行ids
   * @param params.controlId 关联控件ID
   * @param params.viewId 视图Id
   */
  replaceRowRelationRows: (params: {
    worksheetId: string;
    fromRowId: string;
    toRowId: string;
    rowIds: Array;
    controlId: string;
    viewId: string;
  }) => any


  /**
   * 刷新汇总控件
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.rowIds 行ids
   * @param params.isAdd isAdd
   * @param params.controlId 控件Id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   */
  refreshSummary: (params: {
    worksheetId: string;
    rowId: string;
    rowIds: Array;
    isAdd: boolean;
    controlId: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
  }) => any


  /**
   * 批量刷新行记录
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewId 视图Id
   * @param params.rowIds 行id
   * @param params.appId 应用Id
   * @param params.isAll 是否全部
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快递筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 
   * @param params.btnId 自定义按钮ID
   * @param params.btnRemark 按钮备注
   * @param params.btnWorksheetId 点击按钮对应的工作表ID
   * @param params.btnRowId 点击按钮对应的行记录ID
   * @param params.pushUniqueId 推送ID
   * @param params.controls 批量编辑
   */
  refreshWorksheetRows: (params: {
    worksheetId: string;
    viewId: string;
    rowIds: Array;
    appId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    btnId: string;
    btnRemark: string;
    btnWorksheetId: string;
    btnRowId: string;
    pushUniqueId: string;
    controls: Array;
  }) => any


  /**
   * 删除行
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowIds 行id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.isAll 是否全选
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快速筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 
   * @param params.thoroughDelete 彻底删除
   * @param params.pushUniqueId 推送ID
   */
  deleteWorksheetRows: (params: {
    worksheetId: string;
    rowIds: Array;
    viewId: string;
    appId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    thoroughDelete: boolean;
    pushUniqueId: string;
  }) => any


  /**
   * 恢复行
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowIds 行ids
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.restoreRelation 恢复关联
   * @param params.copyRelationControlId 
   * @param params.isAll 是否全选
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快速筛选
   * @param params.pushUniqueId 推送ID
   */
  restoreWorksheetRows: (params: {
    worksheetId: string;
    rowIds: Array;
    viewId: string;
    appId: string;
    restoreRelation: boolean;
    copyRelationControlId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
    pushUniqueId: string;
  }) => any


  /**
   * 彻底删除
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowIds 行ids
   * @param params.appId 应用Id
   * @param params.isAll 是否全选
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快速筛选
   */
  removeWorksheetRows: (params: {
    worksheetId: string;
    rowIds: Array;
    appId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
  }) => any


  /**
   * 过滤查找
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.worksheetId 工作表id
   * @param params.filterControls 查询列
   * @param params.fastFilters 快速筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 筛选组件筛选
   * @param params.sortControls 排序列
   * @param params.keyWords 关键词
   * @param params.pageSize 页大小
   * @param params.pageIndex 页码
   * @param params.isUnRead 是否已读
   * @param params.isGetWorksheet 是否查询工作表的详情
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.relationWorksheetId relationWorksheetId
   * @param params.relationViewId RelationViewId
   * @param params.rowId 行id
   * @param params.controlId 控件Id
   * @param params.kanbanKey 全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,
   * @param params.layer 层级视图加载层数
   * @param params.beginTime 开始时间 日历视图
   * @param params.endTime 结束时间 日历视图
   * @param params.kanbanSize 页大小
   * @param params.kanbanIndex 页码
   * @param params.formId 公开表单ID
   * @param params.linkId 填写链接id
   * @param params.reportId 统计图ID
   * @param params.notGetTotal 不获取总记录数
   * @param params.requestParams 请求参数
   */
  getFilterRows: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    worksheetId: string;
    filterControls: Array;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    sortControls: Array;
    keyWords: string;
    pageSize: integer;
    pageIndex: integer;
    isUnRead: boolean;
    isGetWorksheet: boolean;
    viewId: string;
    appId: string;
    relationWorksheetId: string;
    relationViewId: string;
    rowId: string;
    controlId: string;
    kanbanKey: string;
    layer: integer;
    beginTime: string;
    endTime: string;
    kanbanSize: integer;
    kanbanIndex: integer;
    formId: string;
    linkId: string;
    reportId: string;
    notGetTotal: boolean;
    requestParams: object;
  }) => any


  /**
   * 工作表查询默认值获取
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.worksheetId 工作表id
   * @param params.filterControls 查询列
   * @param params.fastFilters 快速筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 筛选组件筛选
   * @param params.sortControls 排序列
   * @param params.keyWords 关键词
   * @param params.pageSize 页大小
   * @param params.pageIndex 页码
   * @param params.isUnRead 是否已读
   * @param params.isGetWorksheet 是否查询工作表的详情
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.relationWorksheetId relationWorksheetId
   * @param params.relationViewId RelationViewId
   * @param params.rowId 行id
   * @param params.controlId 控件Id
   * @param params.kanbanKey 全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,
   * @param params.layer 层级视图加载层数
   * @param params.beginTime 开始时间 日历视图
   * @param params.endTime 结束时间 日历视图
   * @param params.kanbanSize 页大小
   * @param params.kanbanIndex 页码
   * @param params.formId 公开表单ID
   * @param params.linkId 填写链接id
   * @param params.reportId 统计图ID
   * @param params.notGetTotal 不获取总记录数
   * @param params.requestParams 请求参数
   * @param params.id 工作表查询id
   * @param params.getAllControls 是否返回所有控件返回值
   */
  getFilterRowsByQueryDefault: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    worksheetId: string;
    filterControls: Array;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    sortControls: Array;
    keyWords: string;
    pageSize: integer;
    pageIndex: integer;
    isUnRead: boolean;
    isGetWorksheet: boolean;
    viewId: string;
    appId: string;
    relationWorksheetId: string;
    relationViewId: string;
    rowId: string;
    controlId: string;
    kanbanKey: string;
    layer: integer;
    beginTime: string;
    endTime: string;
    kanbanSize: integer;
    kanbanIndex: integer;
    formId: string;
    linkId: string;
    reportId: string;
    notGetTotal: boolean;
    requestParams: object;
    id: string;
    getAllControls: boolean;
  }) => any


  /**
   * 获取行记录总数
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.worksheetId 工作表id
   * @param params.filterControls 查询列
   * @param params.fastFilters 快速筛选
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 筛选组件筛选
   * @param params.sortControls 排序列
   * @param params.keyWords 关键词
   * @param params.pageSize 页大小
   * @param params.pageIndex 页码
   * @param params.isUnRead 是否已读
   * @param params.isGetWorksheet 是否查询工作表的详情
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.relationWorksheetId relationWorksheetId
   * @param params.relationViewId RelationViewId
   * @param params.rowId 行id
   * @param params.controlId 控件Id
   * @param params.kanbanKey 全部看板，&#34;-1&#34;:无等于或无选项单看板，&#34;key&#34;:单看板数据,
   * @param params.layer 层级视图加载层数
   * @param params.beginTime 开始时间 日历视图
   * @param params.endTime 结束时间 日历视图
   * @param params.kanbanSize 页大小
   * @param params.kanbanIndex 页码
   * @param params.formId 公开表单ID
   * @param params.linkId 填写链接id
   * @param params.reportId 统计图ID
   * @param params.notGetTotal 不获取总记录数
   * @param params.requestParams 请求参数
   */
  getFilterRowsTotalNum: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    worksheetId: string;
    filterControls: Array;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    sortControls: Array;
    keyWords: string;
    pageSize: integer;
    pageIndex: integer;
    isUnRead: boolean;
    isGetWorksheet: boolean;
    viewId: string;
    appId: string;
    relationWorksheetId: string;
    relationViewId: string;
    rowId: string;
    controlId: string;
    kanbanKey: string;
    layer: integer;
    beginTime: string;
    endTime: string;
    kanbanSize: integer;
    kanbanIndex: integer;
    formId: string;
    linkId: string;
    reportId: string;
    notGetTotal: boolean;
    requestParams: object;
  }) => any


  /**
   * 工作表最下方统计
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.filterControls 查询列
   * @param params.columnRpts 列排序
   * @param params.keyWords 关键词
   * @param params.controlId 
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.fastFilters 
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 筛选组件
   * @param params.requestParams 请求参数
   */
  getFilterRowsReport: (params: {
    worksheetId: string;
    filterControls: Array;
    columnRpts: Array;
    keyWords: string;
    controlId: string;
    viewId: string;
    appId: string;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    requestParams: object;
  }) => any


  /**
   * 获取日志
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.pageSize 页大小
   * @param params.pageIndex 页码
   * @param params.rowId 行id
   */
  getLogs: (params: {
    worksheetId: string;
    pageSize: integer;
    pageIndex: integer;
    rowId: string;
  }) => any


  /**
   * 获取工作表操作日志
   * @param params 参数
   * @param params.pageSize 分页大小
   * @param params.pageIndex 当前页
   * @param params.objectType 日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他
   * @param params.worksheetId 工作表id
   * @param params.rowId 记录id
   * @param params.filterUniqueIds 根据唯一码筛选
   * @param params.controlIds 筛选控件或属性ID
   * @param params.opeartorIds 筛选操作人
   * @param params.startDate 开始时间
   * @param params.endDate 结束时间
   * @param params.lastMark 最后标记时间
   * @param params.isGlobaLog 是否为全局日志获取记录日志
   * @param params.requestType 日志操作类型 1：手动 2：工作流 3：按钮
   * @param params.archiveId 归档ID
   */
  getWorksheetOperationLogs: (params: {
    pageSize: integer;
    pageIndex: integer;
    objectType: integer;
    worksheetId: string;
    rowId: string;
    filterUniqueIds: Array;
    controlIds: Array;
    opeartorIds: Array;
    startDate: string;
    endDate: string;
    lastMark: string;
    isGlobaLog: boolean;
    requestType: integer;
    archiveId: string;
  }) => any


  /**
   * 获取子表日志详情
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行记录id
   * @param params.uniqueId 唯一id
   * @param params.createTime 创建时间
   * @param params.lastMark 最后标记时间
   * @param params.objectType 对象类型
   * @param params.requestType 请求类型
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.archiveId 归档ID
   */
  getDetailTableLog: (params: {
    worksheetId: string;
    rowId: string;
    uniqueId: string;
    createTime: string;
    lastMark: string;
    objectType: integer;
    requestType: integer;
    pageIndex: integer;
    pageSize: integer;
    archiveId: string;
  }) => any


  /**
   * 批量获取工作表日志
   * @param params 参数
   * @param params.pageSize 分页大小
   * @param params.pageIndex 当前页
   * @param params.objectType 日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他
   * @param params.worksheetId 工作表id
   * @param params.rowId 记录id
   * @param params.filterUniqueIds 根据唯一码筛选
   * @param params.controlIds 筛选控件或属性ID
   * @param params.opeartorIds 筛选操作人
   * @param params.startDate 开始时间
   * @param params.endDate 结束时间
   * @param params.lastMark 最后标记时间
   * @param params.isGlobaLog 是否为全局日志获取记录日志
   * @param params.requestType 日志操作类型 1：手动 2：工作流 3：按钮
   * @param params.archiveId 归档ID
   */
  batchGetWorksheetOperationLogs: (params: {
    pageSize: integer;
    pageIndex: integer;
    objectType: integer;
    worksheetId: string;
    rowId: string;
    filterUniqueIds: Array;
    controlIds: Array;
    opeartorIds: Array;
    startDate: string;
    endDate: string;
    lastMark: string;
    isGlobaLog: boolean;
    requestType: integer;
    archiveId: string;
  }) => any


  /**
   * 工作表记录分享范围修改
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.worksheetId 工作表id
   * @param params.viewId 视图Id
   * @param params.rowId 行id
   */
  updateWorksheetRowShareRange: (params: {
    appId: string;
    worksheetId: string;
    viewId: string;
    rowId: string;
  }) => any


  /**
   * 获取记录短链
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowIds 行ids
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   */
  getRowsShortUrl: (params: {
    worksheetId: string;
    rowIds: Array;
    viewId: string;
    appId: string;
  }) => any


  /**
   * 复制行记录
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowIds 行ids
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.restoreRelation 恢复关联
   * @param params.copyRelationControlId 
   * @param params.isAll 是否全选
   * @param params.excludeRowIds 需要排除的rowIds
   * @param params.filterControls 筛选条件
   * @param params.keyWords 搜索关键字
   * @param params.fastFilters 快速筛选
   * @param params.pushUniqueId 推送ID
   */
  copyRow: (params: {
    worksheetId: string;
    rowIds: Array;
    viewId: string;
    appId: string;
    restoreRelation: boolean;
    copyRelationControlId: string;
    isAll: boolean;
    excludeRowIds: Array;
    filterControls: Array;
    keyWords: string;
    fastFilters: Array;
    pushUniqueId: string;
  }) => any


  /**
   * 获取分组导航
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.filterControls 查询列
   * @param params.columnRpts 列排序
   * @param params.keyWords 关键词
   * @param params.controlId 
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.fastFilters 
   * @param params.navGroupFilters 导航分组筛选
   * @param params.filtersGroup 筛选组件
   * @param params.requestParams 请求参数
   */
  getNavGroup: (params: {
    worksheetId: string;
    filterControls: Array;
    columnRpts: Array;
    keyWords: string;
    controlId: string;
    viewId: string;
    appId: string;
    fastFilters: Array;
    navGroupFilters: Array;
    filtersGroup: Array;
    requestParams: object;
  }) => any


  /**
   * 获取工作表归档列表
   * @param params 参数
   * @param params.type 1：行记录日志
   */
  getWorksheetArchives: (params: {
    type: integer;
  }) => any


  /**
   * 保存筛选器
   * @param params 参数
   * @param params.name 筛选器名称
   * @param params.worksheetId 工作表id
   * @param params.type 视图类型 1：个人 2：公共
   * @param params.items 
   * @param params.filterId 筛选条件编号
   * @param params.appId 应用Id
   * @param params.module 1:工作表 2:统计
   */
  saveWorksheetFilter: (params: {
    name: string;
    worksheetId: string;
    type: integer;
    items: Array;
    filterId: string;
    appId: string;
    module: integer;
  }) => any


  /**
   * 获取可见筛选器
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.controlId 控件ID
   */
  getWorksheetFilters: (params: {
    worksheetId: string;
    controlId: string;
  }) => any


  /**
   * 获取筛选器详情
   * @param params 参数
   * @param params.filterId 筛选器Id
   * @param params.items FilterSort
   * @param params.projectId 网络Id
   * @param params.worksheetId 工作表ID
   */
  getWorksheetFilterById: (params: {
    filterId: string;
    items: Array;
    projectId: string;
    worksheetId: string;
  }) => any


  /**
   * 删除筛选器
   * @param params 参数
   * @param params.filterId 筛选器Id
   * @param params.appId 应用ID
   */
  deleteWorksheetFilter: (params: {
    filterId: string;
    appId: string;
  }) => any


  /**
   * 筛选器排序
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.filterIds 筛选器Id
   * @param params.appId 应用Id
   */
  sortWorksheetFilters: (params: {
    worksheetId: string;
    filterIds: Array;
    appId: string;
  }) => any


  /**
   * 保存视图
   * @param params 参数
   * @param params.name 视图名称
   * @param params.worksheetId 工作表Id
   * @param params.sortCid 排序字段Id
   * @param params.sortType 排序类型
   * @param params.rowHeight 行高 0：紧凑 1：中等 2：高 3：超高
   * @param params.controls controls
   * @param params.filters filters
   * @param params.fastFilters fastfilters
   * @param params.moreSort 排序
   * @param params.navGroup 导航分组
   * @param params.displayControls 显示字段
   * @param params.showControls Web显示字段
   * @param params.controlsSorts 字段排序
   * @param params.layersName 层级名称
   * @param params.customDisplay 是否配置自定义显示列
   * @param params.viewId 视图id
   * @param params.appId 应用Id
   * @param params.unRead unRead
   * @param params.viewType 0:列表 1：看板 2：层级
   * @param params.childType 1：单表层级 2：多表层级
   * @param params.viewControl 视图维度ID(分组ID)
   * @param params.viewControls 多表层级视图控件
   * @param params.coverCid 封面字段
   * @param params.coverType 0：填满 1：完整显示
   * @param params.showControlName 显示控件名称
   * @param params.advancedSetting 视图高级配置
   * @param params.editAttrs 编辑属性
   * @param params.editAdKeys 编辑AdvancedSetting属性keys
   * @param params.pluginId 视图插件id
   * @param params.pluginName 视图插件名称
   * @param params.pluginIcon 视图插件图标
   * @param params.pluginIconColor 插件插件图标颜色
   * @param params.pluginSource 插件来源
   * @param params.projectId 组织id
   */
  saveWorksheetView: (params: {
    name: string;
    worksheetId: string;
    sortCid: string;
    sortType: integer;
    rowHeight: integer;
    controls: Array;
    filters: Array;
    fastFilters: Array;
    moreSort: Array;
    navGroup: Array;
    displayControls: Array;
    showControls: Array;
    controlsSorts: Array;
    layersName: Array;
    customDisplay: boolean;
    viewId: string;
    appId: string;
    unRead: boolean;
    viewType: integer;
    childType: integer;
    viewControl: string;
    viewControls: Array;
    coverCid: string;
    coverType: integer;
    showControlName: boolean;
    advancedSetting: object;
    editAttrs: Array;
    editAdKeys: Array;
    pluginId: string;
    pluginName: string;
    pluginIcon: string;
    pluginIconColor: string;
    pluginSource: integer;
    projectId: string;
  }) => any


  /**
   * 获取可见视图
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewId 
   * @param params.appId 应用Id
   */
  getWorksheetViews: (params: {
    worksheetId: string;
    viewId: string;
    appId: string;
  }) => any


  /**
   * 获取视图详情
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewId 
   * @param params.appId 应用Id
   */
  getWorksheetViewById: (params: {
    worksheetId: string;
    viewId: string;
    appId: string;
  }) => any


  /**
   * 删除视图
   * @param params 参数
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.status 9：删除 999：彻底删除
   */
  deleteWorksheetView: (params: {
    viewId: string;
    appId: string;
    status: integer;
  }) => any


  /**
   * 恢复视图
   * @param params 参数
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.status 9：删除 999：彻底删除
   */
  restoreWorksheetView: (params: {
    viewId: string;
    appId: string;
    status: integer;
  }) => any


  /**
   * 获取工作表API
   * @param params 参数
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   */
  copyWorksheetView: (params: {
    viewId: string;
    appId: string;
  }) => any


  /**
   * 视图排序
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.viewIds 视图Id
   * @param params.appId 应用Id
   */
  sortWorksheetViews: (params: {
    worksheetId: string;
    viewIds: Array;
    appId: string;
  }) => any


  /**
   * 复制视图配置
   * @param params 参数
   * @param params.viewId 视图Id
   * @param params.copyKeys 用户选中的配置
   * @param params.worksheetId 工作表Id
   * @param params.targetViewIds 目标视图Id集合
   */
  copyWorksheetViewConfig: (params: {
    viewId: string;
    copyKeys: Array;
    worksheetId: string;
    targetViewIds: Array;
  }) => any


  /**
   * 批量生成视图别名
   * @param params 参数
   * @param params.worksheetId 表id
   */
  editGenerateViewDefaultAlias: (params: {
    worksheetId: string;
  }) => any


  /**
   * 编辑视图别名
   * @param params 参数
   * @param params.worksheetId 表id
   * @param params.views 视图别名信息
   */
  editViewAlias: (params: {
    worksheetId: string;
    views: Array;
  }) => any


  /**
   * 获取按钮列表
   * @param params 参数
   * @param params.appId 应用ID
   * @param params.viewId 视图ID
   * @param params.rowId 行记录ID
   * @param params.worksheetId 工作表ID
   * @param params.btnId 
   * @param params.status 状态 1：正常 9：回收站
   * @param params.btnIds 批量获取按钮的id
   * @param params.rowIds 
   */
  getWorksheetBtns: (params: {
    appId: string;
    viewId: string;
    rowId: string;
    worksheetId: string;
    btnId: string;
    status: integer;
    btnIds: Array;
    rowIds: Array;
  }) => any


  /**
   * 验证按钮是否满足行记录
   * @param params 参数
   * @param params.appId 应用ID
   * @param params.viewId 视图ID
   * @param params.rowId 行记录ID
   * @param params.worksheetId 工作表ID
   * @param params.btnId 
   * @param params.status 状态 1：正常 9：回收站
   * @param params.btnIds 批量获取按钮的id
   * @param params.rowIds 
   */
  checkWorksheetRowBtn: (params: {
    appId: string;
    viewId: string;
    rowId: string;
    worksheetId: string;
    btnId: string;
    status: integer;
    btnIds: Array;
    rowIds: Array;
  }) => any


  /**
   * 批量验证行记录是否满足按钮条件
   * @param params 参数
   * @param params.appId 应用ID
   * @param params.viewId 视图ID
   * @param params.rowId 行记录ID
   * @param params.worksheetId 工作表ID
   * @param params.btnId 
   * @param params.status 状态 1：正常 9：回收站
   * @param params.btnIds 批量获取按钮的id
   * @param params.rowIds 
   */
  checkWorksheetRowsBtn: (params: {
    appId: string;
    viewId: string;
    rowId: string;
    worksheetId: string;
    btnId: string;
    status: integer;
    btnIds: Array;
    rowIds: Array;
  }) => any


  /**
   * 获取按钮详情
   * @param params 参数
   * @param params.appId 应用ID
   * @param params.viewId 视图ID
   * @param params.rowId 行记录ID
   * @param params.worksheetId 工作表ID
   * @param params.btnId 
   * @param params.status 状态 1：正常 9：回收站
   * @param params.btnIds 批量获取按钮的id
   * @param params.rowIds 
   */
  getWorksheetBtnByID: (params: {
    appId: string;
    viewId: string;
    rowId: string;
    worksheetId: string;
    btnId: string;
    status: integer;
    btnIds: Array;
    rowIds: Array;
  }) => any


  /**
   * 操作按钮
   * @param params 参数
   * @param params.appId 应用iD
   * @param params.viewId 视图ID
   * @param params.btnId 按钮ID
   * @param params.worksheetId 工作表ID
   */
  optionWorksheetBtn: (params: {
    appId: string;
    viewId: string;
    btnId: string;
    worksheetId: string;
  }) => any


  /**
   * 保存按钮
   * @param params 参数
   * @param params.btnId 
   * @param params.name 
   * @param params.worksheetId 
   * @param params.showType 1:一直 2：满足筛选条件
   * @param params.filters 筛选条件
   * @param params.displayViews 显示视图
   * @param params.clickType 1：立即执行 2：二次确认 3：填写
   * @param params.confirmMsg 确认信息
   * @param params.sureName 确认按钮
   * @param params.cancelName 取消按钮
   * @param params.writeObject 对象 1：本记录 2：关联记录
   * @param params.writeType 类型 1：填写字段 2：新建关联记录
   * @param params.relationControl 关联记录ID
   * @param params.addRelationControlId 新建关联记录ID
   * @param params.workflowType 1:执行 2：不执行
   * @param params.workflowId 工作流ID
   * @param params.writeControls 填写控件 type - 1：只读 2：填写 3：必填
   * @param params.appId 应用ID
   * @param params.color 颜色
   * @param params.icon 图标
   * @param params.desc 描述
   * @param params.isAllView 
   * @param params.editAttrs 编辑属性
   * @param params.verifyPwd 
   * @param params.enableConfirm 
   * @param params.advancedSetting 
   * @param params.isBatch 
   */
  saveWorksheetBtn: (params: {
    btnId: string;
    name: string;
    worksheetId: string;
    showType: integer;
    filters: Array;
    displayViews: Array;
    clickType: integer;
    confirmMsg: string;
    sureName: string;
    cancelName: string;
    writeObject: integer;
    writeType: integer;
    relationControl: string;
    addRelationControlId: string;
    workflowType: integer;
    workflowId: string;
    writeControls: Array;
    appId: string;
    color: string;
    icon: string;
    desc: string;
    isAllView: integer;
    editAttrs: Array;
    verifyPwd: boolean;
    enableConfirm: boolean;
    advancedSetting: object;
    isBatch: boolean;
  }) => any


  /**
   * 复制按钮
   * @param params 参数
   * @param params.appId 应用iD
   * @param params.viewId 视图ID
   * @param params.btnId 按钮ID
   * @param params.worksheetId 工作表ID
   */
  copyWorksheetBtn: (params: {
    appId: string;
    viewId: string;
    btnId: string;
    worksheetId: string;
  }) => any


  /**
   * 获取规则列表
   * @param params 参数
   * @param params.worksheetId 
   * @param params.ruleId 
   * @param params.instanceId 通过工作流时必传
   * @param params.workId 通过工作流时必传
   */
  getControlRules: (params: {
    worksheetId: string;
    ruleId: string;
    instanceId: string;
    workId: string;
  }) => any


  /**
   * 保存规则
   * @param params 参数
   * @param params.worksheetId 
   * @param params.ruleId 
   * @param params.ruleIds 
   * @param params.name 
   * @param params.disabled 
   * @param params.filters 
   * @param params.ruleItems 
   * @param params.editAttrs 
   * @param params.type 0:交互  1：验证 2：锁定
   * @param params.checkType 0：前端  1：前后端
   * @param params.hintType 0：输入和提交 1：仅提交
   */
  saveControlRule: (params: {
    worksheetId: string;
    ruleId: string;
    ruleIds: Array;
    name: string;
    disabled: boolean;
    filters: Array;
    ruleItems: Array;
    editAttrs: Array;
    type: integer;
    checkType: integer;
    hintType: integer;
  }) => any


  /**
   * @param {Object} args 请求参数
   * @param params 参数
   * @param params.worksheetId 
   * @param params.ruleId 
   * @param params.ruleIds 
   * @param params.name 
   * @param params.disabled 
   * @param params.filters 
   * @param params.ruleItems 
   * @param params.editAttrs 
   * @param params.type 0:交互  1：验证 2：锁定
   * @param params.checkType 0：前端  1：前后端
   * @param params.hintType 0：输入和提交 1：仅提交
   */
  sortControlRules: (params: {
    worksheetId: string;
    ruleId: string;
    ruleIds: Array;
    name: string;
    disabled: boolean;
    filters: Array;
    ruleItems: Array;
    editAttrs: Array;
    type: integer;
    checkType: integer;
    hintType: integer;
  }) => any


  /**
   * 保存表控件
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  saveWorksheetControls: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 添加表控件
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  addWorksheetControls: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 获取表控件
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   */
  getWorksheetControls: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
  }) => any


  /**
   * 获取工作表字段智能建议
   * @param params 参数
   * @param params.prompt 提示词
   */
  getAiFieldRecommendation: (params: {
    prompt: string;
  }) => any


  /**
   * 批量获取表控件
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   */
  getWorksheetsControls: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
  }) => any


  /**
   * 编辑控件别名
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  editControlsAlias: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 生成控件默认别名
   * @param params 参数
   * @param params.appId 应用id
   * @param params.worksheetId 工作表id
   * @param params.version 版本号
   */
  editGenerateControlsDefaultAlias: (params: {
    appId: string;
    worksheetId: string;
    version: integer;
  }) => any


  /**
   * 保存表控件
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  editWorksheetControls: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 重置自动编号
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  resetControlIncrease: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 删除autoid
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.relationWorksheetId 关联表的id
   * @param params.getTemplate 是否获取Template
   * @param params.getViews 是否获取Views
   * @param params.appId 应用Id
   * @param params.handleDefault 处理默认值
   * @param params.worksheetIds 批量工作表id
   * @param params.handControlSource 是否处理关联的原始类型
   * @param params.getRules 是否需要验证规则
   * @param params.getSwitchPermit 是否获取功能开关
   * @param params.getRelationSearch 获取查下记录控件
   * @param params.resultType 获取类型 0或者1：常规 2：简易模式 3:严格鉴权
   */
  deleteWorksheetAutoID: (params: {
    worksheetId: string;
    relationWorksheetId: string;
    getTemplate: boolean;
    getViews: boolean;
    appId: string;
    handleDefault: boolean;
    worksheetIds: Array;
    handControlSource: boolean;
    getRules: boolean;
    getSwitchPermit: boolean;
    getRelationSearch: boolean;
    resultType: integer;
  }) => any


  /**
   * 编辑控件状态
   * @param params 参数
   * @param params.sourceId 兼容老数据
   * @param params.worksheetId WorksheetId
   * @param params.version 版本号
   * @param params.controls 控件集合
   * @param params.appId 应用ID
   * @param params.controlId 控件ID
   * @param params.controlIds 控件IDs
   * @param params.status 状态 1:恢复 999：彻底删除
   * @param params.initNum 初始化编号
   */
  editControlsStatus: (params: {
    sourceId: string;
    worksheetId: string;
    version: integer;
    controls: Array;
    appId: string;
    controlId: string;
    controlIds: Array;
    status: integer;
    initNum: integer;
  }) => any


  /**
   * 获取字段和表引用关系
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.controlId 字段ID
   * @param params.type 类型 1：字段引用关系 2：工作表引用关系
   * @param params.module 模块 1：工作表 2：工作流
   * @param params.subModule 子模块 0：表示获取全部 101：字段 102：视图 103：业务规则 201：流程节点
   * @param params.isRefresh 刷新引用关系
   * @param params.appId 空表示所有引用，默认传当前应用ID
   */
  getWorksheetReferences: (params: {
    worksheetId: string;
    controlId: string;
    type: integer;
    module: integer;
    subModule: integer;
    isRefresh: boolean;
    appId: string;
  }) => any


  /**
   * 获取系统打印列表
   * @param params 参数
   * @param params.worksheetId 
   * @param params.viewId 
   * @param params.rowIds 
   */
  getPrintList: (params: {
    worksheetId: string;
    viewId: string;
    rowIds: Array;
  }) => any


  /**
   * 获取 表单组件
   * @param params 参数
   * @param params.worksheetId 工作表Id
   */
  getFormComponent: (params: {
    worksheetId: string;
  }) => any


  /**
   * 获取单个打印模板
   * @param params 参数
   * @param params.id 
   * @param params.projectId 
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.pageIndex 页码
   * @param params.pageSize 页大小
   * @param params.sortId 
   * @param params.isAsc 
   * @param params.keywords 关键词
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 通过工作流审批打印时必传
   * @param params.workId 通过工作流审批打印时必传
   * @param params.filterControls 
   * @param params.fastFilters 快递筛选
   */
  getPrint: (params: {
    id: string;
    projectId: string;
    worksheetId: string;
    rowId: string;
    pageIndex: integer;
    pageSize: integer;
    sortId: string;
    isAsc: boolean;
    keywords: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    filterControls: Array;
    fastFilters: Array;
  }) => any


  /**
   * 获取单个打印模板
   * @param params 参数
   * @param params.id 
   * @param params.projectId 
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.pageIndex 页码
   * @param params.pageSize 页大小
   * @param params.sortId 
   * @param params.isAsc 
   * @param params.keywords 关键词
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 通过工作流审批打印时必传
   * @param params.workId 通过工作流审批打印时必传
   * @param params.filterControls 
   * @param params.fastFilters 快递筛选
   */
  getCodePrint: (params: {
    id: string;
    projectId: string;
    worksheetId: string;
    rowId: string;
    pageIndex: integer;
    pageSize: integer;
    sortId: string;
    isAsc: boolean;
    keywords: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    filterControls: Array;
    fastFilters: Array;
  }) => any


  /**
   * 新建生成打印模板
   * @param params 参数
   * @param params.id 
   * @param params.projectId 
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.pageIndex 页码
   * @param params.pageSize 页大小
   * @param params.sortId 
   * @param params.isAsc 
   * @param params.keywords 关键词
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 通过工作流审批打印时必传
   * @param params.workId 通过工作流审批打印时必传
   * @param params.filterControls 
   * @param params.fastFilters 快递筛选
   */
  getPrintTemplate: (params: {
    id: string;
    projectId: string;
    worksheetId: string;
    rowId: string;
    pageIndex: integer;
    pageSize: integer;
    sortId: string;
    isAsc: boolean;
    keywords: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    filterControls: Array;
    fastFilters: Array;
  }) => any


  /**
   * 保存系统打印模板
   * @param params 参数
   * @param params.id 模板id (空=新建 非空=修改)
   * @param params.saveControls 勾选保存的控件
   */
  editPrint: (params: {
    id: string;
    saveControls: Array;
  }) => any


  /**
   * 编辑打印模板文件属性
   * @param params 参数
   * @param params.id 模板id
   * @param params.name 模板名称
   * @param params.allowEditAfterPrint 允许编辑后打印
   * @param params.advanceSettings 额外配置数据
   */
  editPrintFile: (params: {
    id: string;
    name: string;
    allowEditAfterPrint: boolean;
    advanceSettings: Array;
  }) => any


  /**
   * 保存记录二维码打印模板配置
   * @param params 参数
   * @param params.id 模板id
   * @param params.projectId 组织id
   * @param params.worksheetId 工作表id
   * @param params.name 模板名称
   * @param params.type 3-二维码打印 4-条码打印
   * @param params.range 使用范围
   * @param params.views 视图id
   * @param params.advanceSettings 额外配置
   */
  saveRecordCodePrintConfig: (params: {
    id: string;
    projectId: string;
    worksheetId: string;
    name: string;
    type: integer;
    range: integer;
    views: Array;
    advanceSettings: Array;
  }) => any


  /**
   * 修改打印模板名称
   * @param params 参数
   * @param params.id 
   * @param params.name 
   */
  editPrintName: (params: {
    id: string;
    name: string;
  }) => any


  /**
   * 修改打印模板范围
   * @param params 参数
   * @param params.id 
   * @param params.worksheetId 
   * @param params.viewsIds 视图Ids
   */
  editPrintRange: (params: {
    id: string;
    worksheetId: string;
    viewsIds: Array;
  }) => any


  /**
   * 修改打印模板筛选条件
   * @param params 参数
   * @param params.id 
   * @param params.filters 筛选条件
   */
  editPrintFilter: (params: {
    id: string;
    filters: Array;
  }) => any


  /**
   * 修改打印模板排序
   * @param params 参数
   * @param params.projectId 
   * @param params.worksheetId 
   * @param params.sortItems 
   */
  editPrintTemplateSort: (params: {
    projectId: string;
    worksheetId: string;
    sortItems: Array;
  }) => any


  /**
   * 删除打印模板
   * @param params 参数
   * @param params.id 
   */
  deletePrint: (params: {
    id: string;
  }) => any


  /**
   * 获取 工作表 索引字段配置
   * @param params 参数
   * @param params.worksheetId 工作表Id
   */
  getRowIndexes: (params: {
    worksheetId: string;
  }) => any


  /**
   * 新增 工作表行内容表索引
   * @param params 参数
   * @param params.worksheetId 工作表Id
   * @param params.customeIndexName 自定义索引名称
   * @param params.indexFields 索引字段
   * @param params.uniqueIndex 是否 唯一索引
   * @param params.wildcardIndex 是否 通配符文本索引
   * @param params.sparseIndex 是否 稀疏索引
   * @param params.backgroundIndex 是否 后台索引
   * @param params.appId AppId
   */
  addRowIndex: (params: {
    worksheetId: string;
    customeIndexName: string;
    indexFields: Array;
    uniqueIndex: boolean;
    wildcardIndex: boolean;
    sparseIndex: boolean;
    backgroundIndex: boolean;
    appId: string;
  }) => any


  /**
   * 更新 工作表行内容表索引
   * @param params 参数
   * @param params.worksheetId 工作表Id
   * @param params.customeIndexName 自定义索引名称
   * @param params.indexFields 索引字段
   * @param params.uniqueIndex 是否 唯一索引
   * @param params.wildcardIndex 是否 通配符文本索引
   * @param params.sparseIndex 是否 稀疏索引
   * @param params.backgroundIndex 是否 后台索引
   * @param params.indexConfigId 索引配置Id
   * @param params.appId AppId
   * @param params.isSystemIndex 是否 系统级索引
   * @param params.systemIndexName 系统级索引名称
   */
  updateRowIndex: (params: {
    worksheetId: string;
    customeIndexName: string;
    indexFields: Array;
    uniqueIndex: boolean;
    wildcardIndex: boolean;
    sparseIndex: boolean;
    backgroundIndex: boolean;
    indexConfigId: string;
    appId: string;
    isSystemIndex: boolean;
    systemIndexName: string;
  }) => any


  /**
   * 更新 工作表行内容表索引名称
   * @param params 参数
   * @param params.appId AppId
   * @param params.worksheetId 工作表Id
   * @param params.indexConfigId 索引配置Id
   * @param params.customeIndexName 自定义索引名称
   */
  updateRowIndexCustomeIndexName: (params: {
    appId: string;
    worksheetId: string;
    indexConfigId: string;
    customeIndexName: string;
  }) => any


  /**
   * 移除 工作表行内容表索引
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.worksheetId 工作表Id
   * @param params.indexConfigId 索引配置Id
   * @param params.isSystemIndex 是否 系统级索引
   * @param params.systemIndexName 系统级索引名称
   */
  removeRowIndex: (params: {
    appId: string;
    worksheetId: string;
    indexConfigId: string;
    isSystemIndex: boolean;
    systemIndexName: string;
  }) => any


  /**
   * 获取链接行记录
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.id 
   * @param params.password 
   */
  getLinkDetail: (params: {
    ticket: string;
    randStr: string;
    id: string;
    password: string;
  }) => any


  /**
   * 获取工作表创建记录表单提交设置信息
   * @param params 参数
   * @param params.workSheetId 工作表Id
   * @param params.appId 应用id
   */
  getFormSubmissionSettings: (params: {
    workSheetId: string;
    appId: string;
  }) => any


  /**
   * 更新工作表创建记录表单设置信息
   * @param params 参数
   * @param params.workSheetId 工作表id
   * @param params.appId 应用id
   * @param params.projectId 组织id
   * @param params.advancedSetting 配置项数据
   * @param params.editAdKeys 编辑AdvancedSetting属性keys
   */
  editWorksheetSetting: (params: {
    workSheetId: string;
    appId: string;
    projectId: string;
    advancedSetting: object;
    editAdKeys: Array;
  }) => any


  /**
   * 获取功能系统开关配置
   * @param params 参数
   * @param params.worksheetId 工作表id
   */
  getSwitch: (params: {
    worksheetId: string;
  }) => any


  /**
   * 更新系统配置开关（单个）
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.state 开关
   * @param params.viewIds 
   */
  editSwitch: (params: {
    worksheetId: string;
    state: boolean;
    viewIds: Array;
  }) => any


  /**
   * 更新系统配置开关（批量）
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.switchList 
   */
  batchEditSwitch: (params: {
    worksheetId: string;
    switchList: Array;
  }) => any


  /**
   * 获取功能系统开关（包含管理员判断）
   * @param params 参数
   * @param params.appId 应用管理员
   * @param params.worksheetId 工作表id
   */
  getSwitchPermit: (params: {
    appId: string;
    worksheetId: string;
  }) => any


  /**
   * 获取工作表信息
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.appId 应用id
   * @param params.version 版本  1=v1  2=v2
   */
  getWorksheetApiInfo: (params: {
    worksheetId: string;
    appId: string;
    version: integer;
  }) => any


  /**
   * 获取应用下选项集
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  getCollectionsByAppId: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 保存选项集
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  saveOptionsCollection: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 更新选项集所属应用
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  updateOptionsCollectionAppId: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 删除选项集
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  deleteOptionsCollection: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 获取选项集详细数据
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  getCollectionByCollectId: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 批量获取选项集
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  getCollectionsByCollectIds: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 获取选项集引用的控件列表
   * @param params 参数
   * @param params.collectionId 
   * @param params.collectionIds 
   * @param params.appId 
   * @param params.worksheetId 
   * @param params.options 
   * @param params.name 
   * @param params.colorful 
   * @param params.enableScore 
   * @param params.status 0或者1：正常 9：停用,999：删除
   */
  getQuoteControlsById: (params: {
    collectionId: string;
    collectionIds: Array;
    appId: string;
    worksheetId: string;
    options: Array;
    name: string;
    colorful: boolean;
    enableScore: boolean;
    status: integer;
  }) => any


  /**
   * 获取添加选项接集接口信息
   * @param params 参数

   */
  addOrUpdateOptionSetApiInfo: (params: {

  }) => any


  /**
   * 获取选项接集列表接口信息
   * @param params 参数

   */
  optionSetListApiInfo: (params: {

  }) => any


  /**
   * 工作表OCR识别
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.controlId ocr控件id
   * @param params.data ocr映射url数组(不管单个还是多个批量,都是数组)
   */
  ocr: (params: {
    worksheetId: string;
    controlId: string;
    data: Array;
  }) => any


  /**
   * get单个工作表查询
   * @param params 参数
   * @param params.id 
   */
  getQuery: (params: {
    id: string;
  }) => any


  /**
   * worksheetId 批量获取工作表查询
   * @param params 参数
   * @param params.worksheetId 
   */
  getQueryBySheetId: (params: {
    worksheetId: string;
  }) => any


  /**
   * 保存工作表查询
   * @param params 参数
   * @param params.id id 新建为空，修改传原值
   * @param params.worksheetId 本表id
   * @param params.controlId 默认值控件id
   * @param params.sourceId 来源id （这里值得工作表id）
   * @param params.sourceType 1 = 本表，2 = 他表
   * @param params.items 筛选条件
   * @param params.configs 映射字段
   * @param params.moreType 0 = 获取第一条时，按配置来，1= 不赋值
   * @param params.moreSort 排序
   * @param params.queryCount 查询条数
   * @param params.resultType 结果类型 0=查询到记录，1=仅查询到一条记录，2=查询到多条记录，3=未查询到记录
   * @param params.eventType 0 = 常规字段默认值，1 = 表单事件
   */
  saveQuery: (params: {
    id: string;
    worksheetId: string;
    controlId: string;
    sourceId: string;
    sourceType: integer;
    items: Array;
    configs: Array;
    moreType: integer;
    moreSort: Array;
    queryCount: integer;
    resultType: integer;
    eventType: integer;
  }) => any


  /**
   * 保存筛选组件
   * @param params 参数
   * @param params.filtersGroupId 筛选组件ID
   * @param params.name 名称
   * @param params.enableBtn 开启搜索按钮
   * @param params.filters filters
   * @param params.advancedSetting 视图高级配置
   * @param params.appId 应用ID
   * @param params.filtersGroupIds 批量获取和删除使用
   * @param params.pageId 自定义页面ID
   */
  saveFiltersGroup: (params: {
    filtersGroupId: string;
    name: string;
    enableBtn: boolean;
    filters: Array;
    advancedSetting: object;
    appId: string;
    filtersGroupIds: Array;
    pageId: string;
  }) => any


  /**
   * 获取筛选组件
   * @param params 参数
   * @param params.filtersGroupId 筛选组件ID
   * @param params.name 名称
   * @param params.enableBtn 开启搜索按钮
   * @param params.filters filters
   * @param params.advancedSetting 视图高级配置
   * @param params.appId 应用ID
   * @param params.filtersGroupIds 批量获取和删除使用
   * @param params.pageId 自定义页面ID
   */
  getFiltersGroupByIds: (params: {
    filtersGroupId: string;
    name: string;
    enableBtn: boolean;
    filters: Array;
    advancedSetting: object;
    appId: string;
    filtersGroupIds: Array;
    pageId: string;
  }) => any


  /**
   * 删除筛选组件
   * @param params 参数
   * @param params.filtersGroupId 筛选组件ID
   * @param params.name 名称
   * @param params.enableBtn 开启搜索按钮
   * @param params.filters filters
   * @param params.advancedSetting 视图高级配置
   * @param params.appId 应用ID
   * @param params.filtersGroupIds 批量获取和删除使用
   * @param params.pageId 自定义页面ID
   */
  deleteFiltersGroupByIds: (params: {
    filtersGroupId: string;
    name: string;
    enableBtn: boolean;
    filters: Array;
    advancedSetting: object;
    appId: string;
    filtersGroupIds: Array;
    pageId: string;
  }) => any


  /**
   * 执行api查询
   * @param params 参数
   * @param params.data 执行api查询数据
   * @param params.projectId 组织id
   * @param params.workSheetId 工作表id
   * @param params.controlId 控件id
   * @param params.apiTemplateId api模板id
   * @param params.apkId 应用id
   * @param params.formId 公开表单id
   * @param params.apiEventId 动作事件id（不传默认识别为api查询字段）
   * @param params.authId 授权账户Id
   * @param params.actionType 事件执行类型 调用api 8 调用封装业务流程 13
   */
  excuteApiQuery: (params: {
    data: object;
    projectId: string;
    workSheetId: string;
    controlId: string;
    apiTemplateId: string;
    apkId: string;
    formId: string;
    apiEventId: string;
    authId: string;
    actionType: integer;
  }) => any


  /**
   * 获取api模板消息信息
   * @param params 参数
   * @param params.apiTemplateId api模板id
   * @param params.type 是否为请求参数模板 1-请求模板 2-响应模板 不传-请求响应
   * @param params.actionType 事件执行类型 调用api 8 调用封装业务流程 13
   */
  getApiControlDetail: (params: {
    apiTemplateId: string;
    type: integer;
    actionType: integer;
  }) => any


  /**
   * 更新附件排序
   * @param params 参数
   * @param params.worksheetId 表id
   * @param params.rowId 
   * @param params.controlId 附件控件id
   * @param params.viewId 
   * @param params.fileIds 附件ids（排好序的）
   */
  sortAttachment: (params: {
    worksheetId: string;
    rowId: string;
    controlId: string;
    viewId: string;
    fileIds: Array;
  }) => any


  /**
   * 更新记录附件名
   * @param params 参数
   * @param params.worksheetId 工作表id
   * @param params.rowId 行id
   * @param params.viewId 视图Id
   * @param params.appId 应用Id
   * @param params.instanceId 流程实例id
   * @param params.workId 运行节点id
   * @param params.getTemplate 是否获取模板
   * @param params.shareId 分享页获取关联记录iD
   * @param params.checkView 是否验证视图
   * @param params.relationWorksheetId 关联控件ID
   * @param params.discussId 讨论ID
   * @param params.fileId 
   * @param params.fileName 
   * @param params.controlId 附件的控件id
   */
  editAttachmentName: (params: {
    worksheetId: string;
    rowId: string;
    viewId: string;
    appId: string;
    instanceId: string;
    workId: string;
    getTemplate: boolean;
    shareId: string;
    checkView: boolean;
    relationWorksheetId: string;
    discussId: string;
    fileId: string;
    fileName: string;
    controlId: string;
  }) => any


  /**
   * 获取导出excel配置
   * @param params 参数
   * @param params.worksheetId 
   * @param params.viewId 
   */
  getExportConfig: (params: {
    worksheetId: string;
    viewId: string;
  }) => any


  /**
   * 保存导出配置
   * @param params 参数
   * @param params.worksheetId 
   * @param params.viewId 
   * @param params.exportExtIds 导出特殊列配置
   * @param params.controlIds 需要导出的控件ids
   * @param params.getColumnRpt 是否导出列统计
   * @param params.edited 是否允许修改
   * @param params.sortRelationCids 强制排序导出的关联控件id集合
   * @param params.isNumber 控件是否以数值格式导出
   */
  saveExportConfig: (params: {
    worksheetId: string;
    viewId: string;
    exportExtIds: Array;
    controlIds: Array;
    getColumnRpt: boolean;
    edited: boolean;
    sortRelationCids: Array;
    isNumber: boolean;
  }) => any


  /**
   * 获取工作表币种类型
   * @param params 参数

   */
  getWorksheetCurrencyInfos: (params: {

  }) => any

};


  /**
   * 应用管理
   */
  appManagement: {

  /**
   * 添加角色
   * @param params 参数
   * @param params.appId 应用id
   * @param params.name 名称
   * @param params.hideAppForMembers 该角色成员不可见当前应用
   * @param params.description 描述
   * @param params.permissionWay 角色类型（0:自定义、10:只读、50::成员、100:管理员）
   * @param params.projectId 网络id
   * @param params.sheets 工作表权限集合
   * @param params.userIds 角色成员id集合
   * @param params.pages 自定义页面
   * @param params.extendAttrs 用户扩展权限字段
   */
  addRole: (params: {
    appId: string;
    name: string;
    hideAppForMembers: boolean;
    description: string;
    permissionWay: integer;
    projectId: string;
    sheets: Array;
    userIds: Array;
    pages: Array;
    extendAttrs: Array;
  }) => any


  /**
   * 删除角色(并把人员移动到其他角色)
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.resultRoleId 目标角色id
   * @param params.projectId 网络id
   */
  removeRole: (params: {
    appId: string;
    roleId: string;
    resultRoleId: string;
    projectId: string;
  }) => any


  /**
   * 添加角色成员
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.userIds 用户
   * @param params.departmentIds 部门
   * @param params.departmentTreeIds 部门树
   * @param params.projectOrganizeIds 网络角色
   * @param params.jobIds 职位ids
   * @param params.projectId 网络id
   */
  addRoleMembers: (params: {
    appId: string;
    roleId: string;
    userIds: Array;
    departmentIds: Array;
    departmentTreeIds: Array;
    projectOrganizeIds: Array;
    jobIds: Array;
    projectId: string;
  }) => any


  /**
   * 移除角色成员
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.selectAll 是否全选
   * @param params.userIds 用户
   * @param params.departmentIds 部门
   * @param params.jobIds 职位
   * @param params.departmentTreeIds 部门树
   * @param params.projectOrganizeIds 网络角色
   * @param params.projectId 网络id
   */
  removeRoleMembers: (params: {
    appId: string;
    roleId: string;
    selectAll: boolean;
    userIds: Array;
    departmentIds: Array;
    jobIds: Array;
    departmentTreeIds: Array;
    projectOrganizeIds: Array;
    projectId: string;
  }) => any


  /**
   * 设置 角色负责人
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.projectId 网络id
   * @param params.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
   * @param params.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
   */
  setRoleCharger: (params: {
    appId: string;
    roleId: string;
    projectId: string;
    memberId: string;
    memberCategory: integer;
  }) => any


  /**
   * 取消设置 角色负责人
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.projectId 网络id
   * @param params.memberId 成员Id（用户Id、部门Id、部门树的部门Id、职位Id、组织角色Id、全组织 的 组织Id）
   * @param params.memberCategory 成员类型（用户 = 10、部门 = 20、部门树 = 21、职位 = 30、组织角色 = 40、网络（全组织） = 50）
   */
  cancelRoleCharger: (params: {
    appId: string;
    roleId: string;
    projectId: string;
    memberId: string;
    memberCategory: integer;
  }) => any


  /**
   * 退出应用单个角色
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   */
  quitAppForRole: (params: {
    appId: string;
    roleId: string;
  }) => any


  /**
   * 退出应用下所有角色
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 网络id
   */
  quitRole: (params: {
    appId: string;
    projectId: string;
  }) => any


  /**
   * 配置角色权限
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.projectId 网络id
   */
  editAppRole: (params: {
    appId: string;
    roleId: string;
    projectId: string;
  }) => any


  /**
   * 把人员移动到其他角色
   * @param params 参数
   * @param params.appId 应用id
   * @param params.sourceAppRoleId 来源角色id
   * @param params.resultAppRoleIds 目标角色id
   * @param params.selectAll 是否全选
   * @param params.userIds 用户id集合
   * @param params.departmentIds 部门id集合
   * @param params.jobIds 职位id集合
   * @param params.projectId 网络id
   * @param params.departmentTreeIds 部门树
   * @param params.projectOrganizeIds 网络角色
   */
  removeUserToRole: (params: {
    appId: string;
    sourceAppRoleId: string;
    resultAppRoleIds: Array;
    selectAll: boolean;
    userIds: Array;
    departmentIds: Array;
    jobIds: Array;
    projectId: string;
    departmentTreeIds: Array;
    projectOrganizeIds: Array;
  }) => any


  /**
   * 设置 开启/关闭 普通成员 是否可见角色列表
   * @param params 参数
   * @param params.appId 应用id
   */
  updateMemberStatus: (params: {
    appId: string;
  }) => any


  /**
   * 设置 开启/关闭 应用角色通知
   * @param params 参数
   * @param params.appId 应用 Id
   * @param params.notify 通知
   */
  updateAppRoleNotify: (params: {
    appId: string;
    notify: boolean;
  }) => any


  /**
   * 设置 开启/关闭 Debug模式
   * @param params 参数
   * @param params.appId 应用 Id
   * @param params.isDebug 通知
   */
  updateAppDebugModel: (params: {
    appId: string;
    isDebug: boolean;
  }) => any


  /**
   * 当前用户 设置调试的 角色
   * @param params 参数
   * @param params.appId 应用 Id
   * @param params.roleIds 调试/模拟的 角色Ids（不传 则退出 调试）
   */
  setDebugRoles: (params: {
    appId: string;
    roleIds: Array;
  }) => any


  /**
   * 复制角色
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.roleName 新角色名称
   * @param params.copyPortalRole 是否是复制的外部门户角色
   */
  copyRole: (params: {
    appId: string;
    roleId: string;
    roleName: string;
    copyPortalRole: boolean;
  }) => any


  /**
   * 复制角色到外部门户
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色Id
   * @param params.roleName 角色名称
   */
  copyRoleToExternalPortal: (params: {
    appId: string;
    roleId: string;
    roleName: string;
  }) => any


  /**
   * 复制外部门户角色到内部
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色Id
   * @param params.roleName 角色名称
   */
  copyExternalRolesToInternal: (params: {
    appId: string;
    roleId: string;
    roleName: string;
  }) => any


  /**
   * 角色排序
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleIds 排序后的角色ids
   */
  sortRoles: (params: {
    appId: string;
    roleIds: Array;
  }) => any


  /**
   * 获取 应用角色设置
   * @param params 参数
   * @param params.appId 应用id
   * @param params.notOnSettingPage 不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）
   */
  getAppRoleSetting: (params: {
    appId: string;
    notOnSettingPage: boolean;
  }) => any


  /**
   * 获取 应用角色基本信息 列表（不含具体权限，包含  成员、职位等信息）
   * @param params 参数
   * @param params.appId 应用id
   */
  getRolesWithUsers: (params: {
    appId: string;
  }) => any


  /**
   * 获取 应用下所有角色信息（简要信息：含应用Id、角色Id、角色名称、是否为管理员）
   * @param params 参数
   * @param params.appId 应用id
   */
  getSimpleRoles: (params: {
    appId: string;
  }) => any


  /**
   * 分页获取 全部成员
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.pageIndex 分页面码 = 默认1
   * @param params.pageSize 分页 页大小
   * @param params.keywords 查询 关键词（现仅 支持 成员名称）
   * @param params.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
   * @param params.sort 排序参数
   */
  getTotalMember: (params: {
    appId: string;
    pageIndex: integer;
    pageSize: integer;
    keywords: string;
    searchMemberType: integer;
    sort: Array;
  }) => any


  /**
   * 获取 成员的 角色Id和名称
   * @param params 参数
   * @param params.appId 
   * @param params.memberId 
   */
  getRolesByMemberId: (params: {
    appId: string;
    memberId: string;
  }) => any


  /**
   * 分页获取 外协成员
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.pageIndex 分页面码 = 默认1
   * @param params.pageSize 分页 页大小
   */
  getOutsourcingMembers: (params: {
    appId: string;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 获取 角色列表（包含 我加入的角色标识）
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.allJoinRoles 查看所有加入的角色
   */
  getAppRoleSummary: (params: {
    appId: string;
    allJoinRoles: boolean;
  }) => any


  /**
   * 获取 调试模式 的可选角色
   * @param params 参数
   * @param params.appId 应用Id
   */
  getDebugRoles: (params: {
    appId: string;
  }) => any


  /**
   * 根据角色 分页获取 角色下的用户集
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.roleId 角色Id
   * @param params.pageIndex 分页面码 = 默认1
   * @param params.pageSize 分页 页大小
   * @param params.keywords 查询 关键词（现仅 支持 成员名称）
   * @param params.searchMemberType 搜索 成员类型（默认=0、用户/人员=10、部门=20，组织角色=30，职位=40）
   * @param params.sort 排序参数  （其中 FieldType值为： 默认[时间] = 0、时间 = 10、类型 = 20）
   */
  getMembersByRole: (params: {
    appId: string;
    roleId: string;
    pageIndex: integer;
    pageSize: integer;
    keywords: string;
    searchMemberType: integer;
    sort: Array;
  }) => any


  /**
   * 批量编辑用户角色
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.dstRoleIds 目标角色Ids
   * @param params.selectAll 是否全选
   * @param params.isOutsourcing 是否全选外协
   */
  batchEditMemberRole: (params: {
    appId: string;
    dstRoleIds: Array;
    selectAll: boolean;
    isOutsourcing: boolean;
  }) => any


  /**
   * 批量成员退出应用
   * @param params 参数
   * @param params.appId 应用Id
   */
  batchMemberQuitApp: (params: {
    appId: string;
  }) => any


  /**
   * 获取应用下某个角色的具体权限信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.roleId 角色id
   * @param params.isPortal 是否外部门户 角色
   */
  getRoleDetail: (params: {
    appId: string;
    roleId: string;
    isPortal: boolean;
  }) => any


  /**
   * 获取应用下所有工作表信息生成添加角色模板
   * @param params 参数
   * @param params.appId 应用id
   * @param params.isPortal 是否外部门户 角色
   */
  getAddRoleTemplate: (params: {
    appId: string;
    isPortal: boolean;
  }) => any


  /**
   * 获取网络下用户为应用管理员的应用信息
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.containsLinks 是否包含链接类型
   * @param params.getLock 是否获取锁定应用（默认不获取）
   */
  getAppForManager: (params: {
    projectId: string;
    containsLinks: boolean;
    getLock: boolean;
  }) => any


  /**
   * 网络下用户为管理员的应用集合
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.containsLinks 是否包含链接类型
   */
  getManagerApps: (params: {
    projectId: string;
    containsLinks: boolean;
  }) => any


  /**
   * 刷新权限缓存
   * @param params 参数
   * @param params.appId 应用id
   * @param params.tradeId 交易id
   */
  refresh: (params: {
    appId: string;
    tradeId: string;
  }) => any


  /**
   * 获取以用户方式加入的应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.userId 交接用户id
   */
  getUserIdApps: (params: {
    projectId: string;
    userId: string;
  }) => any


  /**
   * 交接应用角色
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.removeUserId 要移除的 用户Id
   * @param params.addUserId 新添加的用户Id（可空，空时 = 仅移除）
   * @param params.roles 
   */
  replaceRoleMemberForApps: (params: {
    projectId: string;
    removeUserId: string;
    addUserId: string;
    roles: Array;
  }) => any


  /**
   * 组织下加入的应用
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.userId 用户id
   */
  getUserApp: (params: {
    projectId: string;
    userId: string;
  }) => any


  /**
   * 我加入的应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  getMyApp: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 获取网络下应用
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.status 应用状态  0=关闭 1=启用  可空
   * @param params.pageIndex 页数（从1开始）
   * @param params.pageSize 每页显示数
   * @param params.keyword 搜索关键字（支持名称和拥有者名称）
   * @param params.sourceType 来源 默认0=全部，2=过滤分发平台
   * @param params.containsLinks 是否包含链接类型
   * @param params.filterDBType 数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）
   * @param params.dbInstanceId 数据库实例id
   * @param params.createrIds 创建者ids
   */
  getAppsForProject: (params: {
    projectId: string;
    status: integer;
    pageIndex: integer;
    pageSize: integer;
    keyword: string;
    sourceType: integer;
    containsLinks: boolean;
    filterDBType: integer;
    dbInstanceId: string;
    createrIds: Array;
  }) => any


  /**
   * 分页获取网络下应用信息
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.status 应用状态  0=关闭 1=启用  可空
   * @param params.pageIndex 页数（从1开始）
   * @param params.pageSize 每页显示数
   * @param params.keyword 搜索关键字（支持名称和拥有者名称）
   * @param params.sourceType 来源 默认0=全部，2=过滤分发平台
   * @param params.containsLinks 是否包含链接类型
   * @param params.filterDBType 数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）
   * @param params.dbInstanceId 数据库实例id
   * @param params.createrIds 创建者ids
   */
  getAppsByProject: (params: {
    projectId: string;
    status: integer;
    pageIndex: integer;
    pageSize: integer;
    keyword: string;
    sourceType: integer;
    containsLinks: boolean;
    filterDBType: integer;
    dbInstanceId: string;
    createrIds: Array;
  }) => any


  /**
   * 获取应用信息（批量）
   * @param params 参数
   * @param params.appIds 
   */
  getApps: (params: {
    appIds: Array;
  }) => any


  /**
   * 获取导出相关功能模块token
   * @param params 参数
   * @param params.worksheetId 
   * @param params.viewId 
   * @param params.projectId 网络id ，TokenType = 4或6时，这个必穿
   */
  getToken: (params: {
    worksheetId: string;
    viewId: string;
    projectId: string;
  }) => any


  /**
   * 更新应用状态
   * @param params 参数
   * @param params.appId 应用id（原应用包id）
   * @param params.status 状态  0=关闭 1=启用 2=删除
   * @param params.projectId 网络id
   */
  editAppStatus: (params: {
    appId: string;
    status: integer;
    projectId: string;
  }) => any


  /**
   * 检测是否是网络后台应用管理员
   * @param params 参数
   * @param params.projectId 网络id
   */
  checkIsAppAdmin: (params: {
    projectId: string;
  }) => any


  /**
   * 验证用户是否在应用管理员中
   * @param params 参数
   * @param params.appId 应用id
   */
  checkAppAdminForUser: (params: {
    appId: string;
  }) => any


  /**
   * 把自己加入应用管理员(后台)
   * @param params 参数
   * @param params.appId 应用id
   */
  addRoleMemberForAppAdmin: (params: {
    appId: string;
  }) => any


  /**
   * 移动分组下项到另外一个分组（如果是同一应用下应用id相同即可）
   * @param params 参数
   * @param params.sourceAppId 来源应用id
   * @param params.resultAppId 目标应用id
   * @param params.sourceAppSectionId 来源应用分组id
   * @param params.resultAppSectionId 目标应用分组id
   * @param params.workSheetsInfo 基础信息集合
   */
  removeWorkSheetAscription: (params: {
    sourceAppId: string;
    resultAppId: string;
    sourceAppSectionId: string;
    resultAppSectionId: string;
    workSheetsInfo: Array;
  }) => any


  /**
   * 删除应用分组下项(工作表，自定义页面)
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 组织id
   * @param params.appSectionId 应用分组id
   * @param params.workSheetId id
   * @param params.type 类型 0=工作表，1=自定义页面
   * @param params.isPermanentlyDelete 是否永久删除 true-表示永久删除 false-表示到回收站
   */
  removeWorkSheetForApp: (params: {
    appId: string;
    projectId: string;
    appSectionId: string;
    workSheetId: string;
    type: integer;
    isPermanentlyDelete: boolean;
  }) => any


  /**
   * 分页获取应用项回收站列表
   * @param params 参数
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.projectId 组织id
   * @param params.appId 应用id
   * @param params.keyword 关键字搜索
   */
  getAppItemRecoveryList: (params: {
    pageIndex: integer;
    pageSize: integer;
    projectId: string;
    appId: string;
    keyword: string;
  }) => any


  /**
   * @param {Object} args 请求参数
   * @param params 参数
   * @param params.id 应用项回收站记录id
   * @param params.projectId 组织id
   * @param params.appId 应用id
   */
  appItemRecovery: (params: {
    id: string;
    projectId: string;
    appId: string;
  }) => any


  /**
   * 修改分组下实体名称和图标
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId 应用分组id
   * @param params.workSheetId id
   * @param params.workSheetName 名称
   * @param params.icon 图标
   * @param params.type 类型
   * @param params.urlTemplate 链接
   * @param params.configuration 链接配置
   * @param params.resume 摘要
   */
  editWorkSheetInfoForApp: (params: {
    appId: string;
    appSectionId: string;
    workSheetId: string;
    workSheetName: string;
    icon: string;
    type: integer;
    urlTemplate: string;
    configuration: object;
    resume: string;
  }) => any


  /**
   * 变更应用拥有者
   * @param params 参数
   * @param params.appId 应用id
   * @param params.memberId 新的应用拥有者
   */
  updateAppOwner: (params: {
    appId: string;
    memberId: string;
  }) => any


  /**
   * 应用分组下新增项
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId SectionId
   * @param params.name 名称
   * @param params.icon Logo
   * @param params.type 类型 0=工作表 1=自定义页面
   * @param params.createType 创建类型（创建自定义页面得时候需要传）0-表示普通 1-表示外部链接
   * @param params.urlTemplate 链接
   * @param params.configuration 链接配置
   */
  addWorkSheet: (params: {
    appId: string;
    appSectionId: string;
    name: string;
    icon: string;
    type: integer;
    createType: integer;
    urlTemplate: string;
    configuration: object;
  }) => any


  /**
   * 新增工作表（级联数据源及子表）
   * @param params 参数
   * @param params.worksheetId 原始工作表id
   * @param params.name 
   * @param params.worksheetType 1：普通表 2：子表
   * @param params.createLayer 直接创建层级视图
   */
  addSheet: (params: {
    worksheetId: string;
    name: string;
    worksheetType: integer;
    createLayer: boolean;
  }) => any


  /**
   * 转换工作表
   * @param params 参数
   * @param params.sourceWorksheetId 来源工作表id
   * @param params.worksheetId 子表id
   * @param params.name 子表名称
   */
  changeSheet: (params: {
    sourceWorksheetId: string;
    worksheetId: string;
    name: string;
  }) => any


  /**
   * 复制自定义页面
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId SectionId
   * @param params.name 名称
   * @param params.id 自定义页面id
   */
  copyCustomPage: (params: {
    appId: string;
    appSectionId: string;
    name: string;
    id: string;
  }) => any


  /**
   * 新增应用授权
   * @param params 参数
   * @param params.appId 应用id
   * @param params.name 名称
   * @param params.type 权限范围类型 1=全部，2=只读，10=自定义
   * @param params.viewNull 不传视图id不返回数据配置
   * @param params.sheets 工作表权限集（内含视图权限）
   */
  addAuthorize: (params: {
    appId: string;
    name: string;
    type: integer;
    viewNull: boolean;
    sheets: Array;
  }) => any


  /**
   * 获取应用授权
   * @param params 参数
   * @param params.appId 应用id
   */
  getAuthorizes: (params: {
    appId: string;
  }) => any


  /**
   * 获取单个授权的工作表配置
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appKey 应用key
   */
  getAuthorizeSheet: (params: {
    appId: string;
    appKey: string;
  }) => any


  /**
   * 新增授权是获取工作表配置模板
   * @param params 参数
   * @param params.appId AppId
   * @param params.customLink 客户自定义登录链接参数值
   */
  getAuthorizeSheetTemple: (params: {
    appId: string;
    customLink: string;
  }) => any


  /**
   * 编辑应用授权类型
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appKey 应用key
   * @param params.name 名称
   * @param params.type 权限范围类型 1=全部，2=只读
   * @param params.viewNull 不传视图id不返回数据配置
   * @param params.status 授权状态 1-开启 2-关闭 3-删除
   * @param params.sheets 工作表权限集（内含视图权限）
   */
  editAuthorizeStatus: (params: {
    appId: string;
    appKey: string;
    name: string;
    type: integer;
    viewNull: boolean;
    status: integer;
    sheets: Array;
  }) => any


  /**
   * 删除应用授权类型
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appKey 应用key
   */
  deleteAuthorizeStatus: (params: {
    appId: string;
    appKey: string;
  }) => any


  /**
   * 编辑备注
   * @param params 参数
   * @param params.appId 
   * @param params.appKey 
   * @param params.remark 备注
   */
  editAuthorizeRemark: (params: {
    appId: string;
    appKey: string;
    remark: string;
  }) => any


  /**
   * 获取绑定的微信公众号信息
   * @param params 参数
   * @param params.appId AppId
   * @param params.customLink 客户自定义登录链接参数值
   */
  getWeiXinBindingInfo: (params: {
    appId: string;
    customLink: string;
  }) => any


  /**
   * 迁移应用
   * @param params 参数
   * @param params.appId 应用id
   * @param params.dbInstanceId 专属数据库id (迁出为空）
   * @param params.projectId 组织id
   */
  migrate: (params: {
    appId: string;
    dbInstanceId: string;
    projectId: string;
  }) => any


  /**
   * 获取当前应用的的申请信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.pageIndex 页码
   * @param params.size 页大小
   */
  getAppApplyInfo: (params: {
    appId: string;
    pageIndex: integer;
    size: integer;
  }) => any


  /**
   * 申请加入应用
   * @param params 参数
   * @param params.appId 应用id
   * @param params.remark 申请说明
   */
  addAppApply: (params: {
    appId: string;
    remark: string;
  }) => any


  /**
   * 更新应用申请状态
   * @param params 参数
   * @param params.ids 申请信息的id
   * @param params.appId 应用id
   * @param params.status 状态 2=通过，3=拒绝
   * @param params.roleId 角色id（拒绝时可空）
   * @param params.remark 备注，拒绝理由
   */
  editAppApplyStatus: (params: {
    ids: Array;
    appId: string;
    status: integer;
    roleId: string;
    remark: string;
  }) => any


  /**
   * 获取icon（包含系统和自定义）
   * @param params 参数
   * @param params.fileNames 自定义图标名称
   * @param params.projectId 网络id
   * @param params.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
   * @param params.iconType 图标类型 true-表示系统图标 false-自定义图标
   * @param params.categories 分类数组
   */
  getIcon: (params: {
    fileNames: Array;
    projectId: string;
    isLine: boolean;
    iconType: boolean;
    categories: Array;
  }) => any


  /**
   * 添加自定义图标
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.data icon数据
   */
  addCustomIcon: (params: {
    projectId: string;
    data: Array;
  }) => any


  /**
   * 删除自定义图标
   * @param params 参数
   * @param params.fileNames 自定义图标名称
   * @param params.projectId 网络id
   * @param params.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
   * @param params.iconType 图标类型 true-表示系统图标 false-自定义图标
   * @param params.categories 分类数组
   */
  deleteCustomIcon: (params: {
    fileNames: Array;
    projectId: string;
    isLine: boolean;
    iconType: boolean;
    categories: Array;
  }) => any


  /**
   * 获取自定义图标
   * @param params 参数
   * @param params.fileNames 自定义图标名称
   * @param params.projectId 网络id
   * @param params.isLine 线性图标或者面性图标 true表示线性，false表示面性，默认值为true
   * @param params.iconType 图标类型 true-表示系统图标 false-自定义图标
   * @param params.categories 分类数组
   */
  getCustomIconByProject: (params: {
    fileNames: Array;
    projectId: string;
    isLine: boolean;
    iconType: boolean;
    categories: Array;
  }) => any


  /**
   * 获取分类和首页信息
   * @param params 参数
   * @param params.isCategory 是否只加载分类信息
   */
  getAppsCategoryInfo: (params: {
    isCategory: boolean;
  }) => any


  /**
   * 获取分类下应用库模板列表
   * @param params 参数
   * @param params.categoryId 分类id
   */
  getAppsLibraryInfo: (params: {
    categoryId: string;
  }) => any


  /**
   * 安装应用
   * @param params 参数
   * @param params.libraryId 应用库id
   * @param params.projectId 网络id
   */
  installApp: (params: {
    libraryId: string;
    projectId: string;
  }) => any


  /**
   * 获取单个应用库模板详情
   * @param params 参数
   * @param params.libraryId 应用库id
   * @param params.projectId 网络ud
   */
  getAppLibraryDetail: (params: {
    libraryId: string;
    projectId: string;
  }) => any


  /**
   * 获取应用库FileUrl Token
   * @param params 参数
   * @param params.libraryId 
   * @param params.projectId 安装目标网络id
   */
  getLibraryToken: (params: {
    libraryId: string;
    projectId: string;
  }) => any


  /**
   * 获取日志
   * @param params 参数
   * @param params.projectId 
   * @param params.keyword 搜索关键字
   * @param params.handleType 操作类型 1=创建 2=开启 3=关闭 4=删除 5=导出 6=导入
   * @param params.start 开始时间
   * @param params.end 结束时间
   * @param params.pageIndex 
   * @param params.pageSize 
   */
  getLogs: (params: {
    projectId: string;
    keyword: string;
    handleType: integer;
    start: string;
    end: string;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 获取导出记录
   * @param params 参数
   * @param params.appId 
   * @param params.pageIndex 
   * @param params.pageSize 
   */
  getExportsByApp: (params: {
    appId: string;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 导出密码
   * @param params 参数
   * @param params.id 日志id
   * @param params.appId 应用id
   * @param params.passwordType 0 = 导出密码，1 = 锁定密码
   */
  getExportPassword: (params: {
    id: string;
    appId: string;
    passwordType: integer;
  }) => any


  /**
   * 创建工作流CSM
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.name 实体名称
   */
  addWorkflow: (params: {
    projectId: string;
    name: string;
  }) => any


  /**
   * 获取应用实体分享信息
   * @param params 参数
   * @param params.sourceId 分享来源id （页面id，图标id等）
   * @param params.appId 应用id
   */
  getEntityShare: (params: {
    sourceId: string;
    appId: string;
  }) => any


  /**
   * 修改应用实体分享信息
   * @param params 参数
   * @param params.sourceId 分享来源id （页面id，图标id等）
   * @param params.sourceType 分享类型  21 =自定义页面，31 = 图表
   * @param params.status 状态  0 = 关闭，1 =启用
   * @param params.password 密码
   * @param params.validTime 有效时间
   * @param params.pageTitle 页面标题
   */
  editEntityShareStatus: (params: {
    sourceId: string;
    sourceType: integer;
    status: integer;
    password: string;
    validTime: string;
    pageTitle: string;
  }) => any


  /**
   * 获取分享基础信息
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.id 分享id
   * @param params.password 密码
   * @param params.clientId 客户端id
   */
  getEntityShareById: (params: {
    ticket: string;
    randStr: string;
    id: string;
    password: string;
    clientId: string;
  }) => any


  /**
   * 删除应用备份文件
   * @param params 参数
   * @param params.projectId 
   * @param params.appId 应用id
   * @param params.id 应用备份操作日志Id
   * @param params.fileName 应用备份的文件名
   */
  deleteBackupFile: (params: {
    projectId: string;
    appId: string;
    id: string;
    fileName: string;
  }) => any


  /**
   * 分页获取应用备份还原操作日志
   * @param params 参数
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.projectId 组织id
   * @param params.appId 应用Id
   * @param params.isBackup 是否为获取备份文件列表，true表示获取备份文件列表，false表示获取操作日志列表
   * @param params.accountId 操作人
   * @param params.startTime 开始时间
   * @param params.endTime 结束时间
   */
  pageGetBackupRestoreOperationLog: (params: {
    pageIndex: integer;
    pageSize: integer;
    projectId: string;
    appId: string;
    isBackup: boolean;
    accountId: string;
    startTime: string;
    endTime: string;
  }) => any


  /**
   * 获取应用数量信息
   * @param params 参数
   * @param params.appId AppId
   * @param params.customLink 客户自定义登录链接参数值
   */
  getAppSupportInfo: (params: {
    appId: string;
    customLink: string;
  }) => any


  /**
   * 重命名应用备份文件
   * @param params 参数
   * @param params.projectId 
   * @param params.appId 应用id
   * @param params.id 应用备份操作日志Id
   * @param params.fileName 备份新名称
   * @param params.fileOldName 备份新名称
   */
  renameBackupFileName: (params: {
    projectId: string;
    appId: string;
    id: string;
    fileName: string;
    fileOldName: string;
  }) => any


  /**
   * 获取有效备份文件信息
   * @param params 参数
   * @param params.projectId 
   * @param params.appId 应用id
   */
  getValidBackupFileInfo: (params: {
    projectId: string;
    appId: string;
  }) => any


  /**
   * 还原应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.appId 应用id
   * @param params.id 备份还原操作日志id
   * @param params.autoEndMaintain 是否自动结束应用维护状态
   * @param params.backupCurrentVersion 备份当前版本
   * @param params.isRestoreNew 是否还原为新应用
   * @param params.containData 是否还原数据
   * @param params.fileUrl 文件链接
   * @param params.fileName 文件名称
   * @param params.dbInstanceId 数据库实例id
   */
  restore: (params: {
    projectId: string;
    appId: string;
    id: string;
    autoEndMaintain: boolean;
    backupCurrentVersion: boolean;
    isRestoreNew: boolean;
    containData: boolean;
    fileUrl: string;
    fileName: string;
    dbInstanceId: string;
  }) => any


  /**
   * 还原数据
   * @param params 参数
   * @param params.id 任务id
   * @param params.projectId 组织id
   * @param params.appId 应用id
   * @param params.fileUrl 文件链接
   * @param params.fileName 文件名称
   * @param params.backupCurrentVersion 备份当前版本
   * @param params.dbInstanceId 数据库实例id
   */
  restoreData: (params: {
    id: string;
    projectId: string;
    appId: string;
    fileUrl: string;
    fileName: string;
    backupCurrentVersion: boolean;
    dbInstanceId: string;
  }) => any


  /**
   * 备份应用
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.containData 是否备份数据
   */
  backup: (params: {
    appId: string;
    containData: boolean;
  }) => any


  /**
   * 校验还原文件
   * @param params 参数
   * @param params.appId 应用id
   * @param params.fileUrl 文件url
   * @param params.fileName 文件名称
   */
  checkRestoreFile: (params: {
    appId: string;
    fileUrl: string;
    fileName: string;
  }) => any


  /**
   * 获取tar文件上传状态
   * @param params 参数
   * @param params.id 任务id
   */
  getTarTaskInfo: (params: {
    id: string;
  }) => any


  /**
   * 使用情况统计分析
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.departmentId 部门id
   * @param params.depFlag true表示仅当强部门，false表示部门树
   * @param params.appId 应用id
   * @param params.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
   * @param params.dateDemension &#34;1h&#34;:1小时 &#34;1d&#34;:1天 &#34;1w&#34;:1周 &#34;1M&#34;:1月 &#34;1q&#34;:1季度 &#34;1y&#34;:1年
   * @param params.isApp 表示是否是应用的使用分析
   */
  allUsageOverviewStatistics: (params: {
    projectId: string;
    departmentId: string;
    depFlag: boolean;
    appId: string;
    dayRange: integer;
    dateDemension: string;
    isApp: boolean;
  }) => any


  /**
   * 应用汇总概览
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.keyWord 关键字搜索
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.sortFiled 排序字段
   * @param params.sorted 排序方式 true--asc false--desc
   * @param params.appId 应用id
   */
  appUsageOverviewStatistics: (params: {
    projectId: string;
    keyWord: string;
    pageIndex: integer;
    pageSize: integer;
    sortFiled: string;
    sorted: boolean;
    appId: string;
  }) => any


  /**
   * 不同维度使用情况统计(按应用，按成员)
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.dayRange 天数范围 0 = 最近7天，1 = 最近一个月，2=最近一个季度，3=最近半年，4=最近一年
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.dimension 维度 1-应用 2-用户
   * @param params.sortFiled 排序字段（返回结果的列名，例如:appAccess）
   * @param params.sorted 排序方式
   * @param params.keyword 关键词查询
   * @param params.appId 应用id
   */
  usageStatisticsForDimension: (params: {
    projectId: string;
    dayRange: integer;
    pageIndex: integer;
    pageSize: integer;
    dimension: integer;
    sortFiled: string;
    sorted: boolean;
    keyword: string;
    appId: string;
  }) => any


  /**
   * 获取应用日志
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.operators 操作人id数组
   * @param params.appIds 应用id数组
   * @param params.worksheetIds 工作表id数组
   * @param params.modules 所属日志模块
   * @param params.operationTypes 操作类型
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.columnNames 列名称
   * @param params.menuName 菜单名称
   * @param params.startDateTime 开始时间
   * @param params.endDateTime 结束时间
   * @param params.confirmExport 是否确认导出(超量的情况下传)
   * @param params.isSingle 是否是单个应用
   */
  getGlobalLogs: (params: {
    projectId: string;
    operators: Array;
    appIds: Array;
    worksheetIds: Array;
    modules: Array;
    operationTypes: Array;
    pageIndex: integer;
    pageSize: integer;
    columnNames: Array;
    menuName: string;
    startDateTime: string;
    endDateTime: string;
    confirmExport: boolean;
    isSingle: boolean;
  }) => any


  /**
   * 归档日志查询
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.operators 操作人id数组
   * @param params.appIds 应用id数组
   * @param params.worksheetIds 工作表id数组
   * @param params.modules 所属日志模块
   * @param params.operationTypes 操作类型
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.columnNames 列名称
   * @param params.menuName 菜单名称
   * @param params.startDateTime 开始时间
   * @param params.endDateTime 结束时间
   * @param params.confirmExport 是否确认导出(超量的情况下传)
   * @param params.isSingle 是否是单个应用
   * @param params.archivedId 归档id
   */
  getArchivedGlobalLogs: (params: {
    projectId: string;
    operators: Array;
    appIds: Array;
    worksheetIds: Array;
    modules: Array;
    operationTypes: Array;
    pageIndex: integer;
    pageSize: integer;
    columnNames: Array;
    menuName: string;
    startDateTime: string;
    endDateTime: string;
    confirmExport: boolean;
    isSingle: boolean;
    archivedId: string;
  }) => any


  /**
   * 获取归档
   * @param params 参数
   * @param params.projectId 
   * @param params.appId 
   */
  getArchivedList: (params: {
    projectId: string;
    appId: string;
  }) => any


  /**
   * 获取应用下工作表信息
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.appIds 应用ids
   * @param params.isFilterCustomPage 是否过滤自定义页面
   */
  getWorksheetsUnderTheApp: (params: {
    projectId: string;
    appIds: Array;
    isFilterCustomPage: boolean;
  }) => any


  /**
   * 开启密码锁
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 
   * @param params.password 
   */
  addLock: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    password: string;
  }) => any


  /**
   * map解锁
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 
   * @param params.password 
   */
  unlock: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    password: string;
  }) => any


  /**
   * 修改锁定密码
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 
   * @param params.password 
   * @param params.newPassword 
   */
  editLockPassword: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    password: string;
    newPassword: string;
  }) => any


  /**
   * 重新锁定
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 应用id
   * @param params.getSection 是否获取分组信息
   * @param params.getManager 是否获取管理员列表信息
   * @param params.getProject 获取组织信息
   * @param params.getLang 是否获取应用语种信息
   * @param params.isMobile 是否是移动端
   */
  resetLock: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    getSection: boolean;
    getManager: boolean;
    getProject: boolean;
    getLang: boolean;
    isMobile: boolean;
  }) => any


  /**
   * 关闭应用锁
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 应用id
   * @param params.getSection 是否获取分组信息
   * @param params.getManager 是否获取管理员列表信息
   * @param params.getProject 获取组织信息
   * @param params.getLang 是否获取应用语种信息
   * @param params.isMobile 是否是移动端
   */
  closeLock: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    getSection: boolean;
    getManager: boolean;
    getProject: boolean;
    getLang: boolean;
    isMobile: boolean;
  }) => any


  /**
   * 市场已安装应用升级校验
   * @param params 参数
   * @param params.tradeId 已购应用详情id
   * @param params.id 历史版本id
   */
  marketAppUpgrade: (params: {
    tradeId: string;
    id: string;
  }) => any


  /**
   * 执行市场已安装应用升级
   * @param params 参数
   * @param params.id 批次id
   * @param params.worksheets 勾选的升级的表
   * @param params.workflows 勾选升级的流
   * @param params.pages 勾选升级的页面
   * @param params.roles 勾选升级的角色
   * @param params.backupCurrentVersion 备份当前版本
   * @param params.matchOffice 是否匹配用户
   * @param params.upgradeStyle 是否升级应用外观导航
   * @param params.upgradeLang 是否升级语言
   * @param params.upgradeTimeZone 是否升级时区
   * @param params.upgradeName 是否升级名称
   * @param params.upgradeHide 是否升级显影配置
   */
  marketUpgrade: (params: {
    id: string;
    worksheets: Array;
    workflows: Array;
    pages: Array;
    roles: Array;
    backupCurrentVersion: boolean;
    matchOffice: boolean;
    upgradeStyle: boolean;
    upgradeLang: boolean;
    upgradeTimeZone: boolean;
    upgradeName: boolean;
    upgradeHide: boolean;
  }) => any


  /**
   * 校验升级文件
   * @param params 参数
   * @param params.appId 应用id
   * @param params.url 文件url
   * @param params.password 密码
   * @param params.fileName 文件名
   * @param params.batchId 批量导入升级的批次id
   */
  checkUpgrade: (params: {
    appId: string;
    url: string;
    password: string;
    fileName: string;
    batchId: string;
  }) => any


  /**
   * 获取表升级详情
   * @param params 参数
   * @param params.id 
   * @param params.worksheetId 工作表id
   * @param params.appId 
   * @param params.batchId 批量升级批次id
   */
  getWorksheetUpgrade: (params: {
    id: string;
    worksheetId: string;
    appId: string;
    batchId: string;
  }) => any


  /**
   * 升级
   * @param params 参数
   * @param params.id 批次id
   * @param params.appId 应用id
   * @param params.url 导入文件链接（不带token的）
   * @param params.worksheets 勾选的升级的表
   * @param params.workflows 勾选升级的流
   * @param params.pages 勾选升级的页面
   * @param params.roles 勾选升级的角色
   * @param params.backupCurrentVersion 备份当前版本
   * @param params.matchOffice 是否匹配用户
   * @param params.upgradeStyle 是否升级应用外观导航
   * @param params.upgradeLang 是否升级语言
   * @param params.upgradeTimeZone 是否升级时区
   * @param params.upgradeName 是否升级名称
   * @param params.upgradeHide 是否升级显影配置
   */
  upgrade: (params: {
    id: string;
    appId: string;
    url: string;
    worksheets: Array;
    workflows: Array;
    pages: Array;
    roles: Array;
    backupCurrentVersion: boolean;
    matchOffice: boolean;
    upgradeStyle: boolean;
    upgradeLang: boolean;
    upgradeTimeZone: boolean;
    upgradeName: boolean;
    upgradeHide: boolean;
  }) => any


  /**
   * 获取应用升级记录
   * @param params 参数
   * @param params.appId 应用id
   * @param params.tradeId 交易id
   */
  getUpgradeLogs: (params: {
    appId: string;
    tradeId: string;
  }) => any


  /**
   * 获取mdy文件相关密码
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.url 文件url不带token
   * @param params.name 文件名称
   */
  getMdyInfo: (params: {
    projectId: string;
    url: string;
    name: string;
  }) => any


  /**
   * 批量导出应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.password 密码
   * @param params.locked 是否加锁
   * @param params.lockPassword 锁密码
   * @param params.appConfigs 导出应用配置
   */
  batchExportApp: (params: {
    projectId: string;
    password: string;
    locked: boolean;
    lockPassword: string;
    appConfigs: Array;
  }) => any


  /**
   * 获取组织下同源应用列表
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.unionId 同源id
   * @param params.status 应用状态  0=关闭 1=启用  （可空 ，不传查全部）
   * @param params.pageIndex 页数（从1开始）
   * @param params.pageSize 每页显示数
   * @param params.keyword 搜索关键字（支持名称和拥有者名称）
   * @param params.filterDBType 数据筛选类型（0：全部，1= 默认数据库，2 =专属数据库，DbInstanceId传具体id）
   * @param params.dbInstanceId 数据库实例id
   * @param params.excludeAppIds 需要排除的应用id数组
   */
  getsByUnionId: (params: {
    projectId: string;
    unionId: string;
    status: integer;
    pageIndex: integer;
    pageSize: integer;
    keyword: string;
    filterDBType: integer;
    dbInstanceId: string;
    excludeAppIds: Array;
  }) => any


  /**
   * 获取批量导入升级批次id
   * @param params 参数
   * @param params.projectId 组织id
   */
  getBatchId: (params: {
    projectId: string;
  }) => any


  /**
   * 校验批量升级mdy文件
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.batchId 
   * @param params.url mdy链接（不要带token）
   * @param params.password mdy密码
   * @param params.removed 是否是移除mdy操作
   */
  batchImportCheck: (params: {
    projectId: string;
    batchId: string;
    url: string;
    password: string;
    removed: boolean;
  }) => any


  /**
   * 批量导入升级
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.batchId 批次id
   * @param params.datas 批量导入升级业务数据
   * @param params.matchOffice 是否匹配组织人员等信息
   * @param params.backupCurrentVersion 是否备份当前应用
   * @param params.upgradeStyle 是否升级应用外观导航
   * @param params.upgradeLang 是否升级语言
   * @param params.upgradeTimeZone 是否升级时区
   * @param params.upgradeName 是否升级名称
   * @param params.upgradeHide 是否升级显影配置
   */
  batchImport: (params: {
    projectId: string;
    batchId: string;
    datas: Array;
    matchOffice: boolean;
    backupCurrentVersion: boolean;
    upgradeStyle: boolean;
    upgradeLang: boolean;
    upgradeTimeZone: boolean;
    upgradeName: boolean;
    upgradeHide: boolean;
  }) => any


  /**
   * 获取应用语种列表
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 应用id
   */
  getAppLangs: (params: {
    appId: string;
    projectId: string;
  }) => any


  /**
   * 创建应用语言
   * @param params 参数
   * @param params.appId 应用id
   * @param params.langCode 应用语种数组
   * @param params.projectId 
   */
  createAppLang: (params: {
    appId: string;
    langCode: Array;
    projectId: string;
  }) => any


  /**
   * 删除应用语言
   * @param params 参数
   * @param params.appId 应用id
   * @param params.id 应用语种id
   * @param params.projectId 
   */
  deleteAppLang: (params: {
    appId: string;
    id: string;
    projectId: string;
  }) => any


  /**
   * 获取应用语言详情
   * @param params 参数
   * @param params.appId 
   * @param params.appLangId 
   */
  getAppLangDetail: (params: {
    appId: string;
    appLangId: string;
  }) => any


  /**
   * 编辑应用语言详情
   * @param params 参数
   * @param params.appId 应用id
   * @param params.langId 语种id
   * @param params.id 节点id
   * @param params.parentId 父级节点id
   * @param params.correlationId 关联id(应用id，分组id，工作表id等等)
   * @param params.data 翻译数据
   * @param params.projectId 
   */
  editAppLang: (params: {
    appId: string;
    langId: string;
    id: string;
    parentId: string;
    correlationId: string;
    data: object;
    projectId: string;
  }) => any


  /**
   * 机器翻译
   * @param params 参数
   * @param params.appId 应用id
   * @param params.comparisonLangId 对照语种id
   * @param params.targetLangId 目标语种id
   * @param params.projectId 组织id
   */
  machineTranslation: (params: {
    appId: string;
    comparisonLangId: string;
    targetLangId: string;
    projectId: string;
  }) => any


  /**
   * @param {Object} args 请求参数
   * @param params 参数
   * @param params.appId 应用id
   */
  getAppStructureForER: (params: {
    appId: string;
  }) => any


  /**
   * 获取组织语言
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.correlationIds 业务模块id（不需要筛选业务，不传就行）
   * @param params.type 业务模块，0 = 组织名称，20 = 应用分组（不需要筛选业务，不传就行），30 = 密码提示
   */
  getProjectLangs: (params: {
    projectId: string;
    correlationIds: Array;
    type: integer;
  }) => any


  /**
   * 批量获取业务类型组织语言
   * @param params 参数
   * @param params.projectIds 
   * @param params.type 业务模块，0 = 组织名称，20 = 应用分组
   */
  getsByProjectIds: (params: {
    projectIds: Array;
    type: integer;
  }) => any


  /**
   * 编辑组织语言
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.correlationId 业务模块id
   * @param params.type 业务模块，0 = 组织名称，20 = 应用分组
   * @param params.data 翻译数据
   */
  editProjectLangs: (params: {
    projectId: string;
    correlationId: string;
    type: integer;
    data: Array;
  }) => any


  /**
   * 编辑密码规则提示多语言
   * @param params 参数
   * @param params.data 翻译数据
   */
  editPasswordRegexTipLangs: (params: {
    data: Array;
  }) => any


  /**
   * 获取组织名称多语言(只能获取名称)
   * @param params 参数
   * @param params.projectId 网络id
   */
  getProjectLang: (params: {
    projectId: string;
  }) => any


  /**
   * 添加离线应用项
   * @param params 参数
   * @param params.appId 应用Id
   * @param params.worksheetId 工作表Id
   */
  addOfflineItem: (params: {
    appId: string;
    worksheetId: string;
  }) => any


  /**
   * 编辑离线应用项
   * @param params 参数
   * @param params.appId 应用id
   * @param params.worksheetId 工作表Id
   * @param params.status 状态 （0 = 关闭，1 = 启用，2 = 删除）
   */
  editOfflineItemStatus: (params: {
    appId: string;
    worksheetId: string;
    status: integer;
  }) => any


  /**
   * 获取离线应用项
   * @param params 参数
   * @param params.appId 应用id
   * @param params.tradeId 交易id
   */
  getOfflineItems: (params: {
    appId: string;
    tradeId: string;
  }) => any


  /**
   * 获取备份定时任务
   * @param params 参数
   * @param params.appId AppId
   * @param params.customLink 客户自定义登录链接参数值
   */
  getBackupTask: (params: {
    appId: string;
    customLink: string;
  }) => any


  /**
   * 修改定时备份任务状态
   * @param params 参数
   * @param params.appId 应用id
   * @param params.status 状态 （0 = 关闭，1 = 启用，2 = 删除）
   */
  editBackupTaskStatus: (params: {
    appId: string;
    status: integer;
  }) => any


  /**
   * 修改定时备份任务信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.cycleType 周期类型 (1= 每天，2 = 每周，3 = 每月)
   * @param params.cycleValue 具体周期值 （日期（1-31），星期（0 = 星期天））
   * @param params.datum 备份数据
   * @param params.status 状态 （0 = 关闭，1 = 启用，2 = 删除）
   */
  editBackupTaskInfo: (params: {
    appId: string;
    cycleType: integer;
    cycleValue: integer;
    datum: boolean;
    status: integer;
  }) => any

};


  /**
   * 应用
   */
  homeApp: {

  /**
   * 添加应用
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.name 名称
   * @param params.icon 图标
   * @param params.iconColor 图标颜色
   * @param params.navColor 导航颜色
   * @param params.lightColor 背景色
   * @param params.groupId 分组id
   * @param params.urlTemplate url链接模板
   * @param params.configuratiuon 链接配置
   * @param params.pcDisplay Pc端显示,
   * @param params.webMobileDisplay web移动端显示
   * @param params.appDisplay app端显示
   * @param params.dbInstanceId 数据库实例id
   */
  createApp: (params: {
    projectId: string;
    name: string;
    icon: string;
    iconColor: string;
    navColor: string;
    lightColor: string;
    groupId: string;
    urlTemplate: string;
    configuratiuon: object;
    pcDisplay: boolean;
    webMobileDisplay: boolean;
    appDisplay: boolean;
    dbInstanceId: string;
  }) => any


  /**
   * 首页删除应用(删除之后进入回收站)
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 网络id
   * @param params.isHomePage 是否首页 true 是 false 否
   */
  deleteApp: (params: {
    appId: string;
    projectId: string;
    isHomePage: boolean;
  }) => any


  /**
   * 分页获取应用回收站
   * @param params 参数
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.projectId 组织id
   * @param params.isHomePage 是否为首页
   * @param params.keyword 关键字搜索
   */
  getAppRecoveryRecordList: (params: {
    pageIndex: integer;
    pageSize: integer;
    projectId: string;
    isHomePage: boolean;
    keyword: string;
  }) => any


  /**
   * 首页应用回收站彻底删除
   * @param params 参数
   * @param params.id 记录id
   * @param params.projectId 网络id
   * @param params.isHomePage 是否首页 true 是 false 否
   */
  appRecycleBinDelete: (params: {
    id: string;
    projectId: string;
    isHomePage: boolean;
  }) => any


  /**
   * 恢复应用
   * @param params 参数
   * @param params.id 记录id
   * @param params.projectId 组织id
   * @param params.isHomePage 是否是首页恢复
   */
  restoreApp: (params: {
    id: string;
    projectId: string;
    isHomePage: boolean;
  }) => any


  /**
   * 编辑应用时区
   * @param params 参数
   * @param params.appId 
   * @param params.timeZone 1 = 跟随设备，其他参考个人设置，一样的code
   */
  editAppTimeZones: (params: {
    appId: string;
    timeZone: integer;
  }) => any


  /**
   * 编辑原始语言
   * @param params 参数
   * @param params.appId 
   * @param params.originalLang 原始语言code
   */
  editAppOriginalLang: (params: {
    appId: string;
    originalLang: string;
  }) => any


  /**
   * 标星应用或应用项
   * @param params 参数
   * @param params.appId 应用id
   * @param params.itemId 应用项id
   * @param params.type 0 = 应用，1 = 自定义页面，2 = 工作表
   * @param params.isMark 是否标星（true or false）
   * @param params.projectId 网络id(可空为个人应用)
   */
  markApp: (params: {
    appId: string;
    itemId: string;
    type: integer;
    isMark: boolean;
    projectId: string;
  }) => any


  /**
   * 编辑应用
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 网络id
   * @param params.name 名称
   * @param params.description 描述
   * @param params.icon 图标
   * @param params.iconColor 图标颜色
   * @param params.appNaviStyle 移动端:0 = 列表 ，1= 九宫格，2= 导航
   * @param params.pcNavistyle PC端:0-经典 1-左侧列表 2-卡片模式，3 = 树形
   * @param params.viewHideNavi 查看影藏导航项
   * @param params.navColor 导航栏颜色
   * @param params.lightColor 淡色色值
   * @param params.gridDisplayMode 宫格显示模式
   * @param params.appNaviDisplayType 移动端导航列表显示类型
   * @param params.urlTemplate 外部链接url
   * @param params.configuration 链接配置
   * @param params.pcDisplay Pc端显示,
   * @param params.webMobileDisplay web移动端显示
   * @param params.appDisplay app端显示
   * @param params.selectAppItmeType 记住上次使用（2 = 是，1 = 老配置，始终第一个）
   * @param params.pcNaviDisplayType 导航分组展开样式（10.2去掉了）
   * @param params.displayIcon 显示图标,目前只有三级（000，111，，0=不勾选，1=勾选）
   * @param params.expandType 展开方式  0 = 默认，1 = 手风琴
   * @param params.hideFirstSection 隐藏首个分组
   * @param params.appNavItemIds 移动端导航应用项ids
   */
  editAppInfo: (params: {
    appId: string;
    projectId: string;
    name: string;
    description: string;
    icon: string;
    iconColor: string;
    appNaviStyle: integer;
    pcNavistyle: integer;
    viewHideNavi: boolean;
    navColor: string;
    lightColor: string;
    gridDisplayMode: integer;
    appNaviDisplayType: integer;
    urlTemplate: string;
    configuration: object;
    pcDisplay: boolean;
    webMobileDisplay: boolean;
    appDisplay: boolean;
    selectAppItmeType: integer;
    pcNaviDisplayType: integer;
    displayIcon: string;
    expandType: integer;
    hideFirstSection: boolean;
    appNavItemIds: Array;
  }) => any


  /**
   * 更新首页应用排序
   * @param params 参数
   * @param params.sortType 排序类型 1= 全部组织星标应用排序，2 = 网络，3= 个人，4= 外部协作，5= 过期网络，6 = 首页应用分组下应用排序，7 = 当前组织星标应用排序， 8 = 我拥有的应用排序
   * @param params.appIds 应用id
   * @param params.projectId 网络id
   * @param params.groupId 首页分组id
   */
  updateAppSort: (params: {
    sortType: integer;
    appIds: Array;
    projectId: string;
    groupId: string;
  }) => any


  /**
   * 复制应用
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appName 新的应用名称
   * @param params.groupId 分组id
   * @param params.dbInstanceId 数据库实例id
   */
  copyApp: (params: {
    appId: string;
    appName: string;
    groupId: string;
    dbInstanceId: string;
  }) => any


  /**
   * 应用发布设置
   * @param params 参数
   * @param params.appId 应用id
   * @param params.projectId 组织id
   * @param params.pcDisplay Pc端显示,
   * @param params.webMobileDisplay web移动端显示
   * @param params.appDisplay app端显示
   */
  publishSettings: (params: {
    appId: string;
    projectId: string;
    pcDisplay: boolean;
    webMobileDisplay: boolean;
    appDisplay: boolean;
  }) => any


  /**
   * 编辑开放接口的白名单
   * @param params 参数
   * @param params.whiteIps 白名单
   * @param params.appId 应用id
   * @param params.projectId 组织id
   */
  editWhiteList: (params: {
    whiteIps: Array;
    appId: string;
    projectId: string;
  }) => any


  /**
   * 更新维护状态
   * @param params 参数
   * @param params.appId 
   * @param params.projectId 
   * @param params.fixed 维护中标识 true,false
   * @param params.fixRemark 维护通知
   */
  editFix: (params: {
    appId: string;
    projectId: string;
    fixed: boolean;
    fixRemark: string;
  }) => any


  /**
   * 编辑sso登录应用首页地址
   * @param params 参数
   * @param params.appId 
   * @param params.ssoAddress 
   */
  editSSOAddress: (params: {
    appId: string;
    ssoAddress: string;
  }) => any


  /**
   * 获取首页所有应用信息
   * @param params 参数
   * @param params.containsLinks 
   */
  getAllHomeApp: (params: {
    containsLinks: boolean;
  }) => any


  /**
   * 获取应用下所有工作表信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.getAlias 是否获取工作表别名(默认不获取)
   */
  getWorksheetsByAppId: (params: {
    appId: string;
    getAlias: boolean;
  }) => any


  /**
   * 获取附件图片列表
   * @param params 参数
   * @param params.workSheetId 工作表id
   * @param params.viewId 视图id
   * @param params.attachementControlId 控件id
   * @param params.imageLimitCount 图片上限数量
   * @param params.displayMode 展示方式（默认值为0） 0-all 1-每条记录第一张
   * @param params.filedIds 工作表字段控件id数组
   */
  getAttachementImages: (params: {
    workSheetId: string;
    viewId: string;
    attachementControlId: string;
    imageLimitCount: integer;
    displayMode: integer;
    filedIds: Array;
  }) => any


  /**
   * 进入应用刷新页面，前端路由匹配接口
   * @param params 参数
   * @param params.id 
   * @param params.sectionId 分组id
   */
  getPageInfo: (params: {
    id: string;
    sectionId: string;
  }) => any


  /**
   * 批量获取应用项信息
   * @param params 参数

   */
  getAppItemDetail: (params: {

  }) => any


  /**
   * 获取应用详情（包含分组信息，请求参数可选）
   * @param params 参数
   * @param params.ticket 验证码返票据
   * @param params.randStr 票据随机字符串
   * @param params.clientId 客户端标识
   * @param params.appId 应用id
   * @param params.getSection 是否获取分组信息
   * @param params.getManager 是否获取管理员列表信息
   * @param params.getProject 获取组织信息
   * @param params.getLang 是否获取应用语种信息
   * @param params.isMobile 是否是移动端
   */
  getApp: (params: {
    ticket: string;
    randStr: string;
    clientId: string;
    appId: string;
    getSection: boolean;
    getManager: boolean;
    getProject: boolean;
    getLang: boolean;
    isMobile: boolean;
  }) => any


  /**
   * 验证应用有效性
   * @param params 参数
   * @param params.appId 应用id
   * @param params.tradeId 交易id
   */
  checkApp: (params: {
    appId: string;
    tradeId: string;
  }) => any


  /**
   * 获取应用下分组和第一个工作表信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId SectionId
   */
  getAppFirstInfo: (params: {
    appId: string;
    appSectionId: string;
  }) => any


  /**
   * 获取简单应用id及分组id
   * @param params 参数
   * @param params.workSheetId 工作表id
   */
  getAppSimpleInfo: (params: {
    workSheetId: string;
  }) => any


  /**
   * 根据应用分组id获取详情
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId 分组id
   */
  getAppSectionDetail: (params: {
    appId: string;
    appSectionId: string;
  }) => any


  /**
   * 添加应用分组
   * @param params 参数
   * @param params.appId 应用id
   * @param params.name 分组名称
   * @param params.icon 分组图标
   * @param params.iconColor 分组图标颜色
   * @param params.sourceAppSectionId 来源应用分组id（在此后添加应用分组）
   * @param params.parentId 父级分组id（除了创建一级分组外不需要传，其他都需要传）
   * @param params.rootId 根分组id（除了创建一级分组外不需要传,其他都需要传,参数值为一级分组的id）
   */
  addAppSection: (params: {
    appId: string;
    name: string;
    icon: string;
    iconColor: string;
    sourceAppSectionId: string;
    parentId: string;
    rootId: string;
  }) => any


  /**
   * 修改应用分组名称
   * @param params 参数
   * @param params.appId 应用id
   * @param params.name 名称
   * @param params.appSectionId 分组id
   */
  updateAppSectionName: (params: {
    appId: string;
    name: string;
    appSectionId: string;
  }) => any


  /**
   * 修改分组基础信息信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId 分组id
   * @param params.appSectionName 分组名称
   * @param params.icon 图标
   * @param params.iconColor 图标颜色
   */
  updateAppSection: (params: {
    appId: string;
    appSectionId: string;
    appSectionName: string;
    icon: string;
    iconColor: string;
  }) => any


  /**
   * 删除应用分组（并移动该项下工作表到其他应用分组）
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId 删除应用分组Id
   * @param params.sourceAppSectionId 目标应用分组id
   */
  deleteAppSection: (params: {
    appId: string;
    appSectionId: string;
    sourceAppSectionId: string;
  }) => any


  /**
   * 更新应用分组排序信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionIds 删除应用分组Id
   */
  updateAppSectionSort: (params: {
    appId: string;
    appSectionIds: Array;
  }) => any


  /**
   * 更新应用分组下工作表排序信息
   * @param params 参数
   * @param params.appId 应用id
   * @param params.appSectionId 分组id
   * @param params.workSheetIds 排序后的完整ids
   */
  updateSectionChildSort: (params: {
    appId: string;
    appSectionId: string;
    workSheetIds: Array;
  }) => any


  /**
   * 设置应用项显示隐藏
   * @param params 参数
   * @param params.appId 应用id
   * @param params.worksheetId 工作表id
   * @param params.status 状态(1= 显示，2 = 全隐藏，3 = PC隐藏，4 = 移动端隐藏)
   */
  setWorksheetStatus: (params: {
    appId: string;
    worksheetId: string;
    status: integer;
  }) => any


  /**
   * 获取应用open api文档
   * @param params 参数
   * @param params.appId 应用id
   * @param params.notOnSettingPage 不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）
   */
  getApiInfo: (params: {
    appId: string;
    notOnSettingPage: boolean;
  }) => any


  /**
   * 获取我的应用
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.containsLinks 是否包含外部链接
   * @param params.getMarkApp 是否获取标记 (默认获取，10.1新版本后可以不用获取)
   */
  getMyApp: (params: {
    projectId: string;
    containsLinks: boolean;
    getMarkApp: boolean;
  }) => any


  /**
   * 获取首页分组详情
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.containsLinks 是否包含外部链接
   * @param params.getMarkApp 是否获取标记 (默认获取，10.1新版本后可以不用获取)
   * @param params.id 首页分组id
   */
  getGroup: (params: {
    projectId: string;
    containsLinks: boolean;
    getMarkApp: boolean;
    id: string;
  }) => any


  /**
   * 添加应用到分组下
   * @param params 参数
   * @param params.appId 应用id
   * @param params.personalGroups 个人分组ids
   * @param params.projectGroups 网络分组ids
   */
  addToGroup: (params: {
    appId: string;
    personalGroups: Array;
    projectGroups: Array;
  }) => any


  /**
   * 应用从分组下移除
   * @param params 参数
   * @param params.appId 应用id
   * @param params.personalGroups 个人分组ids
   * @param params.projectGroups 网络分组ids
   */
  removeToGroup: (params: {
    appId: string;
    personalGroups: Array;
    projectGroups: Array;
  }) => any


  /**
   * 标星分组
   * @param params 参数
   * @param params.id 分组id
   * @param params.projectId 
   * @param params.isMarked 
   */
  markedGroup: (params: {
    id: string;
    projectId: string;
    isMarked: boolean;
  }) => any


  /**
   * 新增首页分组
   * @param params 参数
   * @param params.projectId 
   * @param params.name 
   * @param params.icon 
   */
  addGroup: (params: {
    projectId: string;
    name: string;
    icon: string;
  }) => any


  /**
   * 编辑分组信息
   * @param params 参数
   * @param params.id 分组id
   * @param params.projectId 
   * @param params.name 
   * @param params.icon 
   */
  editGroup: (params: {
    id: string;
    projectId: string;
    name: string;
    icon: string;
  }) => any


  /**
   * 删除分组
   * @param params 参数
   * @param params.id 分组id
   * @param params.projectId 
   */
  deleteGroup: (params: {
    id: string;
    projectId: string;
  }) => any


  /**
   * 分组排序
   * @param params 参数
   * @param params.projectId 
   * @param params.ids 分组ids ，排好序传过来
   * @param params.sortType 排序类型 1= 星标，2 = 网络，3= 个人，
   */
  editGroupSort: (params: {
    projectId: string;
    ids: Array;
    sortType: integer;
  }) => any


  /**
   * 修改首页自定义显示设置
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.exDisplay 是否显示外部应用
   * @param params.displayCommonApp 是否显示常用应用
   * @param params.isAllAndProject 是否开启全部和组织分组
   * @param params.displayMark 是否显示星标应用
   * @param params.rowCollect 记录收藏
   * @param params.displayApp 工作台左侧菜单是否显示app
   * @param params.displayChart 图表收藏开关
   * @param params.sortItems 排序
   */
  editHomeSetting: (params: {
    projectId: string;
    exDisplay: boolean;
    displayCommonApp: boolean;
    isAllAndProject: boolean;
    displayMark: boolean;
    rowCollect: boolean;
    displayApp: boolean;
    displayChart: boolean;
    sortItems: Array;
  }) => any


  /**
   * 批量标记应用和应用项目
   * @param params 参数
   * @param params.items 标记的应用和应用项
   * @param params.projectId 组织id
   */
  markApps: (params: {
    items: Array;
    projectId: string;
  }) => any


  /**
   * 编辑平台设置
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.bulletinBoards 宣传栏
   * @param params.color 颜色
   * @param params.slogan 标语
   * @param params.logo 组织logo
   * @param params.logoSwitch logo开关
   * @param params.boardSwitch 宣传栏目开关
   * @param params.logoHeight logo高度
   * @param params.advancedSetting 
   */
  editPlatformSetting: (params: {
    projectId: string;
    bulletinBoards: Array;
    color: string;
    slogan: string;
    logo: string;
    logoSwitch: boolean;
    boardSwitch: boolean;
    logoHeight: integer;
    advancedSetting: object;
  }) => any


  /**
   * 工作台
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  myPlatform: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 收藏的应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  marketApps: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 最近访问应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  recentApps: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 获取工作台ids（测试用）
   * @param params 参数

   */
  getAppIdsAndItemIdsTest: (params: {

  }) => any


  /**
   * 工作台多语言
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  myPlatformLang: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 获取应用下应用项
   * @param params 参数
   * @param params.appId 应用id
   * @param params.tradeId 交易id
   */
  getAppItems: (params: {
    appId: string;
    tradeId: string;
  }) => any


  /**
   * 获取平台设置
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  getHomePlatformSetting: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 我拥有的应用
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.noCache 不走缓存
   */
  getOwnedApp: (params: {
    projectId: string;
    noCache: boolean;
  }) => any


  /**
   * 获取可用的专属数据库列表
   * @param params 参数
   * @param params.projectId 
   */
  getMyDbInstances: (params: {
    projectId: string;
  }) => any

};


  /**
   * 操作日志
   */
  actionLog: {

  /**
   * 获取登录日志列表
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.pageIndex 当前页码
   * @param params.pageSize 页面尺寸
   * @param params.startDateTime 开始时间
   * @param params.endDateTime 结束时间
   * @param params.accountIds 用户ID
   * @param params.columnNames 列名称
   * @param params.fileName 导出文件名
   * @param params.confirmExport 是否确认导出(超量的情况下传)
   */
  getActionLogs: (params: {
    projectId: string;
    pageIndex: integer;
    pageSize: integer;
    startDateTime: string;
    endDateTime: string;
    accountIds: Array;
    columnNames: Array;
    fileName: string;
    confirmExport: boolean;
  }) => any


  /**
   * 获取组织管理日志列表
   * @param params 参数
   * @param params.projectId 网络id
   * @param params.pageIndex 当前页码
   * @param params.pageSize 页面尺寸
   * @param params.startDateTime 开始时间
   * @param params.endDateTime 结束时间
   * @param params.accountIds 用户ID
   * @param params.fileName 文件名
   * @param params.columnNames 列名称
   * @param params.confirmExport 是否确认导出(超量的情况下传)
   */
  getOrgLogs: (params: {
    projectId: string;
    pageIndex: integer;
    pageSize: integer;
    startDateTime: string;
    endDateTime: string;
    accountIds: Array;
    fileName: string;
    columnNames: Array;
    confirmExport: boolean;
  }) => any


  /**
   * 获取登录设备列表
   * @param params 参数

   */
  getAccountDevices: (params: {

  }) => any


  /**
   * 添加行为日志
   * @param params 参数
   * @param params.entityId 实体id(根据访问类型不同， 传不同模块id)
   */
  addLog: (params: {
    entityId: string;
  }) => any

};


  /**
   * 工作流-流程实例
   */
  instance: {

  /**
   * 获取待处理列表总数
   * @param params 参数
   * @param params.access_token 令牌
   */
  count: (params: {
    access_token: string;
  }) => any


  /**
   * 审批-转审
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  forward: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 获取归档服务地址
   * @param params 参数
   * @param params.access_token 令牌
   */
  getArchivedList: (params: {
    access_token: string;
  }) => any


  /**
   * 获取历史详情
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId *流程实例ID
   */
  getHistoryDetail: (params: {
    access_token: string;
    instanceId: String;
  }) => any


  /**
   * 获取历史运行列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.archivedId archivedId
   * @param params.endDate 结束时间
   * @param params.instanceId 主instanceId(根据主历史查子流程历史使用)
   * @param params.pageIndex 页数
   * @param params.pageSize 每页数量
   * @param params.processId *流程ID
   * @param params.startDate 开始时间
   * @param params.status 状态
   * @param params.title 名称
   * @param params.workId 主workId(根据主历史查子流程历史使用)
   */
  getHistoryList: (params: {
    access_token: string;
    archivedId: string;
    endDate: Date;
    instanceId: String;
    pageIndex: int;
    pageSize: int;
    processId: String;
    startDate: Date;
    status: int;
    title: String;
    workId: String;
  }) => any


  /**
   * 获取实例基本信息
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId *流程实例ID
   */
  getInstance: (params: {
    access_token: string;
    instanceId: String;
  }) => any


  /**
   * 获取操作窗口详情
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程实例id
   * @param params.workId *工作Id
   */
  getOperationDetail: (params: {
    access_token: string;
    id: string;
    workId: string;
  }) => any


  /**
   * 获取操作历史
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId *流程实例ID
   */
  getOperationHistoryList: (params: {
    access_token: string;
    instanceId: String;
  }) => any


  /**
   * 对应各种操作
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),operationType:操作类型 3撤回 4通过申请 5拒绝申请 6转审 7加签 9提交 10转交 16添加审批人 18催办(integer),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  operation: (params: {
    access_token: string;
    requestWork: 各种操作类型;
  }) => any


  /**
   * 审批-否决
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  overrule: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 审批-通过
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  pass: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 重新发起
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  restart: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 撤回
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  revoke: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 审批-加签
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  signTask: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 填写动作-提交
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  submit: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 审批人撤回
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  taskRevoke: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any


  /**
   * 填写动作-填写转给其他人
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.requestWork {backNodeId:退回节点ID(string),before:加签前后(boolean),countersignType:会签类型  1 全员通过 2 单个通过 3 或签 4 会签 投票(integer),data:编辑的控件数据 web端使用(ref),files:附件(string),formData:编辑的控件数据 明道移动端端使用(string),forwardAccountId:转审账号(string),id:id(string),logId:行记录日志id(string),nextUserRange:由上一审批节点选择(object),opinion:意见(object),opinionType:意见类型 (默认空或者0） 1自动通过 2限时自动通过 3批量处理(integer),signature:签名(ref),workId:workId(string),}
   */
  transfer: (params: {
    access_token: string;
    requestWork: 审批动作;
  }) => any

};


  /**
   * 工作流-流程实例版本
   */
  instanceVersion: {

  /**
   * 用扩展表覆盖
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程实例id
   * @param params.workId *工作Id
   */
  cover: (params: {
    access_token: string;
    id: string;
    workId: string;
  }) => any


  /**
   * 获取流程实例流转详情
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程实例id
   * @param params.workId *工作Id
   */
  get2: (params: {
    access_token: string;
    id: string;
    workId: string;
  }) => any


  /**
   * 获取未完成数量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.apkId 应用id
   * @param params.archivedId 归档服务地址
   * @param params.complete 是否是已完成
   * @param params.createAccountId 发起人id
   * @param params.endDate 结束时间 yyyy-MM-dd
   * @param params.keyword null
   * @param params.operationType 操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType
   * @param params.pageIndex null
   * @param params.pageSize null
   * @param params.processId 流程id
   * @param params.startAppId 触发器实体id
   * @param params.startDate 开始时间 yyyy-MM-dd
   * @param params.startSourceId 触发器数据源id
   * @param params.status 状态  1运行中，2完成，3否决，4 终止 失败
   * @param params.type 0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看
   */
  getTodoCount2: (params: {
    access_token: string;
    apkId: string;
    archivedId: string;
    complete: boolean;
    createAccountId: string;
    endDate: string;
    keyword: string;
    operationType: integer;
    pageIndex: integer;
    pageSize: integer;
    processId: string;
    startAppId: string;
    startDate: string;
    startSourceId: string;
    status: integer;
    type: integer;
  }) => any


  /**
   * 根据表id行id获取审批流程执行列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}
   */
  getTodoList2: (params: {
    access_token: string;
    request: RequestTodo;
  }) => any


  /**
   * 批量操作
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkId:应用id(string),archivedId:归档服务地址(string),batchOperationType:批量操作类型 可操作动作 3撤回 4通过 5拒绝 6转审 7加签 9提交 10转交 12打印(integer),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),id:单个实例id(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),selects:批量选择(array),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),workId:单个运行id(string),}
   */
  batch: (params: {
    access_token: string;
    request: RequestBatch;
  }) => any


  /**
   * 中止执行
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId *instanceId
   */
  endInstance: (params: {
    access_token: string;
    instanceId: string;
  }) => any


  /**
   * 中止执行批量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}
   */
  endInstanceList: (params: {
    access_token: string;
    request: RequestStartProcess;
  }) => any


  /**
   * 获取流程实例详情
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程实例id
   * @param params.workId *工作Id
   */
  get: (params: {
    access_token: string;
    id: string;
    workId: string;
  }) => any


  /**
   * 获取待处理数量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.archivedId archivedId
   */
  getTodoCount: (params: {
    access_token: string;
    archivedId: string;
  }) => any


  /**
   * 获取待处理列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}
   */
  getTodoList: (params: {
    access_token: string;
    request: RequestTodo;
  }) => any


  /**
   * 待处理筛选器
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkId:应用id(string),archivedId:归档服务地址(string),complete:是否是已完成(boolean),createAccountId:发起人id(string),endDate:结束时间 yyyy-MM-dd(string),keyword:null(string),operationType:操作类型 默认0 1填写/通过 2加签 3委托 4否决 5取消（非会签用）WorkItemOperationType(integer),pageIndex:null(integer),pageSize:null(integer),processId:流程id(string),startAppId:触发器实体id(string),startDate:开始时间 yyyy-MM-dd(string),startSourceId:触发器数据源id(string),status:状态  1运行中，2完成，3否决，4 终止 失败(integer),type:0:我发起的 -1待处理 包含(3:待填写 4:待审批) 5:待查看(integer),}
   */
  getTodoListFilter: (params: {
    access_token: string;
    request: RequestTodo;
  }) => any


  /**
   * 获取流程实例对应实体
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程实例id
   * @param params.workId *工作Id
   */
  getWorkItem: (params: {
    access_token: string;
    id: string;
    workId: string;
  }) => any


  /**
   * 执行历史重试
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId *instanceId
   */
  resetInstance: (params: {
    access_token: string;
    instanceId: string;
  }) => any


  /**
   * 执行历史重试批量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}
   */
  resetInstanceList: (params: {
    access_token: string;
    request: RequestStartProcess;
  }) => any

};


  /**
   * 工作流-流程
   */
  process: {

  /**
   * 创建流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.addProcess {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),relationId:关联关系(string),relationType:关联的类型(integer),startEventAppType:发起节点app类型：1：从工作表触发 5:循环触发 6:按日期表触发(integer),}
   */
  addProcess: (params: {
    access_token: string;
    addProcess: 增加流程;
  }) => any


  /**
   * 关闭流程触发历史推送
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.storeId 推送接收到的id
   */
  closeStorePush: (params: {
    access_token: string;
    storeId: string;
  }) => any


  /**
   * 复制工作流
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.copyProcessRequest {name:流程名称增加的部分(string),processId:流程ID(string),subProcess:转为子流程(boolean),}
   * @param params.name *复制出来的流程名称后缀
   * @param params.processId *流程ID
   */
  copyProcess: (params: {
    access_token: string;
    copyProcessRequest: CopyProcessRequest;
    name: string;
    processId: string;
  }) => any


  /**
   * 删除流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId *流程ID
   */
  deleteProcess: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 工作流历史版本
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.pageIndex 页码
   * @param params.pageSize 条数
   * @param params.processId 流程ID
   */
  getHistory: (params: {
    access_token: string;
    pageIndex: string;
    pageSize: string;
    processId: string;
  }) => any


  /**
   * PBC流程api
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId 发布版流程ID
   * @param params.relationId relationId
   */
  getProcessApiInfo: (params: {
    access_token: string;
    processId: string;
    relationId: string;
  }) => any


  /**
   * 根据工作表控件获取流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.appId 工作表id
   * @param params.companyId 网络id
   * @param params.controlId 控件id
   */
  getProcessByControlId: (params: {
    access_token: string;
    appId: string;
    companyId: string;
    controlId: string;
  }) => any


  /**
   * 根据流程id查询流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.id *流程id
   */
  getProcessById: (params: {
    access_token: string;
    id: string;
  }) => any


  /**
   * 根据按钮获取流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.appId 表id
   * @param params.triggerId 按钮id
   */
  getProcessByTriggerId: (params: {
    access_token: string;
    appId: string;
    triggerId: string;
  }) => any


  /**
   * 流程全局配置
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId 流程ID
   */
  getProcessConfig: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 发布版开启过api的PBC流程列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.relationId 应用id
   */
  getProcessListApi: (params: {
    access_token: string;
    relationId: string;
  }) => any


  /**
   * 获取版本发布的信息
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.instanceId 流程实例id
   * @param params.processId 流程id
   */
  getProcessPublish: (params: {
    access_token: string;
    instanceId: string;
    processId: string;
  }) => any


  /**
   * 流程触发历史
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.storeId 推送接收到的id
   */
  getStore: (params: {
    access_token: string;
    storeId: string;
  }) => any


  /**
   * 工作流配置 选择部分触发工作流的列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId 流程ID
   */
  getTriggerProcessList: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 返回上一个版本
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId *流程id
   */
  goBack: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 流程移到到其他应用下
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.moveProcessRequest {processId:流程id(string),relationId:移动到的应用id(string),}
   */
  move: (params: {
    access_token: string;
    moveProcessRequest: MoveProcessRequest;
  }) => any


  /**
   * 发布工作流
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.isPublish isPublish
   * @param params.processId *流程id
   */
  publish: (params: {
    access_token: string;
    isPublish: boolean;
    processId: string;
  }) => any


  /**
   * 保存流程全局配置
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.saveProcessConfigRequest {agents:代理人(array),allowRevoke:允许触发者撤回(boolean),allowTaskRevoke:允许审批人撤回(boolean),allowUrge:允许触发者催办(boolean),callBackType:允许触发者撤回后重新发起 -1: 无配置 0:重新执行  1:直接返回审批节点(integer),dateShowType:日期数据格式1:yyyy-MM-dd HH:mm 6：yyyy-MM-dd HH:mm:ss(integer),debugEvents:调试事件 0开启调试(array),defaultAgent:null(string),defaultCandidateUser:candidateUser获取为空时的默认处理(boolean),defaultErrorCandidateUsers:null(string),disabledPrint:是否关闭系统打印(boolean),dotType:小数位数：0 : 取所有小数位数， 1:根据字段上面配置的小数位数(integer),endContentType:异常结束返回的contentType(integer),endValue:异常结束返回的配置(string),errorInterval:错误通知间隔时间(integer),errorNotifiers:错误消息通知人(array),executeType:运行方式: 1 并行，2：顺序，3：串行(integer),initiatorMaps:审批人为空处理(object),isSaveVariables:是否只保存流程参数(boolean),pbcConfig:PBC高级设置(ref),permissionLevel:操作时验证用户权限级别 默认 0不需要验证 1查看权限(integer),printIds:打印模版id列表(array),processId:流程ID(string),processIds:编辑版的流程id(array),processVariables:流程参数(array),recordTitle:待办标题(string),required:验证必填字段(boolean),requiredIds:必须审批的节点(array),responseContentType:返回的contentType(integer),revokeNodeIds:通过指定的节点不允许撤回(array),sendTaskPass:触发者不发送通知(boolean),startEventPass:工作流触发者自动通过(boolean),triggerType:触发其他工作流 0 ：允许触发，1：只能触发指定工作流 2：不允许触发(integer),triggerView:触发者查看(boolean),userTaskNullMaps:审批人为空处理(object),userTaskNullPass:审批人为空自动通过(boolean),userTaskPass:审批人自动通过(boolean),value:返回的配置(string),viewNodeIds:可查看意见节点 null为默认全可见 空数组就是全不可见(array),}
   */
  saveProcessConfig: (params: {
    access_token: string;
    saveProcessConfigRequest: 保存流程配置;
  }) => any


  /**
   * 工作表按钮触发流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.startProcess {appId:表id(string),dataLog:扩展触发值(string),fastFilters:快速筛选条件(array),filterControls:筛选条件(array),filtersGroup:自定义页面筛选组(array),isAll:是否全选(boolean),keyWords:搜索框(string),navGroupFilters:分组筛选(array),pushUniqueId:push唯一id 客户端使用(string),sources:行ids(array),triggerId:按钮id(string),viewId:视图id(string),}
   */
  startProcess: (params: {
    access_token: string;
    startProcess: RequestStartProcess;
  }) => any


  /**
   * 根据流程id手动触发流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.startProcess {dataLog:扩展触发值(string),debugEvents:调试事件(动态人员赋值测试人) 1审批 2短信 3邮件(array),fields:参数(array),processId:流程id(string),pushUniqueId:推送唯一标识(string),sourceId:行记录id(string),}
   */
  startProcessById: (params: {
    access_token: string;
    startProcess: RequestStartProcessByProcessId;
  }) => any


  /**
   * 根据流程id手动触发PBC流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.startProcess {appId:绑定的页面id(string),controls:PBC参数(array),processId:pbc流程id(string),pushUniqueId:push唯一id 客户端使用(string),title:页面按钮名称(string),triggerId:页面按钮id(string),}
   */
  startProcessByPBC: (params: {
    access_token: string;
    startProcess: RequestStartProcessByPBC;
  }) => any


  /**
   * 修改流程基本信息
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.updateProcess {companyId:公司ID(string),explain:说明(string),iconColor:图标颜色(string),iconName:图标名称(string),name:流程名称(string),processId:流程id(string),versionName:版本名称(string),}
   */
  updateProcess: (params: {
    access_token: string;
    updateProcess: 更新流程信息;
  }) => any


  /**
   * 转交流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.companyId *公司ID
   * @param params.id *流程id
   * @param params.owner *转交人ID
   * @param params.updateOwner {companyId:公司ID(string),owner:被转交人id(string),processId:流程id(string),}
   */
  updateOwner: (params: {
    access_token: string;
    companyId: string;
    id: string;
    owner: string;
    updateOwner: 更新拥有者信息;
  }) => any


  /**
   * 启用流程或禁用流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.updateUseStatus {companyId:公司ID(string),enabled:是否启用,是：true,禁用：false(boolean),processId:流程id(string),}
   */
  updateUseStatus: (params: {
    access_token: string;
    updateUseStatus: 更新流程状态;
  }) => any

};


  /**
   * 工作流-流程版本
   */
  processVersion: {

  /**
   * 批量设置(暂停 恢复)流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}
   */
  batch: (params: {
    access_token: string;
    request: 流程管理后台批量操作;
  }) => any


  /**
   * 按网络获取流程堆积量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.companyId 网络id
   */
  getDifferenceByCompanyId: (params: {
    access_token: string;
    companyId: string;
  }) => any


  /**
   * 获取流程堆积量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId 编辑版流程id
   */
  getDifferenceByProcessId: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 按网络获取堆积流程总数
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.difference {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}
   */
  getDifferenceProcessCount: (params: {
    access_token: string;
    difference: RequestProcessDifference;
  }) => any


  /**
   * 按网络获取堆积流程列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.difference {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}
   */
  getDifferenceProcessList: (params: {
    access_token: string;
    difference: RequestProcessDifference;
  }) => any


  /**
   * 按历史id获取堆积流程列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.difference {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}
   */
  getDifferenceProcessListByIds: (params: {
    access_token: string;
    difference: RequestProcessDifference;
  }) => any


  /**
   * 按网络获取流程堆积量历史
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.manage {companyId:网络id(string),endDate:结束时间 yyyy-MM-dd HH:mm:ss(string),startDate:开始时间 yyyy-MM-dd HH:mm:ss(string),}
   */
  getHistoryDifferenceByCompanyId: (params: {
    access_token: string;
    manage: RequestInstanceIncrementManage;
  }) => any


  /**
   * 按流程id获取有堆积的历史
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId 编辑版流程id
   */
  getHistoryDifferenceByProcessId: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 获取已有通道
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.companyId *网络id
   */
  getRouterList: (params: {
    access_token: string;
    companyId: String;
  }) => any


  /**
   * 获取预警配置
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.companyId *网络id
   */
  getWarning: (params: {
    access_token: string;
    companyId: String;
  }) => any


  /**
   * 同步所有应用 所有执行数
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {companyId:网络id(string),ids:多个历史id(array),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),sorter:排序 正序{'difference':'ascend'} 倒序{'difference':'descend'}(object),}
   */
  init: (params: {
    access_token: string;
    request: RequestProcessDifference;
  }) => any


  /**
   * 丢弃排队
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}
   */
  remove: (params: {
    access_token: string;
    request: 流程管理后台批量操作;
  }) => any


  /**
   * 重置排队计数
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}
   */
  reset: (params: {
    access_token: string;
    request: 流程管理后台批量操作;
  }) => any


  /**
   * 修改选择的通道
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}
   */
  updateRouterIndex: (params: {
    access_token: string;
    request: 流程管理后台批量操作;
  }) => any


  /**
   * 设置暂停流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {hours:暂停多少小时(integer),processId:流程id(string),processIds:批量操作 流程ids(array),routerIndex:选择的通道序号(integer),waiting:开启还是关闭 默认true开启暂停(boolean),}
   */
  updateWaiting: (params: {
    access_token: string;
    request: 流程管理后台批量操作;
  }) => any


  /**
   * 修改预警配置
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {accountIds:通知人(array),companyId:网络id(string),enableEmail:邮件(boolean),enableSms:短信(boolean),value:预警值(integer),}
   */
  updateWarning: (params: {
    access_token: string;
    request: RequestInstanceWarning;
  }) => any


  /**
   * 流程列表数量
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.relationId 应用ID 或者 网络ID
   * @param params.relationType 类型 0 网络，2应用
   */
  count: (params: {
    access_token: string;
    relationId: string;
    relationType: string;
  }) => any


  /**
   * 网络流程列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.apkId 应用ID
   * @param params.companyId 网络id
   * @param params.createrIds 创建者
   * @param params.enabled 开启状态 0 全部，1：开启，2：关闭
   * @param params.isAsc 是否升序
   * @param params.keyWords 搜索框
   * @param params.pageIndex 页数
   * @param params.pageSize 条数
   * @param params.processListType 列表类型
   * @param params.sortId 排序字段id
   */
  getProcessByCompanyId: (params: {
    access_token: string;
    apkId: string;
    companyId: string;
    createrIds: string;
    enabled: string;
    isAsc: string;
    keyWords: string;
    pageIndex: string;
    pageSize: string;
    processListType: string;
    sortId: string;
  }) => any


  /**
   * 流程操作权限
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.relationId 应用ID 或者 流程ID
   * @param params.relationType 类型 0 网络，2应用
   */
  getProcessRole: (params: {
    access_token: string;
    relationId: string;
    relationType: string;
  }) => any


  /**
   * 获取流程使用数量和执行次数
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.companyId 公司ID ,个人传空
   */
  getProcessUseCount: (params: {
    access_token: string;
    companyId: string;
  }) => any


  /**
   * 流程列表接口
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.keyWords keyWords
   * @param params.pageIndex pageIndex
   * @param params.pageSize pageSize
   * @param params.processListType *流程列表类型：1:工作表触发，2:时间触发，3:其他应用修改本应用，4:应用流程，5:网络流程,100:回收站
   * @param params.relationId 应用ID 或者 网络ID
   */
  list: (params: {
    access_token: string;
    keyWords: string;
    pageIndex: integer;
    pageSize: integer;
    processListType: string;
    relationId: string;
  }) => any


  /**
   * 应用下所有流程接口
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.keyWords keyWords
   * @param params.pageIndex pageIndex
   * @param params.pageSize pageSize
   * @param params.relationId 应用ID 或者 网络ID
   */
  listAll: (params: {
    access_token: string;
    keyWords: string;
    pageIndex: integer;
    pageSize: integer;
    relationId: string;
  }) => any


  /**
   * 切底删除流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId *流程ID
   */
  removeProcess: (params: {
    access_token: string;
    processId: string;
  }) => any


  /**
   * 恢复流程
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.processId *流程ID
   */
  restoreProcess: (params: {
    access_token: string;
    processId: string;
  }) => any

};


  /**
   * 工作流-委托
   */
  delegation: {

  /**
   * 添加委托
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkIds:应用ids(array),companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),principal:委托人(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),trustee:受委托人(string),}
   */
  add: (params: {
    access_token: string;
    request: 添加委托;
  }) => any


  /**
   * 获取委托列表
   * @param params 参数
   * @param params.access_token 令牌
   */
  getList: (params: {
    access_token: string;
  }) => any


  /**
   * 获取组织下所有委托列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {companyId:公司ID(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),principals:多个委托人(array),sorter:排序字段 正序{'createDate':'ascend'} 倒序{'createDate':'descend'}(object),}
   */
  getListByCompanyId: (params: {
    access_token: string;
    request: 获取委托列表;
  }) => any


  /**
   * 根据委托人获取委托列表
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {companyId:公司ID(string),keyword:null(string),pageIndex:null(integer),pageSize:null(integer),principals:多个委托人(array),sorter:排序字段 正序{'createDate':'ascend'} 倒序{'createDate':'descend'}(object),}
   */
  getListByPrincipals: (params: {
    access_token: string;
    request: 获取委托列表;
  }) => any


  /**
   * 编辑委托
   * @param params 参数
   * @param params.access_token 令牌
   * @param params.request {apkIds:应用ids(array),companyId:公司ID(string),endDate:结束时间 yyyy-MM-dd HH:mm(string),id:委托ID(string),principal:委托人(string),startDate:开始时间 yyyy-MM-dd HH:mm(string),status:状态 1正常，0结束(integer),trustee:受委托人(string),}
   */
  update: (params: {
    access_token: string;
    request: 编辑委托;
  }) => any

};


  /**
   * 七牛
   */
  qiniu: {

  /**
   * 获取七牛上传 token
   * @param params 参数
   * @param params.files 批量上传文件token 请求对象
   * @param params.worksheetId 默认为工作表ID，注：插件使用此ID
   * @param params.appId 
   * @param params.projectId 
   * @param params.extend 扩展参数
   */
  getUploadToken: (params: {
    files: Array;
    worksheetId: string;
    appId: string;
    projectId: string;
    extend: string;
  }) => any


  /**
   * 获取七牛上传 token
   * @param params 参数
   * @param params.files 批量上传文件token 请求对象
   * @param params.worksheetId 默认为工作表ID，注：插件使用此ID
   * @param params.appId 
   * @param params.projectId 
   * @param params.extend 扩展参数
   */
  getFileUploadToken: (params: {
    files: Array;
    worksheetId: string;
    appId: string;
    projectId: string;
    extend: string;
  }) => any

};


  /**
   * 插件
   */
  plugin: {

  /**
   * 创建
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.name 插件名称
   * @param params.icon 图标
   * @param params.iconColor 图标颜色
   * @param params.debugEnvironments 调试环境
   * @param params.appId 应用id
   */
  create: (params: {
    projectId: string;
    name: string;
    icon: string;
    iconColor: string;
    debugEnvironments: Array;
    appId: string;
  }) => any


  /**
   * 编辑
   * @param params 参数
   * @param params.id 插件id
   * @param params.name 插件名称
   * @param params.icon 图标
   * @param params.iconColor 图标颜色
   * @param params.debugEnvironments 调试环境
   * @param params.paramSettings 参数设置
   * @param params.switchSettings 功能开关配置
   * @param params.configuration 配置
   * @param params.stepState 步骤状态（前端自己决定,前提时值必须大于等于0）
   * @param params.state 插件状态
   * @param params.templateType 模板类型
   * @param params.viewId 视图id
   * @param params.appId 应用id
   */
  edit: (params: {
    id: string;
    name: string;
    icon: string;
    iconColor: string;
    debugEnvironments: Array;
    paramSettings: Array;
    switchSettings: object;
    configuration: object;
    stepState: integer;
    state: integer;
    templateType: integer;
    viewId: string;
    appId: string;
  }) => any


  /**
   * 获取单个插件详情
   * @param params 参数
   * @param params.id 插件id
   * @param params.appId 应用id
   * @param params.projectId 组织id
   */
  getDetail: (params: {
    id: string;
    appId: string;
    projectId: string;
  }) => any


  /**
   * 判断插件是否存在
   * @param params 参数
   * @param params.id 插件id
   * @param params.appId 应用id
   * @param params.projectId 组织id
   */
  checkExists: (params: {
    id: string;
    appId: string;
    projectId: string;
  }) => any


  /**
   * 获取插件列表
   * @param params 参数
   * @param params.creator 创建者，默认为当前登录账号
   * @param params.projectId 组织id
   * @param params.keywords 关键字搜索（插件名称）
   * @param params.state 是否启用状态
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   */
  getList: (params: {
    creator: string;
    projectId: string;
    keywords: string;
    state: integer;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 获取所有插件
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   * @param params.appId 应用id
   */
  getAll: (params: {
    projectId: string;
    pageIndex: integer;
    pageSize: integer;
    appId: string;
  }) => any


  /**
   * 删除
   * @param params 参数
   * @param params.id 插件id
   */
  remove: (params: {
    id: string;
  }) => any


  /**
   * 发布插件的新版本
   * @param params 参数
   * @param params.id 提交历史记录id
   * @param params.versionCode 版本号
   * @param params.description 说明
   * @param params.configuration 配置
   * @param params.pluginId 插件id
   */
  release: (params: {
    id: string;
    versionCode: string;
    description: string;
    configuration: object;
    pluginId: string;
  }) => any


  /**
   * 回滚到某一个版本
   * @param params 参数
   * @param params.releaseId 版本id
   * @param params.pluginId 插件id
   */
  rollback: (params: {
    releaseId: string;
    pluginId: string;
  }) => any


  /**
   * 获取版本历史
   * @param params 参数
   * @param params.id 插件id
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   */
  getReleaseHistory: (params: {
    id: string;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 删除版本
   * @param params 参数
   * @param params.id 版本id
   * @param params.pluginId 插件id
   */
  removeRelease: (params: {
    id: string;
    pluginId: string;
  }) => any


  /**
   * 创建提交历史记录
   * @param params 参数
   * @param params.pluginId 插件id
   * @param params.message 提交消息
   * @param params.worksheetId 工作表id
   */
  commit: (params: {
    pluginId: string;
    message: string;
    worksheetId: string;
  }) => any


  /**
   * 删除提交历史记录
   * @param params 参数
   * @param params.id 提交记录id
   * @param params.appId 应用id
   */
  removeCommit: (params: {
    id: string;
    appId: string;
  }) => any


  /**
   * 获取提交历史列表
   * @param params 参数
   * @param params.id 插件id
   * @param params.pageIndex 当前页
   * @param params.pageSize 当前页
   * @param params.appId 应用id
   */
  getCommitHistory: (params: {
    id: string;
    pageIndex: integer;
    pageSize: integer;
    appId: string;
  }) => any


  /**
   * 获取插件使用明细
   * @param params 参数
   * @param params.id 插件id
   * @param params.pageSize 分页大小
   * @param params.pageIndex 当前页
   * @param params.keywords 关键字
   */
  getUseDetail: (params: {
    id: string;
    pageSize: integer;
    pageIndex: integer;
    keywords: string;
  }) => any


  /**
   * 插件导入
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.url 插件文件url
   * @param params.pluginId 插件来源id
   */
  import: (params: {
    projectId: string;
    url: string;
    pluginId: string;
  }) => any


  /**
   * 插件导出
   * @param params 参数
   * @param params.id 插件id
   * @param params.releaseId 版本id
   */
  export: (params: {
    id: string;
    releaseId: string;
  }) => any


  /**
   * 插件导出历史
   * @param params 参数
   * @param params.id 插件id
   * @param params.pageIndex 当前页
   * @param params.pageSize 页大小
   */
  getExportHistory: (params: {
    id: string;
    pageIndex: integer;
    pageSize: integer;
  }) => any


  /**
   * 根据来源获取插件
   * @param params 参数
   * @param params.projectId 组织id
   * @param params.sourceId 应用id
   */
  getPluginListBySourece: (params: {
    projectId: string;
    sourceId: string;
  }) => any


  /**
   * 保存插件视图使用状态
   * @param params 参数
   * @param params.viewId 视图id
   * @param params.accountId 用户Id
   * @param params.data 插件数据
   */
  stateSave: (params: {
    viewId: string;
    accountId: string;
    data: object;
  }) => any


  /**
   * 获取插件视图使用状态
   * @param params 参数
   * @param params.viewId 视图id
   * @param params.accountId 用户Id
   */
  stateRead: (params: {
    viewId: string;
    accountId: string;
  }) => any

};

};