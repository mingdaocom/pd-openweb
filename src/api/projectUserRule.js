export default {
  /**
  * 获取所有规则（只返回 主作用对象/即被限制对象 ）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRulesWithMainTarget: function (args, options = {}) {
     
     return mdyAPI('ProjectUserRule', 'GetRulesWithMainTarget', args, options);
   },
  /**
  * 获取单条规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.ruleId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRule: function (args, options = {}) {
     
     return mdyAPI('ProjectUserRule', 'GetRule', args, options);
   },
  /**
  * 添加 限制查看外部门规则（返回 规则Id）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.ruleType 主规则的类型（限制查看外部门规则=10、限制查看全网络规则=15）
  * @param {array} args.items 规则明细
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addRule: function (args, options = {}) {
     
     return mdyAPI('ProjectUserRule', 'AddRule', args, options);
   },
  /**
  * 重置 限制查看外部门规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.ruleId 规则Id
  * @param {array} args.items 重置规则的 明细
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   resetRule: function (args, options = {}) {
     
     return mdyAPI('ProjectUserRule', 'ResetRule', args, options);
   },
  /**
  * 删除 限制查看外部门规则
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.ruleId
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRule: function (args, options = {}) {
     
     return mdyAPI('ProjectUserRule', 'RemoveRule', args, options);
   },
};
