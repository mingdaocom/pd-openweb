import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { findLast } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, ScrollView, Skeleton } from 'ming-ui';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import Markdown from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/Markdown';
import { SpeechSynthesizer } from 'src/utils/audio';
import { browserIsMobile } from 'src/utils/common';
import { getContentFromMessage } from '../utils';
import AutoHeightTextArea from './AutoHeightTextArea';
import PlayAnimation from './sound_animation.svg';
import TryTry from './TryTry';

const isMobile = browserIsMobile();

const MessageListWrap = styled(ScrollView)`
  flex: 1;
  padding: 0 16px;
  overflow: hidden;
  .messageListContent {
    width: 100%;
    margin: 0 auto;
    padding-top: 20px;
  }
`;

const MessageItemWrap = styled.div`
  position: relative;
  .tools {
    margin-left: 10px;
    visibility: hidden;
  }
  .user-tools {
    margin-bottom: 5px;
    visibility: hidden;
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eaeaea;
  }
  .messageContentWrap {
    display: flex;
  }
  .messageContent {
    position: relative;
    display: inline-block;
    max-width: 100%;
    padding: 8px 0;
    font-size: 15px;
    color: #151515;
    input,
    select,
    img,
    ol,
    ul,
    textarea,
    button,
    > * {
      font-size: 15px;
    }
    > ol {
      padding-left: 0px !important;
    }
    p {
      margin: 0.6em 0;
    }
  }
  .avatarName {
    margin-left: 5px;
    font-size: 14px;
    font-weight: bold;
    color: #151515;
  }
  &.isEditing,
  &.isMobile,
  &:hover {
    .tools,
    .user-tools {
      visibility: visible;
    }
  }
  &.isSmall {
    img {
      max-width: 100%;
    }
  }
  &.role-user {
    margin-bottom: 20px;
    .messageContentWrap {
      justify-content: end;
    }
    .messageContent {
      background: rgba(33, 150, 243, 0.12);
      padding: 8px 10px;
      border-radius: 5px;
    }
  }
  .is-editing-message {
    font-size: 12px;
    color: #9e9e9e;
    .icon {
      font-size: 15px;
    }
  }
`;

const MessageEditTextarea = styled(AutoHeightTextArea)`
  border: 2px solid var(--ai-primary-color) !important;
  border-radius: 5px !important;
  width: 100% !important;
  padding: 7px 12px !important;
  font-size: 14px !important;
`;

const ScrollToBottom = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 36px;
  background: #fff;
  color: #757575;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: sticky;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
  font-size: 25px;
  margin-top: -36px;
  opacity: 1;
  transition: all 0.2s ease-in-out;
  .icon {
    transform: rotate(-90deg);
  }
  &:hover {
    color: var(--ai-primary-color);
    background: #f7f0ff;
  }
  &.fadeOut {
    opacity: 0;
    pointer-events: none;
  }
