export default {
  /**
  * 获取可选择下属
  * @param {Object} args 请求参数
  * @param {string} args.accountId 账号id
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {boolean} args.isSetParent true 设置上级 false 添加下属
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getAllowChooseUsers: function (args, options = {}) {
     
     return mdyAPI('Structure', 'GetAllowChooseUsers', args, options);
   },
  /**
  * 我的下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {boolean} args.onlyNormalStatus 是否 仅有效用户
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubordinateUsers: function (args, options = {}) {
     
     return mdyAPI('Structure', 'GetSubordinateUsers', args, options);
   },
  /**
  * 分页获取最顶层员工
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.parentId 父级id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 每页条数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedGetAccountList: function (args, options = {}) {
     
     return mdyAPI('Structure', 'PagedGetAccountList', args, options);
   },
  /**
  * 获取员工上级用户信息
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getTreesByAccountId: function (args, options = {}) {
     
     return mdyAPI('Structure', 'GetTreesByAccountId', args, options);
   },
  /**
  * 获取员工下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 要获取其下属的 AccountId
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   myStructures: function (args, options = {}) {
     
     return mdyAPI('Structure', 'MyStructures', args, options);
   },
  /**
  * 获取员工上级
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isDirect 是否直属下属
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getParentsByAccountId: function (args, options = {}) {
     
     return mdyAPI('Structure', 'GetParentsByAccountId', args, options);
   },
  /**
  * 添加下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isTop 是否顶级
  * @param {string} args.parentId 上级ID
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addStructure: function (args, options = {}) {
     
     return mdyAPI('Structure', 'AddStructure', args, options);
   },
  /**
  * 替换节点
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 账号id
  * @param {string} args.replacedAccountId 被替换员工
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   replaceUserStructure: function (args, options = {}) {
     
     return mdyAPI('Structure', 'ReplaceUserStructure', args, options);
   },
  /**
  * 移除上级
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeParentID: function (args, options = {}) {
     
     return mdyAPI('Structure', 'RemoveParentID', args, options);
   },
};
