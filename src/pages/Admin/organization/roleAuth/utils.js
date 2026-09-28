import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';

export const PARENT_PERMISSION_IDS = {
  PAYMENT_AND_INVOICE: 16000,
  INTEGRATION_AND_PLUGIN: 19000,
  API_INTEGRATION: 19100,
  DATA_INTEGRATION: 19300,
  PLUGIN: 19500,
  MINGO_AI: 21000,
};
const INTEGRATION_PERMISSION_IDS = [
  PARENT_PERMISSION_IDS.API_INTEGRATION,
  PARENT_PERMISSION_IDS.DATA_INTEGRATION,
  PERMISSION_ENUM.CREATE_API_CONNECT_FEATURE,
  PERMISSION_ENUM.CREATE_SYNC_TASK_FEATURE,
];
const PLUGIN_PERMISSION_IDS = [PARENT_PERMISSION_IDS.PLUGIN, PERMISSION_ENUM.CREATE_PLUGIN_FEATURE];

export const isHiddenPermission = (permissionId, featureType) => {
  const { hidePlugin, hideIntegration, hideAIBasicFun } = md.global.SysSettings;

  if (permissionId === PARENT_PERMISSION_IDS.PAYMENT_AND_INVOICE) return !featureType; //支付与开票 无功能指标时不显示
  if (permissionId === PERMISSION_ENUM.FINANCE) return !window.platformENV.isPlatform; // 私有部署非平台版无账务
  if (permissionId === PARENT_PERMISSION_IDS.INTEGRATION_AND_PLUGIN) return hideIntegration && hidePlugin;
  if (INTEGRATION_PERMISSION_IDS.includes(permissionId)) return hideIntegration;
  if (PLUGIN_PERMISSION_IDS.includes(permissionId)) return hidePlugin;
  if (permissionId === PARENT_PERMISSION_IDS.MINGO_AI) return hideAIBasicFun;

  return false;
};

export const filterVisiblePermissions = (permissionList = [], featureType) => {
  return permissionList.reduce((acc, permission) => {
    if (isHiddenPermission(permission.permissionId, featureType)) {
      return acc;
    }

    const subPermission = filterVisiblePermissions(permission.subPermission || [], featureType);

    if ((permission.subPermission || []).length && !subPermission.length) {
      return acc;
    }

    acc.push({ ...permission, subPermission });

    return acc;
  }, []);
};

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

const normalizePermissionIds = (selectedIds = []) =>
  [...new Set(selectedIds)].sort((a, b) => String(a).localeCompare(String(b)));

export const hasPermissionEditChanged = (initialValue, currentValue = {}) => {
  if (!initialValue) return false;

  const initialIds = normalizePermissionIds(initialValue.selectedIds);
  const currentIds = normalizePermissionIds(currentValue.selectedIds);

  return (
    (initialValue.roleName || '').trim() !== (currentValue.roleName || '').trim() ||
    Boolean(initialValue.allowAddMembers) !== Boolean(currentValue.allowAddMembers) ||
    initialIds.length !== currentIds.length ||
    initialIds.some((id, index) => id !== currentIds[index])
  );
};

export const filterMyPermissions = (permissionList = []) => {
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
