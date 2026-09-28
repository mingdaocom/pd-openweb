import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Skeleton } from 'ming-ui/antd-components';
import ScrollView from 'ming-ui/components/ScrollView';
import useAutoLoadUntilScrollable from 'ming-ui/hooks/useAutoLoadUntilScrollable';
import { fetchAgentSessionPage } from 'src/components/Agent/agentService';
import { SessionHistory } from 'src/components/Agent/ui';
import SessionRow from 'src/components/Agent/ui/SessionRow';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const PAGE_SIZE = 30;
const Con = styled.div`
  width: 280px;
  border-right: 1px solid var(--color-border-secondary);
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin-left: 0;
  .side-header {
    height: 50px;
    flex-shrink: 0;
    padding: 0 12px 0 16px;
    .brand-wordmark {
      height: 22px;
      width: auto;
      object-fit: contain;
      display: block;
    }
  }
  .new-chat-btn {
    height: 40px;
    border-radius: 40px;
    border: 1px solid var(--color-border-secondary);
    margin: 4px 16px 12px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    &:hover {
      border-color: var(--color-border-hover);
    }
    i {
      font-size: 18px;
      color: var(--color-mingo);
      margin-right: 6px;
    }
    span {
      font-size: 14px;
      color: var(--color-text-title);
      font-weight: 500;
    }
  }
  /* 搜索：去边框、左对齐，做成与列表行一致的轻量行式；点击打开搜索弹窗（参考设计稿） */
  .searchBox {
    flex-shrink: 0;
    margin: 0 8px 4px;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover {
      background: var(--color-background-hover);
    }
    .icon-search {
      font-size: 18px;
      color: var(--color-text-secondary);
    }
    .placeholder {
      flex: 1;
      margin: 0 8px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }
  .list-title {
    flex-shrink: 0;
    padding: 8px 16px 4px;
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
  .sessionList {
    flex: 1;
    padding: 0 8px;
    .sessionItem {
      cursor: pointer;
      border-radius: 6px;
      padding: 0 6px 0 12px;
      height: 40px;
      font-size: 14px;
      color: var(--color-text-primary);
      .operateIcon {
        margin-left: 8px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border-radius: 3px;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: none;
        justify-content: center;
        align-items: center;
      }
      &:hover,
      &.menuActive {
        background: var(--color-background-hover);
        .operateIcon {
          display: flex;
        }
      }
      &.active {
        background: var(--color-mingo-transparent-light);
      }
    }
    .emptyStatus {
      padding: 24px 0;
      font-size: 14px;
      color: var(--color-text-tertiary);
      text-align: center;
    }
  }
  &.un-expand {
    margin-left: -280px;
  }
`;
export const ExpandIcon = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: var(--color-background-hover);
  }
  i {
    font-size: 20px;
    color: var(--color-text-secondary);
  }
  &.un-expand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    border: 1px solid var(--color-border-secondary);
    margin: 12px;
  }
