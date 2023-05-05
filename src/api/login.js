export default {
  /**
  * 使用明道云账号登录
  * @param {Object} args 请求参数
  * @param {string} args.account 账号
  * @param {string} args.password 密码
  * @param {boolean} args.isCookie 是否记住用户名密码
  * @param {string} args.unionId 第三方账号id标识
  * @param {string} args.state 第三方账号随机码
  * @param {} args.tpType 第三方账号类型
  * @param {string} args.regFrom 登录广告来源
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mDAccountLogin: function (args, options = {}) {
     
     return $.api('Login', 'MDAccountLogin', args, options);
   },
  /**
  * 使用明道云账号自动登录，如果登录失败，需要把本地保存的密码清理掉
  * @param {Object} args 请求参数
  * @param {string} args.accountId 账号
  * @param {string} args.encryptPassword 加密密码
  * @param {} args.loginType 登录类型(默认0: AccountId + EncryptPassword、1（LDAP）: AccountId + EncryptPassword + Account + ProjectId)
  * @param {string} args.account 账号
  * @param {string} args.projectId 网络Id
  * @param {string} args.regFrom 登录广告来源
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   mDAccountAutoLogin: function (args, options = {}) {
     
     return $.api('Login', 'MDAccountAutoLogin', args, options);
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
     
     return $.api('Login', 'MDTwofactorLogin', args, options);
   },
  /**
  * 检查登陆状态
登录返回true，未登录则返回false
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   checkLogin: function (args, options = {}) {
     
     return $.api('Login', 'CheckLogin', args, options);
   },
  /**
  * 登出
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   loginOut: function (args, options = {}) {
     
     return $.api('Login', 'LoginOut', args, options);
   },
  /**
  * 发送验证码
  * @param {Object} args 请求参数
  * @param {string} args.state 状态位
  * @param {integer} args.type 发送类型
1为手机号；2为邮箱
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   sendTwofactorVerifyCode: function (args, options = {}) {
     
     return $.api('Login', 'SendTwofactorVerifyCode', args, options);
   },
  /**
  * LDAP账号登录
  * @param {Object} args 请求参数
  * @param {string} args.userName LDAP 用户名
  * @param {string} args.password LDAP 密码
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isCookie 是否记住用户名密码
  * @param {string} args.regFrom 登录广告来源
  * @param {string} args.ticket 验证码返票据
  * @param {string} args.randStr 票据随机字符串
  * @param {} args.captchaType 验证码类型（默认腾讯云）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   lDAPLogin: function (args, options = {}) {
     
     return $.api('Login', 'LDAPLogin', args, options);
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
     
     return $.api('Login', 'TPLogin', args, options);
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
     
     return $.api('Login', 'TPMDAccountLogin', args, options);
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
     
     return $.api('Login', 'WorkWeiXinLogin', args, options);
   },
  /**
  * 【三方应用】企业微信网页授权登录
  * @param {Object} args 请求参数
  * @param {string} args.authCode 授权码
  * @param {} args.suiteType 套件类型
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   workWeiXinWebAuthLogin: function (args, options = {}) {
     
     return $.api('Login', 'WorkWeiXinWebAuthLogin', args, options);
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
     
     return $.api('Login', 'WorkWeiXinInstallAuthLogin', args, options);
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
     
     return $.api('Login', 'GetWorkWeiXinCorpInfo', args, options);
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
     
     return $.api('Login', 'WorkWeiXinMiniProgramLogin', args, options);
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
     
     return $.api('Login', 'WorkWeiXinH5Login', args, options);
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
     
     return $.api('Login', 'GetDingDingCorpInfo', args, options);
   },
  /**
  * 钉钉应用登录
  * @param {Object} args 请求参数
  * @param {string} args.code 授权码
  * @param {string} args.state State
用于oauth 带的key值，定位Corp 信息
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   dingDingAppLogin: function (args, options = {}) {
     
     return $.api('Login', 'DingDingAppLogin', args, options);
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
     
     return $.api('Login', 'WorkWeiXinAppLoginByApp', args, options);
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
     
     return $.api('Login', 'GetWorkWeiXinCorpInfoByApp', args, options);
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
     
     return $.api('Login', 'WelinkAppLoginByApp', args, options);
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
     
     return $.api('Login', 'GetFeishuCorpInfoByApp', args, options);
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
     
     return $.api('Login', 'FeishuAppLoginByApp', args, options);
   },
};
