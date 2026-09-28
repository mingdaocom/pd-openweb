import common from 'src/utils/domain/account/settings';
import { getCurrentProject } from 'src/utils/services/project';

const optionsList = [
  { icon: 'icon-edit_17', label: _l('编辑组织名片'), click: 'handleEdit', key: 'editCard' },
  { icon: 'icon-build', label: _l('组织管理'), click: 'handleGoAdmin', key: 'manage' },
  { icon: 'icon-manage', label: _l('我的汇报关系'), click: 'handleRelation', key: 'reportRelation' },
  { icon: 'icon-exit', label: _l('退出组织'), click: 'handleExit', key: 'exit' },
];

const closeOptionsList = [
  {
    icon: 'icon-back',
    label: _l('恢复组织'),
    click: 'handleRecover',
    key: 'recover',
    isSuperAdmin: true,
    disabledKey: 'recoverDisabled',
  },
  optionsList[3],
];

export const formatProjectStatus = item => {
  const { PROJECT_STATUS_TYPES, USER_STATUS } = common;
  const { userStatus, projectStatus, isSuperAdmin } = item;
  let result = {
    buttonState: 'default',
    editCard: false,
    reportRelation: false,
    exit: false,
    manage: false,
    recover: isSuperAdmin,
  };

  if (userStatus === USER_STATUS.UNAUDITED) {
    return { ...result, buttonState: 'review' };
  }

  if (projectStatus === PROJECT_STATUS_TYPES.FREE) {
    result.buttonState = 'open';
  } else if (projectStatus === PROJECT_STATUS_TYPES.TRIAL) {
    result.buttonState = 'trial';
  }

  if ([PROJECT_STATUS_TYPES.FREE, PROJECT_STATUS_TYPES.TRIAL, PROJECT_STATUS_TYPES.PAID].includes(projectStatus)) {
    result = {
      ...result,
      editCard: true,
      manage: true,
      reportRelation: true,
      exit: true,
    };
  } else {
    result.exit = true;
  }

  return result;
};

export const getHasProjectAdminAuth = (card = {}) => {
  const projectInfo = {
    ...getCurrentProject(card.projectId, true),
    ...card,
  };

  return !!(projectInfo.hasRole || projectInfo.isSuperAdmin || projectInfo.isProjectAdmin);
};

export const getItems = (list = [], key) => list.map(item => item[key]).join(' ; ');

export const getAvailableOptions = ({ isClose, isPlatform }) =>
  (isClose ? closeOptionsList : optionsList).filter(item => isClose || isPlatform || item.key !== 'exit');
