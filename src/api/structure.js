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
     
     return $.api('Structure', 'GetAllowChooseUsers', args, options);
   },
  /**
  * 获取组织结构人员
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageSize 页大小
  * @param {integer} args.pageIndex 页码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getStructureUsers: function (args, options = {}) {
     
     return $.api('Structure', 'GetStructureUsers', args, options);
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
     
     return $.api('Structure', 'GetSubordinateUsers', args, options);
   },
  /**
  * 获取顶点员工
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex
  * @param {integer} args.pageSize
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedTopAccountIdsWith3Level: function (args, options = {}) {
     
     return $.api('Structure', 'PagedTopAccountIdsWith3Level', args, options);
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
   pagedSubIdsWithByAccountId: function (args, options = {}) {
     
     return $.api('Structure', 'PagedSubIdsWithByAccountId', args, options);
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
     
     return $.api('Structure', 'MyStructures', args, options);
   },
  /**
  * 获取单个员工的下属
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isDirect 是否直属下属
  * @param {boolean} args.isGetParent 是否获取上级
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSubordinateByAccountId: function (args, options = {}) {
     
     return $.api('Structure', 'GetSubordinateByAccountId', args, options);
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
     
     return $.api('Structure', 'GetParentsByAccountId', args, options);
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
     
     return $.api('Structure', 'AddStructure', args, options);
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
     
     return $.api('Structure', 'ReplaceUserStructure', args, options);
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
     
     return $.api('Structure', 'RemoveParentID', args, options);
   },
};
