import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { formatQuickFilter } from 'src/utils/domain/worksheet/filter';

const STORAGE_PREFIX = 'gunterExportFilters-';
const SNAPSHOT_LIFETIME = 10 * 60 * 1000;
const CONTEXT_KEYS = ['appId', 'worksheetId', 'viewId'];

const hasValidFilters = snapshot =>
  _.isPlainObject(snapshot) &&
  _.isPlainObject(snapshot.filters) &&
  Array.isArray(snapshot.quickFilter) &&
  snapshot.quickFilter.every(_.isPlainObject);

const clearExpiredSnapshots = () => {
  for (let index = localStorage.length - 1; index >= 0; index--) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;

    const snapshot = safeParse(localStorage.getItem(key));

    if (!Number.isFinite(snapshot?.expiresAt) || snapshot.expiresAt <= Date.now()) {
      localStorage.removeItem(key);
    }
  }
};

// 每次导出单独保存，避免同一视图的多个标签页互相覆盖筛选条件。
export const saveGunterExportFilters = ({ base, filters, quickFilter }) => {
  if (!hasValidFilters({ filters, quickFilter })) {
    throw new Error('Invalid Gunter export filters');
  }

  clearExpiredSnapshots();
  const exportId = uuidv4();
  const key = `${STORAGE_PREFIX}${exportId}`;
  const value = JSON.stringify({
    version: 1,
    ..._.pick(base, CONTEXT_KEYS),
    accountId: md.global.Account.accountId,
    expiresAt: Date.now() + SNAPSHOT_LIFETIME,
    filters,
    quickFilter: formatQuickFilter(quickFilter),
  });

  safeLocalStorageSetItem(key, value);
  // 全局安全写入会吞掉存储异常，读回确认后才能打开导出页。
  if (localStorage.getItem(key) !== value) {
    throw new Error('Unable to save Gunter export filters');
  }

  return exportId;
};

export const takeGunterExportFilters = (exportId, base) => {
  // 兼容直接访问旧导出地址；显式携带但无效的标识不能退回无筛选导出。
  if (exportId === undefined) return null;

  if (typeof exportId !== 'string' || !/^[\w-]{1,80}$/.test(exportId)) {
    throw new Error('Invalid Gunter export id');
  }

  const key = `${STORAGE_PREFIX}${exportId}`;
  const snapshot = safeParse(localStorage.getItem(key));

  localStorage.removeItem(key);
  if (
    !hasValidFilters(snapshot) ||
    snapshot.version !== 1 ||
    !Number.isFinite(snapshot.expiresAt) ||
    snapshot.expiresAt <= Date.now() ||
    snapshot.accountId !== md.global.Account.accountId ||
    !CONTEXT_KEYS.every(key => snapshot[key] === base[key])
  ) {
    throw new Error('Missing or expired Gunter export filters');
  }

  return snapshot;
};
