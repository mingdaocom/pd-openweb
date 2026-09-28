import { allSwitchKeys } from 'src/utils/domain/control/formEnum';

/**
 * 补齐后端未返回的工作表功能开关，缺失项按开启且作用于全部视图处理。
 */
const formatSwitches = switches => {
  return allSwitchKeys.map(type => {
    const switchItem = (switches || []).find(item => item.type === type);

    if (!switchItem) {
      return { type, state: true, viewIds: [] };
    }

    return switchItem;
  });
};

/**
 * 判断指定工作表功能开关是否开启，并在需要时校验视图范围。
 */
export const isOpenPermit = (type, list = [], viewId) => {
  if (Array.isArray(list)) {
    list = list.length > 0 ? formatSwitches(list) : list;
    const data = list.find(item => item.type === type);

    if (!data || list.length <= 0) {
      return false;
    }

    if (type < 20 || [40, 50, 51, 1001, 1002].includes(type)) {
      return data.state;
    } else if (!viewId) {
      return !!data.state;
    }

    return !!data.state && (data.viewIds.includes(viewId) || data.viewIds.length <= 0);
  }

  return false;
};
