export const getCheckedPermissionIds = (permissionList = []) => {
  const checkedIds = [];
  permissionList.forEach(item => {
    if (item.isRolePermission) {
      checkedIds.push(item.permissionId);
    }
    if ((item.subPermission || []).length) {
      checkedIds.push(...getCheckedPermissionIds(item.subPermission));
    }
  });

  return checkedIds;
};

export const filterMyPermissions = permissionList => {
  return permissionList.reduce((acc, cur) => {
    const subPermission = (cur.subPermission || []).length ? filterMyPermissions(cur.subPermission || []) : [];
    if (cur.isRolePermission || subPermission.length) {
      acc.push({
        ...cur,
        subPermission,
      });
    }
    return acc;
  }, []);
};
