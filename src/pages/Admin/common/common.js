import { getCurrentProject } from 'src/util';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
var AdminCommon = {};
import Config from '../config';
import roleApi from 'src/api/role';
import './common.less';
import _ from 'lodash';
import { PERMISSION_ENUM } from '../enum';
import projectSettingApi from 'src/api/projectSetting';
import { getMyPermissions, canPurchase, hasBackStageAdminAuth } from 'src/components/checkPermission';

AdminCommon.getAuthority = async () => {
  Config.getParams();
  Config.project = getCurrentProject(Config.projectId);
  let res = [];

  // 不在这个网络
  if (!Config.project.projectId) {
    return [PERMISSION_ENUM.NOT_MEMBER];
  }

  const userPermission = await roleApi.getProjectPermissionsByUser({
    projectId: Config.projectId,
  });

  if (userPermission.IsNotProjectUser) {
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
