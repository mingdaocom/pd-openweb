/** 清除指定分组及最近工作表的本地导航缓存。 */
export const moveSheetCache = (appId, groupId) => {
  const storageKey = `mdAppCache_${md.global.Account.accountId}_${appId}`;
  const storage = safeParse(localStorage.getItem(storageKey) || '{}');
  storage.worksheets = (storage.worksheets || []).map(data =>
    data.groupId === groupId ? { ...data, worksheetId: '' } : data,
  );
  storage.lastWorksheetId = '';
  safeLocalStorageSetItem(storageKey, JSON.stringify(storage));
};

/** 按工作表缓存当前选中的扩展导航，并限制缓存数量。 */
export const saveSelectExtensionNavType = (worksheetId, navType, navValue) => {
  const sheetConfigNavInfo = safeParse(localStorage.getItem('sheetConfigNavInfo') || '{}');

  if (!sheetConfigNavInfo[worksheetId]) {
    sheetConfigNavInfo[worksheetId] = {};
  }

  sheetConfigNavInfo[worksheetId][navType] = navValue;
  const sheetIds = Object.keys(sheetConfigNavInfo);

  if (sheetIds.length > 10) {
    delete sheetConfigNavInfo[sheetIds[0]];
  }

  safeLocalStorageSetItem('sheetConfigNavInfo', JSON.stringify(sheetConfigNavInfo));
};
