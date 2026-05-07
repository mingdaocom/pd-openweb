import React, { forwardRef, Fragment, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { assign, find, get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { BgIconButton, Modal, Support } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import ShareUrl from 'worksheet/components/ShareUrl';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { navigateTo } from 'src/router/navigateTo';
import { SpeechSynthesizer } from 'src/utils/audio';
import { emitter } from 'src/utils/common';
import { browserIsMobile } from 'src/utils/common';
import { FAST_GPT_CONFIG } from 'src/utils/enum';
import ChatHistory from '../../ChatBot/components/ChatHistory';
import MessageList from '../../ChatBot/components/MessageList';
import MingoWelcome from '../../ChatBot/components/MingoWelcome';
import Send from '../../ChatBot/components/Send';
import TryTry from '../../ChatBot/components/TryTry';
import {
  batchDeleteMessage,
  convertFastGptMessageToOpenAI,
  getContentFromMessage,
  getRecommendMessage,
  insertChatHistory,
  loadChat,
  updateChatHistory,
} from '../../ChatBot/utils';

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
    color: var(--color-text-primary);
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
    onNewChat = () => {},
    onInsertChatHistory = () => {},
    defaultIsChatting = false,
    messageListHeader = null,
    allowEdit = false,
    onUpdateChatId = () => {},
    onUpdateTaskType = () => {},
    onUpdateBase = () => {},
  } = props;
  const cache = useRef({});
  const messageListRef = useRef(null);
  const [isChatHistoryVisible, setIsChatHistoryVisible] = useState(false);
  const [shareIdForHelp, setShareIdForHelp] = useState();
  const [callFromHelp, setCallFromHelp] = useState(!!props.callFromHelp);
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [isLoadingChat, setIsLoadingChat] = useState(!!chatItem || !!props.currentChatId);
  const [chatId, setChatId] = useState();
  const [isLoadingRecommendMessage, setIsLoadingRecommendMessage] = useState(true);
  const [recommendMessage, setRecommendMessage] = useState([]);
  const [chatRecordId, setChatRecordId] = useState();
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
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
      insertChatHistory(newChatId, newMessage).then(chatRecordId => {
        if (chatRecordId) {
          setChatRecordId(chatRecordId);
        }
      });
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
        if (location.search?.includes('from=share')) {
          cache.current.currentChatItem = assign({}, cache.current.currentChatItem, {
            title: getContentFromMessage(newMessages[0]?.content),
          });
        }

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
  const handleStartPendingTask = useCallback(() => {
    if (window.mingoPendingStartTask) {
      if (window.mingoPendingStartTask.base) {
        onUpdateBase(window.mingoPendingStartTask.base);
      }

      setIsChatting(true);
      updateIsChatting(true);
      if (typeof window.mingoPendingStartTask?.callFromHelp === 'boolean') {
        setCallFromHelp(window.mingoPendingStartTask?.callFromHelp);
        window.mingoPendingStartTask = null;
        return;
      }

      onUpdateTaskType(window.mingoPendingStartTask.type);
      window.mingoPendingStartTask = null;
    }
  }, [onUpdateTaskType]);
  const handleCallHelp = useCallback(url => {
    if (window.md_js && window.md_js.customerService) {
      window.md_js.customerService(
        url
          ? {
              message: url,
            }
          : {},
      );
    } else {
      emitter.emit('SET_MINGO_VISIBLE', { mingoVisible: false });
      if (window.mdCustomerServiceOpen) {
        window.mdCustomerServiceOpen();
      }
    }
  }, []);
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
  useEffect(() => {
    handleStartPendingTask();
  }, []);
  if (window.mingoPendingStartTask) {
    return null;
  }

  return (
    <MingoContentWrap className={className}>
      {isChatting ? (
        <MessageList
          allowRegenerate
          allowEdit={allowEdit}
          maxWidth={maxWidth}
          loading={loading}
          isRequesting={isRequesting}
          isLoadingChat={isLoadingChat || infoLoading}
          messages={messages}
          ref={messageListRef}
          messageListHeader={messageListHeader}
          messageRecommendComp={
            <Fragment>
              <div className="messageContent">{_l('您好，HAP中有任何使用问题，都可以向我提问')}</div>
              <TryTry onSelect={handleSend} />
            </Fragment>
          }
          lastAssistantMessageFooterComp={
            !isLoadingRecommendMessage &&
            !!messages.length &&
            !!recommendMessage.length && <TryTry onSelect={handleSend} data={recommendMessage} />
          }
          onSend={handleSend}
        />
      ) : (
        <MingoWelcome
          onStartTask={task => {
            setIsChatting(true);
            updateIsChatting(true);
            onUpdateTaskType(task.type);
          }}
        />
      )}
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <div className="sendHeader t-flex t-flex-row t-items-center t-space-between">
            {!isChatting && <div className="sectionName helpTitle">{_l('使用帮助')}</div>}
            <div className={cx('sendHeaderCon t-flex t-flex-row t-items-center', isChatting && 'w100 t-space-between')}>
              <Support href="https://help.mingdao.com">
                <BgIconButton className="mRight10" icon="book" text={_l('帮助文档')} />
              </Support>
              <div className="t-flex t-flex-row t-items-center">
                {callFromHelp && (
                  <BgIconButton
                    className="mRight10"
                    icon="support_agent"
                    tooltip={_l('人工客服')}
                    onClick={() => {
                      // 呼出链接复制分享层
                      if (chatId) {
                        appManagementApi
                          .editEntityShareStatus({
                            sourceId: chatRecordId,
                            sourceType: 73,
                            status: 1,
                          })
                          .then(res => {
                            const shareId = get(res, 'appEntityShare.id');
                            setShareIdForHelp(shareId);
                          });
                      } else {
                        handleCallHelp();
                      }
                    }}
                  />
                )}
                {!hideHistoryButton && (
                  <BgIconButton
                    icon="access_time"
                    tooltip={_l('历史记录')}
                    popupPlacement="top"
                    onClick={() => setIsChatHistoryVisible(true)}
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
            sendHeader={!isChatting && <TryTry className="try-try-con" onSelect={handleSend} />}
          />
        </div>
      )}
      {isChatHistoryVisible && (
        <ChatHistory
          currentChatId={chatId}
          allowShareChat={!!get(md, 'global.Account.accountId')}
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
      {!!shareIdForHelp && (
        <Modal
          visible
          width={660}
          footer={null}
          title={<b>{_l('分享')}</b>}
          onCancel={() => setShareIdForHelp(undefined)}
        >
          <div className="mBottom10 textTertiary" style={{ marginTop: -15 }}>
            {_l('将当前会话链接分享给人工客服')}
          </div>
          <ShareUrl
            theme="light"
            copyShowText
            url={`${location.origin}/public/mingo/${shareIdForHelp}?help=true`}
            copyText={browserIsMobile() ? _l('复制并前往') : _l('复制')}
            qrVisible={false}
            allowSendToChat={false}
            getCopyContent={url => {
              setShareIdForHelp(undefined);
              handleCallHelp(url);
              return url;
            }}
          />
        </Modal>
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
