import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Menu, MenuItem, Skeleton } from 'ming-ui';
import ScrollView from 'ming-ui/components/ScrollView';
import { deleteAgentSession, fetchAgentSessions, renameAgentSession } from '../agentService';
import { AGENT_DIALOG_CLOSE_CLASS, AgentDialogCloseStyle } from './dialogCloseStyle';

const PAGE_SIZE = 30;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 400px;
  .searchBox {
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
  onSelect = () => {},
  onDeleted = () => {},
  onClose = () => {},
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [menuOpenId, setMenuOpenId] = useState('');
  const pageRef = useRef(1);
  const seqRef = useRef(0); // 每次关键词检索自增，用于丢弃过期的“加载更多”响应
  const loadingMoreRef = useRef(false); // 同步防抖，避免触底事件重复触发
  const renameInputRef = useRef(null); // 重命名弹层里 Input 的非受控引用
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
    setIsLoadingMore(false);
    setIsLoading(true);
    const timer = setTimeout(
      () => {
        fetchAgentSessions({ page: 1, size: PAGE_SIZE, keyword: value })
          .then(list => {
            if (seq !== seqRef.current) return;
            setSessions(list);
            setHasMore(list.length >= PAGE_SIZE);
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

  const doRename = (item, title) => {
    renameAgentSession(item.sessionId, title)
      .then(newTitle => {
        setSessions(prev => prev.map(s => (s.sessionId === item.sessionId ? { ...s, title: newTitle } : s)));
        alert(_l('重命名成功'));
      })
      .catch(err => {
        console.error('[agent] rename session failed', err);
        alert(_l('重命名失败'), 2);
      });
  };

  const doDelete = item => {
    deleteAgentSession(item.sessionId)
      .then(() => {
        setSessions(prev => prev.filter(s => s.sessionId !== item.sessionId));
        alert(_l('删除成功'));
        onDeleted(item.sessionId);
      })
      .catch(err => {
        console.error('[agent] delete session failed', err);
        alert(_l('删除失败'), 2);
      });
  };

  return (
    <Dialog
      visible
      width={640}
      title={_l('历史对话')}
      showFooter={false}
      className={AGENT_DIALOG_CLOSE_CLASS}
      onCancel={onClose}
    >
      <AgentDialogCloseStyle />
      <Body>
        <div className="searchBox t-flex t-items-center">
          <i className="icon-search" />
          <input
            ref={searchInputRef}
            value={keyword}
            placeholder={_l('搜索历史对话')}
            onChange={e => setKeyword(e.target.value)}
          />
          {!!keyword && <i className="icon-cancel" onClick={() => setKeyword('')} />}
        </div>
        <ScrollView className="sessionList" onScrollEnd={handleLoadMore}>
          {isLoading ? (
            <Skeleton active widths={[100, '100%', '100%', '50%']} />
          ) : !sessions.length ? (
            <div className="emptyStatus">{keyword ? _l('未找到相关对话') : _l('暂无历史对话')}</div>
          ) : (
            <React.Fragment>
              {sessions.map(item => (
                <div
                  key={item.sessionId}
                  className={cx('sessionItem t-flex t-items-center t-space-between', {
                    active: currentSessionId && item.sessionId === currentSessionId,
                    menuActive: menuOpenId === item.sessionId,
                  })}
                  onClick={() => onSelect(item)}
                >
                  <div className="name ellipsis t-flex-1">{item.title}</div>
                  {!!item.updateTime && <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>}
                  <Trigger
                    popupVisible={menuOpenId === item.sessionId}
                    onPopupVisibleChange={visible => setMenuOpenId(visible ? item.sessionId : '')}
                    action={['click']}
                    // rc-trigger 默认未给弹层加 position:absolute（项目未引入其内置样式），
                    // dom-align 会回退成 position:relative 导致菜单贴到容器左缘，这里显式指定
                    popupStyle={{ position: 'absolute', zIndex: 1051 }}
                    popupAlign={{ points: ['tl', 'bl'], offset: [0, 6], overflow: { adjustX: true, adjustY: true } }}
                    popup={
                      <Menu className="Relative">
                        <MenuItem
                          icon={<Icon icon="rename_input" className="Font18 mLeft5" />}
                          onClick={e => {
                            // Trigger 弹层经 portal 渲染，事件会沿 React 树冒泡到行的 onSelect，需阻断
                            if (e && e.stopPropagation) e.stopPropagation();
                            setMenuOpenId('');
                            Dialog.confirm({
                              title: _l('重命名对话'),
                              width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                              description: (
                                <Input
                                  autoFocus
                                  placeholder={_l('请输入对话名称')}
                                  className="w100 textPrimary"
                                  defaultValue={item.title}
                                  manualRef={ref => (renameInputRef.current = ref)}
                                />
                              ),
                              onOk: () => {
                                const val = renameInputRef.current && renameInputRef.current.value.trim();

                                if (val) {
                                  doRename(item, val);
                                } else {
                                  alert(_l('请输入对话名称'), 3);
                                  renameInputRef.current && renameInputRef.current.focus();
                                  return false;
                                }
                              },
                            });
                          }}
                        >
                          <span className="mLeft10">{_l('重命名')}</span>
                        </MenuItem>
                        <MenuItem
                          icon={<Icon icon="trash" className="Font18 mLeft5" style={{ color: 'var(--color-error)' }} />}
                          onClick={e => {
                            if (e && e.stopPropagation) e.stopPropagation();
                            setMenuOpenId('');
                            Dialog.confirm({
                              title: (
                                <span style={{ color: 'var(--color-error)', fontWeight: 'bold' }}>
                                  {_l('确定删除该对话')}
                                </span>
                              ),
                              width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                              description: _l('删除后，聊天记录将不可恢复'),
                              buttonType: 'danger',
                              onOk: () => doDelete(item),
                            });
                          }}
                        >
                          <span className="mLeft10" style={{ color: 'var(--color-error)' }}>
                            {_l('删除')}
                          </span>
                        </MenuItem>
                      </Menu>
                    }
                  >
                    <span className="operateIcon" onClick={e => e.stopPropagation()}>
                      <i className="icon icon-more_horiz Font18 textTertiary Hand" />
                    </span>
                  </Trigger>
                </div>
              ))}
              {isLoadingMore && <LoadDiv className="mTop6 mBottom6" size={20} />}
            </React.Fragment>
          )}
        </ScrollView>
      </Body>
    </Dialog>
  );
}

SessionHistory.propTypes = {
  currentSessionId: PropTypes.string,
  onSelect: PropTypes.func,
  onDeleted: PropTypes.func,
  onClose: PropTypes.func,
};