`;
export default function HistorySide({
  visible,
  currentSessionId,
  refreshKey,
  onNewChat = () => {},
  onSelect = () => {},
  onExpand = () => {},
  onDeleted = () => {},
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const loadedRef = useRef(false);
  const scrollViewRef = useRef(null);
  const pageRef = useRef(1);
  const seqRef = useRef(0); // 每次整拉列表时自增，用于丢弃过期的“加载更多”响应
  const loadingMoreRef = useRef(false); // 同步防抖，避免触底事件重复触发

  // 搜索已移到弹窗（SessionHistory），左栏列表常显全部。
  // 只由 refreshKey 触发整拉（新会话首次落库）：整拉会重置到第一页，若把 currentSessionId 也作为依赖，
  // 点击已加载的第 N 页会话就会把后续页丢掉、滚动回顶部，被点中的那条反而从列表里消失。
  // 切换会话不改变列表内容，高亮由 currentSessionId 直接参与渲染，无需重新拉取。
  useEffect(() => {
    const seq = ++seqRef.current;
    pageRef.current = 1;
    loadingMoreRef.current = false;
    setIsLoadingMore(false);
    setIsLoading(true);
    fetchAgentSessionPage({
      page: 1,
      size: PAGE_SIZE,
    })
      .then(({ items, hasMore: nextHasMore }) => {
        if (seq !== seqRef.current) return;
        setSessions(items);
        setHasMore(nextHasMore);
      })
      .catch(err => console.error('[agent] fetch sessions failed', err))
      .finally(() => {
        if (seq !== seqRef.current) return;
        loadedRef.current = true;
        setIsLoading(false);
      });
  }, [refreshKey]);
  const handleLoadMore = () => {
    if (isLoading || loadingMoreRef.current || !hasMore) return;
    const seq = seqRef.current;
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetchAgentSessionPage({
      page: nextPage,
      size: PAGE_SIZE,
    })
      // hasMore 必须取接口层按「过滤前的原始条数」算出的值：items 已剔除 session-bot- 会话，
      // 按它的长度判断会在本页混有 bot 会话时误判成没有下一页，翻页就此停住
      .then(({ items, hasMore: nextHasMore }) => {
        if (seq !== seqRef.current) return;
        pageRef.current = nextPage;
        setSessions(prev => {
          const existed = new Set(prev.map(item => item.sessionId));
          return prev.concat(items.filter(item => !existed.has(item.sessionId)));
        });
        setHasMore(nextHasMore);
      })
      .catch(err => console.error('[agent] load more sessions failed', err))
      .finally(() => {
        if (seq !== seqRef.current) return;
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      });
  };

  // 接口按 size 取数后会剔除 session-bot- 会话，首屏很可能只剩几条、撑不出滚动条，
  // 光靠 onScrollEnd 就再也翻不到下一页，这里补上「不够一屏就继续拉」
  useAutoLoadUntilScrollable({
    scrollViewRef,
    hasMore,
    loading: isLoading,
    loadingMore: isLoadingMore,
    contentKey: sessions.length,
    onLoadMore: handleLoadMore,
  });

  const handleRenamed = (sessionId, newTitle) => {
    setSessions(prev => prev.map(s => (s.sessionId === sessionId ? { ...s, title: newTitle } : s)));
  };

  const handleDeleted = sessionId => {
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    onDeleted(sessionId);
  };

  return (
    <Con
      className={cx('t-flex t-flex-col', {
        'un-expand': !visible,
      })}
    >
      <div className="side-header t-flex t-items-center t-justify-between">
        <a href={pathCompletion('/')} className="t-flex t-items-center">
          <img className="brand-wordmark" src={md.global.SysSettings.aiBrandLogoUrl || mingoLogo} alt="mingo" />
        </a>
        <ExpandIcon className="t-flex t-items-center t-justify-center" onClick={onExpand}>
          <i className="icon icon-menu_left"></i>
        </ExpandIcon>
      </div>
      <div className="new-chat-btn t-flex t-items-center t-justify-center" onClick={onNewChat}>
        <i className="icon icon-new_chat"></i>
        <span>{_l('新对话')}</span>
      </div>
      <div className="searchBox t-flex t-items-center" onClick={() => setSearchVisible(true)}>
        <i className="icon-search" />
        <span className="placeholder">{_l('搜索历史对话')}</span>
      </div>
      <div className="list-title">{_l('历史对话')}</div>
      <ScrollView ref={scrollViewRef} className="sessionList t-flex-1" onScrollEnd={handleLoadMore}>
        {isLoading && !loadedRef.current ? (
          <Skeleton
            className="pAll20"
            active
            paragraph={{
              rows: 4,
              width: [100, '100%', '100%', '50%'],
            }}
          />
        ) : !sessions.length ? (
          <div className="emptyStatus">{_l('暂无历史对话')}</div>
        ) : (
          <React.Fragment>
            {sessions.map(item => (
              <SessionRow
                key={item.sessionId}
                item={item}
                active={currentSessionId && item.sessionId === currentSessionId}
                onSelect={onSelect}
                onRenamed={handleRenamed}
                onDeleted={handleDeleted}
              />
            ))}
            {isLoadingMore && <LoadDiv className="mTop6 mBottom6" size={20} />}
          </React.Fragment>
        )}
      </ScrollView>
      {searchVisible && (
        <SessionHistory
          currentSessionId={currentSessionId}
          onSelect={item => {
            setSearchVisible(false);
            onSelect(item);
          }}
          onDeleted={deletedId => {
            // 弹窗内删除：同步从左栏列表移除，并按当前会话处理（删的是正在看的则回新会话）
            setSessions(prev => prev.filter(s => s.sessionId !== deletedId));
            onDeleted(deletedId);
          }}
          onClose={() => setSearchVisible(false)}
        />
      )}
    </Con>
  );
}

HistorySide.propTypes = {
  visible: PropTypes.bool,
  currentSessionId: PropTypes.string,
  refreshKey: PropTypes.number,
  onNewChat: PropTypes.func,
  onSelect: PropTypes.func,
  onExpand: PropTypes.func,
  onDeleted: PropTypes.func,
};
