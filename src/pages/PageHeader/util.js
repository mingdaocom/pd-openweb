import _ from 'lodash';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';

// 获取应用id、分组id、工作表id
export const getIds = props => _.get(props, ['match', 'params']);

// 格式化后端传入的数据
export const formatData = data =>
  _.flatten(
    Object.keys(data).map(type => {
      const items = data[type];
      if (_.includes(['validProject'], type)) return items.map(item => ({ type, ...item }));
      if (_.includes(['aloneApps'], type)) return { type, projectApps: items };
      return items.length ? { type, projectApps: items } : null;
    }),
  ).filter(item => !!item);

const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
};

/**
 * 用于shouldComponentUpdate中对象属性比较,以优化性能
 * @param {*} current
 * @param {*} next
 * @param {array} props 要比较的属性值，以数组方式传入,支持递归比较，但须酌情使用，以防比较时间超过重新渲染时间得不偿失
 */
export const compareProps = (current = {}, next = {}, props = Object.keys(current)) => {
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const currentVal = current[prop];
    const nextVal = next[prop];
    if (isPlainObject(currentVal) && isPlainObject(nextVal)) {
      return compareProps(currentVal, nextVal, Object.keys(currentVal));
    }
    if (!Object.is(currentVal, nextVal)) return true;
  }
  return false;
};

// 应用的状态
export const getAppStatusText = ({ isGoodsStatus, isNew, fixed, isUpgrade, appStatus }) => {
  if (!isGoodsStatus) return _l('过期');
  if (isUpgrade) return _l('升级中');
  if (fixed) return _l('维护中%01018');
  if (isNew) return _l('新 !');
  if (appStatus === 12) return _l('迁移中');
  return null;
};

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
        _.includes(['modify', 'editIntro', 'copyId', 'appAnalytics', 'appLogs', 'modifyAppLockPassword'], it.type),
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
