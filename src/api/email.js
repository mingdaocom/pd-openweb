export default {
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
    return mdyAPI('Email', 'EditSmtpSecret', args, options);
  },
  /**
   * 获取 smtp 配置
   * @param {Object} args 请求参数
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSmtpSecret: function (args, options = {}) {
    return mdyAPI('Email', 'GetSmtpSecret', args, options);
  },
  /**
   * 获取邮件服务实体绑定列表
   * @param {Object} args 请求参数
   * @param {integer} args.sceneType 邮件发送场景类型（0:未指定 1:系统 2:应用）
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSmtpEntityBindings: function (args, options = {}) {
    return mdyAPI('Email', 'GetSmtpEntityBindings', args, options);
  },
  /**
   * 添加邮件服务实体绑定
   * @param {Object} args 请求参数
   * @param {integer} args.sceneType 邮件发送场景类型（0:未指定 1:系统 2:应用）
   * @param {array} args.sceneEntityIds 场景实体 Id 列表
   * @param {string} args.id 邮件服务 Id
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addSmtpEntityBinding: function (args, options = {}) {
    return mdyAPI('Email', 'AddSmtpEntityBinding', args, options);
  },
  /**
   * 删除邮件服务实体绑定
   * @param {Object} args 请求参数
   * @param {integer} args.sceneType 邮件发送场景类型（0:未指定 1:系统 2:应用）
   * @param {array} args.sceneEntityIds 场景实体 Id 列表
   * @param {string} args.id 邮件服务 Id
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteSmtpEntityBinding: function (args, options = {}) {
    return mdyAPI('Email', 'DeleteSmtpEntityBinding', args, options);
  },
};
