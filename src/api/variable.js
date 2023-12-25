export default {
  /**
  * 获取变量详情
  * @param {Object} args 请求参数
  * @param {string} args.id 组织id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   get: function (args, options = {}) {
     
     return $.api('Variable', 'Get', args, options);
   },
  /**
  * 批量获取变量
  * @param {Object} args 请求参数
  * @param {string} args.sourceId 来源id （sourceType = 0 时，传组织id，其他传应用id）
  * @param {} args.sourceType 获取类型 0 = 组织级别，1= 应用级别，10 = 授权到应用下的变量（包含组织授权到该应用的和应用下创建的），11 = 授权到应用的组织变量（不包含应用下创建的）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   gets: function (args, options = {}) {
     
     return $.api('Variable', 'Gets', args, options);
   },
  /**
  * 创建变量
  * @param {Object} args 请求参数
  * @param {integer} args.sourceType 来源类型 0 = 组织级别，1= 应用级别
  * @param {string} args.sourceId 来源id ，SourceType = 0 时为组织id，其他为应用id
  * @param {array} args.appIds 授权应用范围
  * @param {string} args.name 名称（全路径）
  * @param {integer} args.allowEdit 是否允许在工作流中修改 0 = 不允许，1 = 允许
  * @param {integer} args.masktype 是否允许在工作流中修改 0 = 不掩码，1 = 掩码
  * @param {string} args.description 描述
  * @param {integer} args.scope 授权范围 1 = 所有应用，2 = 指定
  * @param {integer} args.controlType 变量类型（和工作表控件类型保持一致）
  * @param {string} args.value 变量值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   create: function (args, options = {}) {
     
     return $.api('Variable', 'Create', args, options);
   },
  /**
  * 编辑变量
  * @param {Object} args 请求参数
  * @param {string} args.id 变量id
  * @param {integer} args.sourceType 来源类型 0 = 组织级别，1= 应用级别
  * @param {string} args.sourceId 来源id ，SourceType = 0 时为组织id，其他为应用id
  * @param {array} args.appIds 授权应用范围
  * @param {string} args.name 名称（全路径）
  * @param {integer} args.allowEdit 是否允许在工作流中修改 0 = 不允许，1 = 允许
  * @param {integer} args.masktype 是否允许在工作流中修改 0 = 不掩码，1 = 掩码
  * @param {string} args.description 描述
  * @param {integer} args.scope 授权范围 1 = 所有应用，2 = 指定
  * @param {integer} args.controlType 变量类型（和工作表控件类型保持一致）
  * @param {string} args.value 变量值
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   edit: function (args, options = {}) {
     
     return $.api('Variable', 'Edit', args, options);
   },
  /**
  * 删除变量
  * @param {Object} args 请求参数
  * @param {string} args.id 变量id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   remove: function (args, options = {}) {
     
     return $.api('Variable', 'Remove', args, options);
   },
  /**
  * 仅更新变量值
  * @param {Object} args 请求参数
  * @param {string} args.id 变量id
  * @param {string} args.name 变量名称
  * @param {string} args.value 值
  * @param {integer} args.editType 编辑类型 0 = 设为，1= 增加，2 = 减少
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editValue: function (args, options = {}) {
     
     return $.api('Variable', 'EditValue', args, options);
   },
  /**
  * 获取日志
  * @param {Object} args 请求参数
  * @param {string} args.variableId 变量id
  * @param {string} args.start 开始时间
  * @param {string} args.end 结束时间
  * @param {string} args.operator 操作人
  * @param {integer} args.pageIndex 当前页
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLogs: function (args, options = {}) {
     
     return $.api('Variable', 'GetLogs', args, options);
   },
};
