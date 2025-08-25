export default {
  /**
   * 【角色列表】获取 我可可申请的 角色列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {integer} args.pageIndex 页数
   * @param {integer} args.pageSize 每页数目
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pagedApplyRoleList: function (args, options = {}) {
    return mdyAPI('Role', 'PagedApplyRoleList', args, options);
  },
  /**
   * 【角色列表】获取 我已加入的 角色列表
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {integer} args.pageIndex 页数
   * @param {integer} args.pageSize 每页数目
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMyJoinedRoleList: function (args, options = {}) {
    return mdyAPI('Role', 'GetMyJoinedRoleList', args, options);
  },
  /**
   * 【角色列表，只限 超级管理员 能调】获取 所有角色的 角色列表（包含 标识  是否是我加入的角色）
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {integer} args.pageIndex 页数
   * @param {integer} args.pageSize 每页数目
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  pagedRoleList: function (args, options = {}) {
    return mdyAPI('Role', 'PagedRoleList', args, options);
  },
  /**
  * 获取 角色标准权限集（可用于 新建角色）
【只限 角色成员 或 超管】
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.roleId 角色Id（可空【新建角色使用】）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getRoleStandardPermission: function (args, options = {}) {
    return mdyAPI('Role', 'GetRoleStandardPermission', args, options);
  },
  /**
  * 获取 角色 人事权限集（可用于 新建角色）
【只限 角色成员 或 超管，有人事模块的组织】
  * @param {Object} args 请求参数
  * @param {string} args.projectId
  * @param {string} args.roleId 角色Id（可空【新建角色使用】）
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  getRoleHRPermission: function (args, options = {}) {
    return mdyAPI('Role', 'GetRoleHRPermission', args, options);
  },
  /**
   * 创建/编辑 角色所拥有的权限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.roleId 角色id
   * @param {string} args.roleName 角色名
   * @param {boolean} args.allowAssignSamePermission 是否 允许权限分配
   * @param {array} args.permissionIds 权限id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  addRole: function (args, options = {}) {
    return mdyAPI('Role', 'AddRole', args, options);
  },
  /**
   * 创建/编辑 角色所拥有的权限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.roleId 角色id
   * @param {string} args.roleName 角色名
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editRoleName: function (args, options = {}) {
    return mdyAPI('Role', 'EditRoleName', args, options);
  },
  /**
   * 创建/编辑 角色所拥有的权限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.roleId 角色id
   * @param {string} args.roleName 角色名
   * @param {boolean} args.allowAssignSamePermission 是否 允许权限分配
   * @param {array} args.permissionIds 权限id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editRole: function (args, options = {}) {
    return mdyAPI('Role', 'EditRole', args, options);
  },
  /**
   * 创建/编辑 角色所拥有的 HR权限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.roleId 角色id
   * @param {string} args.roleName 角色名
   * @param {boolean} args.allowAssignSamePermission 是否 允许权限分配
   * @param {array} args.permissionIds 权限id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  editRoleHR: function (args, options = {}) {
    return mdyAPI('Role', 'EditRoleHR', args, options);
  },
  /**
   * 设置 角色的 【允许分配权限】
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {string} args.roleId 角色id
   * @param {boolean} args.allowAssignSamePermission 是否 允许权限分配
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  setAllowAssignSamePermission: function (args, options = {}) {
    return mdyAPI('Role', 'SetAllowAssignSamePermission', args, options);
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
  * 分页 查询 角色成员
【只限 角色成员 或 超管】
  * @param {Object} args 请求参数
  * @param {string} args.keywords 搜索关键词
  * @param {string} args.projectId 网络id
  * @param {string} args.roleId 角色id
  * @param {integer} args.pageIndex 页数
  * @param {integer} args.pageSize 每页数目
  * @param {boolean} args.isHRRole
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
  pagedRoleMembers: function (args, options = {}) {
    return mdyAPI('Role', 'PagedRoleMembers', args, options);
  },
  /**
   * 将组织员工 添加到角色下
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
   * 验证 用户是否是 最后一名【超级管理员】
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  isLastSuperAdmin: function (args, options = {}) {
    return mdyAPI('Role', 'IsLastSuperAdmin', args, options);
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
   * 获取 用户在 组织下的权限
   * @param {Object} args 请求参数
   * @param {string} args.projectId 网络id
   * @param {Object} options 配置参数
   * @param {Boolean} options.silent 是否禁止错误弹层
   * @returns {Promise<Boolean, ErrorModel>}
   **/
  getMyPermissions: function (args, options = {}) {
    return mdyAPI('Role', 'GetMyPermissions', args, options);
  },
};
