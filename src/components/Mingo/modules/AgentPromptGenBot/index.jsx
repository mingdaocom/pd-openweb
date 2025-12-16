import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { isFunction } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import sseAjax from 'src/api/sse';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { SpeechSynthesizer } from 'src/utils/audio';
import { emitter } from 'src/utils/common';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import MessageList from '../../ChatBot/components/MessageList';
import ResponseError from '../../ChatBot/components/ResponseError';
import Send from '../../ChatBot/components/Send';
import { MINGO_TASK_TYPE } from '../../ChatBot/enum';
import ResultConfirm from './ResultConfirm';

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

function AgentPromptGenBot(props, ref) {
  const {
    disabled = false,
    className,
    maxWidth,
    infoLoading = false,
    defaultIsChatting = false,
    updateIsChatting = () => {},
    allowEdit = false,
    taskType,
    onBack = () => {},
  } = props;
  const messageListRef = useRef(null);
  const cache = useRef({});
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const [error, setError] = useState();
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  const { messages, sendMessage, loading, activeMessageId, isRequesting, abortRequest, clearMessages } = useChat({
    aiCompletionApi: async (messages, { abortController }) => {
      const {
        userLanguage = '',
        nodeName = '',
        nodeDescription = '',
        existingPrompt = '',
      } = cache.current?.params || {};
      return sseAjax.generateAgentPrompt(
        {
          messageList: [
            {
              role: 'user',
              content: `
                - userLanguage：${userLanguage}
                - nodeName：${nodeName}
                - nodeDescription：${nodeDescription}
                - existingPrompt：${existingPrompt}
              `,
            },
            ...messages,
          ],
        },
        {
          abortController,
          isReadableStream: true,
        },
      );
    },
    onMessagePipe: messageContent => {
      if (cache.current.autoPlay) {
        speechSynthesizer.current.speakStream(messageContent);
      }
    },
    onMessageDone: (messages = []) => {
      console.log('onMessageDone', messages);
    },
    onError: (error, eventData) => {
      setError({
        errorMsg: _l('模型调用失败'),
        sourceData: eventData,
      });
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
  const handleSend = (newMessage, { fromMessageId, messageOptions } = {}) => {
    setIsChatting(true);
    sendMessage(newMessage, { fromMessageId, messageOptions });
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
  useEffect(() => {
    updateIsChatting(isChatting);
  }, [isChatting]);
  useEffect(() => {
    if (window.agentPromptGenBotParams) {
      cache.current.params = window.agentPromptGenBotParams;
      window.agentPromptGenBotParams = undefined;
    }
    handleSend(_l('开始生成'), { messageOptions: { hidden: true } });
  }, []);
  return (
    <MingoContentWrap className={className}>
      <MessageList
        activeMessageId={activeMessageId}
        taskType={taskType}
        allowEdit={allowEdit}
        maxWidth={maxWidth}
        loading={loading}
        isRequesting={isRequesting}
        isLoadingChat={infoLoading}
        messages={messages}
        ref={messageListRef}
        onSend={handleSend}
        errorComp={
          error ? (
            <ResponseError aiFeatureType={AI_FEATURE_TYPE.PROMPT_FOR_AGENT_NODE} error={error} showFeedback />
          ) : null
        }
        renderCustomBlock={({ type, content, isStreaming, isLastAssistantMessage }) => {
          if (type === 'mingo_agent_prompt' && content) {
            return (
              <ResultConfirm
                disabled={!isLastAssistantMessage}
                isStreaming={isStreaming}
                content={content}
                onUse={promptText => {
                  if (isFunction(cache.current.params.onUse)) {
                    cache.current.params.onUse(promptText);
                    emitter.emit('SET_MINGO_VISIBLE', { mingoVisible: false });
                    onBack();
                  }
                }}
              />
            );
          }
          return null;
        }}
      />
      {!disabled && (
        <div className="sendCon" style={{ maxWidth: maxWidth + 16 * 2 }}>
          <Send
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
    </MingoContentWrap>
  );
}

AgentPromptGenBot.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default forwardRef(AgentPromptGenBot);

/**
 * 打开智能体提示词生成器
 * @param {Object} params - 参数
 * @param {string} params.userLanguage - 用户语言
 * @param {string} params.nodeName - 节点名称
 * @param {string} params.nodeDescription - 节点描述
 * @param {string} params.existingPrompt - 已有的提示词
 * @param {Function} params.onUse - 使用提示词回调
 * @returns {void}
 */
export function openAgentPromptGenBot(params) {
  window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CUSTOM_BOT, params };
  window.agentPromptGenBotParams = params;
  emitter.emit('SET_MINGO_VISIBLE');
}
