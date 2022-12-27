export default {
  /**
  * 用户是否具有这些模块的权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 账号id
  * @param {array} args.permissionIds 权限id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isGrantedByPermissionIds: function (args, options = {}) {
     
     return $.api('Role', 'IsGrantedByPermissionIds', args, options);
   },
  /**
  * 用户具有该功能模块的权限明细，哪些菜单有，哪些没有
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.accountId 账号id
  * @param {integer} args.typeId 模块id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserPermissionByType: function (args, options = {}) {
     
     return $.api('Role', 'GetUserPermissionByType', args, options);
   },
  /**
  * 是否有此权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.permissionId 权限id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isGranted: function (args, options = {}) {
     
     return $.api('Role', 'IsGranted', args, options);
   },
  /**
  * 判断是否具有网络管理员权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isProjectAdmin: function (args, options = {}) {
     
     return $.api('Role', 'IsProjectAdmin', args, options);
   },
  /**
  * 用户所拥有的正常权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUserPermissions: function (args, options = {}) {
     
     return $.api('Role', 'GetUserPermissions', args, options);
   },
  /**
  * 编辑角色所拥有的权限
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
     
     return $.api('Role', 'EditRole', args, options);
   },
  /**
  * 管理员给员工添加权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {array} args.accountIds 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addUserToRole: function (args, options = {}) {
     
     return $.api('Role', 'AddUserToRole', args, options);
   },
  /**
  * 同意用户加入
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   agreeUserToRole: function (args, options = {}) {
     
     return $.api('Role', 'AgreeUserToRole', args, options);
   },
  /**
  * 拒绝用户加入
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   refuseUserToRole: function (args, options = {}) {
     
     return $.api('Role', 'RefuseUserToRole', args, options);
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
     
     return $.api('Role', 'RemoveRole', args, options);
   },
  /**
  * 申请权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyRole: function (args, options = {}) {
     
     return $.api('Role', 'ApplyRole', args, options);
   },
  /**
  * 删除用户权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {string} args.accountId 账号id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeUserFromRole: function (args, options = {}) {
     
     return $.api('Role', 'RemoveUserFromRole', args, options);
   },
  /**
  * 配置管理角色列表
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
     
     return $.api('Role', 'GetSummaryRole', args, options);
   },
  /**
  * 角色包含的成员
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
     
     return $.api('Role', 'GetPageUserIds', args, options);
   },
  /**
  * 角色包含的权限
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getRolePermisson: function (args, options = {}) {
     
     return $.api('Role', 'GetRolePermisson', args, options);
   },
  /**
  * 申请权限人数
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getUnauditedUserCount: function (args, options = {}) {
     
     return $.api('Role', 'GetUnauditedUserCount', args, options);
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
     
     return $.api('Role', 'GetUnauditedUserDetail', args, options);
   },
  /**
  * 操作日志
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPageLogs: function (args, options = {}) {
     
     return $.api('Role', 'GetPageLogs', args, options);
   },
  /**
  * 判断是否是超级管理员
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   isSuperAdmin: function (args, options = {}) {
     
     return $.api('Role', 'IsSuperAdmin', args, options);
   },
  /**
  * 获取 用户在网络下的权限信息（查库，限网络后台使用）
  * @param {Object} args 请求参数
  * @param {string} args.projectId 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjectPermissionsByUser: function (args, options = {}) {
     
     return $.api('Role', 'GetProjectPermissionsByUser', args, options);
   },
};
