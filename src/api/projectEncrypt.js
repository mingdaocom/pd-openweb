export default {
  /**
  * 获取当前网络的所有加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectEncryptRules: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'GetProjectEncryptRules', args, options);
   },
  /**
  * 分页面询加密字段 加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId （必填）
  * @param {string} args.encryptRuleId 加密规则Id（必填）
  * @param {string} args.appId 应用Id（选填）
  * @param {string} args.worksheetId 工作表Id（选填）
  * @param {string} args.keywords 搜索关键字
  * @param {integer} args.pageIndex 页码（第一页 = 1）
  * @param {integer} args.pageSize 每页行数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedEncryptFields: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'PagedEncryptFields', args, options);
   },
  /**
  * 分页面询 加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.name 名称（模糊查询 不区分大小写）
  * @param {integer} args.type 加密方式
  * @param {integer} args.state 状态
  * @param {integer} args.pageIndex 页码（第一页 = 1）
  * @param {integer} args.pageSize 每页行数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedEncryptRules: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'PagedEncryptRules', args, options);
   },
  /**
  * 获取当前网络的所有加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'GetAllEncryptRule', args, options);
   },
  /**
  * 获取加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.encryptRuleId 加密规则Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'GetEncryptRule', args, options);
   },
  /**
  * 获取所有可用的加密规则信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAvailableEncryptRuleInfo: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'GetAvailableEncryptRuleInfo', args, options);
   },
  /**
  * 添加加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {} args.addEncryptRule 添加加密规则DTO
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'AddEncryptRule', args, options);
   },
  /**
  * 编辑加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.encryptRuleId 加密规则Id
  * @param {} args.editeEncryptRule 可编辑的加密规则内容
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'EditEncryptRule', args, options);
   },
  /**
  * 设置默认加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.encryptRuleId 加密规则Id
  * @param {integer} args.state 状态值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setEncryptRuleState: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'SetEncryptRuleState', args, options);
   },
  /**
  * 设置默认加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 组织Id
  * @param {string} args.encryptRuleId 加密规则Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   setDefaultEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'SetDefaultEncryptRule', args, options);
   },
  /**
  * 移除加密规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 加密规则id
  * @param {string} args.encryptRuleId 加密规则Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeEncryptRule: function (args, options = {}) {
     
     return $.api('ProjectEncrypt', 'RemoveEncryptRule', args, options);
   },
};
