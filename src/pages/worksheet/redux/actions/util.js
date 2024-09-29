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
//当前角色是否具有管理员权限
export const isHaveCharge = (type, isLock) => {
  const { isAdmin, isOwner } = getUserRole(type, isLock);
  return !!isAdmin || !!isOwner;
};
//获取当前用户对应角色
export const getUserRole = (type, isLock) => {
  let data = {};
  if (type === APP_ROLE_TYPE.POSSESS_ROLE) {
    data.isOwner = !isLock;
  }
  if (type === APP_ROLE_TYPE.MAP_OWNER) {
    data.isOwner = true;
  }
  if (type === APP_ROLE_TYPE.ADMIN_ROLE) {
    data.isAdmin = !isLock;
  }
  if (type === APP_ROLE_TYPE.DEVELOPERS_ROLE) {
    data.isDeveloper = !isLock;
  }
  if (type === APP_ROLE_TYPE.RUNNER_ROLE) {
    data.isRunner = !isLock;
  }
  if (type === APP_ROLE_TYPE.RUNNER_DEVELOPERS_ROLE) {
    //即是开发者又是运营者
    data.isRunner = !isLock;
    data.isDeveloper = !isLock;
  }
  return data;
};
//可以编辑应用、拥有应用搭建权限(管理员，拥有者，开发者)
export const canEditApp = (type, isLock) => {
  const { isAdmin, isOwner, isDeveloper } = getUserRole(type, isLock);
  return !!isAdmin || !!isOwner || !!isDeveloper;
};
//可以管理应用下所有数据权限(管理员，拥有者，运营者)
export const canEditData = type => {
  const { isAdmin, isOwner, isRunner } = getUserRole(type);
  return !!isAdmin || !!isOwner || !!isRunner;
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

export function getItemByRowId(rowId = null, data = []) {
  if (rowId) {
    const treeFind = tree => {
      for (const item of tree) {
        if (item.rowId === rowId) return item;
        if (item.children && item.children.length > 0) {
          const res = treeFind(item.children);
          if (res) return res;
        }
      }
      return null;
    };
    return treeFind(data);
  }
}

export function sortDataByCustomItems(data, view = {}, controls = [], firstNotSpecified = true) {
  let customItems = safeParse(_.get(view, 'advancedSetting.customitems'), 'array');
  if (_.get(view, 'advancedSetting.navshow') === '2') {
    customItems = safeParse(_.get(view, 'advancedSetting.navfilters'), 'array');
  }
  const viewControls = _.find(controls, c => c.controlId === view.viewControl);
  if (!_.isEmpty(customItems) && viewControls) {
    const sortIds = customItems.map(i => {
      if (_.includes([9, 10, 11, 28], viewControls.type)) {
        return i;
      } else {
        const itemVal = safeParse(i);
        return itemVal.id || itemVal.accountId;
      }
    });
    const keyByOrder = new Map(sortIds.map((t, i) => [t, i]));
    const sortOriginData = _.sortBy(data, 'sort');
    let sortData = _.sortBy(sortOriginData, o => (o.key === '-1' ? -999 : keyByOrder.get(o.key)));
    // 未指定固定第一项
    if (!firstNotSpecified) {
      const [specialItems, regularItems] = _.partition(sortData, item => item.key === '-1');
      if (specialItems.length > 0) {
        sortData = [...regularItems, ...specialItems];
      }
    }
    return sortData.map((item, idx) => ({ ...item, sort: idx + 1 }));
  }
  return data;
}
