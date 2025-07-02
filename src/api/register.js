export default {
  /**
  * 发送注册验证码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号邮箱或手机号
  * @param {} args.lang
  * @param {} args.verifyCodeType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendRegisterVerifyCode: function (args, options = {}) {
     
     return mdyAPI('Register', 'SendRegisterVerifyCode', args, options);
   },
  /**
  * 邀请加入网络进行已有账号登录
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号邮箱或手机号
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkExistAccount: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckExistAccount', args, options);
   },
  /**
  * 定向账号邀请加入网络进行已有账号登录
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.confirmation token
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkExistAccountByConfirmation: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckExistAccountByConfirmation', args, options);
   },
  /**
  * 创建组织时
验证当前账号是否登录与账号来源是否受限
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkExistAccountByCurrentAccount: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckExistAccountByCurrentAccount', args, options);
   },
  /**
  * 验证邀请链接
  * @param {Object} args 请求参数
  * @param {string} args.confirmation token
  * @param {boolean} args.isLink 是否是链接
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkInviteLink: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckInviteLink', args, options);
   },
  /**
  * 申请加入网络，根据projectId返回网络设置信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkJoinLink: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckJoinLink', args, options);
   },
  /**
  * 如果已有账号加入某个邀请模块(不含加入公司)
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.password 密码
  * @param {string} args.confirmation token
  * @param {boolean} args.isLink 是否是链接
  * @param {string} args.account 账号邮箱或手机号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   joinByExistAccount: function (args, options = {}) {
     
     return mdyAPI('Register', 'JoinByExistAccount', args, options);
   },
  /**
  * 创建账号
  * @param {Object} args 请求参数
  * @param {string} args.regFrom 注册广告来源
  * @param {string} args.referrer 注册来源页面
  * @param {string} args.password 密码
  * @param {string} args.fullname 用户名
  * @param {boolean} args.setSession 是否直接登录进入
  * @param {string} args.verifyCode 验证码
  * @param {string} args.account 账号邮箱或手机号
  * @param {string} args.confirmation token
  * @param {boolean} args.isLink 是否是链接
  * @param {string} args.unionId 第三方账号
  * @param {string} args.state 第三方账号
  * @param {integer} args.tpType 第三方类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createAccount: function (args, options = {}) {
     
     return mdyAPI('Register', 'CreateAccount', args, options);
   },
  /**
  * 设置 用户名称
  * @param {Object} args 请求参数
  * @param {string} args.fullname 真实姓名
  * @param {string} args.email 邮箱
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setAccountInfo: function (args, options = {}) {
     
     return mdyAPI('Register', 'SetAccountInfo', args, options);
   },
  /**
  * 根据企业号加入组织(检验企业号是否正确，含userCard)
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.projectCode 企业号
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkProjectCode: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckProjectCode', args, options);
   },
  /**
  * 返回公司工商信息
  * @param {Object} args 请求参数
  * @param {string} args.companynameKeyword 企业名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getCompanyInfo: function (args, options = {}) {
     
     return mdyAPI('Register', 'GetCompanyInfo', args, options);
   },
  /**
  * 检查校验用户是否可以创建企业网络
付费用户可以任意创建组织
无组织或者所有组织都为免费组织可以创建
都为免费组织但有试用组织不可以创建
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkCreateCompany: function (args, options = {}) {
     
     return mdyAPI('Register', 'CheckCreateCompany', args, options);
   },
  /**
  * 创建组织
  * @param {Object} args 请求参数
  * @param {string} args.regFrom 注册广告来源
  * @param {string} args.referrer 注册来源页面
  * @param {string} args.companyName 企业名称
  * @param {string} args.tpCompanyId 第三方企业ID
  * @param {string} args.job 职位
  * @param {string} args.email 邮箱
  * @param {integer} args.scaleId 规模Id
  * @param {string} args.scale 规模中文
  * @param {string} args.industry 行业中文
  * @param {integer} args.industryId 行业id
  * @param {string} args.departmentType 部门类型
  * @param {string} args.jobType 职级类型
  * @param {string} args.code 授权code方式
  * @param {string} args.unionId 第3方
  * @param {string} args.state 第3方传递值
  * @param {} args.tpType
  * @param {integer} args.isInterested 是否对伙伴计划感兴趣
  * @param {string} args.geoCountryRegionCode (地理位置)国家地区-编码
  * @param {string} args.extraDatas 组织额外注册信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   createCompany: function (args, options = {}) {
     
     return mdyAPI('Register', 'CreateCompany', args, options);
   },
  /**
  * 邀请加入网络
  * @param {Object} args 请求参数
  * @param {string} args.regFrom 注册广告来源
  * @param {string} args.referrer 注册来源页面
  * @param {string} args.account 账号邮箱或手机号
  * @param {string} args.password 密码
  * @param {string} args.verifyCode 验证码
  * @param {string} args.fullname 用户名
  * @param {array} args.jobIds 职位id
  * @param {string} args.confirmation token
  * @param {boolean} args.isLink 是否是链接
  * @param {string} args.companyName 公司名
  * @param {array} args.departmentIds 部门id
  * @param {array} args.orgRoleIds 角色id
  * @param {string} args.workSiteId 工作地id
  * @param {string} args.jobNumber 工号
  * @param {string} args.contactPhone 座机
  * @param {string} args.email 邮箱
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   inviteJoinCompany: function (args, options = {}) {
     
     return mdyAPI('Register', 'InviteJoinCompany', args, options);
   },
  /**
  * 主动申请加入网络
  * @param {Object} args 请求参数
  * @param {string} args.regFrom 注册广告来源
  * @param {string} args.referrer 注册来源页面
  * @param {string} args.projectId 网络id
  * @param {string} args.account 账号邮箱或手机号
  * @param {string} args.password 密码
  * @param {string} args.verifyCode 验证码
  * @param {string} args.fullname 用户名
  * @param {string} args.email 邮箱
  * @param {array} args.jobIds 职位id
  * @param {string} args.companyName 公司名
  * @param {array} args.departmentIds 部门id
  * @param {array} args.orgRoleIds 角色id
  * @param {string} args.workSiteId 工作地id
  * @param {string} args.jobNumber 工号
  * @param {string} args.contactPhone 座机
  * @param {string} args.unionId 第3方
  * @param {string} args.state 第3方
  * @param {integer} args.tpType 第3方类型
  * @param {string} args.jobId 兼容字段（不要传值）
  * @param {string} args.departmentId 兼容字段（不要传值）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyJoinCompany: function (args, options = {}) {
     
     return mdyAPI('Register', 'ApplyJoinCompany', args, options);
   },
  /**
  * 发送找回密码验证码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号
  * @param {} args.lang
  * @param {} args.verifyCodeType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendFindPasswordVerifyCode: function (args, options = {}) {
     
     return mdyAPI('Register', 'SendFindPasswordVerifyCode', args, options);
   },
  /**
  * 忘记密码 - 更新密码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   updatePassword: function (args, options = {}) {
     
     return mdyAPI('Register', 'UpdatePassword', args, options);
   },
  /**
  * 获取重置密码触发信息
  * @param {Object} args 请求参数
  * @param {string} args.state 状态码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getResetPasswordTrigerInfo: function (args, options = {}) {
     
     return mdyAPI('Register', 'GetResetPasswordTrigerInfo', args, options);
   },
  /**
  * 根据状态码重置密码
  * @param {Object} args 请求参数
  * @param {string} args.state 状态码
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetPasswordByState: function (args, options = {}) {
     
     return mdyAPI('Register', 'ResetPasswordByState', args, options);
   },
};
