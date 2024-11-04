import { APP_ROLE_TYPE, VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';

// 获取应用配置列表
export const getAppConfig = (menus, permissionType) => {
  switch (permissionType) {
    case APP_ROLE_TYPE.POSSESS_ROLE: // 拥有者
      break;
    case APP_ROLE_TYPE.ADMIN_ROLE: // 管理员
      menus = _.filter(menus, it => !_.includes(['del'], it.type));
      break;
    case APP_ROLE_TYPE.RUNNER_ROLE: // 运营者
      menus = _.filter(menus, it =>
        _.includes(['modify', 'editIntro', 'appAnalytics', 'appLogs', 'modifyAppLockPassword'], it.type),
      );
      break;
    case APP_ROLE_TYPE.DEVELOPERS_ROLE: // 开发者
      menus = _.filter(menus, it => !_.includes(['copy', 'export', 'appAnalytics', 'appLogs', 'del'], it.type));
      break;
    case APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE: // 运营者+开发者
      menus = _.filter(menus, it => !_.includes(['copy', 'export', 'del'], it.type));
      break;
    default:
      break;
  }

  return menus;
};

export const getCheckedInfo = ({ typeList = [], defaultCheckedAll = false, source = {} }) => {
  let obj = {};
  typeList.forEach(item => {
    const ids = (source[item] || []).map(({ id }) => id);
    obj[`${item}CheckAll`] = defaultCheckedAll;
    obj[`${item}CheckIds`] = ids;
  });
  return obj;
};

export const getViewIcon = type => {
  if (_.isUndefined(type)) return;

  return (_.find(VIEW_TYPE_ICON, item => item.id === VIEW_DISPLAY_TYPE[type]) || {}).icon;
};
