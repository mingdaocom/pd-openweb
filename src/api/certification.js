export default {
  /**
   * 获取当前用户已有认证信息
   * @param {Object} args 请求参数
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
   * @param {boolean} args.isUpgrade 是否升级
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCertInfoList: function (args, options = {}) {
    return mdyAPI('Certification', 'GetCertInfoList', args, options);
  },
  /**
   * 查看认证信息
   * @param {Object} args 请求参数
   * @param {string} args.relationId 认证Id  (和认证来源二选一) 但是选ID 的时候必填projectId
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCertInfo: function (args, options = {}) {
    return mdyAPI('Certification', 'GetCertInfo', args, options);
  },
  /**
   * 查看认证信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getListCertInfo: function (args, options = {}) {
    return mdyAPI('Certification', 'GetListCertInfo', args, options);
  },
  /**
   * 检查当前人员/组织是否被认证过
   * @param {Object} args 请求参数
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
   * @param {integer} args.authType 认证 的 类型 1个人 2企业
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  checkIsCert: function (args, options = {}) {
    return mdyAPI('Certification', 'CheckIsCert', args, options);
  },
  /**
   * 生成临时人脸识别认证码
   * @param {Object} args 请求参数
   * @param {string} args.state 临时状态码
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFaceCertUrl: function (args, options = {}) {
    return mdyAPI('Certification', 'GetFaceCertUrl', args, options);
  },
  /**
   * 根据新的凭据获取是否已经认证
   * @param {Object} args 请求参数
   * @param {string} args.token 临时状态码
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFaceCertResult: function (args, options = {}) {
    return mdyAPI('Certification', 'GetFaceCertResult', args, options);
  },
  /**
   * 根据人脸识别认证码获取新的凭据
   * @param {Object} args 请求参数
   * @param {string} args.state 临时状态码
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getFaceCertToken: function (args, options = {}) {
    return mdyAPI('Certification', 'GetFaceCertToken', args, options);
  },
  /**
   * 获取个人认证人脸识别H5URL
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.token 临时状态吗
   * @param {} args.personalInfo
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getAdvFaceCertUrl: function (args, options = {}) {
    return mdyAPI('Certification', 'GetAdvFaceCertUrl', args, options);
  },
  /**
   * 个人认证人脸识别认证
   * @param {Object} args 请求参数
   * @param {string} args.token 临时状态吗
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  personalFaceCert: function (args, options = {}) {
    return mdyAPI('Certification', 'PersonalFaceCert', args, options);
  },
  /**
   * 个人认证
   * @param {Object} args 请求参数
   * @param {integer} args.certSource 认证来源 1组织认证  2市场认证
   * @param {string} args.projectId 组织Id 组织认证只能基于当前的AccountId 组织认证如果是选择个人的情况 直接per信息不传
   * @param {string} args.verifyCode 手机验证码
   * @param {} args.personalInfo
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  personalCertification: function (args, options = {}) {
    return mdyAPI('Certification', 'PersonalCertification', args, options);
  },
  /**
   * 组织认证
   * @param {Object} args 请求参数
   * @param {integer} args.certSource 认证来源 1组织认证  2市场认证
   * @param {string} args.entityId 认证实体Id  组织对应projectID  市场对应开发者AccountId
   * @param {string} args.mapProjectId 关联认证组织Id
   * @param {} args.enterpriseInfo
   * @param {boolean} args.isUpgrade 是否升级
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  enterpriseCertification: function (args, options = {}) {
    return mdyAPI('Certification', 'EnterpriseCertification', args, options);
  },
  /**
   * 设置组织认证联系人
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.relationId 认证Id
   * @param {integer} args.contactIdType 联系人证件类型
   * @param {string} args.contactName 联系人姓名
   * @param {string} args.contactIdNumber 联系人证件号
   * @param {string} args.contactMobile 联系人手机号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setCertContact: function (args, options = {}) {
    return mdyAPI('Certification', 'SetCertContact', args, options);
  },
  /**
   * 移除组织认证
   * @param {Object} args 请求参数
   * @param {string} args.relationId 认证Id
   * @param {string} args.projectId 组织ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeCertification: function (args, options = {}) {
    return mdyAPI('Certification', 'RemoveCertification', args, options);
  },
  /**
   * 组织重新认证
   * @param {Object} args 请求参数
   * @param {integer} args.certSource 认证来源 1组织认证  2市场认证
   * @param {string} args.entityId 认证实体Id  组织对应projectID  市场对应开发者AccountId
   * @param {string} args.mapProjectId 关联认证组织Id
   * @param {} args.enterpriseInfo
   * @param {boolean} args.isUpgrade 是否升级
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  renewEnterpriseCertification: function (args, options = {}) {
    return mdyAPI('Certification', 'RenewEnterpriseCertification', args, options);
  },
  /**
   * 获取已填认证失败的信息
   * @param {Object} args 请求参数
   * @param {string} args.projectId 认证实体Id  组织对应projectID
   * @param {integer} args.certSource 认证 的 来源 0个人认证 1企业认证 2市场
   * @param {integer} args.authType 认证 的 类型 1个人 2企业
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getCertFailedInfo: function (args, options = {}) {
    return mdyAPI('Certification', 'GetCertFailedInfo', args, options);
  },
  /**
   * 获取可用短信签名列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getListSmsSignatures: function (args, options = {}) {
    return mdyAPI('Certification', 'GetListSmsSignatures', args, options);
  },
  /**
   * 获取短信签名列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织ID
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSmsSignatures: function (args, options = {}) {
    return mdyAPI('Certification', 'GetSmsSignatures', args, options);
  },
  /**
   * 新增短信签名
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.relationId 关联的 组织认证的ID
   * @param {string} args.signName 短信签名
   * @param {} args.signSource
   * @param {string} args.contactIdCardFront 联系人身份证正面
   * @param {string} args.contactIdCardBack 联系人身份证反面
   * @param {string} args.trademark 商标
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'AddSmsSignature', args, options);
  },
  /**
   * 审核失败短信签名编辑
   * @param {Object} args 请求参数
   * @param {string} args.id 签名Id
   * @param {string} args.projectId 组织id
   * @param {string} args.relationId 关联的 组织认证的ID
   * @param {string} args.signName 短信签名
   * @param {} args.signSource
   * @param {string} args.contactIdCardFront 联系人身份证正面
   * @param {string} args.contactIdCardBack 联系人身份证反面
   * @param {string} args.trademark 商标
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'EditSmsSignature', args, options);
  },
  /**
   * 移除短信签名
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id 签名id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  removeSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'RemoveSmsSignature', args, options);
  },
  /**
   * 禁用或者启用短信签名
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id 签名id
   * @param {boolean} args.disable 是否禁用
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  disableSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'DisableSmsSignature', args, options);
  },
  /**
   * 设置默认短信签名
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id 签名id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setDefaultSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'SetDefaultSmsSignature', args, options);
  },
  /**
   * 测试短信签名
   * @param {Object} args 请求参数
   * @param {string} args.ticket 验证码返票据
   * @param {string} args.randStr 票据随机字符串
   * @param {} args.captchaType
   * @param {string} args.projectId 组织id
   * @param {string} args.id 签名id
   * @param {string} args.mobilePhone 手机号
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  sendTestSmsSignature: function (args, options = {}) {
    return mdyAPI('Certification', 'SendTestSmsSignature', args, options);
  },
};
