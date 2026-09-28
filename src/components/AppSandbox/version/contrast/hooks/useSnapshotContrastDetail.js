import { useEffect, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { normalizePageContrastDetail } from '../model/pageContrast';
import { normalizeProcessContrastDetail } from '../model/processContrast';

const EMPTY_RESULT = {
  requestKey: '',
  data: null,
  error: null,
};

const DETAIL_CONFIG = {
  page: {
    request: ({ appId, contrastId, resourceId }) =>
      appSandboxAjax.getPageCompare({ appId, pageId: resourceId, contrastId }, { silent: true }),
    normalize: normalizePageContrastDetail,
    getErrorMessage: () => _l('获取自定义页面变更详情失败，请稍后重试'),
  },
  process: {
    request: ({ appId, contrastId, resourceId }) =>
      appSandboxAjax.getProcessCompare({ appId, processId: resourceId, contrastId }, { silent: true }),
    normalize: normalizeProcessContrastDetail,
    getErrorMessage: () => _l('获取工作流变更详情失败，请稍后重试'),
  },
};

/** 页面与工作流共用的明细请求：缓存进行中和成功结果，失败后移除缓存以便再次选中时重新请求。 */
export default function useSnapshotContrastDetail({ type, appId, contrastId, resourceId, enabled }) {
  const [snapshotCache] = useState(() => new Map());
  const requestKey = appId && contrastId && resourceId ? `${type}:${appId}:${contrastId}:${resourceId}` : '';
  const [result, setResult] = useState(EMPTY_RESULT);
  const currentResult = result.requestKey === requestKey ? result : EMPTY_RESULT;
  const loading = Boolean(enabled && requestKey && result.requestKey !== requestKey);

  useEffect(() => {
    if (!enabled || !requestKey) return;

    let canceled = false;
    const config = DETAIL_CONFIG[type];
    const cached = snapshotCache.get(requestKey);
    const promise = cached?.promise
      ? cached.promise
      : cached
        ? Promise.resolve(cached.data)
        : config
            .request({ appId, contrastId, resourceId })
            .then(response => {
              const detail = response?.data && typeof response.data === 'object' ? response.data : response;

              if (!detail || (!detail.data && !detail.originalData)) throw new Error(config.getErrorMessage());

              const data = config.normalize(detail, { reverse: !isSandboxEnvironment() });
              snapshotCache.set(requestKey, { data });
              return data;
            })
            .catch(error => {
              snapshotCache.delete(requestKey);
              throw error;
            });

    if (!cached) snapshotCache.set(requestKey, { promise });

    Promise.resolve(promise)
      .then(data => {
        if (!canceled) setResult({ requestKey, data, error: null });
      })
      .catch(error => {
        if (!canceled) setResult({ requestKey, data: null, error });
      });

    return () => {
      canceled = true;
    };
  }, [appId, contrastId, enabled, requestKey, resourceId, snapshotCache, type]);

  return {
    data: currentResult.data,
    error: currentResult.error,
    loading,
  };
}
