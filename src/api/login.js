export default {
  /**
  * 使用明道云账号登录
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账号
  * @param {string} args.password 密码
密码直接登录
  * @param {string} args.verifyCode 验证码
验证码直接登录
  * @param {boolean} args.isCookie 是否记住用户名密码
  * @param {string} args.unionId 第三方账号id标识
  * @param {string} args.state 第三方账号随机码
  * @param {} args.tpType
  * @param {string} args.regFrom 登录广告来源
  * @param {string} args.appKey 移动端 AppKey
只支持iOS/Android
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mDAccountLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'MDAccountLogin', args, options);
   },
  /**
  * 发送登录验证验证码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.account 账户
  * @param {} args.lang
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendLoginVerifyCode: function (args, options = {}) {
     
     return mdyAPI('Login', 'SendLoginVerifyCode', args, options);
   },
  /**
  * 使用明道云账号自动登录，如果登录失败，需要把本地保存的密码清理掉
  * @param {Object} args 请求参数
  * @param {string} args.accountId 账号
  * @param {string} args.encryptPassword 加密密码
  * @param {} args.loginType
  * @param {string} args.account 账号
  * @param {string} args.projectId 网络Id
  * @param {string} args.regFrom 登录广告来源
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mDAccountAutoLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'MDAccountAutoLogin', args, options);
   },
  /**
  * 两步验证登录
  * @param {Object} args 请求参数
  * @param {string} args.state 状态位
  * @param {integer} args.type 登陆类型
1为手机号；2为邮箱
  * @param {string} args.verifyCode 验证码
  * @param {string} args.regFrom 登录广告来源
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mDTwofactorLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'MDTwofactorLogin', args, options);
   },
  /**
  * 发送两步验证验证码
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.state 状态位
  * @param {integer} args.type 发送类型
1为手机号；2为邮箱
  * @param {} args.lang
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendTwofactorVerifyCode: function (args, options = {}) {
     
     return mdyAPI('Login', 'SendTwofactorVerifyCode', args, options);
   },
  /**
  * LDAP账号登录
  * @param {Object} args 请求参数
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType
  * @param {string} args.userName LDAP 用户名
  * @param {string} args.password LDAP 密码
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isCookie 是否记住用户名密码
  * @param {string} args.regFrom 登录广告来源
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   lDAPLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'LDAPLogin', args, options);
   },
  /**
  * 检查登录状态
登录返回true，未登录则返回false
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'CheckLogin', args, options);
   },
  /**
  * 登出
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   loginOut: function (args, options = {}) {
     
     return mdyAPI('Login', 'LoginOut', args, options);
   },
  /**
  * 第三方账号登录
  * @param {Object} args 请求参数
  * @param {string} args.unionId 用户标识id
  * @param {string} args.state 授权随机字符串
  * @param {string} args.tpType 类型（微信，QQ，小米）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   tPLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'TPLogin', args, options);
   },
  /**
  * 获取第三方登录用户信息
  * @param {Object} args 请求参数
  * @param {string} args.unionId 用户标识id
  * @param {string} args.state 授权随机字符串
  * @param {string} args.tpType 类型（微信，QQ，小米）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTPUserInfo: function (args, options = {}) {
     
     return mdyAPI('Login', 'GetTPUserInfo', args, options);
   },
  /**
  * 第三方使用明道云账号SSO登录
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   tPMDAccountLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'TPMDAccountLogin', args, options);
   },
  /**
  * 【三方应用】企业微信二维码登录
  * @param {Object} args 请求参数
  * @param {string} args.authCode 授权码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'WorkWeiXinLogin', args, options);
   },
  /**
  * 【三方应用】企业微信安装应用登录
  * @param {Object} args 请求参数
  * @param {string} args.authCode 授权码
  * @param {string} args.projectId 网络id
  * @param {string} args.suiteId 套件id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinInstallAuthLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'WorkWeiXinInstallAuthLogin', args, options);
   },
  /**
  * 获取企业微信企业相关信息
  * @param {Object} args 请求参数
  * @param {string} args.apkId 应用包id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWeiXinCorpInfo: function (args, options = {}) {
     
     return mdyAPI('Login', 'GetWorkWeiXinCorpInfo', args, options);
   },
  /**
  * 企业微信小程序登录
企业微信打开明道云小程序
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinMiniProgramLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'WorkWeiXinMiniProgramLogin', args, options);
   },
  /**
  * 【三方应用】企业微信三方应用明道云登录
企业微信打开明道云
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinH5Login: function (args, options = {}) {
     
     return mdyAPI('Login', 'WorkWeiXinH5Login', args, options);
   },
  /**
  * 获取钉钉企业相关信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 明道网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getDingDingCorpInfo: function (args, options = {}) {
     
     return mdyAPI('Login', 'GetDingDingCorpInfo', args, options);
   },
  /**
  * 钉钉应用登录
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {string} args.state State
用于oauth 带的key值，定位Corp 信息
  * @param {integer} args.type 1钉钉内部登录 2 钉钉扫码登录
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   dingDingAppLogin: function (args, options = {}) {
     
     return mdyAPI('Login', 'DingDingAppLogin', args, options);
   },
  /**
  * 【自建应用集成】企业微信自建应用集成登录
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {string} args.state State
用于oauth 带的key值，定位Corp 信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinAppLoginByApp: function (args, options = {}) {
     
     return mdyAPI('Login', 'WorkWeiXinAppLoginByApp', args, options);
   },
  /**
  * 【自建应用集成】获取企业微信自建应用集成企业相关信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getWorkWeiXinCorpInfoByApp: function (args, options = {}) {
     
     return mdyAPI('Login', 'GetWorkWeiXinCorpInfoByApp', args, options);
   },
  /**
  * 【自建应用集成】Welink自建应用集成登录
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.code 授权码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   welinkAppLoginByApp: function (args, options = {}) {
     
     return mdyAPI('Login', 'WelinkAppLoginByApp', args, options);
   },
  /**
  * 【自建应用集成】获取企业微信自建应用集成企业相关信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getFeishuCorpInfoByApp: function (args, options = {}) {
     
     return mdyAPI('Login', 'GetFeishuCorpInfoByApp', args, options);
   },
  /**
  * 【自建应用集成】飞书自建应用集成登录
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {string} args.state State
用于oauth 带的key值，定位Corp 信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   feishuAppLoginByApp: function (args, options = {}) {
     
     return mdyAPI('Login', 'FeishuAppLoginByApp', args, options);
   },
};
