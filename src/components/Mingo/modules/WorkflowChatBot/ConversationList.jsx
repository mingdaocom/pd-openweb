import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import { find } from 'lodash';
import styled from 'styled-components';
import ChatItemList from 'src/components/Mingo/ChatBot/components/ChatItemList';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import Share from 'src/pages/worksheet/components/Share';
import { emitter } from 'src/utils/common';

const ConversationListCon = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
  .conversationListTitle {
    padding: 0 20px;
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
  }
  .chatItemList {
    background: var(--color-background-primary);
    .loadingSkeleton {
      background: var(--color-background-primary);
      li {
        background: var(--color-background-secondary);
      }
    }
  }
  .chatHistoryList {
    background: var(--color-background-primary);
    .chatHistoryItem {
      color: var(--color-text-primary);
    }
  }

  .chatItemList.isMobile {
    .chatHistoryItem {
      padding: 0 5px;
      .name {
        font-size: 15px;
        font-weight: bold;
      }
    }
  }
  .chatItemList:not(.isMobile) {
    .chatHistoryItem {
      &:hover,
      &.active {
        background: var(--color-background-hover);
      }
    }
  }
`;

const NewConversationButton = styled.div`
  cursor: pointer;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  font-size: 13px;
  border: 1px solid var(--color-border-primary);
  border-radius: 40px;
  margin: 0 10px 20px;
  flex-shrink: 0;
  .icon {
    font-size: 18px;
    color: var(--app-primary-color);
    margin-right: 5px;
  }
  &:hover {
    background: var(--color-background-hover);
  }
`;

function ConversationList({
  name,
  appId,
  isMobile,
  isCharge,
  allowShareChat,
  chatbotId,
  currentConversationId,
  onSelect = () => {},
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationList, setConversationList] = useState([]);
  const [newCreatedConversationId, setNewCreatedConversationId] = useState();
  const [shareChatItem, setShareChatItem] = useState(null);
  const handleLoadConversationList = useCallback(
    ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }
      chatbotAjax.getConversationList({ chatbotId }, { isReadableStream: false }).then(res => {
        setConversationList(res);
        setIsLoading(false);
      });
    },
    [chatbotId],
  );
  const handleUpdateConversation = useCallback(conversation => {
    if (conversation.chatbotId !== chatbotId) {
      return;
    }
    setConversationList(prev => {
      const matchedConversation = find(prev, { conversationId: conversation.conversationId });
      if (!matchedConversation) {
        setNewCreatedConversationId(conversation.conversationId);
      }
      return matchedConversation
        ? prev.map(item =>
            item.conversationId === conversation.conversationId ? { ...item, title: conversation.title } : item,
          )
        : [
            {
              ...conversation,
              ctime: new Date().getTime(),
            },
            ...prev,
          ];
    });
  }, []);
  useEffect(() => {
    handleLoadConversationList();
  }, [chatbotId]);
  useEffect(() => {
    emitter.on('CHATBOT_SOCKET_UPDATE_CONVERSATION', handleUpdateConversation);
    return () => {
      emitter.off('CHATBOT_SOCKET_UPDATE_CONVERSATION', () => handleUpdateConversation);
    };
  }, []);
  return (
    <ConversationListCon className={cx('t-flex t-flex-col')}>
      {!isMobile && (
        <NewConversationButton
          onClick={() => {
            onSelect(undefined);
          }}
        >
          <i className="icon icon-new_chat"></i>
          {_l('新对话')}
        </NewConversationButton>
      )}
      <div className="t-flex-1 t-flex t-flex-col overflowHidden">
        {!isMobile && <div className="conversationListTitle">{_l('对话')}</div>}
        <div className="t-flex-1 pBottom5 overflowHidden">
          <ChatItemList
            isMobile={isMobile}
            allowShareChat={allowShareChat}
            isLoading={isLoading}
            currentChatId={newCreatedConversationId || currentConversationId}
            chatListData={conversationList.map(conversation => ({
              title: conversation.title,
              chatId: conversation.conversationId,
              updateTime: conversation.ctime,
              conversation,
            }))}
            appId={appId}
            onSelect={item => {
              setNewCreatedConversationId(undefined);
              onSelect(item.chatId);
            }}
            onRename={(newTitle, item) => {
              chatbotAjax.updateConversation({ chatbotId, conversationId: item.chatId, title: newTitle }).then(() => {
                setConversationList(
                  conversationList.map(conversation =>
                    conversation.conversationId === item.chatId ? { ...conversation, title: newTitle } : conversation,
                  ),
                );
              });
            }}
            onShare={item => {
              setShareChatItem(item);
            }}
            onDelete={item => {
              chatbotAjax.clearConversation({ chatbotId, conversationId: item.chatId, deleted: true }).then(() => {
                setConversationList(
                  conversationList.filter(conversation => conversation.conversationId !== item.chatId),
                );
                alert(_l('删除成功'));
                onSelect(undefined);
              });
            }}
          />
        </div>
      </div>
      {shareChatItem && (
        <Share
          title={_l('分享会话: %0', shareChatItem.title)}
          from="chatbot"
          isCustomShare
          isCharge={isCharge}
          privateShare={false}
          params={{
            appId,
            sourceId: `${chatbotId}|${shareChatItem.chatId}`,
            worksheetId: chatbotId,
            title: shareChatItem.title,
          }}
          onClose={() => setShareChatItem(null)}
        />
      )}
    </ConversationListCon>
  );
}

export default ConversationList;
