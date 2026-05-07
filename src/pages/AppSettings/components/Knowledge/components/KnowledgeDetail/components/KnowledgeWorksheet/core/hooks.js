import { useCallback, useEffect, useRef, useState } from 'react';
import knowledgeAjax from '../../../../../api/knowledge';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { COLLECTION_TASK_STATUS_NEEDS_REFRESH } from '../../../../../core/config';
import { usePolling } from '../../../../../core/hooks';
import { removeKidHashFromUrl } from '../../../../../core/utils';

export const useKnowledgeDetail = (knowledgeId, { enabled = true, callback = () => {} } = {}) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState({});

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const isInitializedRef = useRef(true);

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
        callback();
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

  // 使用通用轮询
  const { start, stop } = usePolling({
    fetcher: () => fetchDetail(true),
    shouldContinue: hasRunningTask,
  });

  // 初始加载
  useEffect(() => {
    fetchDetail().then(data => {
      if (enabled && hasRunningTask(data)) {
        start();
      }
    });
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) {
      isInitializedRef.current = false;
      return;
    }

    if (enabled && hasRunningTask(detail)) {
      start();
    }

    if (!enabled) {
      stop();
    }
  }, [enabled, start, stop]);

  const refresh = () => {
    stop();
    fetchDetail().then(data => {
      if (enabled && hasRunningTask(data)) {
        start();
      }
    });
  };

  return {
    loading,
    knowledgeDetail: detail,
    refresh,
  };
};
