export default {
  /**
  * 文档预览
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   oWA: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'OWA', args, options);
   },
  /**
  * 文件预览
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   docView: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'DocView', args, options);
   },
  /**
  * Chat 文件消息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downChatFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'DownChatFile', args, options);
   },
  /**
  * 获取chat 文件链接
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getChatFileUrl: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'GetChatFileUrl', args, options);
   },
  /**
  * 下载链接文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downLinkFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'DownLinkFile', args, options);
   },
  /**
  * 下载知识中心文件
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downKcFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'DownKcFile', args, options);
   },
  /**
  * 批量下载行记录附件
  * @param {Object} args 请求参数
  * @param {} args.connectorType 命名方式连接符类型(0:空格,1:破折号,2:下划线,3:点)
  * @param {boolean} args.rowsEstablishRolderType 每行数据创建一个文件夹(0不创建,1创建)
  * @param {array} args.controlIds 附件控件IDs
  * @param {array} args.fileJointNames 勾选文件名称
  * @param {array} args.rowIds 行记录Ids
  * @param {string} args.workSheetTitleId 标题字段id
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
  * @param {object} args.requestParams 请求参数
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
   downloadRowsBatchFile: function (args, options = {}) {
     
     return $.api('File', 'DownloadRowsBatchFile', args, options);
   },
  /**
  * 文件下载
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   downDocument: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'DownDocument', args, options);
   },
  /**
  * 
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   excelFile: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('File', 'ExcelFile', args, options);
   },
};
