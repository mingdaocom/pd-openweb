import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import { chain, findLast, findLastIndex, flatten, get, identity, isArray, isEmpty, omit } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import processApi from 'src/pages/workflow/api/process';
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import chatbotSSEApi from 'src/pages/workflow/apiV2/chatbotsse';
import { getToolName } from 'src/pages/workflow/WorkflowSettings/utils';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { SpeechSynthesizer } from 'src/utils/audio';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import Guide from './Guide';
import { filterToolCalls, renderToolCalls } from './ToolCalls';

const MingoContentWrap = styled.div`
  height: 100%;
  padding: 0 0 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
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
    background: #fff;
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
  &.isMobile {
    .welcomeText {
      font-size: 17px;
      font-weight: bold;
    }
    .try-tip {
      font-size: 14px !important;
      color: #757575 !important;
      margin-bottom: 12px !important;
    }
    .presetQuestions {
      gap: 8px;
      .presetQuestion {
        height: 40px;
        line-height: 38px;
        padding: 0 12px;
        font-size: 14px;
        font-weight: 500;
        &:hover {
          background: inherit;
        }
      }
    }
  }
`;

const ChatBotHeader = styled.div`
  margin: 16px 0 10px;
  .welcomeText {
    font-size: 15px;
    color: #333;
  }
  .tryTry {
    margin-top: 15px;
    .try-tip {
      font-size: 13px;
      color: #9e9e9e;
      margin-bottom: 10px;
    }
  }
  .presetQuestions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .presetQuestion {
      font-size: 14px;
      color: #152525;
      cursor: pointer;
      border-radius: 36px;
      height: 36px;
      line-height: 34px;
      padding: 0 16px;
      border: 1px solid #eaeaea;
      &:hover {
        background: #f4f4f4;
      }
    }
  }
`;

const ToolCallsCon = styled.div`
  margin-top: 10px;
  .tool-calls-message-fold {
    transition: transform 0.3s ease-in;
    transform: rotate(180deg);
    &.folded {
      transform: rotate(0deg);
    }
  }
`;

const OperateHeader = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

function contentIsEmpty(content) {
  if (content === '') return true;
  if (isArray(content)) {
    return (
      content.filter(item => {
        if (item.type === 'text' && item.text === '') return;
        if (item.type === 'tool_calls' && filterToolCalls(item.toolCalls).length === 0) return;
        return true;
      }).length === 0
    );
  }
  return false;
}

function getContentOfMessage(message) {
  let content = isArray(message.content)
    ? message.content
    : [
        {
          type: 'text',
          text: message.content,
        },
      ];
  const toolMap = message.tool_map || {};
  const filteredToolCalls = filterToolCalls(message.tool_calls || []);
  if (!isEmpty(filteredToolCalls)) {
    content = [
      ...content,
      {
        type: 'tool_calls',
        toolCalls: filteredToolCalls.map(toolCall => ({ function: toolCall, toolName: toolMap[toolCall.id] })),
      },
    ];
  }
  return content;
}

export function formatMessage(message) {
  if (!['user', 'assistant'].includes(message.role)) {
    return;
  }
  const result = {};
  result.id = get(message, 'metadata.id');
  result.instanceId = message.instanceId;
  result.workId = message.workId;
  result.role = message.role === 'user' ? 'user' : 'assistant';
  result.content = message.role === 'user' ? message.content : getContentOfMessage(message);
  result.media = message.media;
  result.hasSubmit = message.hasSubmit;
  result.modelMessageId = get(message, 'metadata.id');
  if (isEmpty(result.content) && isEmpty(result.media)) {
    return;
  }
  return result;
}

export function formatMessages(messages) {
  let result = [];
  chain(messages.map(message => ({ ...message, workId: message.workId || message.id })))
    .groupBy('workId')
    .map(items => items)
    .value()
    .forEach(messages => {
      if (messages.length === 1) {
        result.push(formatMessage(messages[0]));
      } else {
        const content = [];
        messages = messages.filter(message => message.role === 'assistant');
        messages.forEach(message => {
          content.push(getContentOfMessage(message));
        });
        result.push({
          ...formatMessage(messages[0]),
          content: flatten(content),
        });
      }
    });
  return result;
}

