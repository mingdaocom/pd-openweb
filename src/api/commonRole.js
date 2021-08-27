define(function (require, exports, module) {
  module.exports = {
    /**
    * 添加用户到角色
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {string} args.roleId 角色id
    * @param {array} args.accountids 账号
    * @param {} args.userRoleStatus 用户状态
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addUserToRole: function (args, options) {
      return $.api('CommonRole', 'AddUserToRole', args, options);
    },

    /**
    * 从角色里删除用户
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {string} args.accountid 用户id
    * @param {} args.entityType 实体类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeUserFromRole: function (args, options) {
      return $.api('CommonRole', 'RemoveUserFromRole', args, options);
    },

    /**
    * 批量删除角色成员
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {array} args.accountIds 账号id
    * @param {} args.entityType 实体类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeUserFromRoleBatch: function (args, options) {
      return $.api('CommonRole', 'RemoveUserFromRoleBatch', args, options);
    },

    /**
    * 获取角色列表
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getEntitySummaryRole: function (args, options) {
      return $.api('CommonRole', 'GetEntitySummaryRole', args, options);
    },

    /**
    * 获取角色人员
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {string} args.roleId 角色id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getPageUserIds: function (args, options) {
      return $.api('CommonRole', 'GetPageUserIds', args, options);
    },

    /**
    * 检查是否有权限
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {integer} args.permissionId 权限id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    isGranted: function (args, options) {
      return $.api('CommonRole', 'IsGranted', args, options);
    },

    /**
    * 检测是否有权限 （多项）
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {array} args.permissionIds 权限id
    * @param {string} args.accountId 账号id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    isGrantedByPermissionIds: function (args, options) {
      return $.api('CommonRole', 'IsGrantedByPermissionIds', args, options);
    },

    /**
    * 获取用户拥有的权限
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {} args.entityType 实体类型
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getUserEntityPermission: function (args, options) {
      return $.api('CommonRole', 'GetUserEntityPermission', args, options);
    },

    /**
    * 获取权限模版
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getPermissionTemplate: function (args, options) {
      return $.api('CommonRole', 'GetPermissionTemplate', args, options);
    },

    /**
    * 获取角色权限
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getRolePermission: function (args, options) {
      return $.api('CommonRole', 'GetRolePermission', args, options);
    },

    /**
    * 修改或添加角色
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {string} args.roleName 角色名称
    * @param {array} args.permissionId 权限
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    editeRolePermission: function (args, options) {
      return $.api('CommonRole', 'EditeRolePermission', args, options);
    },

    /**
    * 获取所有人员
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getEntityRoleUser: function (args, options) {
      return $.api('CommonRole', 'GetEntityRoleUser', args, options);
    },

    /**
    * 获取用户在实体下的角色，及角色权限
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getUserRoleAndPermissions: function (args, options) {
      return $.api('CommonRole', 'GetUserRoleAndPermissions', args, options);
    },

    /**
    * 获取人员详细信息 可获取全部状态人员
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {integer} args.pageIndex 页码
    * @param {integer} args.pageSize 页大小
    * @param {} args.roleType 角色类型
    * @param {} args.status 用户状态
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getPageUserDetail: function (args, options) {
      return $.api('CommonRole', 'GetPageUserDetail', args, options);
    },

    /**
    * 删除用户在实体下所有的权限关系
    * @param {Object} args 请求参数
    * @param {} args.entityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.accountid 账号id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeEntityUserAllRole: function (args, options) {
      return $.api('CommonRole', 'RemoveEntityUserAllRole', args, options);
    },

    /**
    * 把一个用户加到某个实体的某个角色下
    * @param {Object} args 请求参数
    * @param {} args.roleEntityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {string} args.userScopeId 范围id
    * @param {} args.userScopeType 范围类型
    * @param {} args.userRoleStatus 用户状态
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addUserToEntityRole: function (args, options) {
      return $.api('CommonRole', 'AddUserToEntityRole', args, options);
    },

    /**
    * 把一组用户添加到某个实体下的某个角色下【批量】
    * @param {Object} args 请求参数
    * @param {} args.roleEntityType 实体类型
    * @param {string} args.entityId 实体id
    * @param {string} args.roleId 角色id
    * @param {array} args.userScopeIds 范围id
    * @param {} args.userScopeType 范围类型
    * @param {} args.userRoleStatus 用户状态
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addUserToEntityRoleBatch: function (args, options) {
      return $.api('CommonRole', 'AddUserToEntityRoleBatch', args, options);
    },

    /**
    * 申请加入工作表
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    applyToJoinTheWorksheet: function (args, options) {
      return $.api('CommonRole', 'ApplyToJoinTheWorksheet', args, options);
    },

    /**
    * 退出工作表
    * @param {Object} args 请求参数
    * @param {string} args.entityId 实体id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    quitFromTheWorksheet: function (args, options) {
      return $.api('CommonRole', 'QuitFromTheWorksheet', args, options);
    },

  };
});
