import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal, Skeleton } from 'ming-ui/antd-components';
import ScrollView from 'ming-ui/components/ScrollView';
import useAutoLoadUntilScrollable from 'ming-ui/hooks/useAutoLoadUntilScrollable';
import { fetchAgentSessionPage } from '../agentService';
import { AGENT_DIALOG_CLOSE_CLASS, AgentDialogCloseStyle } from './dialogCloseStyle';
import SessionRow from './SessionRow';

const PAGE_SIZE = 30;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  /* 类名避开通用的 .searchBox：后台等页面有同名全局样式，会穿透 styled 作用域造成冲突 */
  .sessionSearchBox {
    flex-shrink: 0;
    margin-bottom: 12px;
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    transition: border-color 0.2s ease;
    &:focus-within {
      border-color: var(--color-border-hover);
    }
    .icon-search {
      font-size: 18px;
      color: var(--color-text-tertiary);
    }
    input {
      flex: 1;
      margin: 0 8px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--color-text-primary);
      &::placeholder {
        color: var(--color-text-secondary);
      }
    }
    .icon-cancel {
      font-size: 16px;
      color: var(--color-text-tertiary);
      cursor: pointer;
      &:hover {
        color: var(--color-text-secondary);
      }
    }
  }
  .sessionList {
    flex: 1;
    .sessionItem {
      cursor: pointer;
      border-radius: 5px;
      padding: 0 12px;
      height: 42px;
      font-size: 15px;
      color: var(--color-text-primary);
      .updateTime {
        margin-left: 12px;
        font-size: 12px;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
      .operateIcon {
        margin-left: 8px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        border-radius: 3px;
        font-size: 14px;
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
        .updateTime {
          display: none;
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
`;

export default function SessionHistory({
  currentSessionId,
  agentName = '',
  enableShare = true,
  onSelect = () => {},
  onDeleted = () => {},
  onClose = () => {},
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const pageRef = useRef(1);
  const scrollViewRef = useRef(null);
  const seqRef = useRef(0); // 每次关键词检索自增，用于丢弃过期的“加载更多”响应
  const loadingMoreRef = useRef(false); // 同步防抖，避免触底事件重复触发
  const searchInputRef = useRef(null); // 搜索框引用：弹窗打开即聚焦

  // 弹窗打开即聚焦搜索框（Dialog 挂载/动画后再 focus 更稳）
  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 0);
    return () => clearTimeout(timer);
  }, []);

  // 关键词变化时由后端检索（/api/agent/sessions?keyword=xxx），输入时做防抖
  useEffect(() => {
    const value = keyword.trim();
    const seq = ++seqRef.current;
    pageRef.current = 1;
    loadingMoreRef.current = false;
    const timer = setTimeout(
      () => {
        setIsLoadingMore(false);
        setIsLoading(true);
        fetchAgentSessionPage({ page: 1, size: PAGE_SIZE, keyword: value, agentName })
          .then(({ items, hasMore: nextHasMore }) => {
            if (seq !== seqRef.current) return;
            setSessions(items);
            setHasMore(nextHasMore);
          })
          .catch(err => console.error('[agent] fetch sessions failed', err))
          .finally(() => {
            if (seq !== seqRef.current) return;
            setIsLoading(false);
          });
      },
      value ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [keyword, agentName]);

  const handleLoadMore = () => {
    if (isLoading || loadingMoreRef.current || !hasMore) return;
    const seq = seqRef.current;
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetchAgentSessionPage({ page: nextPage, size: PAGE_SIZE, keyword: keyword.trim(), agentName })
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

  // 同左栏：一页数据经 session-bot- 过滤后可能撑不满弹窗列表，没有滚动条就再也触发不了翻页
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
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={640}
      title={_l('历史对话')}
      footer={null}
      rootClassName={AGENT_DIALOG_CLOSE_CLASS}
      onCancel={onClose}
    >
      <AgentDialogCloseStyle />
      <Body>
        <div className="sessionSearchBox t-flex t-items-center">
          <i className="icon-search" />
          <input
            ref={searchInputRef}
            value={keyword}
            placeholder={_l('搜索历史对话')}
            onChange={e => setKeyword(e.target.value)}
          />
          {!!keyword && <i className="icon-cancel" onClick={() => setKeyword('')} />}
        </div>
        <ScrollView ref={scrollViewRef} className="sessionList" onScrollEnd={handleLoadMore}>
          {isLoading ? (
            <Skeleton
              className="pAll20"
              active
              paragraph={{
                rows: 4,
                width: [100, '100%', '100%', '50%'],
              }}
            />
          ) : !sessions.length ? (
            <div className="emptyStatus">{keyword ? _l('未找到相关对话') : _l('暂无历史对话')}</div>
          ) : (
            <React.Fragment>
              {sessions.map(item => (
                <SessionRow
                  key={item.sessionId}
                  item={item}
                  showUpdateTime
                  enableShare={enableShare}
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
      </Body>
    </Modal>
  );
}

SessionHistory.propTypes = {
  currentSessionId: PropTypes.string,
  // 仅展示该 agent 名下的会话（如帮助中心 help-agent）；空则不过滤
  agentName: PropTypes.string,
  // 会话行是否提供「分享」：智能客服不支持会话分享
  enableShare: PropTypes.bool,
  onSelect: PropTypes.func,
  onDeleted: PropTypes.func,
  onClose: PropTypes.func,
};
