define(function (require, exports, module) {
  module.exports = {
    /**
    * 获取企业标识
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectIdentity: function (args, options) {
      return $.api('ProjectSetting', 'GetProjectIdentity', args, options);
    },

    /**
    * 界面定制
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getSysColor: function (args, options) {
      return $.api('ProjectSetting', 'GetSysColor', args, options);
    },

    /**
    * 二级域名
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getSubDomain: function (args, options) {
      return $.api('ProjectSetting', 'GetSubDomain', args, options);
    },

    /**
    * 多域名
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectDomain: function (args, options) {
      return $.api('ProjectSetting', 'GetProjectDomain', args, options);
    },

    /**
    * 新用户加入企业必填字段
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getPrivacy: function (args, options) {
      return $.api('ProjectSetting', 'GetPrivacy', args, options);
    },

    /**
    * 获取是否允许全员可见组织结构
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getStructureForAll: function (args, options) {
      return $.api('ProjectSetting', 'GetStructureForAll', args, options);
    },

    /**
    * 获取 是否允许员工自行添加下属
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getStructureSelfEdit: function (args, options) {
      return $.api('ProjectSetting', 'GetStructureSelfEdit', args, options);
    },

    /**
    * 获取 是否只允许管理员创建应用
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getEnabledWatermark: function (args, options) {
      return $.api('ProjectSetting', 'GetEnabledWatermark', args, options);
    },

    /**
    * 获取 是否开启水印
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getOnlyManagerCreateApp: function (args, options) {
      return $.api('ProjectSetting', 'GetOnlyManagerCreateApp', args, options);
    },

    /**
    * 获取 是否只允许管理员创建应用
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getAutoPurchaseWorkflowExtPack: function (args, options) {
      return $.api('ProjectSetting', 'GetAutoPurchaseWorkflowExtPack', args, options);
    },

    /**
    * 企业标识
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setProjectIdentity: function (args, options) {
      return $.api('ProjectSetting', 'SetProjectIdentity', args, options);
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setLogo: function (args, options) {
      return $.api('ProjectSetting', 'SetLogo', args, options);
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setCustomeHomeImage: function (args, options) {
      return $.api('ProjectSetting', 'SetCustomeHomeImage', args, options);
    },

    /**
    * 生日提醒
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setBirthdayNotice: function (args, options) {
      return $.api('ProjectSetting', 'SetBirthdayNotice', args, options);
    },

    /**
    * 设置审批
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setAudit: function (args, options) {
      return $.api('ProjectSetting', 'SetAudit', args, options);
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setStructureForAll: function (args, options) {
      return $.api('ProjectSetting', 'SetStructureForAll', args, options);
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setStructureSelfEdit: function (args, options) {
      return $.api('ProjectSetting', 'SetStructureSelfEdit', args, options);
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
    setOnlyManagerCreateApp: function (args, options) {
      return $.api('ProjectSetting', 'SetOnlyManagerCreateApp', args, options);
    },

    /**
    * 设置 是否 只允许管理员创建应用
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setEnabledWatermark: function (args, options) {
      return $.api('ProjectSetting', 'SetEnabledWatermark', args, options);
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
    setAutoPurchaseWorkflowExtPack: function (args, options) {
      return $.api('ProjectSetting', 'SetAutoPurchaseWorkflowExtPack', args, options);
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setSubDomin: function (args, options) {
      return $.api('ProjectSetting', 'SetSubDomin', args, options);
    },

    /**
    * 删除绑定的域名
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
    * @param {boolean} args.notice 设置允许Score通知
    * @param {string} args.subDomain 设置二级域名
    * @param {string} args.domain 删除绑定的域名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeProjectDomain: function (args, options) {
      return $.api('ProjectSetting', 'RemoveProjectDomain', args, options);
    },

    /**
    *   /// 新用户加入企业必填字段
MD.Enum.ProjectSetting.UserFillCompanyEnabled
MD.Enum.ProjectSetting.UserFillWorkSiteEnabled
MD.Enum.ProjectSetting.UserFillJobNumberEnabled
MD.Enum.ProjectSetting.UserFillDepartmentEnabled
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {} args.setting 设置类型
    * @param {boolean} args.settingValue 是否开启
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    setPrivacy: function (args, options) {
      return $.api('ProjectSetting', 'SetPrivacy', args, options);
    },

    /**
    *   /// 新用户加入企业必填字段
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
    setPrivacys: function (args, options) {
      return $.api('ProjectSetting', 'SetPrivacys', args, options);
    },

    /**
    * 获取LDAP信息
    * @param {Object} args 请求参数
    * @param {string} args.projectId 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjectLdapSetting: function (args, options) {
      return $.api('ProjectSetting', 'GetProjectLdapSetting', args, options);
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
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    updateProjectLdapSetting: function (args, options) {
      return $.api('ProjectSetting', 'UpdateProjectLdapSetting', args, options);
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
    updateLdapState: function (args, options) {
      return $.api('ProjectSetting', 'UpdateLdapState', args, options);
    },

  };
});
