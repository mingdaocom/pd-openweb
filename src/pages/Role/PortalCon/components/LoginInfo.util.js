import { dateConvertToUserZone } from 'src/utils/platform/runtime/timeZone';

export const LOG_TABS = {
  LOGIN: 'login',
  MANAGE: 'manage',
};

// 后端约定 110 表示外部门户管理日志；登录日志不传 logType，继续走老接口默认类型。
export const PORTAL_MANAGE_LOG_TYPE = 110;

// 统一组装日志接口参数，避免 tab 切换时遗漏管理日志的 logType 或搜索关键字 trim。
export function createActionLogParams({ appId, tab, info = {}, pageSize }) {
  const { searchValue, startDate, endDate, pageIndex } = info;

  return {
    appId,
    ...(tab === LOG_TABS.MANAGE ? { logType: PORTAL_MANAGE_LOG_TYPE } : {}),
    fullnameOrMobilePhone: String(searchValue || '').trim(),
    startDate,
    endDate,
    pageIndex,
    pageSize,
  };
}

// 账号服务异常时后端会降级返回空人员对象，这里使用日志里的 id/name 兜底展示。
export function getAccountName(account = {}, fallback = '') {
  return (account || {}).fullname || fallback || '';
}

// 登录日志只返回 log 字段时，也组装成统一的账号对象，便于列表头像展示。
export function getLoginAccount(data = {}) {
  const log = data.log || {};

  return {
    accountId: log.accountId,
    fullname: log.fullname,
    avatar: log.avatar,
    appId: log.appId,
    projectId: data.projectId || log.projectId,
    mobilePhone: log.mobilePhone,
    email: log.email,
    isPortal: true,
  };
}

// 批量邀请/审核没有单个人员对象，直接展示后端格式化好的“xx 位外部用户”。
export function getOperationObjectName(data = {}) {
  const log = data.log || {};
  const operationObject = data.operationObject || {};

  return log.operationObjectName || operationObject.fullname || log.fullname || '';
}

// 操作人优先使用接口返回的 EasyAccount，异常时用日志中的操作人 id/name 兜底。
export function getOperatorAccount(data = {}) {
  const log = data.log || {};
  const operator = data.operator || {};

  if (operator.accountId || operator.fullname || operator.avatar) {
    return operator;
  }

  if (!log.operatorId) {
    return null;
  }

  return {
    accountId: log.operatorId,
    fullname: log.operatorName,
  };
}

// 单人操作对象在账号服务异常时，使用日志中持久化的外部用户 id/name 继续按头像+姓名展示。
export function getOperationObjectAccount(data = {}) {
  const log = data.log || {};
  const operationObject = data.operationObject || {};

  if (operationObject.accountId) {
    return operationObject.isPortal
      ? {
          ...operationObject,
          fullname: operationObject.fullname || log.operationObjectName || log.fullname,
          appId: operationObject.appId || log.appId,
          projectId: operationObject.projectId || data.projectId || log.projectId,
          mobilePhone: operationObject.mobilePhone || log.mobilePhone,
          email: operationObject.email || log.email,
        }
      : operationObject;
  }

  if (String(log.operationObjectIsMultiple) === '1' || !log.accountId) {
    return null;
  }

  return {
    accountId: log.accountId,
    fullname: log.operationObjectName || log.fullname,
    avatar: log.avatar,
    appId: log.appId,
    projectId: data.projectId || log.projectId,
    mobilePhone: log.mobilePhone,
    email: log.email,
    isPortal: true,
  };
}

// 获取验证码这类登录日志可能没有 userAgent，老接口会把动作文本放在 operationType。
export function getLoginPlatformName(data = {}) {
  const log = data.log || {};

  return log.userAgent || log.operationType || '';
}

// PortalTable 需要稳定 rowid；日志接口没有返回时按 tab + 页码 + 行号补一个。
export function normalizeLogRows(list = [], tab, pageIndex) {
  return list.map((item, index) => ({
    ...item,
    rowid: item.rowid || `${tab}-${pageIndex}-${index}`,
    date: dateConvertToUserZone(item.date),
  }));
}
