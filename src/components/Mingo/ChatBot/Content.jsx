import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { find, get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { BgIconButton } from 'ming-ui';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { navigateTo } from 'src/router/navigateTo';
import { SpeechSynthesizer } from 'src/utils/audio';
import { FAST_GPT_CONFIG } from 'src/utils/enum';
import ChatHistory from './components/ChatHistory';
import MessageList from './components/MessageList';
import MingoFeatureEntry from './components/MingoFeatureEntry';
import Send from './components/Send';
import {
  batchDeleteMessage,
  convertFastGptMessageToOpenAI,
  getRecommendMessage,
  insertChatHistory,
  loadChat,
  updateChatHistory,
} from './utils';

const MingoContentWrap = styled.div`
  padding: 0 0 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .sectionName {
    font-weight: bold;
    margin: 26px 0 6px;
    font-size: 15px;
    color: #151515;
  }
  .sendCon {
    position: relative;
    padding: 0 16px;
    margin: 0 auto;
    width: 100%;
    .abort-button {
      position: absolute;
      top: -30px;
      left: calc(50% - 35px);
    }
    .sendHeader {
      height: 38px;
    }
    .helpTitle {
      margin: 0px;
    }
  }
`;
function MingoContent(props, ref) {
  const {
    disabled = false,
    isLand,
    chatItem,
    className,
    maxWidth,
    infoLoading = false,
    hideHistoryButton = false,
    updateIsChatting = () => {},
    onNewChatClick,
    onNewChat = () => {},
    onInsertChatHistory = () => {},
    defaultIsChatting = false,
    messageListHeader = null,
    allowEdit = false,
    onUpdateChatId = () => {},
  } = props;
  const cache = useRef({});
  const messageListRef = useRef(null);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState(false);
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [isLoadingChat, setIsLoadingChat] = useState(!!chatItem || !!props.currentChatId);
  const [chatId, setChatId] = useState();
  const [isLoadingRecommendMessage, setIsLoadingRecommendMessage] = useState(true);
  const [recommendMessage, setRecommendMessage] = useState([]);
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  // const config = FAST_GPT_CONFIG_DEV;
  const config = FAST_GPT_CONFIG;
  const loadRecommendMessage = useCallback(chatId => {
    if (window.isMingoShare || !chatId) return;
    setIsLoadingRecommendMessage(true);
    getRecommendMessage(chatId).then(data => {
      setRecommendMessage(data);
      setIsLoadingRecommendMessage(false);
    });
  }, []);
  const { messages, sendMessage, loading, isRequesting, abortRequest, clearMessages, setMessages } = useChat({
    aiCompletionApi: async (messages, { abortController }) => {
      const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          chatId: cache.current.currentChatId,
          stream: true,
          messages: messages.filter(item => item.role === 'user').slice(-1),
        }),
        signal: abortController?.signal,
      });
      // const response = await fetch(`https://open.bigmodel.cn/api/paas/v4/chat/completions`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer b5594bd02439803dcac87d6c4260e7f7.Q6j00jxYghrwOyWJ`,
      //   },
      //   body: JSON.stringify({
      //     model: 'glm-4-flash',
      //     messages,
      //     stream: true,
      //   }),
      //   signal: abortController?.signal,
      // });
      return response;
    },
    endCodeTag: 'questions',
    batchDeleteMessage: messageIds => {
      batchDeleteMessage(chatId, messageIds);
    },
    onMessagePipe: messageContent => {
      if (cache.current.autoPlay) {
        speechSynthesizer.current.speakStream(messageContent);
      }
    },
    onEndCodeEnd: endContent => {
      console.log('onEndCodeEnd', endContent);
    },
    onMessageDone: () => {
      const chatId = cache.current.currentChatId;
      setIsChatting('onMessageDone', false);
      cache.current.autoPlay = false;
      updateChatHistory(chatId, { title: cache.current.currentChatItem?.title, updateTime: new Date().getTime() });
      // 更新最新一对消息的 id
      const loadAbortController = new AbortController();
      cache.current.loadAbortController = loadAbortController;
      loadChat(chatId, { signal: loadAbortController.signal, pageSize: 2 }).then(res => {
        if (loadAbortController.signal.aborted) {
          return;
        }
        const list = res?.data?.list || [];
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].id = list[0]?.dataId;
          newMessages[newMessages.length - 2].id = list[1]?.dataId;
          return newMessages;
        });
      });
      // 获取试一试
      loadRecommendMessage(chatId);
    },
  });
  const handleSend = (newMessage, { fromMessageId } = {}) => {
    setRecommendMessage([]);
    if (!messages.length) {
      const newChatId = chatId || uuidv4();
      updateChatId(newChatId);
      insertChatHistory(newChatId, newMessage);
      onInsertChatHistory({
        chatId: newChatId,
        title: newMessage,
        updateTime: new Date().getTime(),
      });
      cache.current.currentChatItem = {
        chatId: newChatId,
        title: newMessage,
      };
    }
    setIsChatting(true);
    sendMessage(newMessage, { fromMessageId });
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollToBottom();
      }
    }, 100);
  };
  const handleNewChat = useCallback(() => {
    abortRequest();
    clearMessages();
    const newChatId = uuidv4();
    updateChatId(newChatId);
    onNewChat(newChatId);
    if (cache.current.loadAbortController) {
      cache.current.loadAbortController.abort();
    }
  }, [abortRequest, clearMessages, onNewChat, updateChatId]);
  const handleLoadChat = useCallback((chatItem, { silent = false } = {}) => {
    const { chatId } = chatItem;
    abortRequest();
    if (!silent) {
      clearMessages();
    }
    setIsChatHistoryVisible(false);

    // 终止上一次的 load 请求
    if (cache.current.loadAbortController) {
      cache.current.loadAbortController.abort();
    }

    // 创建新的 AbortController
    const loadAbortController = new AbortController();
    cache.current.loadAbortController = loadAbortController;

    updateChatId(chatId);
    cache.current.currentChatItem = chatItem;
    if (!cache?.current?.currentChatItem?.title) {
      const matchedItem = find(window.mingoChatHistories || [], { chatId });
      if (matchedItem) {
        cache.current.currentChatItem = matchedItem;
      }
    }
    setIsChatting(true);
    if (!silent) {
      setIsLoadingChat(true);
    }
    loadChat(chatId, { signal: loadAbortController.signal }).then(res => {
      if (!res?.data?.list?.length) {
        setIsLoadingChat(false);
        if (isLand && !window.isMingoShare) {
          navigateTo('/mingo');
        }
        return;
      }
      if (loadAbortController.signal.aborted) {
        return;
      }
      try {
        const newMessages = get(res, 'data.list', []).map(item => ({
          id: item.dataId,
          role: item.obj === 'AI' ? 'assistant' : 'user',
          content: convertFastGptMessageToOpenAI(item.value),
        }));
        setMessages(newMessages);
        setIsLoadingChat(false);
        // 获取试一试
        loadRecommendMessage(chatId);
      } catch (error) {
        console.error(error);
      }
    });
  }, []);
  function updateChatId(newChatId) {
    setChatId(newChatId);
    cache.current.currentChatId = newChatId;
    if (!newChatId || get(cache.current, 'currentChatItem.chatId') !== newChatId) {
      cache.current.currentChatItem = null;
    }
  }
  useImperativeHandle(ref, () => ({
    destroy: () => {
      abortRequest();
      clearMessages();
      // 终止正在进行的 load 请求
      if (cache.current.loadAbortController) {
        cache.current.loadAbortController.abort();
      }
      updateChatId();
      setIsChatting(false);
      setIsLoadingChat(false);
      setIsChatHistoryVisible(false);
      cache.current = {};
    },
    newChat: handleNewChat,
  }));
  useEffect(() => {
    if (props.currentChatId && cache.current.currentChatId !== props.currentChatId) {
      handleLoadChat({ chatId: props.currentChatId });
    } else if (cache.current.currentChatId && !props.currentChatId) {
      handleNewChat();
    }
  }, [props.currentChatId]);
  useEffect(() => {
    cache.current.currentChatId = chatId;
    onUpdateChatId(chatId);
  }, [chatId]);
  useEffect(() => {
    updateIsChatting(isChatting);
  }, [isChatting]);
  return (
    <MingoContentWrap className={className}>
      {isChatting ? (
        <MessageList
          allowEdit={allowEdit}
          maxWidth={maxWidth}
          loading={loading}
          isLoadingRecommendMessage={isLoadingRecommendMessage}
          recommendMessage={recommendMessage}
          messageListHeader={messageListHeader}
          isRequesting={isRequesting}
          isLoadingChat={isLoadingChat || infoLoading}
          messages={messages}
          ref={messageListRef}
          onSend={handleSend}
        />
      ) : (
        <MingoFeatureEntry />
      )}
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <div className="sendHeader t-flex t-flex-row t-items-center t-space-between">
            {!isChatting && <div className="sectionName helpTitle">{_l('使用帮助')}</div>}
            <div className={cx('sendHeaderCon t-flex t-flex-row t-items-center', isChatting && 'w100 t-space-between')}>
              <BgIconButton
                className="mRight10"
                icon="book"
                text={_l('帮助文档')}
                onClick={() => {
                  window.open(md.global.Config.HelpUrl || 'https://help.mingdao.com');
                }}
              />
              <div className="t-flex t-flex-row t-items-center">
                {!hideHistoryButton && (
                  <BgIconButton
                    icon="access_time"
                    tooltip={_l('历史记录')}
                    popupPlacement="top"
                    onClick={() => setIsChatHistoryVisible(true)}
                  />
                )}
                {isChatting && (
                  <BgIconButton
                    className="mLeft10"
                    popupPlacement="top"
                    tooltip={_l('新对话')}
                    icon="newchat"
                    iconStyle={{ color: 'var(--ai-primary-color)' }}
                    onClick={onNewChatClick || handleNewChat}
                  />
                )}
              </div>
            </div>
          </div>
          <Send
            chatId={chatId}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={abortRequest}
            setAutoPlay={value => {
              cache.current.autoPlay = value;
            }}
            onSend={handleSend}
          />
        </div>
      )}
      {isChatHistoryVisible && (
        <ChatHistory
          currentChatId={chatId}
          onClose={() => setIsChatHistoryVisible(false)}
          onSelect={(chatItem, ...args) => {
            if (isLand) {
              navigateTo(`/mingo/chat/${chatItem.chatId}`);
            } else {
              handleLoadChat(chatItem, ...args);
            }
          }}
        />
      )}
    </MingoContentWrap>
  );
}

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
  chatItem: PropTypes.shape({}),
};

export default forwardRef(MingoContent);
