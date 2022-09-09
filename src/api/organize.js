module.exports = {
  /**
  * 获取角色列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {string} args.keywords 关键词
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOrganizes: function (args, options = {}) {
     
     return $.api('Organize', 'GetOrganizes', args, options);
   },
  /**
  * 添加角色
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.organizeName 角色名称
  * @param {string} args.remark 备注
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addOrganize: function (args, options = {}) {
     
     return $.api('Organize', 'AddOrganize', args, options);
   },
  /**
  * 修改角色名称
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.organizeId 角色id
  * @param {string} args.organizeName 角色名称
  * @param {string} args.remark 角色名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editOrganizeName: function (args, options = {}) {
     
     return $.api('Organize', 'EditOrganizeName', args, options);
   },
  /**
  * 删除角色
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.organizeIds 角色Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteOrganizes: function (args, options = {}) {
     
     return $.api('Organize', 'DeleteOrganizes', args, options);
   },
  /**
  * 根据账号id获取角色列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {array} args.accountIds 用户ids
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getOrganizesByAccountId: function (args, options = {}) {
     
     return $.api('Organize', 'GetOrganizesByAccountId', args, options);
   },
  /**
  * 获取 角色成员列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.organizeId 职位id
  * @param {string} args.keywords 关键词
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   pagedOrganizeAccounts: function (args, options = {}) {
     
     return $.api('Organize', 'PagedOrganizeAccounts', args, options);
   },
  /**
  * 添加用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.organizeId 职位id
  * @param {array} args.accountIds 账号Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addOrganizeUsers: function (args, options = {}) {
     
     return $.api('Organize', 'AddOrganizeUsers', args, options);
   },
  /**
  * 删除用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络Id
  * @param {string} args.organizeId
  * @param {array} args.accountIds 账号Id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   deleteOrganizeUsers: function (args, options = {}) {
     
     return $.api('Organize', 'DeleteOrganizeUsers', args, options);
   },
};
