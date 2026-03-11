import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { get, isFunction } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 } from 'uuid';
import { Skeleton } from 'ming-ui';
import ResponseError from 'src/components/Mingo/ChatBot/components/ResponseError';
import previewAttachments, { transformQiniuUrl } from 'src/components/previewAttachments/previewAttachments';
import { AI_FEATURE_TYPE } from 'src/utils/enum';
import { generateParamsForPrompt, getMessageList, saveMessageList } from '../util';
import AutoHeightInput from './AutoHeightInput';
import { MESSAGE_TYPE } from './enum';
import LoadingDots from './LoadingDots';
import Markdown from './Markdown';
import UploadImage from './UploadImage';
import useChatBot from './useChat';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-primary);
  height: 100%;
  padding-top: 12px;
  .code-card {
    margin-bottom: 10px;
    font-size: 12px;
    width: 260px;
    background-color: var(--color-background-primary);
    border-radius: 8px;
    box-shadow: inset 0 0 0 2px rgba(189, 189, 189, 0.2);
    position: relative;
    padding: 10px 20px;
    .title {
      font-weight: bold;
      color: var(--color-text-title);
    }
    .file-name {
      margin-top: 2px;
      color: var(--color-text-secondary);
    }
  }

  @keyframes borderGlow {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 0%;
    }
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const MessageWrapper = styled.div`
  padding: 6px 17px 18px;
`;

const Message = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0 16px;
  cursor: ${props => (props.loading ? 'default' : 'pointer')};
  // &.active {
  //   border: 1px solid var(--color-primary);
  // }
`;

const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--color-mingo-transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-primary);
  flex-shrink: 0;
  overflow: hidden;
  .icon-ai1 {
    font-size: 14px;
    color: var(--color-white);
  }
  img {
    width: 100%;
    height: 100%;
  }
`;

const TextContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

const InputContainer = styled.div`
  position: relative;
  padding-top: 12px;
`;

const InputWrapper = styled.div`
  position: relative;
  margin: 0 17px;
  font-size: 0px;
  padding: 4px 0;
  border-radius: 5px;
  border: 1px solid var(--color-border-primary);
  &.focused {
    border-color: var(--color-primary);
  }
`;

const Input = styled(AutoHeightInput)`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    width: 6px;
    height: 6px;
    background: rgba(187, 187, 187, 0.4);
  }
`;

const SendTools = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
`;

const SendButton = styled.div`
  cursor: pointer;
  color: var(--color-primary);
  font-size: 20px;
  line-height: 1em;
  &.disabled {
    color: var(--color-text-placeholder);
    cursor: default;
  }