function getLoadingText(name = '') {
  const toolName = getToolName(name);
  if (toolName) {
    return _l('正在调用工具：%0', toolName);
  }
  return _l('思考中');
}

function MingoContent(props, ref) {
  const {
    chatbotId,
    isMobile,
    isTest,
    showOperateHeader = false,
    disabled = false,
    showMessagesOnly = false,
    className,
    maxWidth,
    infoLoading = false,
    defaultIsChatting = false,
    allowEdit = false,
    defaultMessages = [],
    messageListHeader,
    updateIsChatting = () => {},
    onOpenMessageLog = () => {},
    onGenerateConversation = () => {},
    onClose = () => {},
  } = props;
  const shareId = new URLSearchParams(window.location.search).get('share');
  const messageListRef = useRef(null);
  const sendRef = useRef(null);
  const cache = useRef({});
  const [isGuideVisible, setIsGuideVisible] = useState(!!sessionStorage.getItem(`chatbotNewCreate-${chatbotId}`));
  const [loadingStatus, setLoadingStatus] = useState();
  const [conversationId, setConversationId] = useState(props.conversationId);
  const [isLoadingMessages, setIsLoadingMessages] = useState(!!props.conversationId && !showMessagesOnly);
  const [error, setError] = useState();
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [isExecutingToolCalls, setIsExecutingToolCalls] = useState(false);
  const [{ name, iconUrl, welcomeText, presetQuestion, uploadPermission = '11' }, setChatbotConfig] = useState(
    props.chatbotConfig || {},
  );
  const presetQuestionsList = presetQuestion?.split('\n').filter(item => item.trim()) || [];
  const showChatBotHeader = !!welcomeText || !!presetQuestionsList.length;
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const {
    messages,
    sendMessage,
    loading,
    activeMessageId,
    handleFetch,
    isRequesting,
    abortRequest,
    clearMessages,
    confirmToolCalls,
    setMessages,
    setLoading,
    setIsRequesting,
  } = useChat({
    defaultMessages,
    aiCompletionApi: async (messages, { prevUserMessageId, toolMessageId, abortController }) => {
      return chatbotSSEApi.chat(
        {
          chatbotId: chatbotId,
          conversationId,
          messages: messages.slice(-1).map(item => {
            const result = omit(item, ['id']);
            if (result.role === 'user') {
              delete result.media;
            }
            return result;
          }),
          prevUserMessageId,
          toolMessageId,
          ...(isTest ? { pushUniqueId: get(md, 'global.Config.pushUniqueId'), debugEvents: [-1, 0, 1, 2, 3] } : {}),
        },
        {
          abortController,
          isReadableStream: true,
          noAccountIdHeader: true,
        },
      );
    },
    onMessagePipe: (messageContent, messageData) => {
      setIsExecutingToolCalls(false);
      if (cache.current.autoPlay) {
        speechSynthesizer.current.speakStream(messageContent);
      }
      if (!cache.current.conversationId && messageData.conversationId) {
        setConversationId(messageData.conversationId);
        cache.current.conversationId = messageData.conversationId;
        cache.current.needSetGenerateConversation = messageData.conversationId;
      }
      if (messageData.step === 'TOOL') {
        setLoadingStatus({ statusText: getLoadingText(messageData.name), type: 'TOOL' });
      } else {
        setLoadingStatus({});
      }
    },
    onMessageDone: (messages = []) => {
      if (cache.current.needSetGenerateConversation) {
        onGenerateConversation(cache.current.needSetGenerateConversation);
        cache.current.needSetGenerateConversation = undefined;
      }
      setLoadingStatus();
      console.log('onMessageDone', messages);
    },
    onError: (error, eventData) => {
      if (safeParse(eventData)?.code !== 'UNKNOWN') {
        setError(error);
      } else {
        setError({
          errorMsg: _l('模型调用失败'),
          sourceData: eventData,
        });
      }
    },
  });
  const handleScrollToBottom = useCallback(({ timeout = 0 } = {}) => {
    if (messageListRef.current) {
      messageListRef.current.scrollToBottom();
      setTimeout(() => {
        messageListRef.current.scrollToBottom();
      }, timeout);
    }
  }, []);
  const loadMoreMessages = useCallback(() => {
    // 只有在已经滚动到底部后，才允许加载更多
    if (cache.current.isLoadingMore || !hasMore || !conversationId || !hasScrolledToBottom) return;

    setIsLoadingMore(true);
    cache.current.isLoadingMore = true;
    const nextPageIndex = pageIndex + 1;

    // 保存当前滚动高度
    const scrollViewInfo = messageListRef.current?.scrollViewRef?.current?.getScrollInfo();
    const oldScrollHeight = scrollViewInfo?.scrollHeight || 0;

    chatbotAjax
      .getMessageList({
        chatbotId,
        conversationId,
        pageIndex: nextPageIndex,
        pageSize: 50,
      })
      .then(getMessageListData => {
        const newMessages = formatMessages(
          getMessageListData.sort((a, b) => new Date(a.ctime) - new Date(b.ctime)),
        ).filter(identity);

        if (newMessages.length < 50) {
          setHasMore(false);
        }
        setMessages(prev => [...newMessages, ...prev]);
        setPageIndex(nextPageIndex);

        // 恢复滚动位置，避免跳动
        setTimeout(() => {
          const newScrollViewInfo = messageListRef.current?.scrollViewRef?.current?.getScrollInfo();
          const newScrollHeight = newScrollViewInfo?.scrollHeight || 0;
          const scrollDiff = newScrollHeight - oldScrollHeight;
          if (scrollDiff > 0 && messageListRef.current?.scrollViewRef?.current) {
            messageListRef.current.scrollViewRef.current.scrollTo({ top: scrollDiff });
          }
        }, 10);
      })
      .finally(() => {
        setIsLoadingMore(false);
        cache.current.isLoadingMore = false;
      });
  }, [isLoadingMore, hasMore, conversationId, pageIndex, chatbotId, hasScrolledToBottom]);
  const handleSend = (newMessage, { fromMessageId, files = [], originMessageForRegenerate } = {}) => {
    if (sessionStorage.getItem(`chatbotNewCreate-${chatbotId}`)) {
      handleHideGuide();
    }
    setError();
    setIsChatting(true);
    setHasScrolledToBottom(true);
    sendMessage(newMessage, {
      fromMessageId,
      media: files.map(file => file.commonAttachment),
      fileIds: files.map(file => file.ocrId),
      originMessageForRegenerate,
    });
    setTimeout(() => {
      handleScrollToBottom();
    }, 100);
  };
  useImperativeHandle(ref, () => ({
    destroy: () => {
      abortRequest();
      clearMessages();
      // 终止正在进行的 load 请求
      if (cache.current.loadAbortController) {
        cache.current.loadAbortController.abort();
      }
      setIsChatting(false);
      cache.current = {};
    },
  }));
  const handleHideGuide = useCallback(() => {
    setIsGuideVisible(false);
    sessionStorage.removeItem(`chatbotNewCreate-${chatbotId}`);
  }, []);
  useEffect(() => {
    if (showMessagesOnly) return;
    setError();
    abortRequest();
    setLoadingStatus();
    if (props.conversationId || shareId) {
      if (props.conversationId == cache.current.conversationId && !shareId) return;

      setIsLoadingMessages(true);
      setPageIndex(1);
      setHasMore(false);
      setHasScrolledToBottom(false);
      let conversationIdForShare;
      Promise.all(
        (isEmpty(props.chatbotConfig) ? [processApi.getChatbotConfig({ chatbotId })] : [{}]).concat([
          shareId
            ? chatbotAjax.shareToConversation({ chatbotId, shareConversationId: shareId }).then(res => {
                conversationIdForShare = res.conversationId;
                return res.messages;
              })
            : chatbotAjax.getMessageList({
                chatbotId,
                conversationId: props.conversationId,
                pageIndex: 1,
                pageSize: 50,
              }),
        ]),
      ).then(([chatbotConfigData, getMessageListData]) => {
        if (!isEmpty(chatbotConfigData)) {
          setChatbotConfig(chatbotConfigData);
        }
        setConversationId(shareId ? conversationIdForShare : props.conversationId);
        if (!shareId) {
          cache.current.conversationId = props.conversationId;
        }
        const formattedMessages = formatMessages(
          getMessageListData.sort((a, b) => new Date(a.ctime) - new Date(b.ctime)),
        ).filter(identity);
        setMessages(formattedMessages);
        // 如果返回的消息数量小于pageSize，说明没有更多消息了
        setHasMore(getMessageListData.length === 50);
        setIsLoadingMessages(false);
        // 延迟设置已滚动到底部的标记，确保初始滚动完成
        setTimeout(() => {
          setHasScrolledToBottom(true);
        }, 500);
      });
    } else {
      setMessages([]);
      setConversationId(undefined);
      cache.current.conversationId = undefined;
      setPageIndex(1);
      setHasMore(true);
      setHasScrolledToBottom(false);
      if (!isMobile) {
        sendRef.current && sendRef.current.focus();
      }
    }
    cache.current.prevConversionId = props.conversationId;
  }, [props.conversationId, shareId]);
  useEffect(() => {
    if (!isEmpty(props.chatbotConfig)) {
      setChatbotConfig(props.chatbotConfig);
      if (cache.current.didMount) {
        handleHideGuide();
      }
    }
  }, [props.chatbotConfig]);
  useEffect(() => {
    updateIsChatting(isChatting);
  }, [isChatting]);
  useEffect(() => {
    cache.current.didMount = true;
  }, []);
  return (
    <MingoContentWrap className={cx(className, { isMobile })}>
      {showOperateHeader && (
        <OperateHeader>
          <span />
          <BgIconButton.Group gap={10}>
            {!!messages.length && (
              <BgIconButton
                icon="clean"
                title={_l('清空')}
                onClick={() => {
                  // cleanMessages();
                  setError();
                  chatbotAjax.clearConversation({ chatbotId, conversationId }).then(() => {
                    setMessages([]);
                    setHasScrolledToBottom(false);
                  });
                }}
              />
            )}
            <BgIconButton
              icon="close"
              title={_l('关闭')}
              onClick={() => {
                onClose();
              }}
            />
          </BgIconButton.Group>
        </OperateHeader>
      )}
      <MessageList
        loading={loading}
        isMobile={isMobile}
        allowRegenerate={!showMessagesOnly}
        useAppThemeColor
        lastMessageShowTool={isTest}
        showTokenUsage={isTest}
        showFeedback={!isTest && !showMessagesOnly}
        listContentStyle={{ paddingTop: 0 }}
        activeMessageId={activeMessageId}
        assistantName={name}
        assistantAvatar={iconUrl || chatBotDefaultIcon}
        showAssistantAvatar={false}
        assistantOperatesPlacement="bottom"
        allowEdit={allowEdit}
        maxWidth={maxWidth}
        isRequesting={isRequesting}
        isExecutingToolCalls={isExecutingToolCalls}
        isLoadingChat={infoLoading || isLoadingMessages}
        onScrollToTop={loadMoreMessages}
        isLoadingMore={isLoadingMore}
        messages={messages.filter(item => {
          if (item.hidden) return false;
          if (contentIsEmpty(item.content) && isEmpty(item.media)) return false;
          return true;
        })}
        messageListHeader={messageListHeader}
        openMessageLog={({ messageId, instanceId, workId }) => {
          onOpenMessageLog({
            chatbotId,
            conversationId,
            messageId,
            instanceId,
            workId,
          });
        }}
        messageRecommendComp={
          showChatBotHeader && (
            <ChatBotHeader>
              {welcomeText && <div className="welcomeText">{welcomeText}</div>}
              {!!presetQuestionsList.length && (
                <div className="tryTry">
                  <div className="try-tip">{_l('试一试')}</div>
                  <div className="presetQuestions">
                    {presetQuestionsList.map(item => (
                      <div
                        key={item}
                        className="presetQuestion ellipsis"
                        onClick={() => {
                          if (window.isPublicApp) return;
                          handleSend(item);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChatBotHeader>
          )
        }
        errorComp={
          error ? (
            <ResponseError
              showFeedback={!!error?.sourceData}
              aiFeatureType={AI_FEATURE_TYPE.AGENT_SMART_PICK}
              error={error}
              onRetry={() => {
                setError();
                const lastUserMessage = findLast(messages, item => item.role === 'user');
                handleSend(lastUserMessage.content, {
                  fromMessageId: lastUserMessage.id,
                });
              }}
            />
          ) : null
        }
        loadingStatus={loadingStatus}
        renderToolCalls={(
          toolCalls,
          { messageId, modelMessageId, needConfirm, isLastAssistantMessage, isLastPart },
        ) => {
          const filteredToolCalls = filterToolCalls(toolCalls);
          if (isEmpty(filteredToolCalls)) {
            return null;
          }
          return (
            <ToolCallsCon>
              <div className="tool-calls-message t-flex t-flex-row t-items-center t-space-between">
                {needConfirm && isLastAssistantMessage ? _l('将执行以下操作，请确认：') : <span />}
              </div>
              {renderToolCalls(toolCalls, {
                chatbotId,
                conversationId,
                messageId,
                needConfirm: needConfirm && isLastAssistantMessage && isLastPart,
                confirmToolCalls: () => {
                  setIsExecutingToolCalls(true);
                  setMessages(prev => {
                    confirmToolCalls({ messages: prev, toolMessageId: modelMessageId });
                    return prev.map(item => {
                      if (item.id === messageId) {
                        return { ...item, hasSubmit: false };
                      }
                      return item;
                    });
                  });
                },
              })}
            </ToolCallsCon>
          );
        }}
        ref={messageListRef}
        onSend={handleSend}
        chatbotId={chatbotId}
        handleRegenerate={async ({ messageId }) => {
          const { prevUserMessageId } = await chatbotAjax.resetConversation({
            chatbotId,
            conversationId,
            messageId,
          });
          setIsRequesting(true);
          setLoading(true);
          setMessages(prev => {
            const messageIndex = findLastIndex(
              prev,
              item => item.id === messageId || item.modelMessageId === messageId,
            );
            const newMessages = [...prev.slice(0, messageIndex)];
            return newMessages;
          });
          handleFetch([], { prevUserMessageId });
        }}
      />
      {!disabled && !showMessagesOnly && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          {isGuideVisible && <Guide style={{ position: 'absolute', marginTop: -60 }} />}
          <Send
            isMobile={isMobile}
            needOcr
            useAppThemeColor
            chatbotId={chatbotId}
            conversationId={conversationId}
            allowUpload={uploadPermission !== '00'}
            uploadFileToolTip={
              {
                11: _l('支持图片和文档类型的附件：PNG、JPG、JPEG、PDF、Word、Excel。一次消息最多上传 5 个附件'),
                '01': _l('仅支持文档类型的附件：PDF、Word、Excel。一次消息最多上传 5 个附件'),
                10: _l('仅支持图片类型的附件：PNG、JPG、JPEG。一次消息最多上传 5 个附件'),
              }[uploadPermission]
            }
            allowMimeTypes={
              {
                11: [
                  { title: 'image', extensions: 'jpg,jpeg,png' },
                  { title: 'office', extensions: 'pdf,doc,docx,xls,xlsx' },
                ],
                '01': [{ title: 'office', extensions: 'pdf,doc,docx,xls,xlsx' }],
                10: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
              }[uploadPermission]
            }
            ref={sendRef}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={(...args) => {
              abortRequest(...args);
              if (!cache.current.conversationId) {
                setMessages([]);
              }
            }}
            setAutoPlay={value => {
              cache.current.autoPlay = value;
            }}
            onSend={handleSend}
          />
        </div>
      )}
    </MingoContentWrap>
  );
}

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
};

export default forwardRef(MingoContent);
