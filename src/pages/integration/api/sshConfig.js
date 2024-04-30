import base, { controllerName } from './base';

var sshConfig = {

  /**
   * 添加新ssh配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.sshConfigId 对已保存的ssh配置测试连接时需要传ssh配置id
   * @param {string} args.projectId 组织id
   * @param {string} args.remark ssh配置备注名称
   * @param {string} args.sshHost ssh host
   * @param {integer} args.sshPort ssh port
   * @param {string} args.sshUser ssh user
   * @param {integer} args.authType ssh验证方式(默认密码:0.密码；1.公钥)
   * @param {string} args.sshPwd ssh pwd:如果有配置ssh密码的情况下，忽略ssh密钥对配置
   * @param {string} args.sshKeyPairId ssh 密钥对
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addSshConfig: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/addSshConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfigaddSshConfig', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取ssh配置列表
   *
   * @param {Object} args 请求参数
   * @param {integer} args.pageNo 页码，从0开始
   * @param {integer} args.pageSize 每页数量
   * @param {string} args.projectId 组织id
   * @param {string} args.searchBody 搜索内容，支持搜索：数据源名称、地址、创建者
   * @param {object} args.sort 排序参数(object)
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  list: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/list';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfiglist', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 测试ssh配置连接
   *
   * @param {Object} args 请求参数
   * @param {string} args.sshConfigId 对已保存的ssh配置测试连接时需要传ssh配置id
   * @param {string} args.projectId 组织id
   * @param {string} args.remark ssh配置备注名称
   * @param {string} args.sshHost ssh host
   * @param {integer} args.sshPort ssh port
   * @param {string} args.sshUser ssh user
   * @param {integer} args.authType ssh验证方式(默认密码:0.密码；1.公钥)
   * @param {string} args.sshPwd ssh pwd:如果有配置ssh密码的情况下，忽略ssh密钥对配置
   * @param {string} args.sshKeyPairId ssh 密钥对
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  test: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/test';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfigtest', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 生成ssh密钥对
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  genKeyPair: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/genKeyPair';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfiggenKeyPair', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 获取ssh配置详情
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.sshConfigId ssh配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getSshConfig: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/getSshConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfiggetSshConfig', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 更新ssh配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.id ssh配置id
   * @param {string} args.remark ssh配置备注名称
   * @param {string} args.sshHost ssh host
   * @param {integer} args.sshPort ssh port
   * @param {string} args.sshUser ssh user
   * @param {string} args.sshPwd ssh pwd:如果有配置ssh密码的情况下，忽略ssh密钥对配置
   * @param {string} args.sshKeyPairId ssh 密钥对
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  updateSshConfig: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/updateSshConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfigupdateSshConfig', JSON.stringify(args), $.extend(base, options));
  },

  /**
   * 删除ssh配置
   *
   * @param {Object} args 请求参数
   * @param {string} args.projectId 组织id
   * @param {string} args.sshConfigId ssh配置id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  deleteSshConfig: function (args, options) {
    base.ajaxOptions.url = base.server(options) + 'sshConfig/deleteSshConfig';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'sshConfigdeleteSshConfig', JSON.stringify(args), $.extend(base, options));
  }
};

export default sshConfig;