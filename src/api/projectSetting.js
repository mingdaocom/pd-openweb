export default {
  /**
  * 界面定制（人事审批打印功能有调用这个接口，所以不能限制管理员权限）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSysColor: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetSysColor', args, options);
   },
  /**
  * 获取 是否允许申请后台组织管理员权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllowApplyManageRole: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetAllowApplyManageRole', args, options);
   },
  /**
  * 获取 平台登录配置（Mingdao）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMDLoginSetting: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetMDLoginSetting', args, options);
   },
  /**
  * 获取SSO相关配置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSsoSettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetSsoSettings', args, options);
   },
  /**
  * 二级域名
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubDomain: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetSubDomain', args, options);
   },
  /**
  * 新用户加入企业必填字段
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPrivacy: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetPrivacy', args, options);
   },
  /**
  * 获取是否允许全员可见组织结构
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getStructureForAll: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetStructureForAll', args, options);
   },
  /**
  * 获取 是否开启了水印
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEnabledWatermark: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetEnabledWatermark', args, options);
   },
  /**
  * 获取 是否开启了用户密码输入可以设置免密验证
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEnabledNoneVerification: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetEnabledNoneVerification', args, options);
   },
  /**
  * 获取 是否只允许管理员创建应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOnlyManagerCreateApp: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetOnlyManagerCreateApp', args, options);
   },
  /**
  * 获取 是否自动订购工作流升级包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAutoPurchaseWorkflowExtPack: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetAutoPurchaseWorkflowExtPack', args, options);
   },
  /**
  * 获取 是否自动订购数据集成升级包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAutoPurchaseDataPipelineExtPack: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetAutoPurchaseDataPipelineExtPack', args, options);
   },
  /**
  * 获取 API集成 仅管理员 可用开关（integration 简写成 intg）,预警信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOnlyManagerSettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetOnlyManagerSettings', args, options);
   },
  /**
  * 获取组织余额告警提醒设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getBalanceLimitNoticeSettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetBalanceLimitNoticeSettings', args, options);
   },
  /**
  * LOGO
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setLogo: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetLogo', args, options);
   },
  /**
  * 去掉 LOGO
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   clearLogo: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'ClearLogo', args, options);
   },
  /**
  * 二级域名页面背景图片
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setCustomeHomeImage: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetCustomeHomeImage', args, options);
   },
  /**
  * 设置允许全员可见组织结构
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setStructureForAll: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetStructureForAll', args, options);
   },
  /**
  * 设置允许员工自行添加下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setStructureSelfEdit: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetStructureSelfEdit', args, options);
   },
  /**
  * 设置 是否 只允许管理员创建应用
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setOnlyManagerCreateApp: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetOnlyManagerCreateApp', args, options);
   },
  /**
  * 设置 是否 开启水印功能
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setEnabledWatermark: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetEnabledWatermark', args, options);
   },
  /**
  * 设置 开启水印功能 文本
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setEnabledWatermarkTxt: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetEnabledWatermarkTxt', args, options);
   },
  /**
  * 设置 是否 启用用户密码输入可以设置免密验证
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setEnabledNoneVerification: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetEnabledNoneVerification', args, options);
   },
  /**
  * 设置 是否 自动订购工作流升级包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.autoPurchaseWorkflowExtPack 是否 自动订购工作流升级包
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setAutoPurchaseWorkflowExtPack: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetAutoPurchaseWorkflowExtPack', args, options);
   },
  /**
  * 设置 是否 自动订购数据集成升级包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.autoPurchaseDataPipelineExtPack 是否 自动订购数据集成升级包
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setAutoPurchaseDataPipelineExtPack: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetAutoPurchaseDataPipelineExtPack', args, options);
   },
  /**
  * 设置 是否 自动订购ApkStorage升级包
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.autoPurchaseApkStorageExtPack 是否 自动订购应用附件上传流量升级包
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setAutoPurchaseApkStorageExtPack: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetAutoPurchaseApkStorageExtPack', args, options);
   },
  /**
  * 设置 是否允许申请后台组织管理员权限
超级管理员才能操作
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowApplyManageRole 是否允许申请管理员
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setAllowApplyManageRole: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetAllowApplyManageRole', args, options);
   },
  /**
  * 设置 平台登录配置（Mingdao）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.enabledMDLogin 是否开启平台账号登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setMDLoginSetting: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetMDLoginSetting', args, options);
   },
  /**
  * 设置 是否开启SSO
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isOpenSso 是否开启sso
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setSso: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetSso', args, options);
   },
  /**
  * 设置 Sso 自定义显示名称
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.ssoName Sso 自定义显示名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setSsoName: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetSsoName', args, options);
   },
  /**
  * 设置 SSOUrl
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.ssoWebUrl sso web url
  * @param {string} args.ssoAppUrl sso app url
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setSsoUrl: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetSsoUrl', args, options);
   },
  /**
  * 设置二级域名
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.allowProjectCodeJoin 企业标识
  * @param {string} args.logoName LOGO
  * @param {string} args.imageName 二级域名页面背景图片
  * @param {boolean} args.birthdayNoticeEnabled 生日提醒
  * @param {boolean} args.isAudit 设置审批
  * @param {boolean} args.forAll 设置允许全员可见组织结构
  * @param {boolean} args.isAllowStructureSelfEdit 是否 允许员工自行添加下属
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用
  * @param {boolean} args.enabledWatermark 是否 启用水印
  * @param {boolean} args.enabledNoneVerification 是否 启用用户密码输入可以设置免密验证
  * @param {boolean} args.notice 设置允许Score通知
  * @param {string} args.subDomain 设置二级域名
  * @param {string} args.domain 删除绑定的域名
  * @param {string} args.enabledWatermarkTxt 水印文本
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setSubDomin: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetSubDomin', args, options);
   },
  /**
  * 新用户加入企业必填字段
MD.Enum.ProjectSetting.UserFillCompanyEnabled
MD.Enum.ProjectSetting.UserFillWorkSiteEnabled
MD.Enum.ProjectSetting.UserFillJobNumberEnabled
MD.Enum.ProjectSetting.UserFillDepartmentEnabled
【前端反馈 无调用】
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.setting
  * @param {boolean} args.settingValue 是否开启
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setPrivacy: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetPrivacy', args, options);
   },
  /**
  * 仅管理员 可用开关
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {boolean} args.onlyManagerCreateApp 是否 只允许管理员创建应用（可空，空置不设置该值）
  * @param {boolean} args.apiIntgOnlyManager 是否 只允许管理员创建应用（可空，空置不设置该值）
  * @param {boolean} args.dataPipeOnlyManager 数据集成 仅管理员 可用开关（可空，空置不设置该值）
  * @param {boolean} args.pluginsOnlyManager 插件 仅管理员 可用开关（可空，空置不设置该值）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setOnlyManager: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetOnlyManager', args, options);
   },
  /**
  * 新用户加入企业必填字段
MD.Enum.ProjectSetting.UserFillCompanyEnabled
MD.Enum.ProjectSetting.UserFillWorkSiteEnabled
MD.Enum.ProjectSetting.UserFillJobNumberEnabled
MD.Enum.ProjectSetting.UserFillDepartmentEnabled
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {array} args.settings
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setPrivacys: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetPrivacys', args, options);
   },
  /**
  * 设置余额告警提醒
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {boolean} args.noticeEnabled 是否开启余额告警提醒
  * @param {integer} args.balanceLimit 提醒余额
  * @param {array} args.accountIds 提醒用户列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setBalanceLimitNotice: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetBalanceLimitNotice', args, options);
   },
  /**
  * 获取LDAP信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectLdapSetting: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetProjectLdapSetting', args, options);
   },
  /**
  * 修改LDAP信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.ldapType LDAP类型
  * @param {string} args.port LDAP服务器端口号
  * @param {boolean} args.enableSSL 安全连接
  * @param {string} args.serverIP LDAP服务器IP
  * @param {string} args.user LDAP服务器用户名
  * @param {string} args.password LDAP服务器密码
  * @param {string} args.domainPath LDAP基本域路径
  * @param {string} args.searchFilter LDAP服务器端口号
  * @param {string} args.emailAttr LDAP Email
  * @param {string} args.fullnameAttr LDAP 用户名称
  * @param {string} args.departmentAttr 注册时需要填写部门
  * @param {string} args.jobAttr LDAP 用户职位
  * @param {string} args.workphoneAttr LDAP 用户工作电话
  * @param {integer} args.searchRange 账户搜索范围
  * @param {object} args.dnGroup DN/组
  * @param {boolean} args.mustFullname 必须同步用户姓名
  * @param {boolean} args.mustDepartment 必须同步用户部门
  * @param {boolean} args.mustJob 必须同步用户职位
  * @param {boolean} args.mustWorkphone 必须同步工作电话
  * @param {boolean} args.createIfNotExists 无匹配账户时新建
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateProjectLdapSetting: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'UpdateProjectLdapSetting', args, options);
   },
  /**
  * 修改LDAP开启状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isEffect 是否开启
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateLdapState: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'UpdateLdapState', args, options);
   },
  /**
  * 修改LDAP开启状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.ldapName Ldap 自定义显示名称
  * @param {string} args.ldapIcon Ldap 自定义显示图标
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updateLdapName: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'UpdateLdapName', args, options);
   },
  /**
  * 获取自定义颜色设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getColorSettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetColorSettings', args, options);
   },
  /**
  * 编辑自定义颜色设置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {} args.type
  * @param {array} args.chart 颜色
  * @param {array} args.theme 主题
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editColorSettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'EditColorSettings', args, options);
   },
  /**
  * 开启api网络代理
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {boolean} args.state api网络代理开启状态
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setApiProxyState: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'SetApiProxyState', args, options);
   },
  /**
  * 获取api网络代理设置开启状态
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApiProxyState: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetApiProxyState', args, options);
   },
  /**
  * 获取api网络代理配置信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApiProxySettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'GetApiProxySettings', args, options);
   },
  /**
  * 保存api网络代理配置
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织id
  * @param {integer} args.type 0-all 1-http 2-https
  * @param {string} args.ip 服务器地址
  * @param {integer} args.port 端口
  * @param {boolean} args.openIdentityValidate 开启身份验证
  * @param {string} args.userName 用户名
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editApiProxySettings: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'EditApiProxySettings', args, options);
   },
  /**
  * 
 ProcessType = 10 &gt;  RemoveProjectUserMemoryCache : 移除 （整网络）网络成员 内存缓存 

 ProcessType = 11 &gt; ResetProjectUserMemoryCache : 重置 （整网络）网络成员 内存缓存 

 ProcessType = 13 &gt; ResetAccountsProjectUserMemoryCache : 重置 网络成员 内存缓存 中 指定成员的 缓存数据！（需传递 AccountIds） 

 ProcessType = 20 &gt; RemovePersonalContactsMemoryCache : 移除 个人联系人内存缓存（可指定 AccountIds，否则 为 全网络）（注：无 重置操作 选项） 

 ProcessType = 30 &gt; RemoveAccountsMemoryCache : 移除 Account 缓存（独立的 缓存信息，好友、外协中使用）（与网络无关）（必须指定 AccountIds） 
  * @param {Object} args 请求参数
  * @param {} args.processType
  * @param {string} args.projectId
  * @param {array} args.accountIds
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   projectClearCache: function (args, options = {}) {
     
     return mdyAPI('ProjectSetting', 'ProjectClearCache', args, options);
   },
};
