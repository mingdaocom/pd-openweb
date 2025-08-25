import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled, { keyframes } from 'styled-components';
import { Dialog, Icon, Input, Menu, MenuItem, ScrollView, Skeleton } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { deleteChat, deleteChatHistory, getChatHistories, updateChatTitle } from '../utils';
import 'rc-trigger/assets/index.css';

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(50%);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const ChatHistoryContentCon = styled(ScrollView)`
  width: 100%;
  height: 100%;
  background: #fff;
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
      color: #757575;
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
      color: #151515;
      .updateTime {
        margin-left: 6px;
        font-size: 12px;
        color: #9e9e9e;
      }
      &:hover {
        background: #f5f5f5;
      }
      &.active {
        background: #f0f8ff;
      }
      .operateIcon {
        width: 24px;
        height: 24px;
        border-radius: 3px;
        background: #fff;
        font-size: 14px;
        color: #757575;
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
      color: #9e9e9e;
      text-align: center;
    }
  }
`;

const Con = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  .chatHistoryContent {
    animation: ${slideUp} 0.3s ease-in-out;
    height: calc(100% - 64px);
    border-radius: 12px 12px 0 0;
  }
`;

function ChatHistoryItem({ item, currentChatId, onClick = () => {}, onRename = () => {}, onDelete = () => {} }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const itemRef = useRef(null);
  const cache = useRef({});
  useClickAway(itemRef, e => {
    if (e.target.closest('.MenuItem')) {
      return;
    }
    setMenuVisible(false);
  });
  return (
    <div
      className={cx('chatHistoryItem t-flex t-items-center t-space-between', {
        active: currentChatId && item.chatId === currentChatId,
        hasMenu: menuVisible,
      })}
      onClick={onClick}
      ref={itemRef}
    >
      <div className="name ellipsis t-flex-1">{item.title}</div>
      <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>
      <div onClick={e => e.stopPropagation()}>
        <Trigger
          popupVisible={menuVisible}
          onPopupVisibleChange={setMenuVisible}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 6],
            overflow: { adjustY: true, adjustX: true },
          }}
          popup={
            <Menu className="Relative">
              <MenuItem
                onClick={() => {
                  setMenuVisible(false);
                  Dialog.confirm({
                    title: _l('重命名对话'),
                    width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                    description: (
                      <Input
                        autoFocus
                        placeholder={_l('请输入对话名称')}
                        className="w100 Gray"
                        defaultValue={item.title}
                        manualRef={ref => (cache.current.input = ref)}
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
                }}
                icon={<Icon icon="rename_input" className="Font18 mLeft5" />}
              >
                <span className="mLeft10">{_l('重命名')}</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuVisible(false);
                  window.open(`/mingo/share/${item.chatId}`, '_blank');
                }}
                icon={<Icon icon="share" className="Font18 mLeft5" />}
              >
                <span className="mLeft10">{_l('分享')}</span>
              </MenuItem>
              <MenuItem
                icon={<Icon icon="trash" className="Font18 mLeft5" style={{ color: '#F44336' }} />}
                onClick={() => {
                  setMenuVisible(false);
                  Dialog.confirm({
                    title: <span style={{ color: '#F44336', fontWeight: 'bold' }}>{_l('确定删除该对话')}</span>,
                    width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                    description: _l('删除后，聊天记录将不可恢复'),
                    buttonType: 'danger',
                    onOk: () => {
                      onDelete(item.chatId);
                    },
                  });
                }}
              >
                <span className="mLeft10" style={{ color: '#F44336' }}>
                  {_l('删除')}
                </span>
              </MenuItem>
            </Menu>
          }
        >
          <span className="operateIcon" onClick={e => e.stopPropagation()}>
            <i className="icon icon-more_horiz Font18 Gray_9e Hand" />
          </span>
        </Trigger>
      </div>
    </div>
  );
}

export const ChatHistoryContent = forwardRef(function ChatHistoryContent(
  {
    isLand,
    className,
    currentChatId,
    setDocumentTitle,
    header = null,
    showHeader = true,
    onClose = () => {},
    onSelect = () => {},
  },
  ref,
) {
  useImperativeHandle(ref, () => ({
    appendChatItem: chatItem => {
      setHistories([chatItem, ...histories]);
    },
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [histories, setHistories] = useState();
  useEffect(() => {
    getChatHistories().then(data => {
      window.mingoChatHistories = data;
      setHistories((data || []).sort((a, b) => b.updateTime - a.updateTime));
      setIsLoading(false);
      if (setDocumentTitle && currentChatId) {
        const newTitle = find(histories, { chatId: currentChatId })?.title;
        if (newTitle) {
          document.title = newTitle;
        }
      }
    });
  }, []);
  return (
    <ChatHistoryContentCon className={cx('chatHistoryContent', className)} onClick={e => e.stopPropagation()}>
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
            style={{ maxWidth: 800, margin: '0 auto', padding: '0 10px' }}
            widths={[100, '100%', '100%', '50%']}
          />
        ) : (
          <Fragment>
            {!histories.length && <div className="emptyStatus">{_l('暂无历史记录')}</div>}
            {!!histories.length &&
              histories.map((item, i) => (
                <ChatHistoryItem
                  isLand={isLand}
                  key={i}
                  item={item}
                  currentChatId={currentChatId}
                  onClick={() => {
                    onSelect(item);
                    if (setDocumentTitle && item.title) {
                      document.title = item.title;
                    }
                  }}
                  onDelete={async () => {
                    await deleteChat(item.chatId);
                    await deleteChatHistory(item.chatId);
                    setHistories(histories.filter(history => history.chatId !== item.chatId));
                    if (currentChatId === item.chatId && isLand) {
                      navigateTo('/mingo');
                    }
                  }}
                  onRename={async newTitle => {
                    await updateChatTitle(item.chatId, newTitle);
                    setHistories(
                      histories.map(history =>
                        item.chatId === history.chatId ? { ...history, title: newTitle } : history,
                      ),
                    );
                  }}
                />
              ))}
          </Fragment>
        )}
      </div>
    </ChatHistoryContentCon>
  );
});

export default function ChatHistoryPopup(props) {
  return (
    <Con className="t-flex t-items-end" onClick={props.onClose}>
      <ChatHistoryContent {...props} />
    </Con>
  );
}

ChatHistoryPopup.propTypes = {
  currentChatId: PropTypes.string,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};
