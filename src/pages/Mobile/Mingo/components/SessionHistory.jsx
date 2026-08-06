import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv, MobileSearch, PopupWrapper, ScrollView, Skeleton } from 'ming-ui';
import { fetchAgentSessions } from 'src/components/Agent/agentService';

const PAGE_SIZE = 30;
const HIDDEN_SCROLLBAR_OPTIONS = { scrollbars: { visibility: 'hidden' } };

const Content = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-background-card);
  .inlineTitle {
    flex-shrink: 0;
    padding: 16px 15px 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  &.inlineHistory {
    border-right: 1px solid var(--color-border-secondary);
    .sessionList .sessionItem {
      padding: 0 15px;
    }
  }
  .sessionList {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    .sessionItem {
      cursor: pointer;
      border-radius: 5px;
      padding: 0 15px;
      height: 42px;
      font-size: 15px;
      color: var(--color-text-primary);
      .updateTime {
        margin-left: 12px;
        font-size: 12px;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
      &.active {
        background: var(--color-mingo-transparent-light);
      }
    }
    .emptyStatus {
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 15px;
      font-size: 14px;
      color: var(--color-text-tertiary);
      text-align: center;
    }
  }
`;

export default function SessionHistory({ currentSessionId, inline = false, onSelect = () => {}, onClose = () => {} }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const loadedRef = useRef(false);
  const pageRef = useRef(1);
  const seqRef = useRef(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const value = keyword.trim();
    const seq = ++seqRef.current;

    pageRef.current = 1;
    loadingMoreRef.current = false;
    setIsLoadingMore(false);
    setIsLoading(true);
    setSessions([]);

    fetchAgentSessions({ page: 1, size: PAGE_SIZE, keyword: value })
      .then(list => {
        if (seq !== seqRef.current) return;
        setSessions(list);
        setHasMore(list.length >= PAGE_SIZE);
      })
      .catch(err => console.error('[agent] fetch sessions failed', err))
      .finally(() => {
        if (seq !== seqRef.current) return;
        loadedRef.current = true;
        setIsLoading(false);
      });
  }, [keyword]);

  const handleLoadMore = () => {
    if (isLoading || loadingMoreRef.current || !hasMore) return;

    const seq = seqRef.current;
    const nextPage = pageRef.current + 1;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetchAgentSessions({ page: nextPage, size: PAGE_SIZE, keyword: keyword.trim() })
      .then(list => {
        if (seq !== seqRef.current) return;
        pageRef.current = nextPage;
        setSessions(prev => {
          const existed = new Set(prev.map(item => item.sessionId));

          return prev.concat(list.filter(item => !existed.has(item.sessionId)));
        });
        setHasMore(list.length >= PAGE_SIZE);
      })
      .catch(err => console.error('[agent] load more sessions failed', err))
      .finally(() => {
        if (seq !== seqRef.current) return;
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      });
  };

  const isSearching = !!keyword.trim();
  const showLoading = isLoading && (!loadedRef.current || isSearching);
  const content = (
    <Content className={cx({ inlineHistory: inline })}>
      {inline && <div className="inlineTitle">{_l('历史记录')}</div>}
      <MobileSearch placeholder={_l('搜索历史对话')} onSearch={setKeyword} />
      <ScrollView className="sessionList" options={HIDDEN_SCROLLBAR_OPTIONS} onScrollEnd={handleLoadMore}>
        {showLoading ? (
          <Skeleton active widths={[100, '100%', '100%', '50%']} />
        ) : !sessions.length ? (
          <div className="emptyStatus">{isSearching ? _l('无搜索结果') : _l('暂无历史对话')}</div>
        ) : (
          <React.Fragment>
            {sessions.map(item => (
              <div
                key={item.sessionId}
                className={cx('sessionItem flexRow alignItemsCenter', {
                  active: currentSessionId && item.sessionId === currentSessionId,
                })}
                onClick={() => onSelect(item)}
              >
                <div className="name ellipsis flex">{item.title}</div>
                {!!item.updateTime && <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>}
              </div>
            ))}
            {isLoadingMore && <LoadDiv className="mTop6 mBottom6" size={20} />}
          </React.Fragment>
        )}
      </ScrollView>
    </Content>
  );

  if (inline) return content;

  return (
    <PopupWrapper
      visible
      title={_l('历史记录')}
      headerType="withIcon"
      headerTitleAlign="left"
      bodyClassName="heightPopupBody40"
      onClose={onClose}
    >
      {content}
    </PopupWrapper>
  );
}
