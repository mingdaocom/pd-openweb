import _ from 'lodash';
import { getEmbedValue } from 'src/components/Form/core/formUtils/helper';
import { transferValue } from 'src/utils/controlCommon';

export const DASHBOARD_THEME_ASSET_URL_PREFIX = 'https://fp1.mingdaoyun.cn/dashboard/assets';

const getThemeAssetBaseUrl = (themeKey, assetUrlPrefix = DASHBOARD_THEME_ASSET_URL_PREFIX) =>
  `${String(assetUrlPrefix).replace(/\/$/, '')}/${themeKey}`;

export const getAdvancedThemeChannel = host => (String(host || '').includes('www.mingdao.com') ? 'prod' : 'test');

export const getAdvancedThemeBulletinPicExt = theme => {
  const ext = String(_.get(theme, 'bannerExt') || '')
    .replace(/^\./, '')
    .toLowerCase();

  return ext === 'gif' ? 'gif' : 'jpg';
};

export const getAdvancedThemeAssetUrls = (themeKey, assetUrlPrefix = DASHBOARD_THEME_ASSET_URL_PREFIX) => {
  const assetBaseUrl = getThemeAssetBaseUrl(themeKey, assetUrlPrefix);

  return {
    appIcon: `${assetBaseUrl}/app.png`,
    appCollectIcon: `${assetBaseUrl}/app_collect.png`,
    chartCollectIcon: `${assetBaseUrl}/chart.png`,
    recordFavIcon: `${assetBaseUrl}/record.png`,
    processIcon: `${assetBaseUrl}/process.png`,
    recentIcon: `${assetBaseUrl}/recent.png`,
    bgImg: `${assetBaseUrl}/background.png`,
  };
};

const getChannelThemeKeys = (themeConfig, themeChannel, themes) => {
  const channelThemeKeys = (themeConfig.channels || {})[themeChannel];

  if (_.isArray(channelThemeKeys)) {
    return channelThemeKeys;
  }

  if (_.isString(channelThemeKeys)) {
    return [channelThemeKeys];
  }

  return themes.map(item => item.themeKey);
};

export const formatAdvancedThemes = (
  themeConfig,
  { channel: themeChannel = 'test', assetUrlPrefix = DASHBOARD_THEME_ASSET_URL_PREFIX } = {},
) => {
  const config = themeConfig || {};
  const configThemes = _.get(config, 'themes');
  const themes = _.isArray(config) ? config : _.isArray(configThemes) ? configThemes : [];
  const themeMap = _.keyBy(themes, 'themeKey');
  const themeKeys = _.isArray(themeConfig)
    ? themes.map(item => item.themeKey)
    : getChannelThemeKeys(config, themeChannel, themes);

  return themeKeys
    .map(themeKey => themeMap[themeKey])
    .filter(_.identity)
    .map(item => {
      const assetBaseUrl = getThemeAssetBaseUrl(item.themeKey, assetUrlPrefix);

      return {
        ...item,
        assetBaseUrl,
        themeIcon: `${assetBaseUrl}/main.png`,
        bulletinPic: `${assetBaseUrl}/banner.${getAdvancedThemeBulletinPicExt(item)}`,
      };
    });
};

export function getAppNavigateUrl(appId, pcNaviStyle, selectAppItmeType = 2) {
  const storage = safeParse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`) || '{}');

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
  const storage = safeParse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`) || '{}');
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
