define(function (require, exports, module) {
  module.exports = {
    /**
    * 申请秘钥
    * @param {Object} args 请求参数
    * @param {string} args.serverId 服务器id
    * @param {string} args.projectName 网络名称
    * @param {string} args.job 职位
    * @param {integer} args.scaleId 规模
    * @param {string} args.mobilePhone 手机号
    * @param {string} args.verifyCode 验证码
    * @param {string} args.licenseTemplateVersion 支持的密钥模板版本
    * @param {string} args.channel 申请来源
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    applyLicenseCode: function (args, options) {
      return $.api('PrivateGuide', 'ApplyLicenseCode', args, options);
    },

    /**
    * 获取当前用户秘钥申请列表
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getLicenseList: function (args, options) {
      return $.api('PrivateGuide', 'GetLicenseList', args, options);
    },

    /**
    * 获取当前服务器秘钥申请列表
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getServerLicenseList: function (args, options) {
      return $.api('PrivateGuide', 'GetServerLicenseList', args, options);
    },

    /**
    * 获取当前服务器信息
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getServerInfo: function (args, options) {
      return $.api('PrivateGuide', 'GetServerInfo', args, options);
    },

    /**
    * 获取组织列表
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getProjects: function (args, options) {
      return $.api('PrivateGuide', 'GetProjects', args, options);
    },

    /**
    * 绑定组织
    * @param {Object} args 请求参数
    * @param {array} args.projectIds 网络id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    bindProject: function (args, options) {
      return $.api('PrivateGuide', 'BindProject', args, options);
    },

    /**
    * 添加授权
    * @param {Object} args 请求参数
    * @param {string} args.licenseCode 授权码
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    bindLicenseCode: function (args, options) {
      return $.api('PrivateGuide', 'BindLicenseCode', args, options);
    },

    /**
    * 启用授权
    * @param {Object} args 请求参数
    * @param {string} args.licenseCode 授权码
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    enableLicenseCode: function (args, options) {
      return $.api('PrivateGuide', 'EnableLicenseCode', args, options);
    },

    /**
    * 创建管理员账号
    * @param {Object} args 请求参数
    * @param {string} args.name 姓名
    * @param {string} args.email 邮箱
    * @param {string} args.password 密码
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addAdmin: function (args, options) {
      return $.api('PrivateGuide', 'AddAdmin', args, options);
    },

    /**
    * 创建网络
    * @param {Object} args 请求参数
    * @param {string} args.name 网络名称
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addProject: function (args, options) {
      return $.api('PrivateGuide', 'AddProject', args, options);
    },

    /**
    * 获取引导步骤状态
    * @param {Object} args 请求参数
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getGuideStepStatus: function (args, options) {
      return $.api('PrivateGuide', 'GetGuideStepStatus', args, options);
    },

  };
});
