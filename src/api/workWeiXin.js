export default {
  /**
  * 明道云通讯录同步到企业微信
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.check 是否只检测
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncMingToWorkWX: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncMingToWorkWX', args, options);
   },
  /**
  * 企业微信通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.check 是否只检测
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncWorkWXToMing: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncWorkWXToMing', args, options);
   },
  /**
  * 修改自动同步设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.autoSync 自动同步（true:开启 false:关系）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAutoSync: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditAutoSync', args, options);
   },
  /**
  * 获取通过已存在的企业微信账号安装应用的跳转地址
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.suiteId 套件Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getInstallByExistAccountUrl: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetInstallByExistAccountUrl', args, options);
   },
  /**
  * 获取安装推荐应用的url
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRecommendInstallUrls: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetRecommendInstallUrls', args, options);
   },
  /**
  * 获取通过创建新的企业微信账号安装应用的跳转地址
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.suiteId 套件Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getInstallByNewAccountUrl: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetInstallByNewAccountUrl', args, options);
   },
  /**
  * 获取套件信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectSuiteInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetProjectSuiteInfo', args, options);
   },
  /**
  * 获取日志列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLogs: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetLogs', args, options);
   },
  /**
  * 保存上传到企业微信的临时素材到七牛
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.suiteType 套件类型
  * @param {string} args.mediaId mediaId
  * @param {} args.bucketType 存储的Bucket
  * @param {string} args.ext 扩展名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   saveMedia: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SaveMedia', args, options);
   },
  /**
  * 获取js-sdk的签名信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.suiteType 套件类型（1：通讯录 2：任务 3：审批 4：考勤 5：明道云小程序 6：明道云 8：自建应用包括代开发）
  * @param {string} args.url 调用JS接口页面的完整URL，不包含#及其后面部分
  * @param {integer} args.ticketType 签名类型
1表示企业 wx.config；2表示应用 agentConfig
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSignatureInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetSignatureInfo', args, options);
   },
  /**
  * 编辑应用消息通知
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.appId 应用id
  * @param {string} args.agentId AgentId
  * @param {string} args.secret Secret
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorkWXAppNoticeSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWorkWXAppNoticeSetting', args, options);
   },
  /**
  * 获取全部明道云与企业微信用户、部门关系
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXAllMap: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXAllMap', args, options);
   },
  /**
  * 获取明道云与企业微信用户关系【key:明道用户 accountid，value:企业微信用户id】
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.accountIds 明道云账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXAccountIdMap: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXAccountIdMap', args, options);
   },
  /**
  * 获取明道云与企业微信部门关系【key:明道部门id，value:企业微信部门id】
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.departmentIds 明道云部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXDepartmentIdMap: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXDepartmentIdMap', args, options);
   },
  /**
  * 获取网络的钉钉设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDDProjectSettingInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetDDProjectSettingInfo', args, options);
   },
  /**
  * 获取网络或者应用钉钉的配置地址
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.apkId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDDSsoUrlInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetDDSsoUrlInfo', args, options);
   },
  /**
  * 编辑网络的钉钉设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.appKey 钉钉应用的appkey
  * @param {string} args.appSecret 钉钉应用的appsecret
  * @param {string} args.corpId 钉钉公司 ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDProjectSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDProjectSetting', args, options);
   },
  /**
  * 修改钉钉扫码登录信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.scan_appKey 钉钉扫码应用id
  * @param {string} args.scan_appSecret 钉钉扫码应用secret
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editProjectSettingScanInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditProjectSettingScanInfo', args, options);
   },
  /**
  * 编辑网络的钉钉集成状态
0代表提交申请；2代表之前集成过但关闭集成；1重新开启使用
由于钉钉IP策略调整，直接点击申请就代表可以开通
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 主站需要用到的值：0代表提交申请；2代表之前集成过但关闭集成；1重新开启使用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDProjectSettingStatus: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDProjectSettingStatus', args, options);
   },
  /**
  * 编辑钉钉客户端打开方式
1 为新开浏览器打开方式，2 为钉钉PC端打开
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDProjectClientWorkingPattern: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDProjectClientWorkingPattern', args, options);
   },
  /**
  * 编辑钉钉消息链接可配置打开方式
1 侧边栏打开（默认），2 浏览器打开
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDMessagUrlPcSlide: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDMessagUrlPcSlide', args, options);
   },
  /**
  * 编辑钉钉消息是否进入待办任务
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDProjectTodoMessageEnabled: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDProjectTodoMessageEnabled', args, options);
   },
  /**
  * 钉钉通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.check 是否只检测
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncWorkDDToMing: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncWorkDDToMing', args, options);
   },
  /**
  * 编辑应用钉钉消息通知
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.appId 明道应用id
  * @param {string} args.agentId 钉钉应用代理id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editDDAppNoticeSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditDDAppNoticeSetting', args, options);
   },
  /**
  * 获取钉钉自建应用 JSAPI 配置信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.url 地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDDJsapiConfig: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetDDJsapiConfig', args, options);
   },
  /**
  * 获取网络的企业微信自建应用集成设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWXProjectSettingInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWXProjectSettingInfo', args, options);
   },
  /**
  * 编辑网络的企业微信自建应用集成设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.agentId 应用的AgentId
  * @param {string} args.secret 应用的Secret
  * @param {string} args.corpId 公司 ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectSetting', args, options);
   },
  /**
  * 编辑企业微信自建应用集成状态
1代表开通；2代表关闭
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectSettingStatus: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectSettingStatus', args, options);
   },
  /**
  * 编辑企业微信是否允许使用扫码登录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectScanEnabled: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectScanEnabled', args, options);
   },
  /**
  * 编辑企业微信是否允许自定义字段匹配
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectMappingFieldEnabled: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectMappingFieldEnabled', args, options);
   },
  /**
  * 编辑企业微信工号自定义匹配的字段
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.fieldName 企业微信自定义匹配的字段名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectJobnumberMappingField: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectJobnumberMappingField', args, options);
   },
  /**
  * 编辑企业微信标签自定义匹配的字段
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.fieldName 企业微信自定义匹配的字段名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXProjectTagMappingField: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXProjectTagMappingField', args, options);
   },
  /**
  * 编辑私有部署企业微信是否启用快速审批
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWXIsEnableQuickApprove: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWXIsEnableQuickApprove', args, options);
   },
  /**
  * 检测企业微信自建应用集成通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkWorkWXToMingByApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'CheckWorkWXToMingByApp', args, options);
   },
  /**
  * 获取企业微信通讯录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXStructureInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXStructureInfo', args, options);
   },
  /**
  * 企业微信自建应用集成通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {object} args.userMaps 明道用户和微信的手动映射关系
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncWorkWXToMingByApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncWorkWXToMingByApp', args, options);
   },
  /**
  * 获取企业微信和明道云用户绑定关系列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.platformKeyword
  * @param {string} args.workwxKeyword
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWxUserRelations: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWxUserRelations', args, options);
   },
  /**
  * 解绑企业微信用户和明道云用户关系
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.mingdaoAccountId
  * @param {string} args.workwxUserId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unbindWorkWxUserRelation: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'UnbindWorkWxUserRelation', args, options);
   },
  /**
  * 转换网络企业微信集成状态
企业微信自建应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.tagetProjectId 需要转换的网络Id
  * @param {string} args.agentId 应用的AgentId
  * @param {string} args.secret 应用的Secret
  * @param {string} args.corpId 公司 ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   transferProjectIntergrationToWorkwxApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'TransferProjectIntergrationToWorkwxApp', args, options);
   },
  /**
  * 企业微信第三方/自建 应用SSO地址信息 公用同一个接口，后端根据集成类型判断
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.apkId 应用Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXSsoUrlInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXSsoUrlInfo', args, options);
   },
  /**
  * 获取企业微信代开发模式授权二维码链接
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWXAlternativeAppScanCodeUrl: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWXAlternativeAppScanCodeUrl', args, options);
   },
  /**
  * 提交已经申请开通企业微信代开发模式
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWorkWXAlternativeAppStatus: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWorkWXAlternativeAppStatus', args, options);
   },
  /**
  * 提交应用申请开通企业微信代开发模式
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.appId 应用Id
  * @param {string} args.appName 应用名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyWorkWXAlternativeApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'ApplyWorkWXAlternativeApp', args, options);
   },
  /**
  * 获取网络的Welink设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWelinkProjectSettingInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWelinkProjectSettingInfo', args, options);
   },
  /**
  * 编辑网络的Welink自建应用集成设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.clientId 应用的AgentId
  * @param {string} args.clientSecret 应用的Secret
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWelinkProjectSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWelinkProjectSetting', args, options);
   },
  /**
  * 编辑Welink自建应用集成状态
1代表开通；2代表关闭
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editWelinkProjectSettingStatus: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditWelinkProjectSettingStatus', args, options);
   },
  /**
  * Welink自建应用集成通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.check 是否只检测
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncWelinkToMingByApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncWelinkToMingByApp', args, options);
   },
  /**
  * Welink 自建应用SSO地址信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWelinkSsoUrlInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWelinkSsoUrlInfo', args, options);
   },
  /**
  * 获取网络的飞书设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFeishuProjectSettingInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetFeishuProjectSettingInfo', args, options);
   },
  /**
  * 获取飞书js-sdk的签名信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.url 调用JS接口页面的完整URL，不包含#及其后面部分
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFeiShuSignatureInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetFeiShuSignatureInfo', args, options);
   },
  /**
  * 编辑网络的飞书自建应用集成设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.appId 应用的Id
  * @param {string} args.appSecret 应用的Secret
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editFeishuProjectSetting: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditFeishuProjectSetting', args, options);
   },
  /**
  * 编辑飞书自建应用集成状态
1代表开通；2代表关闭
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.status 1代表开通；2代表关闭
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editFeishuProjectSettingStatus: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditFeishuProjectSettingStatus', args, options);
   },
  /**
  * 飞书自建应用集成通讯录同步到明道云
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.check 是否只检测
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   syncFeishuToMingByApp: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'SyncFeishuToMingByApp', args, options);
   },
  /**
  * 飞书 自建应用SSO地址信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFeishuSsoUrlInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetFeishuSsoUrlInfo', args, options);
   },
  /**
  * 获取集成账号自定义初始密码值
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIntergrationAccountInitializeInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetIntergrationAccountInitializeInfo', args, options);
   },
  /**
  * 设置集成账号自定义初始密码值
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.password 自定义初始密码值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editIntergrationAccountInitializeInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'EditIntergrationAccountInitializeInfo', args, options);
   },
  /**
  * 根据应用信息获取集成相关信息
返回集成类型与网络信息
  * @param {Object} args 请求参数
  * @param {string} args.appId 应用ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getIntergrationInfo: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetIntergrationInfo', args, options);
   },
  /**
  * 获取明道授权许可信息详情
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWxLicenseDetailByApp: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('WorkWeiXin', 'GetWorkWxLicenseDetailByApp', args, options);
   },
  /**
  * 获取创建订单信息提示
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWxLicenseCreateOrderDetailByApp: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return $.api('WorkWeiXin', 'GetWorkWxLicenseCreateOrderDetailByApp', args, options);
   },
  /**
  * 创建订单
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createWorkWxLicenseOrder: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'CreateWorkWxLicenseOrder', args, options);
   },
  /**
  * 查看订单列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.startTime 开始时间,下单时间。可不填。但是不能单独指定该字段，start_time跟end_time必须同时指定。
  * @param {string} args.endTime 结束时间,下单时间。起始时间跟结束时间不能超过31天。可不填。但是不能单独指定该字段，start_time跟end_time必须同时指定。
  * @param {integer} args.pageIndex 用于分页查询的游标，字符串类型，由上一次调用返回，首次调用可不填
  * @param {integer} args.pageSize 返回的最大记录数，整型，最大值1000，默认值500
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWxLicenseOrderList: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWxLicenseOrderList', args, options);
   },
  /**
  * 订单详情
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.orderId 订单id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWxLicenseOrderDetail: function (args, options = {}) {
     
     return $.api('WorkWeiXin', 'GetWorkWxLicenseOrderDetail', args, options);
   },
};
