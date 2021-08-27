import { find } from 'lodash';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
export const dealData = data => {
  const res = {};
  data.forEach(item => {
    res[item.rowid] = item;
  });
  return res;
};
export const getParaIds = worksheet => {
  const { appId, worksheetId, viewId } = _.get(worksheet, 'base');
  return { appId, worksheetId, viewId };
};

export const getCurrentView = sheet => {
  const { base, views } = sheet;
  return find(views, item => item.viewId === base.viewId) || {};
};

export const getHierarchyViewIds = (worksheet, path = []) => {
  const { appId, worksheetId, viewId } = _.get(worksheet, 'base');
  const { childType, viewControls } = getCurrentView(worksheet);
  if (childType === 2 && path.length > 0) {
    const currentSheet = viewControls[path.length - 1];
    return { appId, worksheetId: currentSheet.worksheetId };
  }
  return { appId, worksheetId, viewId };
};

export const isHaveCharge = (type, isLock) => {
  if (type === APP_ROLE_TYPE.MAP_OWNER) return true;
  if (!isLock && type >= 100) return true;
  return false;
};

export function wrapAjax(func) {
  const cache = {};
  return (...args) => {
    if (cache[func.name]) {
      cache[func.name].abort();
    }
    cache[func.name] = func(...args);
    return cache[func.name];
  };
}
