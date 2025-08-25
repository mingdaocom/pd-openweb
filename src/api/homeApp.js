export default {
  /**
   * 添加应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.name 名称
   * @param {string} args.icon 图标
   * @param {string} args.iconColor 图标颜色
   * @param {string} args.navColor 导航颜色
   * @param {string} args.lightColor 背景色
   * @param {string} args.groupId 分组id
   * @param {} args.groupType
   * @param {string} args.urlTemplate url链接模板
   * @param {object} args.configuratiuon 链接配置
   * @param {} args.createType
   * @param {boolean} args.pcDisplay Pc端显示,
   * @param {boolean} args.webMobileDisplay web移动端显示
   * @param {boolean} args.appDisplay app端显示
   * @param {string} args.dbInstanceId 数据库实例id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  createApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'CreateApp', args, options);
  },
  /**
   * 首页删除应用(删除之后进入回收站)
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.projectId 网络id
   * @param {boolean} args.isHomePage 是否首页 true 是 false 否
   * @param {boolean} args.noCache 不处理缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'DeleteApp', args, options);
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
    return mdyAPI('HomeApp', 'GetAppRecoveryRecordList', args, options);
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
    return mdyAPI('HomeApp', 'AppRecycleBinDelete', args, options);
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
    return mdyAPI('HomeApp', 'RestoreApp', args, options);
  },
  /**
   * 编辑应用时区
   * @param {Object} args 请求参数
   * @param {string} args.appId
   * @param {integer} args.timeZone 1 = 跟随设备，其他参考个人设置，一样的code
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAppTimeZones: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditAppTimeZones', args, options);
  },
  /**
   * 编辑原始语言
   * @param {Object} args 请求参数
   * @param {string} args.appId
   * @param {string} args.originalLang 原始语言code
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAppOriginalLang: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditAppOriginalLang', args, options);
  },
  /**
   * 标星应用或应用项
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.itemId 应用项id
   * @param {integer} args.type 0 = 应用，1 = 自定义页面，2 = 工作表
   * @param {boolean} args.isMark 是否标星（true or false）
   * @param {string} args.projectId 网络id(可空为个人应用)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  markApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MarkApp', args, options);
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
   * @param {integer} args.pcNavistyle PC端:0-经典 1-左侧列表 2-卡片模式，3 = 树形
   * @param {boolean} args.viewHideNavi 查看影藏导航项
   * @param {string} args.navColor 导航栏颜色
   * @param {string} args.lightColor 淡色色值
   * @param {integer} args.gridDisplayMode 宫格显示模式
   * @param {integer} args.appNaviDisplayType 移动端导航列表显示类型
   * @param {string} args.urlTemplate 外部链接url
   * @param {object} args.configuration 链接配置
   * @param {boolean} args.pcDisplay Pc端显示,
   * @param {boolean} args.webMobileDisplay web移动端显示
   * @param {boolean} args.appDisplay app端显示
   * @param {integer} args.selectAppItmeType 记住上次使用（2 = 是，1 = 老配置，始终第一个）
   * @param {integer} args.pcNaviDisplayType 导航分组展开样式（10.2去掉了）
   * @param {string} args.displayIcon 显示图标,目前只有三级（000，111，，0=不勾选，1=勾选）
   * @param {integer} args.expandType 展开方式  0 = 默认，1 = 手风琴
   * @param {boolean} args.hideFirstSection 隐藏首个分组
   * @param {array} args.appNavItemIds 移动端导航应用项ids
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editAppInfo: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditAppInfo', args, options);
  },
  /**
   * 更新首页应用排序
   * @param {Object} args 请求参数
   * @param {integer} args.sortType 排序类型 1= 全部组织星标应用排序，2 = 网络，3= 个人，4= 外部协作，5= 过期网络，6 = 首页应用分组下应用排序，7 = 当前组织星标应用排序， 8 = 我拥有的应用排序
   * @param {array} args.appIds 应用id
   * @param {string} args.projectId 网络id
   * @param {string} args.groupId 首页分组id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateAppSort: function (args, options = {}) {
    return mdyAPI('HomeApp', 'UpdateAppSort', args, options);
  },
  /**
   * 复制应用
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.appName 新的应用名称
   * @param {string} args.groupId 分组id
   * @param {} args.groupType
   * @param {string} args.dbInstanceId 数据库实例id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  copyApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'CopyApp', args, options);
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
    return mdyAPI('HomeApp', 'PublishSettings', args, options);
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
    return mdyAPI('HomeApp', 'EditWhiteList', args, options);
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
    return mdyAPI('HomeApp', 'EditFix', args, options);
  },
  /**
   * 编辑sso登录应用首页地址
   * @param {Object} args 请求参数
   * @param {string} args.appId
   * @param {string} args.ssoAddress
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSSOAddress: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditSSOAddress', args, options);
  },
  /**
   * 获取首页所有应用信息
   * @param {Object} args 请求参数
   * @param {boolean} args.containsLinks
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAllHomeApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetAllHomeApp', args, options);
  },
  /**
   * 获取应用下所有工作表信息
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {} args.type
   * @param {boolean} args.getAlias 是否获取工作表别名(默认不获取)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getWorksheetsByAppId: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetWorksheetsByAppId', args, options);
  },
  /**
   * 获取附件图片列表
   * @param {Object} args 请求参数
   * @param {string} args.workSheetId 工作表id
   * @param {string} args.viewId 视图id
   * @param {string} args.attachementControlId 控件id
   * @param {integer} args.imageLimitCount 图片上限数量
   * @param {integer} args.displayMode 展示方式（默认值为0） 0-all 1-每条记录第一张
   * @param {array} args.filedIds 工作表字段控件id数组
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAttachementImages: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetAttachementImages', args, options);
  },
  /**
   * 进入应用刷新页面，前端路由匹配接口
   * @param {Object} args 请求参数
   * @param {string} args.id
   * @param {string} args.sectionId 分组id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPageInfo: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetPageInfo', args, options);
  },
  /**
   * 批量获取应用项信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppItemDetail: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetAppItemDetail', args, options);
  },
  /**
  * 获取应用详情（包含分组信息，请求参数可选）
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.clientId 客户端标识
记录输入密码之后，页面刷新不用重复输入密码操作
滑动过期
  * @param {string} args.appId 应用id
  * @param {boolean} args.getSection 是否获取分组信息
  * @param {boolean} args.getManager 是否获取管理员列表信息
  * @param {boolean} args.getProject 获取组织信息
  * @param {boolean} args.getLang 是否获取应用语种信息
  * @param {boolean} args.isMobile 是否是移动端
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetApp', args, options);
  },
  /**
   * 验证应用有效性
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.tradeId 交易id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'CheckApp', args, options);
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
    return mdyAPI('HomeApp', 'GetAppFirstInfo', args, options);
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
    return mdyAPI('HomeApp', 'GetAppSimpleInfo', args, options);
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
    return mdyAPI('HomeApp', 'GetAppSectionDetail', args, options);
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
    return mdyAPI('HomeApp', 'AddAppSection', args, options);
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
    return mdyAPI('HomeApp', 'UpdateAppSectionName', args, options);
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
    return mdyAPI('HomeApp', 'UpdateAppSection', args, options);
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
    return mdyAPI('HomeApp', 'DeleteAppSection', args, options);
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
    return mdyAPI('HomeApp', 'UpdateAppSectionSort', args, options);
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
    return mdyAPI('HomeApp', 'UpdateSectionChildSort', args, options);
  },
  /**
   * 设置应用项显示隐藏
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.worksheetId 工作表id
   * @param {integer} args.status 状态(1= 显示，2 = 全隐藏，3 = PC隐藏，4 = 移动端隐藏)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setWorksheetStatus: function (args, options = {}) {
    return mdyAPI('HomeApp', 'SetWorksheetStatus', args, options);
  },
  /**
   * 获取应用open api文档
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {boolean} args.notOnSettingPage 不是在 配置页面（ 当为 ture 时，代表是在 前台/非管理 页面，此时 需要验证 角色负责人）
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getApiInfo: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetApiInfo', args, options);
  },
  /**
   * 获取我的应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {boolean} args.containsLinks 是否包含外部链接
   * @param {boolean} args.getMarkApp 是否获取标记 (默认获取，10.1新版本后可以不用获取)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMyApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetMyApp', args, options);
  },
  /**
   * 获取首页分组详情
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {boolean} args.containsLinks 是否包含外部链接
   * @param {boolean} args.getMarkApp 是否获取标记 (默认获取，10.1新版本后可以不用获取)
   * @param {string} args.id 首页分组id
   * @param {} args.groupType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getGroup: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetGroup', args, options);
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
    return mdyAPI('HomeApp', 'AddToGroup', args, options);
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
    return mdyAPI('HomeApp', 'RemoveToGroup', args, options);
  },
  /**
   * 标星分组
   * @param {Object} args 请求参数
   * @param {string} args.id 分组id
   * @param {} args.groupType
   * @param {string} args.projectId
   * @param {boolean} args.isMarked
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  markedGroup: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MarkedGroup', args, options);
  },
  /**
   * 新增首页分组
   * @param {Object} args 请求参数
   * @param {string} args.projectId
   * @param {string} args.name
   * @param {string} args.icon
   * @param {} args.groupType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addGroup: function (args, options = {}) {
    return mdyAPI('HomeApp', 'AddGroup', args, options);
  },
  /**
   * 编辑分组信息
   * @param {Object} args 请求参数
   * @param {string} args.id 分组id
   * @param {} args.groupType
   * @param {string} args.projectId
   * @param {string} args.name
   * @param {string} args.icon
   * @param {} args.displayType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editGroup: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditGroup', args, options);
  },
  /**
   * 删除分组
   * @param {Object} args 请求参数
   * @param {string} args.id 分组id
   * @param {} args.groupType
   * @param {string} args.projectId
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteGroup: function (args, options = {}) {
    return mdyAPI('HomeApp', 'DeleteGroup', args, options);
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
    return mdyAPI('HomeApp', 'EditGroupSort', args, options);
  },
  /**
   * 修改首页自定义显示设置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {} args.displayType
   * @param {} args.markedAppDisplay
   * @param {} args.todoDisplay
   * @param {boolean} args.exDisplay 是否显示外部应用
   * @param {boolean} args.displayCommonApp 是否显示常用应用
   * @param {boolean} args.isAllAndProject 是否开启全部和组织分组
   * @param {boolean} args.displayMark 是否显示星标应用
   * @param {boolean} args.rowCollect 记录收藏
   * @param {boolean} args.displayApp 工作台左侧菜单是否显示app
   * @param {boolean} args.displayChart 图表收藏开关
   * @param {array} args.sortItems 排序
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editHomeSetting: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditHomeSetting', args, options);
  },
  /**
   * 批量标记应用和应用项目
   * @param {Object} args 请求参数
   * @param {array} args.items 标记的应用和应用项
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  markApps: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MarkApps', args, options);
  },
  /**
   * 编辑平台设置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {array} args.bulletinBoards 宣传栏
   * @param {string} args.color 颜色
   * @param {string} args.slogan 标语
   * @param {string} args.logo 组织logo
   * @param {boolean} args.logoSwitch logo开关
   * @param {boolean} args.boardSwitch 宣传栏目开关
   * @param {integer} args.logoHeight logo高度
   * @param {object} args.advancedSetting
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editPlatformSetting: function (args, options = {}) {
    return mdyAPI('HomeApp', 'EditPlatformSetting', args, options);
  },
  /**
   * 工作台
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  myPlatform: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MyPlatform', args, options);
  },
  /**
   * 收藏的应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  marketApps: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MarketApps', args, options);
  },
  /**
   * 最近访问应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  recentApps: function (args, options = {}) {
    return mdyAPI('HomeApp', 'RecentApps', args, options);
  },
  /**
   * 获取工作台ids（测试用）
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppIdsAndItemIdsTest: function (args, options = {}) {
    options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });
    return mdyAPI('HomeApp', 'GetAppIdsAndItemIdsTest', args, options);
  },
  /**
   * 工作台多语言
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  myPlatformLang: function (args, options = {}) {
    return mdyAPI('HomeApp', 'MyPlatformLang', args, options);
  },
  /**
   * 获取应用下应用项
   * @param {Object} args 请求参数
   * @param {string} args.appId 应用id
   * @param {string} args.tradeId 交易id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAppItems: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetAppItems', args, options);
  },
  /**
   * 获取平台设置
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getHomePlatformSetting: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetHomePlatformSetting', args, options);
  },
  /**
   * 我拥有的应用
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {boolean} args.noCache 不走缓存
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getOwnedApp: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetOwnedApp', args, options);
  },
  /**
  * 获取可用的专属数据库列表
注意 受限于版本 应用/组织管理员
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getMyDbInstances: function (args, options = {}) {
    return mdyAPI('HomeApp', 'GetMyDbInstances', args, options);
  },
};
