import { navigateTo } from 'router/navigateTo';
import { upgradeVersionDialog, getCurrentProject, expireDialogAsync } from 'src/util';
var AdminCommon = {};
import Config from '../config';
import RoleController from 'src/api/role';
import './common.less';
import _ from 'lodash';

const { AUTHORITY_DICT } = Config;

AdminCommon.init = function () {
  Config.getParams();
  Config.project = {};

  Config.project = getCurrentProject(Config.projectId);
  // 是否在这个网络
  if (Config.project.projectId) {
    return AdminCommon.getProjectPermissionsByUser().then((...authority) => {
      return _.flatten(_.filter(authority, item => item));
    });
  } else {
    return new Promise((resolve, reject) => {
      reject([AUTHORITY_DICT.NOT_MEMBER]);
    });
  }
};

AdminCommon.getProjectPermissionsByUser = function () {
  return RoleController.getProjectPermissionsByUser({
    projectId: Config.projectId,
  }).then(data => {
    let res = [];

    if (data.IsNotProjectUser) {
      res.push(AUTHORITY_DICT.NOT_MEMBER);
    }

    // 管理员权限（能操作 | 只能申请）
    if (data.isProjectAdmin || data.isProjectAppManager || data.isSuperAdmin) {
      res.push(AUTHORITY_DICT.HAS_PERMISSIONS);
    }
    // 组织管理员(无工作流、应用)
    if (data.isProjectAdmin) {
      res.push(AUTHORITY_DICT.PROJECT_ADMIN);
    }
    // 应用管理员(只包含应用、工作流)
    if (data.isProjectAppManager) {
      res.push(AUTHORITY_DICT.APK_ADMIN);
    }

    // 有角色（显示管理员菜单）
    if (data.hasRole) {
      res.push(AUTHORITY_DICT.SHOW_MANAGER);
    }

    return res;
  });
};

AdminCommon.freeUpdateDialog = () => {
  upgradeVersionDialog({
    projectId: Config.project.projectId,
    explainText: _l('请升级至付费版解锁开启'),
    isFree: true,
  });
};

export default AdminCommon;
