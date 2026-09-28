import { useCallback, useEffect, useRef, useState } from 'react';
import knowledgeAjax from '../../api/knowledge';
import { usePolling } from 'src/utils/platform/react/polling';
import { getTranslateInfo } from 'src/utils/services/app';
import { KNOWLEDGE_STATUS } from '../../core/config';

const POLLING_STATUS = [
  KNOWLEDGE_STATUS.INIT_QUEUED,
  KNOWLEDGE_STATUS.INITIALIZING,
  KNOWLEDGE_STATUS.INIT_SUCCESS,
  KNOWLEDGE_STATUS.CHUNK_QUEUED,
  KNOWLEDGE_STATUS.CHUNKING,
  KNOWLEDGE_STATUS.VECTOR_FAILED,
  KNOWLEDGE_STATUS.VECTOR_QUEUED,
  KNOWLEDGE_STATUS.VECTORIZING,
];

export const useKnowledgeList = appId => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  /**
   * 是否需要继续轮询
   */
  const hasRunningTask = useCallback(data => {
    return data.some(item => POLLING_STATUS.includes(item.taskStatus));
  }, []);

  /**
   * 获取列表
   */
  const fetchList = useCallback(
    async (isSilence = false) => {
      const requestId = ++requestIdRef.current;

      if (!isSilence && mountedRef.current) {
        setLoading(true);
      }

      try {
        const data = await knowledgeAjax.getKnowledgeBase({
          apkId: appId,
        });

        if (!mountedRef.current) return [];
        if (requestId !== requestIdRef.current) return [];

        const listData = data || [];

        setList(
          listData.map(item => ({
            ...item,
            worksheets: item.worksheets.map(worksheet => ({
              ...worksheet,
              workSheetName: getTranslateInfo(appId, null, worksheet.workSheetId).name || worksheet.workSheetName,
            })),
          })),
        );

        return listData;
      } catch (err) {
        console.error('getKnowledgeBase error:', err);
        return [];
      } finally {
        if (!isSilence && mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [appId],
  );
  const fetchListSilently = useCallback(() => fetchList(true), [fetchList]);

  /**
   * 使用通用轮询
   */
  const { start, stop } = usePolling({
    fetcher: fetchListSilently,
    shouldContinue: hasRunningTask,
  });

  /**
   * 初始加载
   */
  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    Promise.resolve()
      .then(fetchListSilently)
      .then(data => {
        if (!active || !mountedRef.current) return;

        setLoading(false);
        if (hasRunningTask(data)) {
          start();
        }
      });

    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
      stop();
    };
  }, [fetchListSilently, hasRunningTask, start, stop]);

  /**
   * 手动刷新
   */
  const refresh = useCallback(
    (isSilence = false) => {
      stop();

      return fetchList(isSilence).then(data => {
        if (hasRunningTask(data)) start();
      });
    },
    [fetchList, hasRunningTask, start, stop],
  );

  /**
   * 更新
   */
  const updateItem = ({ id, name, description }) => {
    setList(prev => prev.map(item => (item.id === id ? { ...item, name, description } : item)));
  };

  /**
   * 删除
   */
  const removeItem = id => {
    setList(prev => prev.filter(item => item.id !== id));
  };

  return {
    loading,
    list,
    refresh,
    updateItem,
    removeItem,
  };
};
