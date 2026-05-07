import _ from 'lodash';
import { getEmbedValue } from 'src/components/Form/core/formUtils/helper';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';

export function getAppNavigateUrl(appId, pcNaviStyle, selectAppItmeType = 2) {
  const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`));

  if (storage && selectAppItmeType === 2) {
    const { lastGroupId, lastWorksheetId, lastViewId } = storage;

    if (pcNaviStyle === 2) {
      return lastGroupId ? `/app/${appId}/${lastGroupId}?from=insite` : `/app/${appId}`;
    }

    if (lastGroupId && lastWorksheetId && lastViewId) {
      return `/app/${appId}/${[lastGroupId, lastWorksheetId, lastViewId].join('/')}?from=insite`;
    } else if (lastGroupId && lastWorksheetId) {
      return `/app/${appId}/${[lastGroupId, lastWorksheetId].join('/')}?from=insite`;
    } else if (lastGroupId) {
      return `/app/${appId}/${lastGroupId}?from=insite`;
    } else {
      return `/app/${appId}`;
    }
  } else {
    return `/app/${appId}`;
  }
}

export const getAppItemUrl = (appId, appSectionId, worksheetId) => {
  const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
  const cacheViewId = (
    (storage.worksheets || []).filter(w => w.groupId === appSectionId && w.worksheetId === worksheetId)[0] || {}
  ).viewId;

  return cacheViewId
    ? `/app/${appId}/${appSectionId}/${worksheetId}/${cacheViewId}`
    : `/app/${appId}/${appSectionId}/${worksheetId}`;
};

export const transferExternalLinkUrl = (urlTemplate, projectId, appId) => {
  let transferUrl = '';
  const urlValue = transferValue(urlTemplate);
  urlValue.forEach(item => {
    const { cid, staticValue } = item;

    if (cid) {
      transferUrl += getEmbedValue({ projectId, appId }, cid);
    } else {
      transferUrl += staticValue;
    }
  });
  return transferUrl;
};

export const getFilterApps = (apps, keywords) => {
  if (!keywords.trim()) {
    return apps;
  }

  return apps.filter(
    app => [app.enName, app.name].filter(_.identity).join('').toLowerCase().indexOf(keywords.trim().toLowerCase()) > -1,
  );
};
