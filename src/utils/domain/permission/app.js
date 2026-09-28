import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';

/**
 * 将应用角色类型转换为当前用户的角色能力标记。
 */
export const getUserRole = (type, isLock) => {
  const data = {};

  if (type === APP_ROLE_TYPE.POSSESS_ROLE) {
    data.isOwner = !isLock;
  }

  if (type === APP_ROLE_TYPE.MAP_OWNER) {
    data.isOwner = true;
  }

  if (type === APP_ROLE_TYPE.ADMIN_ROLE) {
    data.isAdmin = !isLock;
  }

  if (type === APP_ROLE_TYPE.DEVELOPERS_ROLE) {
    data.isDeveloper = !isLock;
  }

  if (type === APP_ROLE_TYPE.RUNNER_ROLE) {
    data.isRunner = !isLock;
  }

  if (type === APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE) {
    data.isRunner = !isLock;
    data.isDeveloper = !isLock;
  }

  return data;
};

/**
 * 判断当前应用角色是否具有管理员或拥有者权限。
 */
export const isHaveCharge = (type, isLock) => {
  const { isAdmin, isOwner } = getUserRole(type, isLock);
  return !!isAdmin || !!isOwner;
};

/**
 * 判断当前应用角色是否具有应用搭建权限。
 */
export const canEditApp = (type, isLock) => {
  const { isAdmin, isOwner, isDeveloper } = getUserRole(type, isLock);
  return !!isAdmin || !!isOwner || !!isDeveloper;
};

/**
 * 判断当前应用角色是否具有管理应用全部数据的权限。
 */
export const canEditData = type => {
  const { isAdmin, isOwner, isRunner } = getUserRole(type);
  return !!isAdmin || !!isOwner || !!isRunner;
};
