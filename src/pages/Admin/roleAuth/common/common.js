var RoleAuthCommon = {};
var RoleController = require('src/api/role');

RoleAuthCommon.checkIsSuperAdmin = function(projectId) {
  return RoleController.isSuperAdmin(
    {
      projectId,
    },
    { ajaxOptions: { async: false } }
  ).then(function(flag) {
    RoleAuthCommon.isSuperAdmin = flag;
    return flag;
  });
};

RoleAuthCommon.getUnauditedCount = function(projectId) {
  return RoleController.getUnauditedUserCount({
    projectId,
  }).then(function(data) {
    return data || 0;
  });
};

RoleAuthCommon.formatRoleAuth = function(role, removeRoleModule = true) {
  const roleModule = role.permissionTypes;
  const isAdmin = role.roleId && role.roleId.toUpperCase() === 'D552154A-BF26-403F-9783-DC4A5B268865';
  let rolePermission;
  let predicate = permission => permission.typeId === 1;
  if (removeRoleModule) {
    rolePermission = _.remove(roleModule, predicate)[0];
  } else {
    rolePermission = _.find(roleModule, predicate);
  }
  let _addAuth, _editAuth, _deleteAuth, _noAuth;
  if (rolePermission) {
    _.each(rolePermission.subPermissions, permission => {
      if (permission.permissionId === 101) {
        _addAuth = true;
      }
      if (permission.permissionId === 102) {
        _editAuth = true;
      }
      if (permission.permissionId === 103) {
        _deleteAuth = true;
      }
    });
  } else if (!RoleAuthCommon.isSuperAdmin) {
    _noAuth = true;
  }
  role.noAuth = _noAuth;
  role.addAuth = _addAuth;
  role.editAuth = _editAuth;
  role.deleteAuth = _deleteAuth;
  // 超级管理员不可删除 编辑
  if (isAdmin) {
    role.isSuperAdmin = true;
    role.auth = {
      add: _addAuth || RoleAuthCommon.isSuperAdmin,
      edit: false,
      delete: false,
    };
  } else {
    role.auth = {
      add: _addAuth || RoleAuthCommon.isSuperAdmin,
      edit: RoleAuthCommon.isSuperAdmin,
      delete: RoleAuthCommon.isSuperAdmin,
    };
  }
};

module.exports = RoleAuthCommon;
