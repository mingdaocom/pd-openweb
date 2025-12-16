export default {
  /**
   * 申请秘钥
   * @param {Object} args 请求参数
   * @param {string} args.serverId 服务器id
   * @param {string} args.projectName 网络名称
   * @param {string} args.job 职位
   * @param {integer} args.scaleId 规模
   * @param {string} args.licenseTemplateVersion 支持的密钥模板版本
   * @param {} args.licenseVersion
   * @param {string} args.channel 申请来源
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  applyLicenseCode: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'ApplyLicenseCode', args, options);
  },
  /**
   * 获取当前用户秘钥申请列表
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getLicenseList: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetLicenseList', args, options);
  },
  /**
   * 获取当前服务器信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getServerInfo: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetServerInfo', args, options);
  },
  /**
   * 获取当前授权信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPlatformLicenseInfo: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetPlatformLicenseInfo', args, options);
  },
  /**
   * 获取授权日志
   * @param {Object} args 请求参数
   * @param {integer} args.pageIndex 页码
   * @param {integer} args.pageSize 页大小
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPlatformLicenseLogs: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetPlatformLicenseLogs', args, options);
  },
  /**
   * 获取升级服务到期时间
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSupportInfo: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetSupportInfo', args, options);
  },
  /**
   * 密钥验证
   * @param {Object} args 请求参数
   * @param {string} args.licenseCode 授权码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  verifyLicenseCode: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'VerifyLicenseCode', args, options);
  },
  /**
   * 添加授权
   * @param {Object} args 请求参数
   * @param {string} args.licenseCode 授权码
   * @param {array} args.projectIds 非平台版：组织Id列表（仅新增的组织Id）
   * @param {array} args.projectQuotas 非平台版：组织用户配置
   * @param {boolean} args.useProjectQuota 非平台版：是否开启自定义组织用户配置
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  bindLicenseCode: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'BindLicenseCode', args, options);
  },
  /**
   * 添加增值服务授权
   * @param {Object} args 请求参数
   * @param {string} args.licenseCode 授权码
   * @param {} args.extendFunType
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  bindTrialLicenseCode: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'BindTrialLicenseCode', args, options);
  },
  /**
   * 获取组织用户配额
   * @param {Object} args 请求参数
   * @param {string} args.licenseCode 密钥
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProjectQuota: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetProjectQuota', args, options);
  },
  /**
   * 设置组织用户配额
   * @param {Object} args 请求参数
   * @param {array} args.projectIds 新添加的组织Id列表
   * @param {array} args.projectQuotas 组织用户配置
   * @param {boolean} args.useProjectQuota 是否开启自定义组织用户配置
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setProjectQuota: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'SetProjectQuota', args, options);
  },
  /**
   * 获取组织列表
   * @param {Object} args 请求参数
   * @param {array} args.filterProjectIds 需要过滤的组织Id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getProjects: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetProjects', args, options);
  },
  /**
   * 获取初始化状态
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getGuideStepStatus: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetGuideStepStatus', args, options);
  },
  /**
   * 创建管理员账号（安装流程）
   * @param {Object} args 请求参数
   * @param {string} args.name 姓名
   * @param {string} args.email 邮箱
   * @param {string} args.password 密码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addAdmin: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'AddAdmin', args, options);
  },
  /**
   * 创建组织（安装流程）
   * @param {Object} args 请求参数
   * @param {string} args.name 网络名称
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addProject: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'AddProject', args, options);
  },
  /**
   * 获取平台提醒信息
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getPlatformRemindInfo: function (args, options = {}) {
    return mdyAPI('PrivateGuide', 'GetPlatformRemindInfo', args, options);
  },
};
