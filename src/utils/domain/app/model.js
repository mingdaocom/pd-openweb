import _ from 'lodash';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';

/** 从 React Router 路由属性中提取应用、分组和工作表标识。 */
export const getIds = props => _.get(props, ['match', 'params']);

const isPlainObject = value => {
  if (typeof value !== 'object' || value === null) return false;
  let prototype = value;

  while (Object.getPrototypeOf(prototype) !== null) {
    prototype = Object.getPrototypeOf(prototype);
  }

  return Object.getPrototypeOf(value) === prototype;
};

/** 比较指定对象属性是否发生变化，嵌套普通对象按值递归比较。 */
export const compareProps = (current = {}, next = {}, props = Object.keys(current)) => {
  for (let index = 0; index < props.length; index++) {
    const prop = props[index];
    const currentValue = current[prop];
    const nextValue = next[prop];

    if (isPlainObject(currentValue) && isPlainObject(nextValue)) {
      return compareProps(currentValue, nextValue, Object.keys(currentValue));
    }

    if (!Object.is(currentValue, nextValue)) return true;
  }

  return false;
};

/** 根据应用状态生成统一的状态文案。 */
export const getAppStatusText = ({ isGoodsStatus, isNew, fixed, isUpgrade, appStatus }) => {
  if (!isGoodsStatus) return _l('过期');
  if (isUpgrade) return _l('升级中');
  if (fixed) return _l('维护中%01018');
  if (isNew) return _l('新 !');
  if (appStatus === 12) return _l('迁移中');
  return null;
};

/** 按当前应用角色过滤应用配置菜单。 */
export const getAppConfig = (menus, permissionType) => {
  switch (permissionType) {
    case APP_ROLE_TYPE.ADMIN_ROLE:
      return _.filter(menus, item => !_.includes(['del'], item.type));
    case APP_ROLE_TYPE.RUNNER_ROLE:
      return _.filter(menus, item =>
        _.includes(
          ['modify', 'editIntro', 'copyId', 'appAnalytics', 'appLogs', 'modifyAppLockPassword', 'mobileView'],
          item.type,
        ),
      );
    case APP_ROLE_TYPE.DEVELOPERS_ROLE:
      return _.filter(menus, item => !_.includes(['copy', 'export', 'appAnalytics', 'appLogs', 'del'], item.type));
    case APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE:
      return _.filter(menus, item => !_.includes(['copy', 'export', 'del'], item.type));
    default:
      return menus;
  }
};