`;
const AbortButton = styled.div`
  position: absolute;
  bottom: 11px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: 24px;
  background-color: var(--color-background-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  .square {
    width: 8px;
    height: 8px;
    border-radius: 1px;
    background-color: var(--color-background-primary);
  }
  &:hover {
    background-color: var(--color-background-inverse);
  }
`;

const Footer = styled.div`
  height: 40px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  padding: 0 17px;
  > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const ScrollToBottomButton = styled.div`
  margin-top: -40px;
  position: absolute;
  right: 17px;
  font-size: 18px;
  color: var(--color-text-title);
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: var(--color-background-primary);
  border: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  animation: fadeIn 100ms ease-in forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

function MessageListLoading() {
  return (
    <div style={{ padding: 10 }}>
      <Skeleton
        style={{ flex: 1 }}
        direction="column"
        widths={['30%', '40%', '90%', '60%']}
        active
        itemStyle={{ marginBottom: '4px' }}
      />
      <Skeleton
        style={{ flex: 1 }}
        direction="column"
        widths={['40%', '55%', '100%', '80%']}
        active
        itemStyle={{ marginBottom: '4px' }}
      />
      <Skeleton
        style={{ flex: 2 }}
        direction="column"
        widths={['45%', '100%', '100%', '100%']}
        active
        itemStyle={{ marginBottom: '4px' }}
      />
    </div>
  );
}

function ChatLLM(
  {
    env,
    control,
    freeId,
    worksheetId,
    currentCode,
    showEmptyHolder,
    onCodeUpdate = () => {},
    onCodeCardClick = () => {},
    setLlmIsGenerating = () => {},
  },
  ref,
) {
  const messageStoreId = freeId || control.controlId;
  const cache = useRef({});
  const uploadImageRef = useRef(null);
  const [messageListLoading, setMessageListLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState();
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const isRefValue = control.type === 54;
  const handleSaveMessageList = useCallback(newMessages => {
    const filteredMessages = newMessages.filter(m => m.type !== MESSAGE_TYPE.SHOW_NOT_SEND);
    saveMessageList({
      worksheetId,
      messageStoreId,
      messageList: [filteredMessages[0], ...filteredMessages.slice(1).slice(-9)],
    });
  }, []);
  const paramsForPrompt = useMemo(
    () => generateParamsForPrompt({ envControls: env.controls, isRefValue, control }),
    [env.controls, isRefValue, control],
  );
  const {
    activeMessageId,
    messages,
    input,
    setInput,
    sendMessage,
    loading,
    isRequesting,
    abortRequest,
    clearMessages,
    setCurrentCode,
    setMessages,
    setFirstInputMessage,
  } = useChatBot({
    params: paramsForPrompt,
    onMessageDone: handleSaveMessageList,
    currentCode,
    defaultMessages: [
      {
        role: 'assistant',
        type: MESSAGE_TYPE.SHOW_NOT_SEND,
        content: _l(
          '请向我描述您想要实现的字段功能，我将为你生成代码。你可以在左侧实时预览代码效果，也可以向我追加提问修改代码或者提供报错信息让我协助排查问题。',
        ),
      },
    ],
    onError: (error, eventData) => {
      setError({
        errorMsg: _l('模型调用失败'),
        sourceData: eventData,
      });
    },
  });
  const [inputIsFocused, setInputIsFocused] = useState(false);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [dropElementId] = useState(v4());
  const messagesContainerRef = useRef(null);
  const updateScrollToBottomButtonVisible = useCallback(() => {
    setScrollToBottomVisible(
      messagesContainerRef.current.scrollHeight -
        messagesContainerRef.current.scrollTop -
        messagesContainerRef.current.clientHeight >=
        120,
    );
  }, [messagesContainerRef]);

  useImperativeHandle(ref, () => ({
    sendMessage,
    setInput,
  }));

  useEffect(() => {
    setLlmIsGenerating(loading);
  }, [loading]);

  useEffect(() => {
    if (
      messagesContainerRef.current.scrollHeight -
        messagesContainerRef.current.scrollTop -
        messagesContainerRef.current.clientHeight <
      120
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleMessageClick = useCallback(
    e => {
      e.stopPropagation();
      if (loading) return;
      const $codeCard = e.target.closest('.code-card');
      if ($codeCard) {
        const messageId = $codeCard.dataset.messageId;
        onCodeCardClick(messageId);
      } else if (e.target.tagName.toLowerCase() === 'img') {
        previewAttachments(transformQiniuUrl(e.target.src, { ext: 'png' }));
      }
    },
    [loading],
  );

  const handleSubmit = e => {
    e.preventDefault();
    sendMessage(input, {
      noCode: showEmptyHolder,
      imageUrl: uploadedImageUrl,
    });
    if (isFunction(get(uploadImageRef, 'current.clear'))) {
      uploadImageRef.current.clear();
      setUploadedImageUrl('');
    }
    setTimeout(() => {
      inputRef.current.focus();
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      updateScrollToBottomButtonVisible();
    }
  }, [messagesContainerRef.current]);

  useEffect(() => {
    setCurrentCode(currentCode);
  }, [currentCode]);

  useEffect(() => {
    getMessageList({
      worksheetId,
      messageStoreId,
    }).then(res => {
      if (res && res.messageList) {
        setMessages(prev => [...prev, ...res.messageList]);
        if (res.messageList[0] && res.messageList[0].content) {
          setFirstInputMessage(res.messageList[0].content);
        }
      }
      setMessageListLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView();
      }, 0);
    });
  }, []);

  return (
    <Container>
      <MessagesContainer ref={messagesContainerRef} onScroll={updateScrollToBottomButtonVisible}>
        <MessageWrapper onClick={handleMessageClick}>
          {!!messageListLoading && <MessageListLoading />}
          {!messageListLoading &&
            messages
              .filter(m => m.role !== 'system')
              .map((message, index) => (
                <Message key={index} className={cx({ active: activeMessageId === message.id, loading })}>
                  <Avatar role={message.role}>
                    {message.role === 'assistant' ? (
                      <i className="icon icon-ai1" />
                    ) : (
                      <img src={get(md, 'global.Account.avatar')} alt="User" />
                    )}
                  </Avatar>
                  <TextContainer>
                    <Markdown
                      id={message.id}
                      content={message.content}
                      isStreaming={activeMessageId === message.id}
                      codeIsClosed={message.codeIsClosed}
                      onAiCodeUpdate={onCodeUpdate}
                    />
                    {!!error && message.role === 'assistant' && index === messages.length - 1 && (
                      <ResponseError
                        style={{ marginTop: 0 }}
                        aiFeatureType={AI_FEATURE_TYPE.CODEGEN_TABLE_FIELDS}
                        error={error}
                        showFeedback
                      />
                    )}
                  </TextContainer>
                </Message>
              ))}
          {isRequesting && (
            <Message>
              <Avatar role="assistant">
                <i className="icon icon-ai1" />
              </Avatar>
              <TextContainer>
                <LoadingDots />
              </TextContainer>
            </Message>
          )}
          <div ref={messagesEndRef} />
        </MessageWrapper>
      </MessagesContainer>

      <InputContainer>
        {scrollToBottomVisible && (
          <ScrollToBottomButton onClick={() => messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })}>
            <i className="icon icon-arrow-down-border" />
          </ScrollToBottomButton>
        )}
        <InputWrapper className={inputIsFocused ? 'focused' : ''}>
          <Input
            autoFocus
            setRef={ref => {
              inputRef.current = ref;
            }}
            id={dropElementId}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputIsFocused(true)}
            onBlur={() => setInputIsFocused(false)}
            onKeyDown={e => {
              if (e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                setInput(old => old + '\n');
                return;
              }
              if (e.key === 'Enter' && !cache.current.isOnComposition) {
                e.preventDefault();
                if (!loading) {
                  handleSubmit(e);
                }
              }
            }}
            onCompositionStart={() => {
              cache.current.isOnComposition = true;
            }}
            onCompositionEnd={() => {
              cache.current.isOnComposition = false;
            }}
          />
          <SendTools>
            <UploadImage
              ref={uploadImageRef}
              dropElementId={dropElementId}
              dropElement={inputRef.current}
              onBegin={() => {
                setUploadedImageUrl(null);
                setIsUploadingImage(true);
              }}
              onUploaded={url => {
                setUploadedImageUrl(url);
                setIsUploadingImage(false);
              }}
              onError={() => {
                setUploadedImageUrl(null);
                setIsUploadingImage(false);
              }}
            />
            {loading ? (
              <AbortButton
                onClick={() => {
                  abortRequest();
                  inputRef.current.focus();
                }}
              >
                <span className="square"></span>
              </AbortButton>
            ) : (
              <SendButton
                className={!input.trim() || isUploadingImage ? 'disabled' : ''}
                onClick={!input.trim() ? null : handleSubmit}
              >
                <i className="icon icon-sending" />
              </SendButton>
            )}
          </SendTools>
        </InputWrapper>
        <Footer>
          <div
            className="Hand"
            onClick={() => {
              clearMessages();
              setMessageListLoading(true);
              saveMessageList({
                worksheetId,
                messageStoreId,
                messageList: [],
              }).then(() => {
                setMessageListLoading(false);
              });
            }}
          >
            <i className="icon icon-cleaning_services textTertiary Font16" />
            <span className="textSecondary mLeft6">{_l('清除对话')}</span>
          </div>
          {/* <div className="Hand mLeft12">
            <i className="icon icon-wait textTertiary Font17" />
            <span className="textSecondary mLeft6">237 / 200</span>
          </div> */}
          <div className="flex"></div>
          <div>{_l('内容由 AI 生成，可能存在错误，仅供参考')}</div>
        </Footer>
      </InputContainer>
    </Container>
  );
}

ChatLLM.propTypes = {
  onCodeUpdate: PropTypes.func,
};

export default forwardRef(ChatLLM);
