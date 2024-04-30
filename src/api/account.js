export default {
  /**
  * 获取账户一览信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountListInfo: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetAccountListInfo', args, options);
   },
  /**
  * 获取个人账户的联系方式
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactInfo: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetContactInfo', args, options);
   },
  /**
  * 获取个人账户的工作/教育履历
  * @param {Object} args 请求参数
  * @param {} args.type
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountDetail: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetAccountDetail', args, options);
   },
  /**
  * 删除履历
  * @param {Object} args 请求参数
  * @param {string} args.autoId 履历id
  * @param {integer} args.detailType 用户资历类型(1:工作;2:教育)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   delAccountDetail: function (args, options = {}) {
     
     return mdyAPI('Account', 'DelAccountDetail', args, options);
   },
  /**
  * 保存个人账户基本信息
  * @param {Object} args 请求参数
  * @param {string} args.fullname 真实姓名
  * @param {string} args.birthdate 出身日期
  * @param {} args.gender
  * @param {string} args.companyName 单位名称
  * @param {string} args.profession 职业
  * @param {string} args.address 地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountBasicInfo: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditAccountBasicInfo', args, options);
   },
  /**
  * 保存个人账户的联系方式
  * @param {Object} args 请求参数
  * @param {string} args.imQQ QQ账号,null时不修改
  * @param {string} args.snsLinkedin Linkedin账号,null时不修改
  * @param {string} args.snsSina 新浪微博账号,null时不修改
  * @param {string} args.snsQQ 腾讯微博账号,null时不修改
  * @param {string} args.weiXin 微信号,null时不修改
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editContactInfo: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditContactInfo', args, options);
   },
  /**
  * 保存个人账户的工作/教育履历
  * @param {Object} args 请求参数
  * @param {string} args.name 雇主/学校名称,null时不修改
  * @param {string} args.title 职位/学位&amp;学历,null时不修改
  * @param {string} args.description 工作内容/核心课程,null时不修改
  * @param {string} args.startDate 开始年月份,null时不修改
  * @param {string} args.endDate 结束年月份,null时不修改
  * @param {} args.type
  * @param {integer} args.autoId 修改的Id
  * @param {string} args.isSoFar 是否至今仍在 0：是的  1：不是
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountDetail: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditAccountDetail', args, options);
   },
  /**
  * 修改头像
  * @param {Object} args 请求参数
  * @param {string} args.fileName 头像文件名
如: https://pic.mingdao.com/UserAvatar/9e4554bb-4fb4-4ef7-abb8-d79fcdbc3f7d.jpg
只需要传: 9e4554bb-4fb4-4ef7-abb8-d79fcdbc3f7d.jpg
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountAvatar: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditAccountAvatar', args, options);
   },
  /**
  * 获取账户信息（手机/邮箱）
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountInfo: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetAccountInfo', args, options);
   },
  /**
  * 发送网络邮箱绑定的验证邮件
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendProjectBindEmail: function (args, options = {}) {
     
     return mdyAPI('Account', 'SendProjectBindEmail', args, options);
   },
  /**
  * 邮箱验证
  * @param {Object} args 请求参数
  * @param {string} args.token token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   emailValidate: function (args, options = {}) {
     
     return mdyAPI('Account', 'EmailValidate', args, options);
   },
  /**
  * 修改账户密码
  * @param {Object} args 请求参数
  * @param {string} args.oldPwd 老密码
  * @param {string} args.newPwd 新密码
  * @param {string} args.confirmPwd 确认密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editPwd: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditPwd', args, options);
   },
  /**
  * 修改集成账号信息
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {string} args.newPwd 新密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editIntergrationAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditIntergrationAccount', args, options);
   },
  /**
  * 发送修改帐号验证码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号
  * @param {boolean} args.needCheckCode 是否需要验证密码输入
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendVerifyCode: function (args, options = {}) {
     
     return mdyAPI('Account', 'SendVerifyCode', args, options);
   },
  /**
  * 验证登录密码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'CheckAccount', args, options);
   },
  /**
  * 验证登录密码
根据设备（勾选之后1小时内免验证）
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.password 密码
  * @param {string} args.projectId 组织ID
  * @param {boolean} args.isNoneVerification 是否1小时内该设备免验证
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAccountIdentity: function (args, options = {}) {
     
     return mdyAPI('Account', 'CheckAccountIdentity', args, options);
   },
  /**
  * 修改账号
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {string} args.verifyCode 验证码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditAccount', args, options);
   },
  /**
  * 取消绑定明道云账号
  * @param {Object} args 请求参数
  * @param {string} args.state 状态码
  * @param {} args.tpType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unBindAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'UnBindAccount', args, options);
   },
  /**
  * 退出指定设备已经登录的账号
  * @param {Object} args 请求参数
  * @param {string} args.platform 平台（web或app）
  * @param {string} args.sessionId 会话ID
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exitAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'ExitAccount', args, options);
   },
  /**
  * 获取我加入的网络
  * @param {Object} args 请求参数
  * @param {string} args.pageIndex 页码
  * @param {string} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectList: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetProjectList', args, options);
   },
  /**
  * 按token的方式加入网络
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.token Token
  * @param {string} args.companyName 公司名称
  * @param {string} args.jobId 职位id
  * @param {string} args.jobNumber 工号
  * @param {string} args.workSiteId 工作地id
  * @param {string} args.departmentId 部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   joinProjectByToken: function (args, options = {}) {
     
     return mdyAPI('Account', 'JoinProjectByToken', args, options);
   },
  /**
  * 按企业号加入网络
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.projectCode 企业号
  * @param {string} args.companyName 公司名称
  * @param {string} args.jobId 职位id
  * @param {string} args.jobNumber 工号
  * @param {string} args.workSiteId 工作地id
  * @param {string} args.departmentId 部门id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   joinProjectByCode: function (args, options = {}) {
     
     return mdyAPI('Account', 'JoinProjectByCode', args, options);
   },
  /**
  * 取消加入网络
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   revokedJoinProject: function (args, options = {}) {
     
     return mdyAPI('Account', 'RevokedJoinProject', args, options);
   },
  /**
  * 同意邀请
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.token 邀请码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkJoinProjectByTokenWithCard: function (args, options = {}) {
     
     return mdyAPI('Account', 'CheckJoinProjectByTokenWithCard', args, options);
   },
  /**
  * 拒绝加入邀请
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.token token
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseJoin: function (args, options = {}) {
     
     return mdyAPI('Account', 'RefuseJoin', args, options);
   },
  /**
  * 修改企业名片联系电话
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.contactPhone 联系电话
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editUserCardContactPhone: function (args, options = {}) {
     
     return mdyAPI('Account', 'EditUserCardContactPhone', args, options);
   },
  /**
  * 获取网络名片
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserCard: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetUserCard', args, options);
   },
  /**
  * 提醒管理员审核
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.msgType
  * @param {boolean} args.sendIntergrationMsg 是否同步发送到集成消息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendSystemMessageToAdmin: function (args, options = {}) {
     
     return mdyAPI('Account', 'SendSystemMessageToAdmin', args, options);
   },
  /**
  * 退出网络（密码验证）
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.projectId 网络id
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateExitProject: function (args, options = {}) {
     
     return mdyAPI('Account', 'ValidateExitProject', args, options);
   },
  /**
  * 退出网络（全部交接给小秘书）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.newAdminAccountId 新管理员账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   exitProject: function (args, options = {}) {
     
     return mdyAPI('Account', 'ExitProject', args, options);
   },
  /**
  * 获取我的邀请信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyAuthList: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetMyAuthList', args, options);
   },
  /**
  * 获取我的未处理的邀请信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUntreatAuthList: function (args, options = {}) {
     
     return mdyAPI('Account', 'GetUntreatAuthList', args, options);
   },
  /**
  * 解绑邮件
  * @param {Object} args 请求参数
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unbindEmail: function (args, options = {}) {
     
     return mdyAPI('Account', 'UnbindEmail', args, options);
   },
  /**
  * 解绑手机
  * @param {Object} args 请求参数
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unbindMobile: function (args, options = {}) {
     
     return mdyAPI('Account', 'UnbindMobile', args, options);
   },
  /**
  * 验证是否 可以注销账户
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateLogoffAccount: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Account', 'ValidateLogoffAccount', args, options);
   },
  /**
  * 申请注销账户
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyLogOffAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'ApplyLogOffAccount', args, options);
   },
  /**
  * 查询注销状态
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getApplyLogOffAccount: function (args, options = {}) {
     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' }); 
     return mdyAPI('Account', 'GetApplyLogOffAccount', args, options);
   },
  /**
  * 取消申请注销
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelLogOffAccount: function (args, options = {}) {
     
     return mdyAPI('Account', 'CancelLogOffAccount', args, options);
   },
};
