import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import { findLast, findLastIndex, get, identity, isEmpty, omit } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import processApi from 'src/pages/workflow/api/process';
import chatBotDefaultIcon from 'src/pages/Chatbot/assets/profile.png';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import chatbotSSEApi from 'src/pages/workflow/apiV2/chatbotsse';
import { getToolName } from 'src/pages/workflow/WorkflowSettings/utils';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { AI_FEATURE_TYPE } from 'src/utils/domain/shared/aiFeatures';
import { SpeechSynthesizer } from 'src/utils/platform/browser/audio';
import { emitter } from 'src/utils/platform/browser/dom';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import { resolveStreamError } from '../../ChatBot/utils';
import MobileShareOperate from '../MobileShareOperate';
import {
  contentIsEmpty,
  formatMessage,
  formatMessages,
  sortMessagesByCtimeAsc,
  sumPrice,
} from '../shared/messageUtils';
import { renderToolCalls } from '../shared/ToolCalls';
import { filterToolCalls } from '../shared/toolCallUtils';
import ShareOperate from '../ShareOperate';
import Guide from './Guide';

const MingoContentWrap = styled.div`
  height: 100%;
  padding: 0 0 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background-primary);
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
    background: var(--color-background-primary);
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
      color: var(--color-text-secondary) !important;
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
    color: var(--color-text-primary);
  }
  .tryTry {
    margin-top: 15px;
    .try-tip {
      font-size: 13px;
      color: var(--color-text-tertiary);
      margin-bottom: 10px;
    }
  }
  .presetQuestions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    .presetQuestion {
      font-size: 14px;
      color: var(--color-text-primary);
      cursor: pointer;
      border-radius: 36px;
      height: 36px;
      line-height: 34px;
      padding: 0 16px;
      border: 1px solid var(--color-border-secondary);
      &:hover {
        background: var(--color-background-disabled);
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

export { formatMessage, formatMessages, sortMessagesByCtimeAsc };

function getLoadingText(name = '') {
  const toolName = getToolName(name);

  if (toolName) {
    return _l('正在调用工具：%0', toolName);
  }

  return _l('思考中');
}

// 拉会话消息：取原始信封（{ status, data, msg }）自行判定。会话不存在 / 不可访问（已删除、无权访问）时
// 后端不抛异常，而是返回 status=0 + data=[]，标准契约解析只拿得到空数组，与「这个会话本来就没消息」
// 无从区分，界面会静默渲染成一个空会话。silent 关掉全局 toast，异常态交给调用方呈现。
// 返回 { unavailable, list }：只把明确的 status=0 当不可访问，其余取值一律按成功处理，避免误伤非 0/1 的信封。
function fetchMessageList(params) {
  return chatbotAjax.getMessageList(params, { customParseResponse: true, silent: true }).then(res => {
    const { status, data } = res || {};

    return { unavailable: Number(status) === 0, list: Array.isArray(data) ? data : [] };
  });
}

function MingoContent(props, ref) {
  const {
    appId,
    // 分享会话时按应用所属组织提交可见范围，缺省会回退到「当前组织」而挂错组织
    projectId,
    chatbotId,
    isCharge,
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
    onConversationUnavailable = () => {},
    onClose = () => {},
  } = props;
  const shareId = new URLSearchParams(window.location.search).get('share');
  const ShareOperateComponent = isMobile ? MobileShareOperate : ShareOperate;
  const messageListRef = useRef(null);
  const sendRef = useRef(null);
  const cache = useRef({});
  // 会话不可访问的回调不进加载副作用的依赖：调用方多是内联箭头函数，每次渲染都是新引用，
  // 进依赖会让加载会话的副作用反复重跑。每次渲染把最新回调写进 ref，用时只读 ref。
  const onConversationUnavailableRef = useRef(onConversationUnavailable);

  useEffect(() => {
    onConversationUnavailableRef.current = onConversationUnavailable;
  });
  const [isGuideVisible, setIsGuideVisible] = useState(!!sessionStorage.getItem(`chatbotNewCreate-${chatbotId}`));
  const [loadingStatus, setLoadingStatus] = useState();
  const [shareMode, setShareMode] = useState();
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
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
  const [conRef, { width }] = useMeasure();
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
            // time 是前端为展示补的本地时间（后端有自己的 ctime），不回传
            const result = omit(item, ['id', 'time']);

            if (result.role === 'user') {
              delete result.media;
            }

            return result;
          }),
          prevUserMessageId,
          toolMessageId,
          pushUniqueId: get(md, 'global.Config.pushUniqueId'),
          ...(isTest ? { debugEvents: [-1, 0, 1, 2, 3] } : {}),
        },
        {
          abortController,
          isReadableStream: true,
          noAccountIdHeader: true,
        },
      );
    },
    onMessagePipe: (messageContent, messageData, messageId) => {
      setIsExecutingToolCalls(false);
      // 定位本轮在途的助手气泡：工具调用确认后的续跑不会新建气泡（见 useChat 的 toolMessageId 分支），
      // 此时下发的 messageId 是一个列表里不存在的新 id，回退到最后一条 assistant
      const findStreamMessageIndex = list => {
        const indexById = messageId ? findLastIndex(list, item => item.id === messageId) : -1;

        return indexById === -1 ? findLastIndex(list, item => item.role === 'assistant') : indexById;
      };

      // 消息时间：后端的 ctime 要等消息落库、下次拉列表才拿得到，刚发出的提问和在途回答先用本地时间
      // 占位，刷新后由 ctime 覆盖。已经有时间的消息（含历史消息）不动
      setMessages(prev => {
        const indexes = [findStreamMessageIndex(prev), findLastIndex(prev, item => item.role === 'user')].filter(
          index => index !== -1 && !prev[index].time,
        );

        if (!indexes.length) return prev;

        const now = Date.now();

        return prev.map((item, index) => (indexes.includes(index) ? { ...item, time: now } : item));
      });

      // 信用点：一轮 LLM 调用会在多个帧上重复下发同一份 usage（price 是该轮的累计值），逐帧相加会把同一笔
      // 费用算很多次，生成中的数字远大于落库真值。这里按模型消息 id 覆盖记账、再对各轮求和，与历史消息
      // 逐条累加 metadata.price 的口径保持一致
      const price = get(messageData, 'usage.price') || 0;

      if (price > 0) {
        const priceMap = cache.current.streamPriceMap || (cache.current.streamPriceMap = {});
        priceMap[messageData.id || messageData.instanceId || 'current'] = price;
        const totalPrice = sumPrice(Object.values(priceMap));

        setMessages(prev => {
          const targetIndex = findStreamMessageIndex(prev);

          if (targetIndex === -1) return prev;

          return prev.map((item, index) => (index === targetIndex ? { ...item, price: totalPrice } : item));
        });
      }

      try {
        if (cache.current.autoPlay) {
          speechSynthesizer.current.speakStream(messageContent);
        }
      } catch (error) {
        console.error('Error speaking message:', error);
      }

      if (!cache.current.conversationId && messageData.conversationId) {
        setConversationId(messageData.conversationId);
        cache.current.conversationId = messageData.conversationId;
        // 服务端一旦下发 conversationId 立即同步到 URL（而非等到 onMessageDone）。
        // 否则中途终止或报错时 onMessageDone 不触发，URL 仍停留在空会话，
        // 点击「新对话」navigate 到同一地址不会变更路由，会话无法重置。
        onGenerateConversation(messageData.conversationId);
      }

      if (messageData.step === 'TOOL') {
        setLoadingStatus({ statusText: getLoadingText(messageData.name), type: 'TOOL' });
      } else if (messageContent) {
        // 仅在有真实回答内容时展示底部「生成中」提示。推理阶段穿插的空增量（content:null）不触发，
        // 交由气泡内推理块的「思考中」独立呈现，避免最外层再叠一个多余的 loading。
        setLoadingStatus({});
      }
    },
    onMessageDone: (messages = []) => {
      setLoadingStatus();
      console.log('onMessageDone', messages);
    },
    // 后端通过独立的 thinking / reasoning 事件下发思考/工具调用进度，这类事件没有 choices / text-delta，
    // 在 useChat 中会被提前 return，不会进入 onMessagePipe。此时首条消息尚未产生、isRequesting
    // 也已置 false，界面会出现一段空白。这里单独兜住这些事件：thinking 展示底部 loading，reasoning 交给
    // 气泡内推理块展示（清掉底部重复的 loading）。同时尽早从事件里同步 conversationId 到 URL，
    // 避免推理阶段中途报错/中止时 URL 仍停留在空会话（reasoning 不再走 onMessagePipe，需在此补上）。
    onEvent: event => {
      if (!['reasoning', 'thinking'].includes(event.event)) return;
      const data = safeParse(event.data) || {};

      if (!cache.current.conversationId && data.conversationId) {
        setConversationId(data.conversationId);
        cache.current.conversationId = data.conversationId;
        onGenerateConversation(data.conversationId);
      }

      if (event.event === 'reasoning') {
        // 推理内容已在气泡内以「思考中」实时展示，无需底部再重复 loading 提示
        setLoadingStatus();
        return;
      }

      setLoadingStatus(
        data.step === 'TOOL'
          ? { statusText: getLoadingText(data.name), type: 'TOOL' }
          : { statusText: getLoadingText(), type: 'thinking' },
      );
    },
    onError: (error, eventData) => {
      setError(resolveStreamError(error, eventData));
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

    fetchMessageList({
      chatbotId,
      conversationId,
      pageIndex: nextPageIndex,
      pageSize: 50,
    })
      .then(({ unavailable, list }) => {
        // 翻页途中会话被删 / 失权：停在已加载的内容上，不再继续往前拉
        if (unavailable) {
          setHasMore(false);
          return;
        }

        const newMessages = formatMessages(sortMessagesByCtimeAsc(list)).filter(identity);

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
    // 每轮回答的信用点单独记账，重新生成时同样从零开始
    cache.current.streamPriceMap = {};
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

  const filteredMessages = messages.filter(item => {
    if (item.hidden) return false;
    if (contentIsEmpty(item.content) && isEmpty(item.media)) return false;
    return true;
  });
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
  // 重置为「新对话」空态：清空消息、错误、会话 id 等。供「新对话」在路由不变时主动重置使用。
  const resetToNewConversation = useCallback(() => {
    setError();
    abortRequest();
    setLoadingStatus();
    setIsSelectAll(false);
    setSelectedMessageIds([]);
    setShareMode(false);
    setIsChatting(false);
    clearMessages();
    setMessages([]);
    setConversationId(undefined);
    cache.current.conversationId = undefined;
    setPageIndex(1);
    setHasMore(true);
    setHasScrolledToBottom(false);
    if (!isMobile) {
      sendRef.current && sendRef.current.focus();
    }
  }, [abortRequest, clearMessages, setMessages, isMobile]);
  // 发送报错等场景下服务端未下发 conversationId，URL 仍停留在空会话，点「新对话」navigate 到
  // 同一地址不会触发上面的 [props.conversationId] 重置副作用，需由会话列表广播事件主动重置。
  useEffect(() => {
    if (showMessagesOnly) return;
    const handleNewConversation = (payload = {}) => {
      if (payload.chatbotId && payload.chatbotId !== chatbotId) return;
      resetToNewConversation();
    };

    emitter.on('CHATBOT_NEW_CONVERSATION', handleNewConversation);
    return () => emitter.off('CHATBOT_NEW_CONVERSATION', handleNewConversation);
  }, [chatbotId, showMessagesOnly, resetToNewConversation]);
  useEffect(() => {
    if (showMessagesOnly) return;
    // URL 追平到当前进行中的会话（流式中途服务端下发 conversationId 后同步 URL 触发本副作用）：
    // 与当前会话一致，仅是路由补全，不能中断在途流或重载，提前返回。
    if (props.conversationId && props.conversationId == cache.current.conversationId && !shareId) return;
    setError();
    abortRequest();
    setLoadingStatus();
    setIsSelectAll(false);
    setSelectedMessageIds([]);
    setShareMode(false);
    if (props.conversationId || shareId) {
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
                return { unavailable: false, list: res.messages || [] };
              })
            : fetchMessageList({
                chatbotId,
                conversationId: props.conversationId,
                pageIndex: 1,
                pageSize: 50,
              }),
        ]),
      ).then(([chatbotConfigData, { unavailable, list }]) => {
        if (!isEmpty(chatbotConfigData)) {
          setChatbotConfig(chatbotConfigData);
        }

        // 会话不存在 / 无权访问：不能落成一个可继续提问的空会话，清空消息交给调用方渲染异常态
        if (unavailable) {
          setMessages([]);
          setHasMore(false);
          setIsLoadingMessages(false);
          onConversationUnavailableRef.current(props.conversationId);
          return;
        }

        setConversationId(shareId ? conversationIdForShare : props.conversationId);
        if (!shareId) {
          cache.current.conversationId = props.conversationId;
        }

        const formattedMessages = formatMessages(sortMessagesByCtimeAsc(list)).filter(identity);
        setMessages(formattedMessages);
        // 如果返回的消息数量小于pageSize，说明没有更多消息了
        setHasMore(list.length === 50);
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
    <MingoContentWrap className={cx(className, { isMobile })} ref={conRef}>
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
        width={width}
        recordInfoAppId={appId}
        recordInfoIsCharge={isCharge}
        allowShare={!get(window, 'shareState.isPublicChatbot') && !shareId && !isTest}
        shareMode={shareMode}
        isSelectAll={isSelectAll}
        selectedMessageIds={selectedMessageIds}
        setSelectedMessageIds={setSelectedMessageIds}
        loading={loading}
        isMobile={isMobile}
        allowRegenerate={!showMessagesOnly && !shareId}
        useAppThemeColor
        lastMessageShowTool={isTest}
        showTokenUsage={isTest}
        showCredits
        showTime
        foldWorkPhase
        showFeedback={!isTest && !showMessagesOnly}
        // 分享页匿名访问，附件预览与下载都要打登录态接口，点开只会报服务异常，这里直接禁掉交互
        disableAttachmentActions={showMessagesOnly}
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
        messages={filteredMessages}
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
          // 缺少会话 / 消息 id 时无法定位要重置到的位置，直接返回，避免漏传参数请求接口
          if (!conversationId || !messageId) return;

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
        setShareMode={setShareMode}
        setIsSelectAll={setIsSelectAll}
      />
      {!disabled && !showMessagesOnly && !shareMode && (
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
                10: _l('仅支持图片类型的附件：PNG、JPG、JPEG、HEIC。一次消息最多上传 5 个附件'),
              }[uploadPermission]
            }
            allowMimeTypes={
              {
                11: [
                  { title: 'image', extensions: 'jpg,jpeg,png,heic' },
                  { title: 'office', extensions: 'pdf,doc,docx,xls,xlsx' },
                ],
                '01': [{ title: 'office', extensions: 'pdf,doc,docx,xls,xlsx' }],
                10: [{ title: 'image', extensions: 'jpg,jpeg,png,heic' }],
              }[uploadPermission]
            }
            ref={sendRef}
            isChatting={isChatting}
            loading={loading}
            isRequesting={isRequesting}
            abortRequest={(...args) => {
              abortRequest(...args);
              // 主动终止时 onMessageDone 不会触发，需手动清掉思考/工具调用中的 loading 提示，否则会一直转
              setLoadingStatus();
              setIsExecutingToolCalls(false);
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
      {shareMode && (
        <ShareOperateComponent
          from="chatbot"
          appId={appId}
          projectId={projectId}
          chatbotId={chatbotId}
          conversationId={conversationId}
          isCharge={isCharge}
          messages={filteredMessages}
          selectedMessageIds={selectedMessageIds}
          setSelectedMessageIds={setSelectedMessageIds}
          maxWidth={maxWidth + 16 * 2}
          setShareMode={setShareMode}
          isSelectAll={isSelectAll}
          setIsSelectAll={setIsSelectAll}
        />
      )}
    </MingoContentWrap>
  );
}

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
  // 会话不存在 / 无权访问时回传该会话 id，由调用方决定异常态怎么展示
  onConversationUnavailable: PropTypes.func,
};

export default forwardRef(MingoContent);
