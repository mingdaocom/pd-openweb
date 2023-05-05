export default {
  /**
  * 获取账户一览信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountListInfo: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountListInfo', args, options);
   },
  /**
  * 获取积分的途径列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountScore: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountScore', args, options);
   },
  /**
  * 获取所用级别列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountPoint: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountPoint', args, options);
   },
  /**
  * 获取积分历史
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountCostLogList: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountCostLogList', args, options);
   },
  /**
  * 获取个人账户的头像
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountAvatar: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountAvatar', args, options);
   },
  /**
  * 获取个人账户的联系方式
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getContactInfo: function (args, options = {}) {
     
     return $.api('Account', 'GetContactInfo', args, options);
   },
  /**
  * 获取个人账户的工作/教育履历
  * @param {Object} args 请求参数
  * @param {} args.type 用户资历类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountDetail: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountDetail', args, options);
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
     
     return $.api('Account', 'DelAccountDetail', args, options);
   },
  /**
  * 保存个人账户基本信息
  * @param {Object} args 请求参数
  * @param {string} args.fullname 真实姓名
  * @param {string} args.birthdate 出身日期
  * @param {} args.gender 性别
  * @param {string} args.companyName 单位名称
  * @param {string} args.profession 职业
  * @param {string} args.address 地址
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountBasicInfo: function (args, options = {}) {
     
     return $.api('Account', 'EditAccountBasicInfo', args, options);
   },
  /**
  * 修改用户信息
  * @param {Object} args 请求参数
  * @param {string} args.companyName 公司名称
  * @param {string} args.profession 职位
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountInfo: function (args, options = {}) {
     
     return $.api('Account', 'EditAccountInfo', args, options);
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
     
     return $.api('Account', 'EditContactInfo', args, options);
   },
  /**
  * 保存个人账户的工作/教育履历
  * @param {Object} args 请求参数
  * @param {string} args.name 雇主/学校名称,null时不修改
  * @param {string} args.title 职位/学位&amp;学历,null时不修改
  * @param {string} args.description 工作内容/核心课程,null时不修改
  * @param {string} args.startDate 开始年月份,null时不修改
  * @param {string} args.endDate 结束年月份,null时不修改
  * @param {} args.type LOV：1表示工作；2表示教育,null时不修改
  * @param {integer} args.autoId 修改的Id
  * @param {string} args.isSoFar 是否至今仍在 0：是的  1：不是
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountDetail: function (args, options = {}) {
     
     return $.api('Account', 'EditAccountDetail', args, options);
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
     
     return $.api('Account', 'EditAccountAvatar', args, options);
   },
  /**
  * 获取账户信息（手机/邮箱）
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAccountInfo: function (args, options = {}) {
     
     return $.api('Account', 'GetAccountInfo', args, options);
   },
  /**
  * 获取网络注册时的邮箱
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectEmailIsVerify: function (args, options = {}) {
     
     return $.api('Account', 'GetProjectEmailIsVerify', args, options);
   },
  /**
  * 发送网络邮箱绑定的验证邮件
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendProjectBindEmail: function (args, options = {}) {
     
     return $.api('Account', 'SendProjectBindEmail', args, options);
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
     
     return $.api('Account', 'EmailValidate', args, options);
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
     
     return $.api('Account', 'EditPwd', args, options);
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
     
     return $.api('Account', 'EditIntergrationAccount', args, options);
   },
  /**
  * 发送修改帐号验证码
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {boolean} args.needCheckCode 是否需要验证密码输入
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendVerifyCode: function (args, options = {}) {
     
     return $.api('Account', 'SendVerifyCode', args, options);
   },
  /**
  * 验证登陆密码
  * @param {Object} args 请求参数
  * @param {string} args.password 密码
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkAccount: function (args, options = {}) {
     
     return $.api('Account', 'CheckAccount', args, options);
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
     
     return $.api('Account', 'EditAccount', args, options);
   },
  /**
  * 取消绑定明道云账号
  * @param {Object} args 请求参数
  * @param {string} args.state 状态码
  * @param {} args.tpType 第三方类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   unBindAccount: function (args, options = {}) {
     
     return $.api('Account', 'UnBindAccount', args, options);
   },
  /**
  * 清理mq的session状态
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   clearMqSession: function (args, options = {}) {
     
     return $.api('Account', 'ClearMqSession', args, options);
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
     
     return $.api('Account', 'ExitAccount', args, options);
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
     
     return $.api('Account', 'GetProjectList', args, options);
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
     
     return $.api('Account', 'JoinProjectByToken', args, options);
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
     
     return $.api('Account', 'JoinProjectByCode', args, options);
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
     
     return $.api('Account', 'RevokedJoinProject', args, options);
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
     
     return $.api('Account', 'CheckJoinProjectByTokenWithCard', args, options);
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
     
     return $.api('Account', 'RefuseJoin', args, options);
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
     
     return $.api('Account', 'EditUserCardContactPhone', args, options);
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
     
     return $.api('Account', 'GetUserCard', args, options);
   },
  /**
  * 提醒管理员审核
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {} args.msgType 发送申请消息类型
  * @param {boolean} args.sendIntergrationMsg 是否同步发送到集成消息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendSystemMessageToAdmin: function (args, options = {}) {
     
     return $.api('Account', 'SendSystemMessageToAdmin', args, options);
   },
  /**
  * 退出网络（密码验证）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.password 密码
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   validateExitProject: function (args, options = {}) {
     
     return $.api('Account', 'ValidateExitProject', args, options);
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
     
     return $.api('Account', 'ExitProject', args, options);
   },
  /**
  * 获取我的邀请信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMyAuthList: function (args, options = {}) {
     
     return $.api('Account', 'GetMyAuthList', args, options);
   },
  /**
  * 获取我的未处理的邀请信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUntreatAuthList: function (args, options = {}) {
     
     return $.api('Account', 'GetUntreatAuthList', args, options);
   },
  /**
  * 获取我的徽章
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {} args.type 徽章类型
  * @param {string} args.keyword 关键词
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getMedalByType: function (args, options = {}) {
     
     return $.api('Account', 'GetMedalByType', args, options);
   },
  /**
  * 修改是否显示
  * @param {Object} args 请求参数
  * @param {string} args.isShow 是否显示
  * @param {string} args.mediaId 徽章id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editAccountMedalIsShow: function (args, options = {}) {
     
     return $.api('Account', 'EditAccountMedalIsShow', args, options);
   },
  /**
  * 授予勋章,若系统发放
  * @param {Object} args 请求参数
  * @param {string} args.toAccountIds 接收者
  * @param {string} args.medalId 徽章id
  * @param {string} args.remark 备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAccountMedalGrantLog: function (args, options = {}) {
     
     return $.api('Account', 'AddAccountMedalGrantLog', args, options);
   },
  /**
  * 获得显示和不显示的徽章
  * @param {Object} args 请求参数
  * @param {string} args.displayType 0: 获得显示的徽章 1：获得不显示的徽章
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDisplayMedalList: function (args, options = {}) {
     
     return $.api('Account', 'GetDisplayMedalList', args, options);
   },
  /**
  * 获取系统默认全部勋章列表
  * @param {Object} args 请求参数
  * @param {} args.medalType 徽章类型
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keyword 关键词
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSystemMedals: function (args, options = {}) {
     
     return $.api('Account', 'GetSystemMedals', args, options);
   },
  /**
  * 获取本周用户已发勋章数
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWeekMedalCount: function (args, options = {}) {
     
     return $.api('Account', 'GetWeekMedalCount', args, options);
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
     
     return $.api('Account', 'UnbindEmail', args, options);
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
     
     return $.api('Account', 'UnbindMobile', args, options);
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
     return $.api('Account', 'ValidateLogoffAccount', args, options);
   },
  /**
  * 申请注销账户
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyLogOffAccount: function (args, options = {}) {
     
     return $.api('Account', 'ApplyLogOffAccount', args, options);
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
     return $.api('Account', 'GetApplyLogOffAccount', args, options);
   },
  /**
  * 取消申请注销
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   cancelLogOffAccount: function (args, options = {}) {
     
     return $.api('Account', 'CancelLogOffAccount', args, options);
   },
};
