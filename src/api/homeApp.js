module.exports = {
  /**
  * 添加应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.name 名称
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'CreateApp', args, options);
   },
  /**
  * 删除应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'DeleteApp', args, options);
   },
  /**
  * 标星应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {boolean} args.isMark 是否标星（true or false）
  * @param {string} args.projectId 网络id(可空为个人应用)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   markApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'MarkApp', args, options);
   },
  /**
  * 编辑应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {string} args.name 名称
  * @param {string} args.description 描述
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {integer} args.appNaviStyle 0 = 列表 ，1= 九宫格，2= 导航
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditAppInfo', args, options);
   },
  /**
  * 更新首页应用排序
  * @param {Object} args 请求参数
  * @param {integer} args.sortType 排序类型
  * @param {array} args.appIds 应用id
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppSort: function (args, options = {}) {
     
     return $.api('HomeApp', 'UpdateAppSort', args, options);
   },
  /**
  * 编辑首页网络排序
  * @param {Object} args 请求参数
  * @param {array} args.projectIds 排序后的网络id集合
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editProjectIndex: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditProjectIndex', args, options);
   },
  /**
  * 复制应用
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appName 新的应用名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   copyApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'CopyApp', args, options);
   },
  /**
  * 应用发布设置
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 组织id
  * @param {boolean} args.pcDisplay Pc端显示,
  * @param {boolean} args.webMobileDisplay web移动端显示
  * @param {boolean} args.appDisplay app端显示
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   publishSettings: function (args, options = {}) {
     
     return $.api('HomeApp', 'PublishSettings', args, options);
   },
  /**
  * 编辑开放接口的白名单
  * @param {Object} args 请求参数
  * @param {array} args.whiteIps 白名单
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWhiteList: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditWhiteList', args, options);
   },
  /**
  * 更新维护状态
  * @param {Object} args 请求参数
  * @param {string} args.appId
  * @param {string} args.projectId
  * @param {boolean} args.fixed 维护中标识 true,false
  * @param {string} args.fixRemark 维护通知
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editFix: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditFix', args, options);
   },
  /**
  * 获取首页所有应用信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllHomeApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAllHomeApp', args, options);
   },
  /**
  * 获取应用分组的详情（包含导航头和工作表基础信息）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppInfo', args, options);
   },
  /**
  * 获取应用下所有工作表信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {} args.type 应用分组下实体类型（0=工作表，1=自定义页面）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorksheetsByAppId: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetWorksheetsByAppId', args, options);
   },
  /**
  * 获取自定义页面详情
  * @param {Object} args 请求参数
  * @param {string} args.id
  * @param {string} args.sectionId 分组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPageInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetPageInfo', args, options);
   },
  /**
  * 获取应用详细信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppDetail: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppDetail', args, options);
   },
  /**
  * 验证应用有效性
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'CheckApp', args, options);
   },
  /**
  * 获取应用下分组和第一个工作表信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId SectionId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppFirstInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppFirstInfo', args, options);
   },
  /**
  * 获取简单应用id及分组id
  * @param {Object} args 请求参数
  * @param {string} args.workSheetId 工作表id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppSimpleInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppSimpleInfo', args, options);
   },
  /**
  * 应用分享详情获取
  * @param {Object} args 请求参数
  * @param {string} args.shareId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getShare: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetShare', args, options);
   },
  /**
  * 根据应用分组id获取详情
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 分组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppSectionDetail: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppSectionDetail', args, options);
   },
  /**
  * 添加应用分组
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.name 名称
  * @param {string} args.sourceAppSectionId 来源应用分组id（在此后添加应用分组）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAppSection: function (args, options = {}) {
     
     return $.api('HomeApp', 'AddAppSection', args, options);
   },
  /**
  * 修改应用分组名称
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.name 名称
  * @param {string} args.appSectionId 分组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppSectionName: function (args, options = {}) {
     
     return $.api('HomeApp', 'UpdateAppSectionName', args, options);
   },
  /**
  * 删除应用分组（并移动该项下工作表到其他应用分组）
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 删除应用分组Id
  * @param {string} args.sourceAppSectionId 目标应用分组id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteAppSection: function (args, options = {}) {
     
     return $.api('HomeApp', 'DeleteAppSection', args, options);
   },
  /**
  * 更新应用分组排序信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {array} args.appSectionIds 删除应用分组Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppSectionSort: function (args, options = {}) {
     
     return $.api('HomeApp', 'UpdateAppSectionSort', args, options);
   },
  /**
  * 更新应用分组下工作表排序信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 分组id
  * @param {array} args.workSheetIds 排序后的完整ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateSectionChildSort: function (args, options = {}) {
     
     return $.api('HomeApp', 'UpdateSectionChildSort', args, options);
   },
  /**
  * 设置工作表显示隐藏
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.worksheetId 工作表id
  * @param {integer} args.status 状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setWorksheetStatus: function (args, options = {}) {
     
     return $.api('HomeApp', 'SetWorksheetStatus', args, options);
   },
  /**
  * 获取应用open api文档
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApiInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetApiInfo', args, options);
   },
};
