module.exports = {
  /**
  * 修改 smtp 配置
  * @param {Object} args 请求参数
  * @param {string} args.signature 签名
  * @param {string} args.fromAddress 来自邮箱
  * @param {string} args.server 服务器地址
  * @param {string} args.account 账号
  * @param {string} args.password 密码
  * @param {integer} args.port 端口
  * @param {boolean} args.enableSsl 是否启用 SSL
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editSmtpSecret: function (args, options = {}) {
     
     return $.api('Email', 'EditSmtpSecret', args, options);
   },
  /**
  * 获取 smtp 配置
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSmtpSecret: function (args, options = {}) {
     
     return $.api('Email', 'GetSmtpSecret', args, options);
   },
};