`;

function MessageItem({
  id,
  content,
  role,
  isLastAssistantMessage,
  allowEdit = true,
  handleSendFromMessage = () => {},
  tryComp,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [messageTempValue, setMessageTempValue] = useState(getContentFromMessage(content).replace(/\n$/g, ''));
  const messageContentRef = useRef(null);
  const speechSynthesizer = useRef(new SpeechSynthesizer());
  const sendMessageFromMessage = useCallback(
    ({ isRegenerate = false } = {}) => {
      if (!messageTempValue.trim() && !isRegenerate) return;
      handleSendFromMessage({
        content: messageTempValue,
        messageId: id,
        isRegenerate,
      });
      setIsEditing(false);
    },
    [id, handleSendFromMessage, messageTempValue],
  );
  useEffect(() => {
    return () => {
      speechSynthesizer.current.clear();
    };
  }, []);
  return (
    <MessageItemWrap
      key={id}
      className={cx('user-message-item role-' + role, {
        isEditing: role === 'user' && isEditing,
        isMobile,
        isSmall: window.innerWidth < 500,
      })}
      data-id={id}
      style={
        isLastAssistantMessage
          ? {
              minHeight: 'calc(100dvh - 336px)',
            }
          : {}
      }
    >
      {role === 'assistant' && (
        <div className="assistantHeader t-flex t-items-center">
          <img src={mingoHead} className="avatar" alt="" />
          <div className="avatarName">Mingo</div>
          <div className="tools">
            <BgIconButton.Group gap={6}>
              <BgIconButton
                size="small"
                icon="copy_custom"
                popupPlacement="top"
                tooltip={_l('复制')}
                onClick={() => {
                  copy(getContentFromMessage(content));
                  alert(_l('复制成功'));
                }}
              />
              <BgIconButton
                size="small"
                icon="bofang"
                iconComponent={isPlaying ? <img width={16} height={16} src={PlayAnimation} alt="" /> : null}
                iconStyle={isPlaying ? { color: 'var(--ai-primary-color)' } : {}}
                popupPlacement="top"
                tooltip={isPlaying ? _l('停止朗读') : _l('朗读')}
                onClick={() => {
                  if (isPlaying) {
                    speechSynthesizer.current.clear();
                    setIsPlaying(false);
                    return;
                  }
                  const text = getContentFromMessage(content);
                  speechSynthesizer.current.speak(text.replace(/#/g, ''), {
                    onEnd: () => {
                      setIsPlaying(false);
                    },
                  });
                  setIsPlaying(true);
                }}
              />
              {!window.isMingoShare && (
                <BgIconButton
                  size="small"
                  icon="ic_refresh_black"
                  popupPlacement="top"
                  tooltip={_l('重新生成')}
                  onClick={() => {
                    sendMessageFromMessage({ isRegenerate: true });
                  }}
                />
              )}
            </BgIconButton.Group>
          </div>
        </div>
      )}
      {role === 'user' && (
        <div className="user-tools t-flex t-items-center t-justify-between">
          <div>
            {isEditing && (
              <div className="is-editing-message t-flex t-items-center t-justify-end">
                <div className="icon icon-edit_17"></div>
                {_l('正在编辑问题')}
              </div>
            )}
          </div>
          {!isEditing ? (
            <BgIconButton.Group gap={6}>
              <BgIconButton
                size="small"
                icon="copy_custom"
                popupPlacement="top"
                tooltip={_l('复制')}
                onClick={() => {
                  copy(getContentFromMessage(content));
                  alert(_l('复制成功'));
                }}
              />
              {allowEdit && (
                <BgIconButton
                  size="small"
                  icon="edit_17"
                  popupPlacement="top"
                  tooltip={_l('修改')}
                  onClick={() => {
                    setIsEditing(true);
                    setTimeout(() => {
                      messageContentRef.current?.focus();
                    }, 100);
                  }}
                />
              )}
            </BgIconButton.Group>
          ) : (
            <BgIconButton.Group gap={6}>
              <BgIconButton
                size="small"
                iconStyle={{ color: '#F44336' }}
                icon="close"
                popupPlacement="top"
                onClick={() => setIsEditing(false)}
              />
              <BgIconButton
                size="small"
                iconStyle={{ color: '#4CAF50' }}
                icon="hr_ok"
                popupPlacement="top"
                onClick={sendMessageFromMessage}
              />
            </BgIconButton.Group>
          )}
        </div>
      )}
      <div className="messageContentWrap">
        {!isEditing ? (
          <div className="messageContent">
            {role === 'user' ? <div>{getContentFromMessage(content)}</div> : <Markdown content={content} />}
          </div>
        ) : (
          <MessageEditTextarea
            ref={messageContentRef}
            minHeight={38}
            rows={1}
            value={messageTempValue}
            onChange={e => {
              setMessageTempValue(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                sendMessageFromMessage();
              }
            }}
          />
        )}
      </div>
      {!!isLastAssistantMessage && tryComp}
    </MessageItemWrap>
  );
}

MessageItem.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

function MessageList(
  {
    maxWidth,
    isRequesting,
    isLoadingChat,
    messages,
    onSend,
    allowEdit = false,
    messageListHeader = null,
    isLoadingRecommendMessage,
    recommendMessage,
  },
  ref,
) {
  const cache = useRef({});
  const scrollViewRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollToBottomRef = useRef(null);
  const onScroll = useCallback(() => {
    if (!messagesEndRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollViewRef.current.getScrollInfo();
    if (scrollTop < 120) return;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    if (scrollBottom > 120) {
      scrollToBottomRef.current.classList.remove('fadeOut');
    } else {
      scrollToBottomRef.current.classList.add('fadeOut');
    }
  }, []);
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
  }));
  useEffect(() => {
    if (messages.length === 0) {
      scrollToBottomRef.current?.classList?.add('fadeOut');
    }
    if (window.isMingoShare || messages.length === 0 || cache.current.prevIsLoadingChat === isLoadingChat) return;
    const lastUserMessageId = findLast(messages, item => item.role === 'user')?.id;
    const lastUserMessageDom = lastUserMessageId && document.querySelector(`[data-id="${lastUserMessageId}"]`);
    if (!isLoadingChat && messagesEndRef.current && lastUserMessageDom) {
      lastUserMessageDom.scrollIntoView({ behavior: 'smooth' });
    }
    cache.current.prevIsLoadingChat = isLoadingChat;
  }, [isLoadingChat, messages]);
  if (isLoadingChat) {
    return (
      <MessageListWrap className="t-flex-1">
        <Skeleton active style={{ maxWidth, margin: '0 auto', padding: 0 }} widths={[100, '100%', '100%', '50%']} />
      </MessageListWrap>
    );
  }
  return (
    <MessageListWrap
      ref={scrollViewRef}
      className="t-flex-1"
      onScroll={onScroll}
      onClick={e => {
        if (e.target.tagName.toLowerCase() === 'img') {
          previewQiniuUrl(e.target.src, { disableDownload: true, ext: 'png' });
        }
      }}
    >
      <div className="messageListContent" style={{ maxWidth }}>
        {messageListHeader}
        {!messages.length && (
          <div>
            <MessageItemWrap>
              <div className="assistantHeader t-flex t-items-center">
                <img src={mingoHead} className="avatar" alt="" />
                <div className="avatarName">Mingo</div>
              </div>
              <div className="messageContent">
                <Markdown content={_l('您好，HAP中有任何使用问题，都可以向我提问')} />
              </div>
              <TryTry onSelect={onSend} />
            </MessageItemWrap>
          </div>
        )}
        {messages.map(message => (
          <MessageItem
            allowEdit={allowEdit}
            key={message.id}
            {...message}
            isLastAssistantMessage={
              !isRequesting && message.role === 'assistant' && message.id === messages[messages.length - 1].id
            }
            tryComp={
              !isLoadingRecommendMessage &&
              !!messages.length &&
              !!recommendMessage.length && <TryTry onSelect={onSend} data={recommendMessage} />
            }
            handleSendFromMessage={({ content, messageId, isRegenerate = false }) => {
              let newContent = content;
              let fromMessageId = messageId;
              if (isRegenerate) {
                const currentMessageIndex = messages.findIndex(item => item.id === messageId);
                const prevMessage = messages[currentMessageIndex - 1];
                newContent = getContentFromMessage(prevMessage.content);
                fromMessageId = prevMessage.id;
              }
              onSend(newContent, {
                fromMessageId,
              });
            }}
          />
        ))}

        {isRequesting && (
          <MessageItemWrap style={{ minHeight: 'calc(100dvh - 336px)' }}>
            <div className="assistantHeader t-flex t-items-center">
              <img src={mingoHead} className="avatar" alt="" />
              <div className="avatarName">Mingo</div>
            </div>
            <LoadingDots dotNumber={3} />
          </MessageItemWrap>
        )}
        <div ref={messagesEndRef} />

        <ScrollToBottom
          className="fadeOut"
          ref={scrollToBottomRef}
          onClick={() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <i className="icon icon-arrow_back"></i>
        </ScrollToBottom>
      </div>
    </MessageListWrap>
  );
}

export default forwardRef(MessageList);

MessageList.propTypes = {
  maxWidth: PropTypes.number,
  isRequesting: PropTypes.bool,
  isLoadingChat: PropTypes.bool,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ),
  onSend: PropTypes.func,
  messageListHeader: PropTypes.node,
  isLoadingRecommendMessage: PropTypes.bool,
  recommendMessage: PropTypes.array,
};
