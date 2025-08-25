import projectSettingApi from 'src/api/projectSetting';
import roleApi from 'src/api/role';
import { canPurchase, getMyPermissions, hasBackStageAdminAuth } from 'src/components/checkPermission';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { getCurrentProject } from 'src/utils/project';
import Config from '../config';
import { PERMISSION_ENUM } from '../enum';
import './common.less';

var AdminCommon = {};

AdminCommon.getAuthority = async () => {
  Config.getParams();
  Config.project = getCurrentProject(Config.projectId, true);
  let res = [];
  let isNotProjectUser = false;

  // 不在这个网络
  if (!Config.project.projectId) {
    return [PERMISSION_ENUM.NOT_MEMBER];
  }

  await roleApi.getProjectPermissionsByUser({ projectId: Config.projectId }, { silent: true }).catch(() => {
    isNotProjectUser = true;
  });

  if (isNotProjectUser) {
    return [PERMISSION_ENUM.NOT_MEMBER]; //不是组织成员
  }

  const myPermissions = getMyPermissions(Config.projectId);

  if (myPermissions.length) {
    const showManager = hasBackStageAdminAuth({ myPermissions });
    const hasPurchaseAuth = canPurchase({ myPermissions });

    res.push(
      ...myPermissions
        .concat(hasPurchaseAuth ? PERMISSION_ENUM.CAN_PURCHASE : [])
        .concat(showManager ? PERMISSION_ENUM.SHOW_MANAGER : PERMISSION_ENUM.SHOW_MY_CHARACTER),
    );
  } else {
    // 是否允许申请管理员
    await projectSettingApi
      .getAllowApplyManageRole({ projectId: Config.projectId })
      .then(data => data && res.push(PERMISSION_ENUM.SHOW_APPLY));
  }

  return res;
};

AdminCommon.freeUpdateDialog = () => {
  upgradeVersionDialog({
    projectId: Config.project.projectId,
    explainText: _l('请升级至付费版解锁开启'),
    isFree: true,
  });
};

export default AdminCommon;
