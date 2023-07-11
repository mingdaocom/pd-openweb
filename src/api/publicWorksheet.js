export default {
  /**
  * 保存基础信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.name 名称
  * @param {string} args.desc 描述
  * @param {string} args.logo logo
  * @param {string} args.submitBtnName 提交按钮名称
  * @param {string} args.cover 封面
  * @param {integer} args.themeColor 主题颜色（枚举）
  * @param {integer} args.visibleType 分享状态 （1=关闭 2=公开）
  * @param {array} args.controls 控件排序信息
  * @param {array} args.hidedControlIds 隐藏控件ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveWorksheet: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'SaveWorksheet', args, options);
   },
  /**
  * 保存设置
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {string} args.code 代码
  * @param {integer} args.fillTimes 填写次数
  * @param {string} args.ipControlId ip对应控件id
  * @param {string} args.browserControlId 浏览器对应控件id
  * @param {string} args.deviceControlId 设备对应控件id
  * @param {string} args.systemControlId 系统对应控件id
  * @param {string} args.receipt 回执
  * @param {string} args.extendSourceId 扩展来源控件id
  * @param {array} args.extends 扩展来源信息（微博，微信等）
  * @param {boolean} args.needCaptcha 是否启用验证码
  * @param {boolean} args.smsVerification 短信验证 需要短信验证-true 不需要短信验证-false
  * @param {string} args.smsVerificationFiled 选择的手机号验证的字段
  * @param {string} args.smsSignature 短信签名
  * @param {integer} args.writeScope 填写人群范围
  * @param {} args.linkSwitchTime 设置链接开启停止时间
  * @param {} args.limitWriteTime 限制填写时间
  * @param {} args.limitWriteCount 限制收集数量上限 0 or number
  * @param {} args.limitPasswordWrite 限制密码写入 empty or string
  * @param {boolean} args.cacheDraft 缓存未提交内容，下次自动填充
  * @param {} args.cacheFieldData 缓存本次填写数据，下次自动填充
  * @param {} args.weChatSetting 微信设置
  * @param {} args.abilityExpand 能力增强
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveSetting: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'SaveSetting', args, options);
   },
  /**
  * 刷新链接
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refreshPublicWorksheetUrl: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'RefreshPublicWorksheetUrl', args, options);
   },
  /**
  * 变更公开表单分享链接状态
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {} args.visibleType 分享链接状态  1=关闭 2=公开
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updatePublicWorksheetState: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'UpdatePublicWorksheetState', args, options);
   },
  /**
  * 重置
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   reset: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'Reset', args, options);
   },
  /**
  * 根据工作表ID获取公开查询
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPublicQuery: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetPublicQuery', args, options);
   },
  /**
  * 获取表单信息
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPublicWorksheetInfo: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetPublicWorksheetInfo', args, options);
   },
  /**
  * 编辑公开查询状态
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {} args.visibleType 分享链接状态  1=关闭 2=公开
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPublicQueryState: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'EditPublicQueryState', args, options);
   },
  /**
  * 编辑公开查询配置
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId
  * @param {string} args.viewId
  * @param {array} args.queryControlIds
  * @param {string} args.title
  * @param {boolean} args.exported 是否导出excel
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPublicQuery: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'EditPublicQuery', args, options);
   },
  /**
  * 获取关联记录
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
   getRelationRows: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetRelationRows', args, options);
   },
  /**
  * 工作表详情
  * @param {Object} args 请求参数
  * @param {string} args.worksheetId 工作表id
  * @param {boolean} args.getTemplate 是否获取Template
  * @param {boolean} args.getViews 是否获取Views
  * @param {string} args.appId 应用Id
  * @param {boolean} args.handleDefault 处理默认值
  * @param {} args.getControlType 0:显示控件 1：不显示控件（被动关联） 2：全部 3:全部关联控件 9:回收站的控件 11:获取表信息不处理隐藏controlSource
  * @param {array} args.worksheetIds 批量工作表id
  * @param {boolean} args.handControlSource 是否处理关联的原始类型
  * @param {boolean} args.getRules 是否需要验证规则
  * @param {boolean} args.getSwitchPermit 是否获取功能开关
  * @param {boolean} args.getRelationSearch
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetInfo: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetWorksheetInfo', args, options);
   },
  /**
  * 获取公开表单填写信息
  * @param {Object} args 请求参数
  * @param {string} args.shareId 公开表单分享id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPublicWorksheet: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetPublicWorksheet', args, options);
   },
  /**
  * 提交公开表单信息（行记录）
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
  * @param {string} args.password 密码填写
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRow: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'AddRow', args, options);
   },
  /**
  * 获取公开查询信息
  * @param {Object} args 请求参数
  * @param {string} args.queryId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPublicQueryById: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'GetPublicQueryById', args, options);
   },
  /**
  * 公开查询
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
   query: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'Query', args, options);
   },
  /**
  * 公开查询发送验证码短信
  * @param {Object} args 请求参数
  * @param {string} args.account 账号手机号
  * @param {string} args.worksheetId 工作表ID
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendVerifyCode: function (args, options = {}) {
     
     return $.api('PublicWorksheet', 'SendVerifyCode', args, options);
   },
};
