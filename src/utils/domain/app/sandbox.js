import { VersionProductType } from 'src/utils/domain/shared/productFeatures';

export const MAX_SYNC_COUNT_PER_SHEET = 10000;
export const MAX_SYNC_COUNT_PER_APP = 50000;
export const SANDBOX_LIST_ORDER = {
  ASC: 4,
  DESC: 3,
};
const SANDBOX_FEATURE_HOSTNAMES = new Set([
  'localhost',
  'web.dev.mingdao.net',
  'sandbox.mingdao.com',
  'appsandbox3.mingdao.com',
]);

function getSelectedSyncCount(entities = []) {
  return entities.reduce((total, entity) => {
    const count = entity.count === 'all' ? entity.totalRecordNum : entity.count;
    return total + (Number.isFinite(count) && count > 0 ? count : 0);
  }, 0);
}

export function isDataSyncSettingsDisabled(list = []) {
  return list.some(item => item.exampleType === 2 && item.selectedCount > MAX_SYNC_COUNT_PER_APP);
}

/** 将批量检查结果转换为已产生沙盒数据的应用 Id。 */
export function getSandboxDataExistingAppIds(result, appIds = []) {
  const data = result?.data ?? result;

  if (typeof data === 'boolean') return data ? appIds : [];

  if (Array.isArray(data)) {
    if (data.every(item => typeof item === 'boolean')) {
      return appIds.filter((appId, index) => data[index]);
    }

    return data.reduce((ids, item) => {
      if (typeof item === 'string') return ids.concat(item);
      if (!item || typeof item !== 'object') return ids;

      const appId = item.appId || item.id || item.key;
      const exists = item.exists ?? item.isExists ?? item.dataExists ?? item.hasData ?? item.value ?? true;
      return appId && exists ? ids.concat(appId) : ids;
    }, []);
  }

  if (!data || typeof data !== 'object') return [];

  const existingAppIds = data.appIds || data.existingAppIds;
  if (Array.isArray(existingAppIds)) return getSandboxDataExistingAppIds(existingAppIds, appIds);

  return appIds.filter(appId => Boolean(data[appId]));
}

export function updateAppDataSyncType(list = [], appId, exampleType) {
  return list.map(item => (item.appId === appId ? { ...item, exampleType } : item));
}

export function updateEntitySyncCount(list = [], appId, worksheetId, selection) {
  return list.map(item => {
    if (item.appId !== appId) return item;

    const entities = (item.entities || []).map(entity => {
      if (entity.worksheetId !== worksheetId) return entity;

      const count = typeof selection === 'object' ? selection.count : selection;

      if (count === 'all') {
        const isAll = entity.totalRecordNum <= MAX_SYNC_COUNT_PER_SHEET;
        return {
          ...entity,
          count: Math.min(entity.totalRecordNum, MAX_SYNC_COUNT_PER_SHEET),
          isAll,
          isCustom: !isAll,
        };
      }

      return {
        ...entity,
        count,
        isAll: false,
        isCustom: typeof selection === 'object' ? Boolean(selection.isCustom) : count === -1,
      };
    });

    return { ...item, entities, selectedCount: getSelectedSyncCount(entities) };
  });
}

/**
 * 将应用信息转换为数据同步策略的初始配置。
 * 默认仅同步应用结构，保留工作表记录总数并将同步数量初始化为 0。
 */
export const normalizeSandboxAppSettings = (apps = [], sandboxDataExistingAppIds = []) => {
  const sandboxDataExistingAppIdSet = new Set(sandboxDataExistingAppIds);

  return apps.map(app => ({
    ...app,
    exampleType: 0,
    selectedCount: 0,
    sandboxDataExists: sandboxDataExistingAppIdSet.has(app.appId),
    entities: (app.entities || []).map(entity => ({
      ...entity,
      count: 0,
      totalRecordNum: entity.count,
    })),
  }));
};

/**
 * 将数据同步策略转换为沙盒接口复用的应用配置。
 * sheetConfig 中的工作表标识按沙盒接口要求使用 sheeId。
 */
const buildSandboxAppConfig = (item = {}) => ({
  appId: item.appId,
  exampleType: item.exampleType,
  sheetConfig: (item.entities || []).map(entity => ({
    sheeId: entity.worksheetId,
    count: entity.count > 0 ? entity.count : 0,
  })),
});

/** 构造应用下开启沙盒的接口参数。 */
export const buildSandboxEnableParams = item => buildSandboxAppConfig(item);

/**
 * 当前组织是否为支持沙盒功能的专业版或更高版本。
 */
export const isSandboxSupportedProject = projectId => {
  const project = (md.global.Account?.projects || []).find(item => item.projectId === projectId) || {};
  const versionInfo = (md.global.Versions || []).find(item => item.VersionIdV2 === project.version?.versionIdV2);
  const feature = (versionInfo?.Products || []).find(item => item.ProductType === VersionProductType.appSandbox);

  return feature?.Type === '1';
};

/**
 * 当前应用是否已开启沙盒。
 */
export const isAppSandboxEnabled = sandboxStatus => sandboxStatus === 2;

/**
 * 当前是否处于沙盒环境。
 */
export const isSandboxEnvironment = () => Boolean(md.global.Config.IsAppSandbox);

/** 当前部署环境是否开放应用沙盒功能入口。 */
export const isSandboxFeatureEnvironment = hostname => {
  const currentHostname = hostname || (typeof window === 'undefined' ? '' : window.location.hostname);

  return SANDBOX_FEATURE_HOSTNAMES.has(currentHostname.toLowerCase());
};

/** 获取对向环境的页面地址。 */
export const getPeerEnvironmentUrl = path => {
  const peerWebUrl = md.global.Config.PeerWebUrl;

  if (!peerWebUrl) return '';

  const normalizedPeerWebUrl = peerWebUrl.replace(/\/+$/, '');
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  return normalizedPath ? `${normalizedPeerWebUrl}/${normalizedPath}` : normalizedPeerWebUrl;
};

/** 在新窗口打开当前环境对应的生产/沙盒页面。 */
export const openPeerEnvironment = path => {
  const url = getPeerEnvironmentUrl(path);

  if (!url) return false;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};

/**
 * 当前应用已开启沙盒，并且当前处于生产环境。
 */
export const isAppSandboxInProduction = sandboxStatus => isAppSandboxEnabled(sandboxStatus) && !isSandboxEnvironment();
