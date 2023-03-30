export default {
  /**
  * 添加应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.name 名称
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {string} args.groupId 分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'CreateApp', args, options);
   },
  /**
  * 首页删除应用(删除之后进入回收站)
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isHomePage 是否首页 true 是 false 否
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'DeleteApp', args, options);
   },
  /**
  * 分页获取应用回收站
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {string} args.projectId 组织id
  * @param {boolean} args.isHomePage 是否为首页
  * @param {string} args.keyword 关键字搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppRecoveryRecordList: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppRecoveryRecordList', args, options);
   },
  /**
  * 首页应用回收站彻底删除
  * @param {Object} args 请求参数
  * @param {string} args.id 记录id
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isHomePage 是否首页 true 是 false 否
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   appRecycleBinDelete: function (args, options = {}) {
     
     return $.api('HomeApp', 'AppRecycleBinDelete', args, options);
   },
  /**
  * 恢复应用
  * @param {Object} args 请求参数
  * @param {string} args.id 记录id
  * @param {string} args.projectId 组织id
  * @param {boolean} args.isHomePage 是否是首页恢复
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   restoreApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'RestoreApp', args, options);
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
  * @param {integer} args.appNaviStyle 移动端:0 = 列表 ，1= 九宫格，2= 导航
  * @param {integer} args.pcNavistyle PC端:0-经典 1-左侧列表 2-卡片模式
  * @param {boolean} args.viewHideNavi 查看影藏导航项
  * @param {string} args.navColor 导航栏颜色
  * @param {string} args.lightColor 淡色色值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAppInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditAppInfo', args, options);
   },
  /**
  * 获取应用导航信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getNavigationInfo: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetNavigationInfo', args, options);
   },
  /**
  * 更新首页应用排序
  * @param {Object} args 请求参数
  * @param {integer} args.sortType 排序类型 1= 全部组织星标应用排序，2 = 网络，3= 个人，4= 外部协作，5= 过期网络，6 = 首页应用分组下应用排序，7 = 当前组织星标应用排序
  * @param {array} args.appIds 应用id
  * @param {string} args.projectId 网络id
  * @param {string} args.groupId 首页分组id
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
  * @param {string} args.groupId 分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
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
  * 获取附件图片列表
  * @param {Object} args 请求参数
  * @param {string} args.workSheetId 工作表id
  * @param {string} args.viewId 视图id
  * @param {string} args.attachementControlId 控件id
  * @param {integer} args.imageLimitCount 图片上限数量
  * @param {array} args.filedIds 工作表字段控件id数组
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAttachementImages: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAttachementImages', args, options);
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
  * 
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAppItemDetail: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetAppItemDetail', args, options);
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
  * @param {string} args.name 分组名称
  * @param {string} args.icon 分组图标
  * @param {string} args.iconColor 分组图标颜色
  * @param {string} args.sourceAppSectionId 来源应用分组id（在此后添加应用分组）
  * @param {string} args.parentId 父级分组id（除了创建一级分组外不需要传，其他都需要传）
  * @param {string} args.rootId 根分组id（除了创建一级分组外不需要传,其他都需要传,参数值为一级分组的id）
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
  * 修改分组基础信息信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {string} args.appSectionId 分组id
  * @param {string} args.appSectionName 分组名称
  * @param {string} args.icon 图标
  * @param {string} args.iconColor 图标颜色
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateAppSection: function (args, options = {}) {
     
     return $.api('HomeApp', 'UpdateAppSection', args, options);
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
  /**
  * 获取我的应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyApp: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetMyApp', args, options);
   },
  /**
  * 获取首页分组详情
  * @param {Object} args 请求参数
  * @param {string} args.id 首页分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'GetGroup', args, options);
   },
  /**
  * 添加应用到分组下
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {array} args.personalGroups 个人分组ids
  * @param {array} args.projectGroups 网络分组ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addToGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'AddToGroup', args, options);
   },
  /**
  * 应用从分组下移除
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用id
  * @param {array} args.personalGroups 个人分组ids
  * @param {array} args.projectGroups 网络分组ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeToGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'RemoveToGroup', args, options);
   },
  /**
  * 标星分组
  * @param {Object} args 请求参数
  * @param {boolean} args.isMarked
  * @param {string} args.id 分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   markedGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'MarkedGroup', args, options);
   },
  /**
  * 新增首页分组
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.name
  * @param {string} args.icon
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'AddGroup', args, options);
   },
  /**
  * 编辑分组信息
  * @param {Object} args 请求参数
  * @param {string} args.name
  * @param {string} args.icon
  * @param {} args.displayType 选项卡类型  0 = 平铺，1= 选项卡 (没有修改可不传这个参数)
  * @param {string} args.id 分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditGroup', args, options);
   },
  /**
  * 删除分组
  * @param {Object} args 请求参数
  * @param {string} args.id 分组id
  * @param {} args.groupType 分组类型 0 = 个人，1= 网络
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteGroup: function (args, options = {}) {
     
     return $.api('HomeApp', 'DeleteGroup', args, options);
   },
  /**
  * 分组排序
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {array} args.ids 分组ids ，排好序传过来
  * @param {integer} args.sortType 排序类型 1= 星标，2 = 网络，3= 个人，
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editGroupSort: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditGroupSort', args, options);
   },
  /**
  * 修改首页自定义显示设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.displayType 显示方式  0 = 平铺，1= 选项卡
  * @param {} args.markedAppDisplay 标星应用显示 0 =当前网络，1= 全部
  * @param {boolean} args.exDisplay 是否显示外部应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editHomeSetting: function (args, options = {}) {
     
     return $.api('HomeApp', 'EditHomeSetting', args, options);
   },
};
