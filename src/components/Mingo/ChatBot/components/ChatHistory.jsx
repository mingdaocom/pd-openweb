import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import cx from 'classnames';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { navigateTo } from 'src/router/navigateTo';
import { deleteChat, deleteChatHistory, getChatHistories, updateChatTitle } from '../utils';
import ChatItemList from './ChatItemList';
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

export const ChatHistoryContent = forwardRef(function ChatHistoryContent(
  {
    isLand,
    className,
    currentChatId,
    allowShareChat,
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
    <ChatItemList
      className={cx('chatHistoryContent', className)}
      header={header}
      showHeader={showHeader}
      isLoading={isLoading}
      chatListData={histories}
      currentChatId={currentChatId}
      isLand={isLand}
      allowShareChat={allowShareChat}
      onClick={e => e.stopPropagation()}
      onSelect={item => {
        onSelect(item);
        if (setDocumentTitle && item.title) {
          document.title = item.title;
        }
      }}
      onDelete={async item => {
        await deleteChat(item.chatId);
        await deleteChatHistory(item.chatId);
        setHistories(histories.filter(history => history.chatId !== item.chatId));
        if (currentChatId === item.chatId && isLand) {
          navigateTo('/mingo');
        }
      }}
      onRename={async (newTitle, item) => {
        await updateChatTitle(item.chatId, newTitle);
        setHistories(
          histories.map(history => (item.chatId === history.chatId ? { ...history, title: newTitle } : history)),
        );
      }}
      onShare={item => {
        window.open(`/mingo/share/${item.chatId}`, '_blank');
      }}
      onClose={onClose}
    />
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
