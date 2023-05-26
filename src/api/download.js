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
     return $.api('Download', 'GetExAccountImportTemplate', args, options);
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
     return $.api('Download', 'Verify', args, options);
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
     return $.api('Download', 'ExportFolderToExcel', args, options);
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
     return $.api('Download', 'ExportCalendarByCalendarId', args, options);
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
     return $.api('Download', 'ExportCalendarByToken', args, options);
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
     return $.api('Download', 'ExportSharedCalendar', args, options);
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
     return $.api('Download', 'ExportProjectEntityToExcel', args, options);
   },
  /**
  * 导出公司员工列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountIds 账号id
  * @param {string} args.departmentIds 部门ids
  * @param {} args.userStatus 用户状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportProjectUserList: function (args, options = {}) {
     
     return $.api('Download', 'ExportProjectUserList', args, options);
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
     
     return $.api('Download', 'ExportImportUserFailList', args, options);
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
     
     return $.api('Download', 'ExportImportEditUserFailList', args, options);
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
     
     return $.api('Download', 'ExportFailJobOrDepartmentErrorList', args, options);
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
     
     return $.api('Download', 'ExportProjectJobList', args, options);
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
     
     return $.api('Download', 'ExportProjectDepartmentList', args, options);
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
     return $.api('Download', 'DownloadBankInfo', args, options);
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
     
     return $.api('Download', 'CustomIcon', args, options);
   },
  /**
  * 下载应用文件包
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Download', 'AppFile', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   worksheetExcel: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Download', 'WorksheetExcel', args, options);
   },
  /**
  * 导出登录日志
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exportLoginLog: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Download', 'ExportLoginLog', args, options);
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
     return $.api('Download', 'DownloadBackupFile', args, options);
   },
  /**
  * 批量下载行记录附件
  * @param {Object} args 请求参数
  * @param {string} args.controlId 附件控件id
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   rowAttachments: function (args, options = {}) {
     
     return $.api('Download', 'RowAttachments', args, options);
   },
  /**
  * 下载应用库模板
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appLibrary: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('Download', 'AppLibrary', args, options);
   },
};
