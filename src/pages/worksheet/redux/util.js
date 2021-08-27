import { head, find } from 'lodash';

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
    return '-1';
  }
}

export const getCurrentView = sheet => {
  const { base, views } = sheet;
  return find(views, item => item.viewId === base.viewId) || {};
};
