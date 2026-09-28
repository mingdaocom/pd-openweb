import { find, get, head } from 'lodash';

/**
 * 将工作表记录数组按 rowid 转换为记录字典。
 */
export const dealData = data => {
  const result = {};
  data.forEach(item => {
    result[item.rowid] = item;
  });
  return result;
};

/**
 * 从工作表 Redux state 中提取接口通用的应用、工作表和视图 ID。
 */
export const getParaIds = worksheet => {
  const { appId, worksheetId, viewId } = get(worksheet, 'base');
  return { appId, worksheetId, viewId };
};

export function getBoardItemKey(data) {
  try {
    const parseData = JSON.parse(data);

    if (Array.isArray(parseData)) {
      const firstItem = head(parseData);

      if (typeof firstItem === 'object') {
        return firstItem.sid || firstItem.accountId || '-1';
      }

      return firstItem;
    }

    return parseData || '-1';
  } catch (error) {
    console.log(error);
    return '-1';
  }
}

export const getCurrentView = sheet => {
  const { base, views } = sheet;
  return find(views, item => item.viewId === base.viewId) || {};
};
