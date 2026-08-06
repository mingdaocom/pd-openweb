import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Menu, MenuItem, Skeleton } from 'ming-ui';
import ScrollView from 'ming-ui/components/ScrollView';
import { deleteAgentSession, fetchAgentSessions, renameAgentSession } from 'src/components/Agent/agentService';
import { SessionHistory } from 'src/components/Agent/ui';
import mingoLogo from 'src/pages/mingo/common/images/mingo-logo.png';
import { pathCompletion } from 'src/utils/common';

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
  const [menuOpenId, setMenuOpenId] = useState('');
  const loadedRef = useRef(false);
  const pageRef = useRef(1);
  const seqRef = useRef(0); // 每次关键词检索/会话切换自增，用于丢弃过期的“加载更多”响应
  const loadingMoreRef = useRef(false); // 同步防抖，避免触底事件重复触发
  const renameInputRef = useRef(null); // 重命名弹层里 Input 的非受控引用

  // 搜索已移到弹窗（SessionHistory），左栏列表常显全部；currentSessionId / refreshKey 变化（新建、切换、一轮结束）刷新列表
  useEffect(() => {
    const seq = ++seqRef.current;
    pageRef.current = 1;
    loadingMoreRef.current = false;
    setIsLoadingMore(false);
    setIsLoading(true);
    fetchAgentSessions({ page: 1, size: PAGE_SIZE })
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
  }, [currentSessionId, refreshKey]);

  const handleLoadMore = () => {
    if (isLoading || loadingMoreRef.current || !hasMore) return;
    const seq = seqRef.current;
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetchAgentSessions({ page: nextPage, size: PAGE_SIZE })
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

  const doRename = (item, newTitle) => {
    renameAgentSession(item.sessionId, newTitle)
      .then(resultTitle => {
        setSessions(prev => prev.map(s => (s.sessionId === item.sessionId ? { ...s, title: resultTitle } : s)));
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
    <Con className={cx('t-flex t-flex-col', { 'un-expand': !visible })}>
      <div className="side-header t-flex t-items-center t-justify-between">
        <a href={pathCompletion('/')} className="t-flex t-items-center">
          <img className="brand-wordmark" src={mingoLogo} alt="mingo" />
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
      <ScrollView className="sessionList t-flex-1" onScrollEnd={handleLoadMore}>
        {isLoading && !loadedRef.current ? (
          <Skeleton active widths={[100, '100%', '100%', '50%']} />
        ) : !sessions.length ? (
          <div className="emptyStatus">{_l('暂无历史对话')}</div>
        ) : (
          <React.Fragment>
            {sessions.map(item => (
              <div
                key={item.sessionId}
                className={cx('sessionItem t-flex t-items-center', {
                  active: currentSessionId && item.sessionId === currentSessionId,
                  menuActive: menuOpenId === item.sessionId,
                })}
                onClick={() => onSelect(item)}
              >
                <div className="name ellipsis t-flex-1">{item.title}</div>
                <Trigger
                  popupVisible={menuOpenId === item.sessionId}
                  onPopupVisibleChange={open => setMenuOpenId(open ? item.sessionId : '')}
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
