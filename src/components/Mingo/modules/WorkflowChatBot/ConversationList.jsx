import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { find } from 'lodash';
import styled from 'styled-components';
import SharePopup from 'mobile/components/SharePopup';
import ChatItemList from 'src/components/Mingo/ChatBot/components/ChatItemList';
import { buildChatbotShareProps } from 'src/components/Mingo/modules/chatbotShare';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import Share from 'src/pages/worksheet/components/Share';
import { emitter } from 'src/utils/platform/browser/dom';

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
    .hap-skeleton {
      background: var(--color-background-primary);
      .hap-skeleton-paragraph > li {
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
  appId,
  // 与对话区分享一致：可见范围按应用所属组织提交，缺省会回退到「当前组织」
  projectId,
  isMobile,
  isCharge,
  allowShareChat,
  chatbotId,
  currentConversationId,
  onSelect = () => {},
  onNewConversation = () => {},
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationList, setConversationList] = useState([]);
  const [newCreatedConversationId, setNewCreatedConversationId] = useState();
  const [shareChatItem, setShareChatItem] = useState(null);
  const refreshedConversationIdRef = useRef();
  // socket 订阅只随 chatbotId 变化，回调用 ref 兜住，避免外层每次 render 重建函数导致反复解绑重订
  const onNewConversationRef = useRef(onNewConversation);
  // socket 回调闭包里的列表是旧值，判断会话是否已在列表需读 ref 里的当前值
  const conversationListRef = useRef(conversationList);
  // 校验中的会话 id：同一会话的标题推送可能连发多次，校验期间的重复推送直接跳过
  const verifyingConversationIdsRef = useRef(new Set());
  const handleShareConversation = item => setShareChatItem(item);
  const conversationShareProps = shareChatItem
    ? buildChatbotShareProps({
        appId,
        chatbotId,
        conversationId: shareChatItem.chatId,
        title: shareChatItem.title,
        projectId,
        isCharge,
      })
    : null;
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
  const handleUpdateConversation = useCallback(
    conversation => {
      if (conversation.chatbotId !== chatbotId) {
        return;
      }

      if (find(conversationListRef.current, { conversationId: conversation.conversationId })) {
        setConversationList(prev =>
          prev.map(item =>
            item.conversationId === conversation.conversationId ? { ...item, title: conversation.title } : item,
          ),
        );
        return;
      }

      // 列表中不存在的会话不能凭推送体直接插入：删除会话不会终止服务端在途的回复/标题生成任务，
      // 任务收尾回写会产生一个只有标题、没有任何消息的空会话并推送到这里，直插会让被删的对话
      // 「复活」成一条点开是空白新对话页、还能分享的幽灵记录。先查一条消息确认是真实会话再插入；
      // 正常新会话的标题即由首条消息生成，推送到达时消息已可查到。极小概率校验时消息尚未落库，
      // URL 同步会话 id 后的补拉副作用会把这条会话找回，可接受。
      if (verifyingConversationIdsRef.current.has(conversation.conversationId)) {
        return;
      }

      verifyingConversationIdsRef.current.add(conversation.conversationId);
      chatbotAjax
        .getMessageList(
          { chatbotId, conversationId: conversation.conversationId, pageIndex: 1, pageSize: 1 },
          { customParseResponse: true, silent: true },
        )
        .then(res => {
          // 信封口径与对话区拉消息一致：status=0 为会话不可访问（已删除/无权），data 为消息数组
          const { status, data } = res || {};

          if (Number(status) === 0 || !Array.isArray(data) || !data.length) {
            return;
          }

          setConversationList(prev =>
            // 校验期间列表可能已通过补拉拿到这条会话，再判一次防止重复插入
            find(prev, { conversationId: conversation.conversationId })
              ? prev
              : [{ ...conversation, ctime: new Date().getTime() }, ...prev],
          );
          setNewCreatedConversationId(conversation.conversationId);
          // 服务端生成标题的推送常早于流式响应下发 conversationId。列表这时已把这条新会话当成当前会话
          // （高亮 + 「更多」里可分享），同步告知外层，避免顶部分享还灰着、两处状态打架。
          onNewConversationRef.current(conversation.conversationId);
        })
        .catch(() => {})
        .finally(() => {
          verifyingConversationIdsRef.current.delete(conversation.conversationId);
        });
    },
    [chatbotId],
  );
  useEffect(() => {
    onNewConversationRef.current = onNewConversation;
  }, [onNewConversation]);
  useEffect(() => {
    conversationListRef.current = conversationList;
  }, [conversationList]);
  useEffect(() => {
    handleLoadConversationList();
  }, [handleLoadConversationList]);
  useEffect(() => {
    emitter.on('CHATBOT_SOCKET_UPDATE_CONVERSATION', handleUpdateConversation);
    return () => emitter.off('CHATBOT_SOCKET_UPDATE_CONVERSATION', handleUpdateConversation);
  }, [handleUpdateConversation]);
  // 新建会话没有服务端推送，列表只在挂载时拉过一次。对话区一旦拿到新会话 id 就会同步到 URL，
  // 这里据此补拉：新建对话、从分享页「继续对话」后首次发消息都会走到。
  // 每个 id 只补一次，避免会话确实查不到时反复空转。
  useEffect(() => {
    if (isLoading || !currentConversationId || refreshedConversationIdRef.current === currentConversationId) {
      return;
    }

    if (find(conversationList, { conversationId: currentConversationId })) {
      return;
    }

    refreshedConversationIdRef.current = currentConversationId;
    // 不复用 handleLoadConversationList：那条路会在 effect 内同步切 loading 态，列表会闪一下骨架屏
    chatbotAjax.getConversationList({ chatbotId }, { isReadableStream: false }).then(setConversationList);
  }, [isLoading, currentConversationId, conversationList, chatbotId]);
  return (
    <ConversationListCon className={cx('t-flex t-flex-col')}>
      {!isMobile && (
        <NewConversationButton
          onClick={() => {
            setNewCreatedConversationId(undefined);
            // 已处于空会话 URL（如发送报错未生成 conversationId）时，navigate 到同一地址不会变更路由，
            // 对话区的重置副作用不会触发，需主动广播事件让对话区清空重置。
            if (!currentConversationId) {
              emitter.emit('CHATBOT_NEW_CONVERSATION', { chatbotId });
            }

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
            onShare={handleShareConversation}
            onDelete={item => {
              chatbotAjax.clearConversation({ chatbotId, conversationId: item.chatId, deleted: true }).then(() => {
                setConversationList(
                  conversationList.filter(conversation => conversation.conversationId !== item.chatId),
                );
                alert(_l('删除成功'));
                // 回到新对话空态。AI 还在回复时会话 id 未必已同步到 URL，navigate 到同一地址不会触发
                // 对话区的重置副作用，需主动广播；它同时会中断在途的流式请求，
                // 否则删除后 AI 的回复仍会写回页面，回完还能分享一条已被删除的对话。
                emitter.emit('CHATBOT_NEW_CONVERSATION', { chatbotId });
                onSelect(undefined);
              });
            }}
          />
        </div>
      </div>
      {shareChatItem &&
        (isMobile ? (
          <SharePopup {...conversationShareProps} onClose={() => setShareChatItem(null)} />
        ) : (
          <Share {...conversationShareProps} onClose={() => setShareChatItem(null)} />
        ))}
    </ConversationListCon>
  );
}

export default ConversationList;
