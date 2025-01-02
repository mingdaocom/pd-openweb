export default {
  /**
  * 获取 外部用户导入模板
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExAccountImportTemplate: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'GetExAccountImportTemplate', args, options);
   },
  /**
  * 下载免审文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   verify: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'Verify', args, options);
   },
  /**
  * 导出项目
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportFolderToExcel: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'ExportFolderToExcel', args, options);
   },
  /**
  * 导出单个日程
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportCalendarByCalendarId: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'ExportCalendarByCalendarId', args, options);
   },
  /**
  * 根据 token 导出个人日程
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportCalendarByToken: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'ExportCalendarByToken', args, options);
   },
  /**
  * 导出分享的日程
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportSharedCalendar: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'ExportSharedCalendar', args, options);
   },
  /**
  * 网络管理导出各实体数据
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectEntityToExcel: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'ExportProjectEntityToExcel', args, options);
   },
  /**
  * 导出公司员工列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountIds 账号id
  * @param {string} args.departmentIds 部门ids
  * @param {} args.userStatus
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectUserList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportProjectUserList', args, options);
   },
  /**
  * 导出导入用户错误列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.dowloadId 下载Id
  * @param {integer} args.type 下载类型 1 是职位 2是部门
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportImportUserFailList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportImportUserFailList', args, options);
   },
  /**
  * 编辑导入用户错误列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.dowloadId 下载Id
  * @param {integer} args.type 下载类型 1 是职位 2是部门
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportImportEditUserFailList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportImportEditUserFailList', args, options);
   },
  /**
  * 导入职位或者部门错误列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.dowloadId 下载Id
  * @param {integer} args.type 下载类型 1 是职位 2是部门
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportFailJobOrDepartmentErrorList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportFailJobOrDepartmentErrorList', args, options);
   },
  /**
  * 导出公司职位列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectJobList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportProjectJobList', args, options);
   },
  /**
  * 导出公司组织角色列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectOrgRoleList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportProjectOrgRoleList', args, options);
   },
  /**
  * 导出公司部门列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectDepartmentList: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportProjectDepartmentList', args, options);
   },
  /**
  * 下载银行信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downloadBankInfo: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'DownloadBankInfo', args, options);
   },
  /**
  * 下载自定义图标
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
   customIcon: function (args, options = {}) {
     
     return mdyAPI('Download', 'CustomIcon', args, options);
   },
  /**
  * 下载应用包
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'AppFile', args, options);
   },
  /**
  * 下载导出的工作表附件跳转
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   worksheetExcel: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'WorksheetExcel', args, options);
   },
  /**
  * 导出登录日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 当前页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {} args.logType
  * @param {} args.accountResult
  * @param {array} args.accountIds 用户ID
  * @param {array} args.columnNames 列名称
  * @param {string} args.fileName 导出文件名
  * @param {boolean} args.confirmExport 是否确认导出(超量的情况下传)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportLoginLog: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportLoginLog', args, options);
   },
  /**
  * 导出应用全局日志
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
   exportGlobalLogs: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportGlobalLogs', args, options);
   },
  /**
  * 导出组织管理全局日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 当前页码
  * @param {integer} args.pageSize 页面尺寸
  * @param {string} args.startDateTime 开始时间
  * @param {string} args.endDateTime 结束时间
  * @param {} args.operateTargetType
  * @param {} args.operateType
  * @param {array} args.accountIds 用户ID
  * @param {string} args.fileName 文件名
  * @param {array} args.columnNames 列名称
  * @param {boolean} args.confirmExport 是否确认导出(超量的情况下传)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportOrgOperateLogs: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportOrgOperateLogs', args, options);
   },
  /**
  * 批量下载行记录附件
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
  * @param {string} args.controlId 附件控件id
  * @param {string} args.parentWorksheetId 主表id 不是子表/关联表/他表 就不传
  * @param {string} args.parentRowId 主表行记录id 不是子表/关联表/他表 就不传
  * @param {string} args.foreignControlid 主表关联控件id 不是子表/关联表/他表 就不传
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   rowAttachments: function (args, options = {}) {
     
     return mdyAPI('Download', 'RowAttachments', args, options);
   },
  /**
  * 下载应用备份文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downloadBackupFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'DownloadBackupFile', args, options);
   },
  /**
  * 下载数据备份文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downloadBackupDataFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'DownloadBackupDataFile', args, options);
   },
  /**
  * 下载应用库模板文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appLibrary: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'AppLibrary', args, options);
   },
  /**
  * 下载授权应用文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   trade: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'Trade', args, options);
   },
  /**
  * 下载插件导出文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   plugin: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Download', 'Plugin', args, options);
   },
  /**
  * 导出记录操作日志
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
  * @param {integer} args.fileType 文件类型
1为Excel；2为PDF
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportWorksheetOperationLogs: function (args, options = {}) {
     
     return mdyAPI('Download', 'ExportWorksheetOperationLogs', args, options);
   },
};
