import { useCallback, useEffect, useRef, useState } from 'react';
import knowledgeAjax from '../../../../../api/knowledge';
import { usePolling } from 'src/utils/platform/react/polling';
import { getTranslateInfo } from 'src/utils/services/app';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import { COLLECTION_TASK_STATUS_NEEDS_REFRESH } from '../../../../../core/config';
import { removeKidHashFromUrl } from '../../../../../core/utils';

const noop = () => {};

export const useKnowledgeDetail = (knowledgeId, { enabled = true, callback = noop } = {}) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState({});

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const hasRunningTask = useCallback(data => {
    return data?.knowledgeCollections?.some(item => COLLECTION_TASK_STATUS_NEEDS_REFRESH.includes(item.taskStatus));
  }, []);

  const fetchDetail = useCallback(
    async (isSilence = false) => {
      const requestId = ++requestIdRef.current;

      if (!isSilence && mountedRef.current) setLoading(true);

      try {
        const data = await knowledgeAjax.getKnowledgeBaseDetail({
          id: knowledgeId,
        });

        if (!mountedRef.current) return [];
        if (requestId !== requestIdRef.current) return null;

        const list = data?.knowledgeCollections || [];

        const apkId = data.apk.apkId;

        const formatted = list.map(item => {
          const worksheet = item.worksheet;
          const workSheetId = worksheet?.workSheetId;
          const workSheetName = worksheet?.workSheetName;

          const translateInfo = workSheetId ? getTranslateInfo(apkId, null, workSheetId) : null;
          const translatedName = translateInfo?.name || workSheetName;

          return {
            ...item,
            controls: replaceControlsTranslateInfo(apkId, workSheetId, item.controls),
            worksheet: workSheetName
              ? {
                  ...worksheet,
                  workSheetName: translatedName,
                }
              : worksheet,

            isDeleted: !workSheetName,
          };
        });

        const next = {
          ...data,
          knowledgeCollections: formatted,
        };

        setDetail(next);

        return next;
      } catch (err) {
        console.error('getKnowledgeBaseDetail error:', err);
        callbackRef.current();
        removeKidHashFromUrl();
        return null;
      } finally {
        if (!isSilence && mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [knowledgeId],
  );
  const fetchDetailSilently = useCallback(() => fetchDetail(true), [fetchDetail]);

  // 使用通用轮询
  const { start, stop } = usePolling({
    fetcher: fetchDetailSilently,
    shouldContinue: hasRunningTask,
  });

  // 初始加载
  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    Promise.resolve()
      .then(fetchDetailSilently)
      .then(() => {
        if (active && mountedRef.current) setLoading(false);
      });

    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
      stop();
    };
  }, [fetchDetailSilently, stop]);

  useEffect(() => {
    if (enabled && hasRunningTask(detail)) {
      start();
    } else {
      stop();
    }
  }, [detail, enabled, hasRunningTask, start, stop]);

  const refresh = useCallback(() => {
    stop();
    return fetchDetail();
  }, [fetchDetail, stop]);

  return {
    loading,
    knowledgeDetail: detail,
    refresh,
  };
};
