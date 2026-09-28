import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAgentSessionPage } from 'src/components/Agent/agentService';

const PAGE_SIZE = 30;

export default function useSessionHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const isLoadingRef = useRef(true);
  const keywordRef = useRef('');

  useEffect(() => {
    const seq = ++seqRef.current;
    pageRef.current = 1;
    loadingMoreRef.current = false;

    fetchAgentSessionPage({ page: 1, size: PAGE_SIZE, keyword })
      .then(({ items, hasMore }) => {
        if (seq !== seqRef.current) return;
        setSessions(items);
        hasMoreRef.current = hasMore;
      })
      .catch(error => console.error('[mobile-mingo] fetch sessions failed', error))
      .finally(() => {
        if (seq !== seqRef.current) return;
        isLoadingRef.current = false;
        setIsLoading(false);
      });

    return () => {
      if (seq === seqRef.current) seqRef.current += 1;
    };
  }, [keyword]);

  const search = useCallback(value => {
    const nextKeyword = value.trim();

    // MobileSearch 在按回车后还会执行一次防抖回调，相同关键词不能再次清空列表。
    if (nextKeyword === keywordRef.current) return;

    seqRef.current += 1;
    loadingMoreRef.current = false;
    hasMoreRef.current = false;
    isLoadingRef.current = true;
    keywordRef.current = nextKeyword;
    setIsLoadingMore(false);
    setIsLoading(true);
    setSessions([]);
    setKeyword(nextKeyword);
  }, []);

  // ScrollView 初始化后会持有首次 onScrollEnd，保持函数引用稳定并从 ref 读取最新分页状态。
  const loadMore = useCallback(() => {
    if (isLoadingRef.current || loadingMoreRef.current || !hasMoreRef.current) return;

    const seq = seqRef.current;
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    fetchAgentSessionPage({ page: nextPage, size: PAGE_SIZE, keyword: keywordRef.current })
      .then(({ items, hasMore }) => {
        if (seq !== seqRef.current) return;
        pageRef.current = nextPage;
        setSessions(previousSessions => {
          const existedSessionIds = new Set(previousSessions.map(item => item.sessionId));
          return previousSessions.concat(items.filter(item => !existedSessionIds.has(item.sessionId)));
        });
        hasMoreRef.current = hasMore;
      })
      .catch(error => console.error('[mobile-mingo] load more sessions failed', error))
      .finally(() => {
        if (seq !== seqRef.current) return;
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      });
  }, []);

  const updateSessionTitle = (sessionId, title) => {
    setSessions(previousSessions =>
      previousSessions.map(item => (item.sessionId === sessionId ? { ...item, title } : item)),
    );
  };

  const removeSession = sessionId => {
    setSessions(previousSessions => previousSessions.filter(item => item.sessionId !== sessionId));
  };

  return {
    isLoading,
    isLoadingMore,
    keyword,
    sessions,
    loadMore,
    removeSession,
    search,
    updateSessionTitle,
  };
}
