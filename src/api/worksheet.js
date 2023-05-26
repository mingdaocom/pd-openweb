export default {
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorksheetControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditWorksheetControls', args, options);
   },
  /**
  * 获取表格控件数量
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetControlsQuantity: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetControlsQuantity', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetControlIncrease: function (args, options = {}) {
     
     return $.api('Worksheet', 'ResetControlIncrease', args, options);
   },
  /**
  * 删除autoid
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteWorksheetAutoID: function (args, options = {}) {
     
     return $.api('Worksheet', 'DeleteWorksheetAutoID', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editControlsStatus: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditControlsStatus', args, options);
   },
  /**
  * 获取系统打印列表
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId
  * @param {string} args.viewId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPrintList: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetPrintList', args, options);
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
     
     return $.api('Worksheet', 'GetFormComponent', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPrint: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetPrint', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCodePrint: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetCodePrint', args, options);
   },
  /**
  * 新建生成打印模板e
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPrintTemplate: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetPrintTemplate', args, options);
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
     
     return $.api('Worksheet', 'EditPrint', args, options);
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
  * @param {} args.config 记录二维码打印配置
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveRecordCodePrintConfig: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveRecordCodePrintConfig', args, options);
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
     
     return $.api('Worksheet', 'EditPrintName', args, options);
   },
  /**
  * 修改表单名称
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.name
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPrintFormName: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditPrintFormName', args, options);
   },
  /**
  * 修改打印模板范围
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {} args.range 范围类型 1=全部记录。2=未指定试图 3=勾选试图配置
  * @param {array} args.viewsIds 视图Ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPrintRange: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditPrintRange', args, options);
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
     
     return $.api('Worksheet', 'DeletePrint', args, options);
   },
  /**
  * 修改打印空数据显影
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {boolean} args.showData 是否显影
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editShowData: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditShowData', args, options);
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
     
     return $.api('Worksheet', 'GetRowIndexes', args, options);
   },
  /**
  * 新增 工作表行内容表索引
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.customeIndexName 自定义索引名称
  * @param {array} args.indexFields 索引字段
  * @param {boolean} args.uniqueIndex 是否 唯一索引
  * @param {boolean} args.wildcardIndex 是否 通配符文本索引
  * @param {boolean} args.sparseIndex 是否 稀疏索引
  * @param {boolean} args.backgroundIndex 是否 后台索引
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRowIndex: function (args, options = {}) {
     
     return $.api('Worksheet', 'AddRowIndex', args, options);
   },
  /**
  * 更新 工作表行内容表索引
  * @param {Object} args 请求参数
  * @param {string} args.indexConfigId 索引配置Id
（系统级索引可为空）
  * @param {string} args.appId AppId
  * @param {boolean} args.isSystemIndex 是否 系统级索引
  * @param {string} args.systemIndexName 系统级索引名称
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.customeIndexName 自定义索引名称
  * @param {array} args.indexFields 索引字段
  * @param {boolean} args.uniqueIndex 是否 唯一索引
  * @param {boolean} args.wildcardIndex 是否 通配符文本索引
  * @param {boolean} args.sparseIndex 是否 稀疏索引
  * @param {boolean} args.backgroundIndex 是否 后台索引
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateRowIndex: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateRowIndex', args, options);
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
     
     return $.api('Worksheet', 'UpdateRowIndexCustomeIndexName', args, options);
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
     
     return $.api('Worksheet', 'RemoveRowIndex', args, options);
   },
  /**
  * 获取链接行记录
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.password
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLinkDetail: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetLinkDetail', args, options);
   },
  /**
  * 提交链接
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {array} args.newOldControl 要修改的cell
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editRowByLink: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditRowByLink', args, options);
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
     
     return $.api('Worksheet', 'GetFormSubmissionSettings', args, options);
   },
  /**
  * 更新工作表创建记录表单设置信息
  * @param {Object} args 请求参数
  * @param {string} args.workSheetId 工作表id
  * @param {string} args.appId 应用id
  * @param {object} args.advancedSetting 配置项数据
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorksheetSetting: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditWorksheetSetting', args, options);
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
     
     return $.api('Worksheet', 'GetSwitch', args, options);
   },
  /**
  * 更新系统配置开关（单个）
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.state 开关
  * @param {} args.type 业务类型
  * @param {} args.roleType 角色类型
  * @param {array} args.viewIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSwitch: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditSwitch', args, options);
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
     
     return $.api('Worksheet', 'BatchEditSwitch', args, options);
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
     
     return $.api('Worksheet', 'GetSwitchPermit', args, options);
   },
  /**
  * 获取导出excel错误日志
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExcelLog: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetExcelLog', args, options);
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
     
     return $.api('Worksheet', 'GetWorksheetApiInfo', args, options);
   },
  /**
  * 选项转为选项集
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.worksheetId
  * @param {string} args.controlId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   optionsToCollection: function (args, options = {}) {
     
     return $.api('Worksheet', 'OptionsToCollection', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCollectionsByAppId: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetCollectionsByAppId', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveOptionsCollection: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveOptionsCollection', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteOptionsCollection: function (args, options = {}) {
     
     return $.api('Worksheet', 'DeleteOptionsCollection', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCollectionsByCollectIds: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetCollectionsByCollectIds', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getQuoteControlsById: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetQuoteControlsById', args, options);
   },
  /**
  * 获取添加选项接集接口信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addOrUpdateOptionSetApiInfo: function (args, options = {}) {
     
     return $.api('Worksheet', 'AddOrUpdateOptionSetApiInfo', args, options);
   },
  /**
  * 获取选项接集列表接口信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   optionSetListApiInfo: function (args, options = {}) {
     
     return $.api('Worksheet', 'OptionSetListApiInfo', args, options);
   },
  /**
  * 工作表OCR识别
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.controlId ocr控件id
  * @param {string} args.url 待识别文件url ，图片的 Url 地址。要求图片经Base64编码后不超过 7M，分辨率建议500*800以上，支持PNG、JPG、JPEG、BMP格式。建议卡片部分占据图片2/3以上。 建议图片存储于腾讯云，可保障更高的下载速度和稳定性。
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   ocr: function (args, options = {}) {
     
     return $.api('Worksheet', 'Ocr', args, options);
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
     
     return $.api('Worksheet', 'GetQuery', args, options);
   },
  /**
  * get 批量工作表查询
  * @param {Object} args 请求参数
  * @param {array} args.ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getsQuery: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetsQuery', args, options);
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
     
     return $.api('Worksheet', 'GetQueryBySheetId', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveQuery: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveQuery', args, options);
   },
  /**
  * 删除工作表查询
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteQuery: function (args, options = {}) {
     
     return $.api('Worksheet', 'DeleteQuery', args, options);
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
     
     return $.api('Worksheet', 'SaveFiltersGroup', args, options);
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
     
     return $.api('Worksheet', 'GetFiltersGroupByIds', args, options);
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
     
     return $.api('Worksheet', 'DeleteFiltersGroupByIds', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   excuteApiQuery: function (args, options = {}) {
     
     return $.api('Worksheet', 'ExcuteApiQuery', args, options);
   },
  /**
  * 获取api模板消息信息
  * @param {Object} args 请求参数
  * @param {string} args.apiTemplateId api模板id
  * @param {integer} args.type 是否为请求参数模板 1-请求模板 2-响应模板 不传-请求响应
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApiControlDetail: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetApiControlDetail', args, options);
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
     
     return $.api('Worksheet', 'SortAttachment', args, options);
   },
  /**
  * 更新记录附件名
  * @param {Object} args 请求参数
  * @param {string} args.fileId
  * @param {string} args.fileName
  * @param {string} args.controlId 附件的控件id
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
   editAttachmentName: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditAttachmentName', args, options);
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
     
     return $.api('Worksheet', 'GetExportConfig', args, options);
   },
  /**
  * 保存导出配置
  * @param {Object} args 请求参数
  * @param {array} args.exportExtIds 导出特殊列配置
  * @param {array} args.controlIds 需要导出的控件ids
  * @param {} args.type 导出类型，0 = excel,1= csv
  * @param {} args.exportFieldType 导出字段类型，0=全部字段，1 =  导出当前表格显示列
  * @param {boolean} args.getColumnRpt 是否导出列统计
  * @param {boolean} args.edited 是否允许修改
  * @param {string} args.worksheetId
  * @param {string} args.viewId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveExportConfig: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveExportConfig', args, options);
   },
  /**
  * 获取视图字段查看编辑权限
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getViewFieldPermission: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetViewFieldPermission', args, options);
   },
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
     
     return $.api('Worksheet', 'GetViewPermission', args, options);
   },
  /**
  * 获取应用角色用户扩展属性
  * @param {Object} args 请求参数
  * @param {string} args.appId AppId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppExtendAttr: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetAppExtendAttr', args, options);
   },
  /**
  * 获取工作表扩展属性可选项控件集合
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExtendAttrOptionalControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetExtendAttrOptionalControls', args, options);
   },
  /**
  * 获取工作表的扩展属性选项控件信息
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getExtendAttrOptionalControl: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetExtendAttrOptionalControl', args, options);
   },
  /**
  * 保存应用角色用户扩展属性
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用
  * @param {string} args.worksheetId 工作表Id
  * @param {string} args.userControlId 用户控件
  * @param {array} args.extendAttrs 扩展字段属性
  * @param {integer} args.status 状态【9：关闭 1：正常】
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveAppExtendAttr: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveAppExtendAttr', args, options);
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
     
     return $.api('Worksheet', 'CopyWorksheet', args, options);
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
     
     return $.api('Worksheet', 'UpdateEntityName', args, options);
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
     
     return $.api('Worksheet', 'UpdateWorksheetAlias', args, options);
   },
  /**
  * 编辑按钮和记录名称
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.entityName 记录名
  * @param {string} args.btnName 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateEntityAndBtnName: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateEntityAndBtnName', args, options);
   },
  /**
  * 修改表格描述
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.dec 描述
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetDec: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetDec', args, options);
   },
  /**
  * 修改表格名称
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.name 名称
  * @param {string} args.appid 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetName: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetName', args, options);
   },
  /**
  * 修改表格视图分享范围
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.rowId 行Id
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.viewId 视图Id
  * @param {} args.shareRange 分享范围
  * @param {} args.objectType 分享内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetShareRange: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetShareRange', args, options);
   },
  /**
  * 获取负责的总行数
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isCreatedWorksheet: function (args, options = {}) {
     
     return $.api('Worksheet', 'IsCreatedWorksheet', args, options);
   },
  /**
  * 获取负责的总行数
  * @param {Object} args 请求参数
  * @param {string} args.workSheetId 工作表id
  * @param {string} args.ownerId 负责人Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowCountByOwnerID: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowCountByOwnerID', args, options);
   },
  /**
  * 工作表详情
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetInfo: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetInfo', args, options);
   },
  /**
  * 审批、填写获取子表信息及控件权限
  * @param {Object} args 请求参数
  * @param {string} args.controlId 子表的控件id
  * @param {string} args.instanceId 流程实例id
  * @param {string} args.workId 运行节点id
  * @param {string} args.linkId 工作流填写链接id
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetInfoByWorkItem: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetInfoByWorkItem', args, options);
   },
  /**
  * 工作表详情
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetsInfo: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetsInfo', args, options);
   },
  /**
  * 获取工作表分享链接
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {} args.objectType objectType
  * @param {string} args.rowId 行Id
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {string} args.password 密码code
  * @param {string} args.validTime 有效时间
  * @param {boolean} args.isEdit 是否为编辑,获取url时不传，编辑时传true
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetShareUrl: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetShareUrl', args, options);
   },
  /**
  * 根据shareid得到worksheetid
  * @param {Object} args 请求参数
  * @param {string} args.shareId 对外分享标识
  * @param {string} args.password 密码
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getShareInfoByShareId: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetShareInfoByShareId', args, options);
   },
  /**
  * 获取分享行
  * @param {Object} args 请求参数
  * @param {string} args.shareId 分享id
  * @param {} args.getType
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {string} args.sortId 排序字段
  * @param {boolean} args.isAsc 是否升序
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowsDataByShareId: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowsDataByShareId', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowByID: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowByID', args, options);
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
     
     return $.api('Worksheet', 'GetAttachmentDetail', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAttachmentShareId: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetAttachmentShareId', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowDetail: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowDetail', args, options);
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
     
     return $.api('Worksheet', 'GetWorkItem', args, options);
   },
  /**
  * 行列表
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.rowIds 行ids
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowsDataByIds: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowsDataByIds', args, options);
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
  * @param {array} args.filters
  * @param {boolean} args.getRules
  * @param {} args.getType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRowRelationRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRowRelationRows', args, options);
   },
  /**
  * 获取关联可见记录数
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId
  * @param {string} args.rowId
  * @param {array} args.controlIds
  * @param {string} args.shareId
  * @param {string} args.linkShareId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRelationRowsCount: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetRelationRowsCount', args, options);
   },
  /**
  * 添加行
  * @param {Object} args 请求参数
  * @param {string} args.shareId 分享id
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.receiveControls 该行所有的cell
  * @param {array} args.receiveRows 批量新增所有rows
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {string} args.btnId 自定义按钮ID
  * @param {string} args.btnRemark 按钮备注
  * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
  * @param {string} args.btnRowId 点击按钮对应的行记录ID
  * @param {} args.masterRecord 主记录信息
  * @param {string} args.pushUniqueId 推送ID
  * @param {string} args.verifyCode 验证码【根据配置来校验是否必填】
  * @param {integer} args.rowStatus 1：正常 21：草稿箱
  * @param {string} args.draftRowId 草稿ID
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorksheetRow: function (args, options = {}) {
     
     return $.api('Worksheet', 'AddWorksheetRow', args, options);
   },
  /**
  * 批量添加行
  * @param {Object} args 请求参数
  * @param {string} args.shareId 分享id
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.receiveControls 该行所有的cell
  * @param {array} args.receiveRows 批量新增所有rows
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {string} args.btnId 自定义按钮ID
  * @param {string} args.btnRemark 按钮备注
  * @param {string} args.btnWorksheetId 点击按钮对应的工作表ID
  * @param {string} args.btnRowId 点击按钮对应的行记录ID
  * @param {} args.masterRecord 主记录信息
  * @param {string} args.pushUniqueId 推送ID
  * @param {string} args.verifyCode 验证码【根据配置来校验是否必填】
  * @param {integer} args.rowStatus 1：正常 21：草稿箱
  * @param {string} args.draftRowId 草稿ID
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWSRowsBatch: function (args, options = {}) {
     
     return $.api('Worksheet', 'AddWSRowsBatch', args, options);
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
  * @param {integer} args.rowStatus 1：正常 11：草稿箱
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetRow: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetRow', args, options);
   },
  /**
  * 验证字段唯一性
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.controlId 需要验证的控件id
  * @param {} args.controlType 控件类型
  * @param {string} args.controlValue 新输入的值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkFieldUnique: function (args, options = {}) {
     
     return $.api('Worksheet', 'CheckFieldUnique', args, options);
   },
  /**
  * 批量修改
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {} args.cells 要修改的cell（只能批量修改单个列）
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetRows', args, options);
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
     
     return $.api('Worksheet', 'UpdateRowRelationRows', args, options);
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
     
     return $.api('Worksheet', 'ReplaceRowRelationRows', args, options);
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
     
     return $.api('Worksheet', 'RefreshSummary', args, options);
   },
  /**
  * 批量刷新行记录
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {} args.cells 要修改的cell（只能批量修改单个列）
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refreshWorksheetRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'RefreshWorksheetRows', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteWorksheetRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'DeleteWorksheetRows', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restoreWorksheetRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'RestoreWorksheetRows', args, options);
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
     
     return $.api('Worksheet', 'RemoveWorksheetRows', args, options);
   },
  /**
  * 过滤查找
  * @param {Object} args 请求参数
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
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterRows: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetFilterRows', args, options);
   },
  /**
  * 工作表查询默认值获取
  * @param {Object} args 请求参数
  * @param {string} args.id 工作表查询id
  * @param {boolean} args.getAllControls 是否返回所有控件返回值
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
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterRowsByQueryDefault: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetFilterRowsByQueryDefault', args, options);
   },
  /**
  * 获取行记录总数
  * @param {Object} args 请求参数
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
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterRowsTotalNum: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetFilterRowsTotalNum', args, options);
   },
  /**
  * 工作表最下方统计
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.filterControls 查询列
  * @param {array} args.columnRpts 列排序
  * @param {} args.searchType 查询类型
  * @param {string} args.keyWords 关键词
  * @param {string} args.controlId
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {array} args.fastFilters
  * @param {array} args.navGroupFilters 导航分组筛选
  * @param {array} args.filtersGroup 筛选组件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFilterRowsReport: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetFilterRowsReport', args, options);
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
     
     return $.api('Worksheet', 'GetLogs', args, options);
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
  * @param {string} args.endDate
  * @param {string} args.lastMark 最后标记时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetOpeationLogs: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetOpeationLogs', args, options);
   },
  /**
  * 获取子表日志详情
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.rowId 行记录id
  * @param {string} args.uniqueId 唯一id
  * @param {string} args.createTime 创建时间
  * @param {} args.log 日志项集合
  * @param {string} args.lastMark 最后标记时间
  * @param {integer} args.objectType 对象类型
  * @param {integer} args.requestType 请求类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDetailTableLog: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetDetailTableLog', args, options);
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
  * @param {string} args.endDate
  * @param {string} args.lastMark 最后标记时间
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchGetWorksheetOpeationLogs: function (args, options = {}) {
     
     return $.api('Worksheet', 'BatchGetWorksheetOpeationLogs', args, options);
   },
  /**
  * 批量修改行负责人
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.ownerId 要修改成的负责人
  * @param {string} args.appId 应用Id
  * @param {string} args.viewId 视图Id
  * @param {array} args.rowIds 行id集合
  * @param {boolean} args.isAll isAll
  * @param {array} args.excludeRowIds excludeRowIds
  * @param {array} args.filterControls filterControls
  * @param {array} args.navGroupFilters 导航分组筛选
  * @param {string} args.keyWords keyWords
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetRowsOwner: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetRowsOwner', args, options);
   },
  /**
  * 移交行
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.oldOwnerId 旧的负责人
  * @param {string} args.newOwnerId 新的负责人
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetAllRowOwner: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetAllRowOwner', args, options);
   },
  /**
  * 批量已读
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.rowIds 行ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   batchRead: function (args, options = {}) {
     
     return $.api('Worksheet', 'BatchRead', args, options);
   },
  /**
  * 工作表记录分享范围修改
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用Id
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.viewId 视图Id
  * @param {string} args.rowId 行id
  * @param {} args.shareRange 分享范围（枚举）
  * @param {} args.objectType 分享内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateWorksheetRowShareRange: function (args, options = {}) {
     
     return $.api('Worksheet', 'UpdateWorksheetRowShareRange', args, options);
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
     
     return $.api('Worksheet', 'GetRowsShortUrl', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyRow: function (args, options = {}) {
     
     return $.api('Worksheet', 'CopyRow', args, options);
   },
  /**
  * 获取分组导航
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.filterControls 查询列
  * @param {array} args.columnRpts 列排序
  * @param {} args.searchType 查询类型
  * @param {string} args.keyWords 关键词
  * @param {string} args.controlId
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {array} args.fastFilters
  * @param {array} args.navGroupFilters 导航分组筛选
  * @param {array} args.filtersGroup 筛选组件
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNavGroup: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetNavGroup', args, options);
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
     
     return $.api('Worksheet', 'SaveWorksheetFilter', args, options);
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
     
     return $.api('Worksheet', 'GetWorksheetFilters', args, options);
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
     
     return $.api('Worksheet', 'GetWorksheetFilterById', args, options);
   },
  /**
  * 获取嵌入统计图的筛选条件
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.controlId 控件ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFiltersByControlId: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetFiltersByControlId', args, options);
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
     
     return $.api('Worksheet', 'DeleteWorksheetFilter', args, options);
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
     
     return $.api('Worksheet', 'SortWorksheetFilters', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveWorksheetView: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveWorksheetView', args, options);
   },
  /**
  * 获取可见视图
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetViews: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetViews', args, options);
   },
  /**
  * 获取单个视图详情
  * @param {Object} args 请求参数
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetViewById: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetViewById', args, options);
   },
  /**
  * 删除视图
  * @param {Object} args 请求参数
  * @param {string} args.viewId 视图Id
  * @param {string} args.appId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteWorksheetView: function (args, options = {}) {
     
     return $.api('Worksheet', 'DeleteWorksheetView', args, options);
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
     
     return $.api('Worksheet', 'CopyWorksheetView', args, options);
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
     
     return $.api('Worksheet', 'SortWorksheetViews', args, options);
   },
  /**
  * 视图排序自定义动作
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {array} args.btnIds 自定义按钮列表
  * @param {string} args.appId 应用Id
  * @param {string} args.viewId 视图ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sortViewBtns: function (args, options = {}) {
     
     return $.api('Worksheet', 'SortViewBtns', args, options);
   },
  /**
  * 获取按钮列表
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用ID
  * @param {string} args.viewId 视图ID
  * @param {string} args.rowId 行记录ID
  * @param {string} args.worksheetId 工作表ID
  * @param {string} args.btnId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetBtns: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetBtns', args, options);
   },
  /**
  * 获取按钮详情
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用ID
  * @param {string} args.viewId 视图ID
  * @param {string} args.rowId 行记录ID
  * @param {string} args.worksheetId 工作表ID
  * @param {string} args.btnId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetBtnByID: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetBtnByID', args, options);
   },
  /**
  * 操作按钮
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用iD
  * @param {string} args.viewId 视图ID
  * @param {string} args.btnId 按钮ID
  * @param {string} args.worksheetId 工作表ID
  * @param {integer} args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   optionWorksheetBtn: function (args, options = {}) {
     
     return $.api('Worksheet', 'OptionWorksheetBtn', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveWorksheetBtn: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveWorksheetBtn', args, options);
   },
  /**
  * 获取规则列表
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId
  * @param {string} args.ruleId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getControlRules: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetControlRules', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveControlRule: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveControlRule', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sortControlRules: function (args, options = {}) {
     
     return $.api('Worksheet', 'SortControlRules', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveWorksheetControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'SaveWorksheetControls', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addWorksheetControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'AddWorksheetControls', args, options);
   },
  /**
  * 获取表控件
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetControls', args, options);
   },
  /**
  * 获取工作表字段智能建议
  * @param {Object} args 请求参数
  * @param {string} args.prompt
  * @param {} args.lang
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAiFieldRecommendation: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetAiFieldRecommendation', args, options);
   },
  /**
  * 批量获取表控件
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {integer} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 9:回收站的控件
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetsControls: function (args, options = {}) {
     
     return $.api('Worksheet', 'GetWorksheetsControls', args, options);
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
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editControlsAlias: function (args, options = {}) {
     
     return $.api('Worksheet', 'EditControlsAlias', args, options);
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
     
     return $.api('Worksheet', 'EditGenerateControlsDefaultAlias', args, options);
   },
};
