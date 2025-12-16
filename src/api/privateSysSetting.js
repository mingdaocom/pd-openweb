export default {
  /**
  * 系统配置
  * @param {Object} args 请求参数
  * @param {object} args.settings 配置项

ForbidSuites:string，隐藏的协作套件 【1:动态 2:任务 3:日程 4:文件，多个用|分隔】，人事模块强制不显示
OnlyAdminCreateApp:bool，是否只有管理员可以创建应用
HideDownloadApp:bool，是否隐藏 APP 下载入口
DownloadAppRedirectUrl:string，APP 下载落地页（APP 定制开发的客户需要）
HideHelpTip:bool，是否隐藏帮助提示
HideRegister:bool，是否隐藏注册入口
HideTemplateLibrary:bool，是否隐藏模板库
TemplateLibraryTypes:string，开启的模板库类型，1：明道云应用库 2：自建运用库，多个使用英文逗号分隔
TemplateLibraryAuditProjectId，string 模板库应用上架允许审核的组织Id
HideIntegration:bool，是否隐藏集成中心入口
HideIntegrationLibrary:bool，是否隐藏集成中心预置API库
HidePlugin:bool，是否隐藏插件入口
HideDataPipeline:bool，是否隐藏数据集成入口（集成中心=》数据集成、聚合表）
HideAIBasicFun:bool，是否隐藏 AI 基础功能
HideAIGCNode:bool，是否隐藏 AIGC 工作流节点
HideOCR:bool，是否隐藏OCR功能
HideWorkWeixin:bool，隐藏企业微信
HideDingding:bool，隐藏钉钉
HideFeishu:bool，隐藏飞书
HideWelink:bool，隐藏Welink
HideWeixin:bool，隐藏微信公众号
HideWorksheetControl:string，隐藏的工作表控件（多个使用|分割）
WorkflowBatchGetDataLimitCount:int，工作流批量数据获取限制条数
WorkflowSubProcessDataLimitCount:int，工作流子流程数据源限制条数
WorktableBatchOperateDataLimitCount:int，工作表批量数据操作限制条数
WorksheetExcelImportDataLimitCount:int，工作表 Excel 数据导入限制条数
ExportAppWorksheetLimitCount:int，导出的应用工作表总数上限
AppRecycleDays:int，应用回收站保留天数
AppItemRecycleDays:int，应用项回收站保留天数
WorksheetRowRecycleDays:int，工作表行记录回收站保留天数
AppBackupRecycleDays:int，应用备份文件回收站保留天数
FileUploadLimitSize:int，文件上传限制大小（单位：M）
InstallCaptainUrl:string，安装管理器访问地址
ServiceStatusWebhookUrl:string，服务状态通知地址
WorkWxSelfBuildNoticUrl:string，企业微信申请集成通知地址
CsmWebhookUrl:string，运营事件通知接收地址
RefreshReportInterval:int，刷新报表时间间隔（单位：秒），默认 300s
AllowBindAccountNoVerify:bool，是否允许绑定账号不验证
PasswordRegex:string，密码正则表达式
PasswordRegexTip:string，密码正则表达式说明文字
TwoFactorAuthenticationSwitchType:int，双因素认证开关类型（1：全平台用户无需二次验证 2：全平台用户必须二次验证 3：用户自行设置）
TwoFactorAuthenticationPriorityType:int，双因素认证优先的账号类型（1：手机号，2：邮箱）
FirstLoginResetPassword:bool，首次登录需要重置密码
PasswordOverdueDays:int，密码过期时间，0代表不过期
BrandName:string，品牌名
BrandLogo:string，品牌Logo
BrandLogoHeight:int，品牌Logo显示高度
BrandLogoRedirectUrl:string，点击品牌 Logo 跳转地址
BrandHomeImage:string，品牌背景
HideBrandName:bool，是否隐藏品牌名（登录页面）
HideBrandLogo:bool，是否隐藏品牌Logo（登录页面）
EnableDeclareConfirm:bool，Web移动端是否必须同意服务条款/隐私协议
EnableDeclareRegisterConfirm:bool，用户注册时必须同意服务条款/隐私协议
EnableCreateProject:bool，非平台管理员是否可以创建组织
EnableMobilePhoneRegister:bool，是否允许手机号注册
EnableEmailRegister:bool，是否允许邮箱注册
EnableEditAccountInfo:bool，是否允许修改个人账号信息
EnableVerificationCodeLogin:bool，是否允许验证码登录
EnableSmsCustomContent:bool，是否支持自定义短信内容的功能
EnableBackupWorksheetData:bool，是否支持备份工作表数据
EnableFooterInfo:bool，是否显示页脚信息栏
FooterThemeColor:int，页脚信息主题色 1:浅色,2:深色
MultipleDevicesUseSwitchType:int，多设备同时登录开关类型（1：全平台允许 2：全平台禁止 3：用户自行设置）
EnableRequiredStrictVerification:bool，是否开启接口严格鉴权
EnableMap:bool，是否开启地图功能
EnableSso:bool，是否显示 SSO 登录
SsoName:string，SSO 按钮名称
SsoIcon:string，SSO 图标
SsoWebUrl:string，SSO Web Url
SsoAppUrl:string，SSO App Url
LoginGotoAppId:string，登录后直接进入的应用Id，与 LoginGotoUrl 2选1
LoginGotoUrl:string，登录后直接进入的页面地址（不含WebUrl部分），与 LoginGotoAppId 2选1
EnablePromptNewVersion:bool，是否开启新版本提醒
SessionWeb:string，Web（PC/H5) 内部用户会话有效期设置（格式：{t:1,v:5,r:true}）
SessionApp:string，APP 内部用户会话有效期设置（格式：{t:1,v:5,r:true}）
SessionWebPortal:string，Web（PC/H5) 外部门户用户会话有效期设置（格式：{t:1,v:5,r:true}）
SessionExpireRedirectType:int，会话过期后跳转方式 1:停留在原页面（默认） 2:跳转到登录页面
GeoCountryRegionCode:string，国家与地区
EnableVoiceToText:bool，是否开启语音转文字功能
EnableOnlinSearch:bool，是否开启联网搜索
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  editSysSettings: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'EditSysSettings', args, options);
  },
  /**
   * 获取组织列表
   * @param {Object} args 请求参数
   * @param {string} args.keywords 关键词
   * @param {integer} args.pageSize 数量
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProjects: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'GetProjects', args, options);
  },
  /**
   * 获取组织
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProject: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'GetProject', args, options);
  },
  /**
   * 配置 SSO 信息
   * @param {Object} args 请求参数
   * @param {string} args.clientId 客户端Id
   * @param {string} args.clientSecret 客户端密钥
   * @param {string} args.redirectUri 回调地址（废弃，改成服务端固定地址，前端只作为显示）
   * @param {} args.tpType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setSso: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'SetSso', args, options);
  },
  /**
   * 配置 SSO 启用状态
   * @param {Object} args 请求参数
   * @param {} args.tpType
   * @param {} args.status
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setSsoStatus: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'SetSsoStatus', args, options);
  },
  /**
   * 删除 SSO 配置
   * @param {Object} args 请求参数
   * @param {} args.tpType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeSso: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'RemoveSso', args, options);
  },
  /**
   * 获取 SSO 配置信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSsoSettings: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'GetSsoSettings', args, options);
  },
  /**
   * 登录页获取 SSO 配置信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSsonSettingsFroLogin: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'GetSsonSettingsFroLogin', args, options);
  },
  /**
   * 发送 CsmWebhook 测试消息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendCsmWebhookTest: function (args, options = {}) {
    return mdyAPI('PrivateSysSetting', 'SendCsmWebhookTest', args, options);
  },
};
