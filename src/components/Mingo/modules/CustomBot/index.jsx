import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import sseAjax from 'src/api/sse';
import useChat from 'src/pages/worksheet/hooks/useChat';
import { SpeechSynthesizer } from 'src/utils/audio';
import MessageList from '../../ChatBot/components/MessageList';
import Send from '../../ChatBot/components/Send';

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
    className,
    maxWidth,
    infoLoading = false,
    defaultIsChatting = false,
    updateIsChatting = () => {},
    allowEdit = false,
    taskType,
  } = props;
  const messageListRef = useRef(null);
  const cache = useRef({});
  const [isChatting, setIsChatting] = useState(defaultIsChatting);
  const speechSynthesizer = useRef(new SpeechSynthesizer({ bufferDelay: 2000 }));
  const { messages, sendMessage, loading, activeMessageId, isRequesting, abortRequest, clearMessages } = useChat({
    aiCompletionApi: async (messages, { abortController }) => {
      return sseAjax.buildWorkSheet(
        {
          appId: 'ab228e89-afd6-4aa1-b0f5-5aeb285bdb94',
          messageList: [
            {
              role: 'system',
              content: '你是一个智能助手，请根据用户的问题给出回答。',
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
  });
  const handleScrollToBottom = useCallback(({ timeout = 0 } = {}) => {
    if (messageListRef.current) {
      messageListRef.current.scrollToBottom();
      setTimeout(() => {
        messageListRef.current.scrollToBottom();
      }, timeout);
    }
  }, []);
  const handleSend = (newMessage, { fromMessageId } = {}) => {
    setIsChatting(true);
    sendMessage(newMessage, { fromMessageId });
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
        messages={messages.filter(item => !item.hidden)}
        ref={messageListRef}
        onSend={handleSend}
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

MingoContent.propTypes = {
  className: PropTypes.string,
  maxWidth: PropTypes.number,
  updateIsChatting: PropTypes.func.isRequired,
};

export default forwardRef(MingoContent);
