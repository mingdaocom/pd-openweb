import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';

export const VERSION_STATUS = {
  PENDING_APPROVAL: 0,
  PENDING_UPDATE: 1,
  UPGRADED: 2,
  REVERTED: 3,
  REJECTED: 4,
  INVALID: 5,
};

export const VERSION_ACTION = {
  WITHDRAW: 'withdraw',
  RESTORE: 'restore',
  REJECT: 'reject',
  APPROVE: 'approve',
  UPGRADE: 'upgrade',
};

export function getVersionStatusLabel(status) {
  switch (status) {
    case VERSION_STATUS.PENDING_APPROVAL:
      return _l('待审核');
    case VERSION_STATUS.PENDING_UPDATE:
      return _l('待升级');
    case VERSION_STATUS.UPGRADED:
      return _l('已升级');
    case VERSION_STATUS.REVERTED:
      return _l('已撤回');
    case VERSION_STATUS.REJECTED:
      return _l('被驳回');
    case VERSION_STATUS.INVALID:
      return _l('已失效');
    default:
      return '';
  }
}

export function getVersionStatusOptions() {
  return Object.values(VERSION_STATUS).map(value => ({ value, label: getVersionStatusLabel(value) }));
}

export function getVersionActionLabel(action) {
  switch (action) {
    case VERSION_ACTION.WITHDRAW:
      return _l('撤回');
    case VERSION_ACTION.RESTORE:
      return _l('还原至此版本');
    case VERSION_ACTION.REJECT:
      return _l('驳回');
    case VERSION_ACTION.APPROVE:
      return _l('通过');
    case VERSION_ACTION.UPGRADE:
      return _l('升级');
    default:
      return '';
  }
}

export const SANDBOX_VERSION_DETAIL_MODE = {
  VIEW: 'view',
  RELEASE: 'release',
};

export const VERSION_DETAIL_FROM = {
  APP_MANAGEMENT: 'appManagement',
  ORGANIZATION_MANAGEMENT: 'organizationManagement',
};

export const VERSION_ACTION_SCENE = {
  DETAIL: 'detail',
  LIST: 'list',
};

const REVIEW_ACTIONS = [VERSION_ACTION.APPROVE, VERSION_ACTION.REJECT];
const WITHDRAW_ACTION = [VERSION_ACTION.WITHDRAW];
const UPGRADE_ACTION = [VERSION_ACTION.UPGRADE];
const RESTORE_ACTION = [VERSION_ACTION.RESTORE];

export const getVersionActions = ({ from, status, scene = VERSION_ACTION_SCENE.DETAIL }) => {
  const isList = scene === VERSION_ACTION_SCENE.LIST;
  const isOrganization = from === VERSION_DETAIL_FROM.ORGANIZATION_MANAGEMENT;
  const isSandboxApp = !isOrganization && isSandboxEnvironment();

  if (isSandboxApp && [VERSION_STATUS.PENDING_APPROVAL, VERSION_STATUS.PENDING_UPDATE].includes(status)) {
    return WITHDRAW_ACTION;
  }

  if (!isSandboxApp && status === VERSION_STATUS.PENDING_APPROVAL) return REVIEW_ACTIONS;
  if (isList && !isSandboxApp && status === VERSION_STATUS.PENDING_UPDATE) return UPGRADE_ACTION;
  if (!isList && (isOrganization || isSandboxApp) && status === VERSION_STATUS.UPGRADED) return RESTORE_ACTION;

  return [];
};

export const VERSION_DETAIL_HORIZONTAL_PADDING = '10%';
