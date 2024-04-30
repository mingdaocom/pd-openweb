export default {
  /**
  * 判断是否具有组织超级管理员权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isSuperAdmin: function (args, options = {}) {
     
     return mdyAPI('Role', 'IsSuperAdmin', args, options);
   },
  /**
  * 判断是否具有组织账户管理员权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isProjectAdmin: function (args, options = {}) {
     
     return mdyAPI('Role', 'IsProjectAdmin', args, options);
   },
  /**
  * 获取角色列表用于管理员首页展示列表
超级管理员忽略这个IsJoined参数返回所有角色列表；其余用户则根据这个值获取用户加入或者没有加入的角色列表
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {boolean} args.isJoined 是否加入网络
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSummaryRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetSummaryRole', args, options);
   },
  /**
  * 获取用户拥有的权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserPermissions: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetUserPermissions', args, options);
   },
  /**
  * 获取角色包含的权限
只有用户角色内才可以获取（超管除外）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolePermisson: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetRolePermisson', args, options);
   },
  /**
  * 获取 用户在组织下的权限信息（查库，限网络后台使用）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectPermissionsByUser: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetProjectPermissionsByUser', args, options);
   },
  /**
  * 将组织员工添加到角色下
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addUserToRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'AddUserToRole', args, options);
   },
  /**
  * 删除用户权限
移除角色下的某个用户
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUserFromRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'RemoveUserFromRole', args, options);
   },
  /**
  * 获取角色下成员
支持分页
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索关键词
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPageUserIds: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetPageUserIds', args, options);
   },
  /**
  * 创建/编辑角色所拥有的权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleName 角色名
  * @param {array} args.permissionIds 权限id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   editRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'EditRole', args, options);
   },
  /**
  * 删除角色
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'RemoveRole', args, options);
   },
  /**
  * 申请角色权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'ApplyRole', args, options);
   },
  /**
  * 同意用户加入角色
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   agreeUserToRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'AgreeUserToRole', args, options);
   },
  /**
  * 拒绝用户加入角色
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseUserToRole: function (args, options = {}) {
     
     return mdyAPI('Role', 'RefuseUserToRole', args, options);
   },
  /**
  * 获取申请所有角色的人数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUnauditedUserCount: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetUnauditedUserCount', args, options);
   },
  /**
  * 获取所有申请用户详情
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUnauditedUserDetail: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetUnauditedUserDetail', args, options);
   },
  /**
  * 获取组织管理-管理员相关操作日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPageLogs: function (args, options = {}) {
     
     return mdyAPI('Role', 'GetPageLogs', args, options);
   },
};
