import { useCallback, useEffect, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { getPublishContrastErrorMessage, isPublishContrastSuccess, normalizePublishContrast } from '../publishContrast';

const EMPTY_RESULT = {
  attemptKey: '',
  requestKey: '',
  data: null,
  error: null,
};

/** 详情页打开后，获取发布草稿或指定历史版本的真实差异。 */
export default function usePublishContrast({ appId, versionId, enabled }) {
  const requestKey = appId ? `${appId}:${versionId || 'release'}` : '';
  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState(EMPTY_RESULT);
  const attemptKey = enabled && requestKey ? `${requestKey}:${retryCount}` : '';
  const currentResult = result.requestKey === requestKey ? result : EMPTY_RESULT;
  const loading = Boolean(attemptKey && result.attemptKey !== attemptKey);
  const retry = useCallback(() => setRetryCount(count => count + 1), []);

  useEffect(() => {
    if (!attemptKey || !appId) return;

    // 详情页关闭或应用切换后忽略旧响应，防止过期数据覆盖当前页面。
    let canceled = false;
    // 发布新版不传 versionId；查看历史版本时按指定版本对比。
    const request = appSandboxAjax.getPublishContrast(
      {
        appId,
        ...(versionId ? { versionId } : {}),
      },
      { silent: true },
    );

    request
      .then(response => {
        if (canceled) return;
        if (!isPublishContrastSuccess(response)) throw new Error(getPublishContrastErrorMessage(response));

        setResult({
          attemptKey,
          requestKey,
          data: normalizePublishContrast(response, {
            isRelease: !versionId,
            reverse: !isSandboxEnvironment(),
          }),
          error: null,
        });
      })
      .catch(error => {
        if (!canceled) {
          setResult({
            attemptKey,
            requestKey,
            data: null,
            error: error || new Error('Failed to get publish contrast'),
          });
        }
      });

    return () => {
      canceled = true;
      request?.abort?.();
    };
  }, [appId, attemptKey, requestKey, versionId]);

  return {
    data: currentResult.data,
    error: currentResult.error,
    loading,
    retry,
  };
}
