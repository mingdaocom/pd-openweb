import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Input, Modal, Skeleton } from 'ming-ui/antd-components';
import ScrollView from 'ming-ui/components/ScrollView';
import ActionPopup from 'mobile/components/ActionPopup';
import { browserIsMobile } from 'src/utils/platform/browser/device';

const Con = styled(ScrollView)`
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
  .header {
    height: 50px;
    padding: 0 10px 0 16px;
    .title {
      font-size: 18px;
      font-weight: bold;
    }
    .closeIcon {
      width: 30px;
      height: 30px;
      font-size: 18px;
      color: var(--color-text-secondary);
    }
  }
  .chatHistoryList {
    padding: 0 10px;
    .chatHistoryItem {
      cursor: pointer;
      border-radius: 3px;
      padding: 0 10px;
      height: 45px;
      font-size: 14px;
      color: var(--color-text-primary);
      .updateTime {
        margin-left: 6px;
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
      .operateIcon {
        width: 24px;
        height: 24px;
        border-radius: 3px;
        background: var(--color-background-card);
        font-size: 14px;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: none;
        justify-content: center;
        align-items: center;
      }
      &:hover,
      &.hasMenu {
        .operateIcon {
          display: flex;
        }
        .updateTime {
          display: none;
        }
      }
    }
    .emptyStatus {
      padding: 12px 0;
      font-size: 14px;
      color: var(--color-text-tertiary);
      text-align: center;
    }
  }
  &.isMobile {
    .updateTime {
      display: none;
    }
    .operateIcon {
      display: flex !important;
    }
  }
`;

function ChatHistoryItem({
  item,
  currentChatId,
  allowShareChat,
  onClick = () => {},
  onRename = () => {},
  onDelete = () => {},
  onShare = () => {},
}) {
  const isMobile = browserIsMobile();
  const [menuVisible, setMenuVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const cache = useRef({});

  const renderDesktopTrigger = () => {
    return (
      <Dropdown
        open={menuVisible}
        onOpenChange={setMenuVisible}
        trigger={['click']}
        placement="bottomLeft"
        menu={{
          items: [
            {
              key: 'rename',
              icon: <Icon icon="rename_input" className="Font18" />,
              label: <span className="mLeft10">{_l('重命名')}</span>,
              onClick: () => {
                setMenuVisible(false);
                Modal.confirm({
                  title: _l('重命名对话'),
                  width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                  content: (
                    <Input
                      autoFocus
                      placeholder={_l('请输入对话名称')}
                      className="w100 textPrimary"
                      defaultValue={item.title}
                      ref={input => {
                        cache.current.input = input?.input;
                      }}
                    />
                  ),
                  onOk: () => {
                    if (cache.current.input?.value.trim()) {
                      onRename(cache.current.input.value);
                    } else {
                      alert(_l('请输入对话名称'), 3);
                      cache.current.input.focus();
                      return false;
                    }
                  },
                });
              },
            },
            allowShareChat && {
              key: 'share',
              icon: <Icon icon="share" className="Font18" />,
              label: <span className="mLeft10">{_l('分享')}</span>,
              onClick: () => {
                setMenuVisible(false);
                onShare();
              },
            },
            {
              key: 'delete',
              danger: true,
              icon: <Icon icon="trash" className="Font18" />,
              label: <span className="mLeft10">{_l('删除')}</span>,
              onClick: () => {
                setMenuVisible(false);
                Modal.confirm({
                  title: (
                    <span
                      style={{
                        color: 'var(--color-error)',
                      }}
                      className="textError"
                    >
                      {_l('确定删除该对话')}
                    </span>
                  ),
                  width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                  content: _l('删除后，聊天记录将不可恢复'),
                  okButtonProps: {
                    danger: true,
                  },
                  onOk: () => {
                    onDelete();
                  },
                });
              },
            },
          ].filter(Boolean),
        }}
      >
        <span className="operateIcon" onClick={e => e.stopPropagation()}>
          <i className="icon icon-more_horiz Font18 textTertiary Hand" />
        </span>
      </Dropdown>
    );
  };

  const renderMobilePopup = () => {
    return (
      <Fragment>
        <span className="operateIcon" onClick={() => setMobileMenuVisible(true)}>
          <i className="icon icon-more_horiz Font18 textTertiary Hand" />
        </span>
        {mobileMenuVisible && (
          <ActionPopup
            title={item.title}
            renamePlaceholder={_l('请输入对话名称')}
            deleteTitle={_l('确定删除该对话')}
            deleteDescription={_l('删除后，聊天记录将不可恢复')}
            manageHistory={false}
            onRename={onRename}
            onShare={() => {
              setMobileMenuVisible(false);
              onShare();
            }}
            onDelete={onDelete}
            onClose={() => setMobileMenuVisible(false)}
          />
        )}
      </Fragment>
    );
  };

  return (
    <div
      className={cx('chatHistoryItem t-flex t-items-center t-space-between', {
        active: currentChatId && item.chatId === currentChatId,
        hasMenu: menuVisible,
      })}
      onClick={onClick}
    >
      <div className="name ellipsis t-flex-1">{item.title}</div>
      <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>
      <div onClick={e => e.stopPropagation()}>{isMobile ? renderMobilePopup() : renderDesktopTrigger()}</div>
    </div>
  );
}

export default function ChatItemList(props) {
  const {
    className,
    isMobile,
    header,
    showHeader,
    isLoading,
    chatListData,
    currentChatId,
    isLand,
    allowShareChat,
    onClick,
    onSelect,
    onDelete,
    onRename,
    onShare,
    onClose,
  } = props;
  return (
    <Con
      className={cx('chatItemList', className, {
        isMobile,
      })}
      onClick={onClick}
    >
      {header}
      {showHeader && (
        <div className="header t-flex t-items-center t-space-between">
          <div className="title">{_l('历史记录')}</div>
          <div className="closeIcon Hand t-flex t-items-center t-justify-center Hand">
            <i className="icon icon-close" onClick={onClose}></i>
          </div>
        </div>
      )}
      <div className="chatHistoryList">
        {isLoading ? (
          <Skeleton
            active
            style={{
              maxWidth: 800,
              margin: '0 auto',
              padding: '0 10px',
            }}
            paragraph={{
              rows: 4,
              width: [100, '100%', '100%', '50%'],
            }}
          />
        ) : (
          <Fragment>
            {!chatListData.length && <div className="emptyStatus">{_l('暂无历史记录')}</div>}
            {!!chatListData.length &&
              chatListData.map((item, i) => (
                <ChatHistoryItem
                  isMobile={isMobile}
                  allowShareChat={allowShareChat}
                  isLand={isLand}
                  key={i}
                  item={item}
                  currentChatId={currentChatId}
                  onClick={() => {
                    onSelect(item);
                  }}
                  onDelete={() => {
                    onDelete(item);
                  }}
                  onRename={newTitle => {
                    onRename(newTitle, item);
                  }}
                  onShare={() => {
                    onShare(item);
                  }}
                />
              ))}
          </Fragment>
        )}
      </div>
    </Con>
  );
}
