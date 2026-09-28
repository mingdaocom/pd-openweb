import { useEffect, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { normalizeWorksheetContrastDetail } from '../model/worksheetContrast';

const EMPTY_RESULT = {
  requestKey: '',
  data: null,
  error: null,
};

const MAX_SNAPSHOT_CACHE_SIZE = 100;

/** 写入或刷新 LRU 顺序，最多保留 100 个工作表快照，避免页面长期使用导致缓存无界增长。 */
const touchCache = (cache, key, value) => {
  cache.delete(key);
  cache.set(key, value);

  if (cache.size > MAX_SNAPSHOT_CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }
};

/**
 * 按 appId + contrastId + worksheetId 获取不可变快照。
 * 同一快照复用进行中的 Promise 或成功结果；失败结果不缓存，重新选中时再次请求。
 */
const getSnapshot = ({ cache, appId, contrastId, worksheetId, requestKey }) => {
  const cached = cache.get(requestKey);

  if (cached) {
    touchCache(cache, requestKey, cached);
    return cached.promise || Promise.resolve(cached.detail);
  }

  const promise = appSandboxAjax
    .getWorksheetContrastDetail({ appId, worksheetId, contrastId }, { silent: true })
    .then(response => {
      // mdyAPI 已解开网络响应外层 data，此处直接读取接口结果中的 data。
      const detail = response?.data;
      if (!detail) throw new Error(_l('获取工作表变更详情失败，请稍后重试'));

      touchCache(cache, requestKey, { detail });
      return detail;
    })
    .catch(error => {
      cache.delete(requestKey);
      throw error;
    });

  touchCache(cache, requestKey, { promise });
  return promise;
};

/** 同一原始快照只规范化一次；正式环境下接口两侧含义相反，需要交换后再生成差异。 */
const getNormalizedSnapshot = (snapshotCache, requestKey, detail) => {
  const cacheEntry = snapshotCache.get(requestKey) || { detail };

  if (!cacheEntry.normalized) {
    cacheEntry.normalized = normalizeWorksheetContrastDetail(detail, { reverse: !isSandboxEnvironment() });
  }

  touchCache(snapshotCache, requestKey, cacheEntry);
  return cacheEntry.normalized;
};

/**
 * 选中工作表更新项后按整体对比批次获取两侧配置快照。
 * 组件卸载只阻止 setState，不中止共享请求，以便同一快照的后续访问继续复用结果。
 */
export default function useWorksheetContrastDetail({ appId, contrastId, worksheetId, enabled }) {
  // 缓存随 ChangeDetailPanel 实例创建和释放；弹层关闭卸载后不会跨下次打开复用。
  const [snapshotCache] = useState(() => new Map());
  const snapshotKey = appId && contrastId && worksheetId ? `${appId}:${contrastId}:${worksheetId}` : '';
  const requestKey = snapshotKey;
  const [result, setResult] = useState(EMPTY_RESULT);
  const currentResult = result.requestKey === requestKey ? result : EMPTY_RESULT;
  const loading = Boolean(enabled && requestKey && result.requestKey !== requestKey);

  useEffect(() => {
    if (!enabled || !snapshotKey || !appId || !contrastId || !worksheetId) return;

    let canceled = false;
    const request = getSnapshot({
      cache: snapshotCache,
      appId,
      contrastId,
      worksheetId,
      requestKey: snapshotKey,
    });

    request
      .then(detail => {
        if (canceled) return;

        setResult({
          requestKey,
          data: getNormalizedSnapshot(snapshotCache, snapshotKey, detail),
          error: null,
        });
      })
      .catch(error => {
        if (!canceled) {
          setResult({
            requestKey,
            data: null,
            error: error || new Error('Failed to get worksheet contrast detail'),
          });
        }
      });

    return () => {
      canceled = true;
    };
  }, [appId, contrastId, enabled, requestKey, snapshotCache, snapshotKey, worksheetId]);

  return {
    data: currentResult.data,
    error: currentResult.error,
    loading,
  };
}
