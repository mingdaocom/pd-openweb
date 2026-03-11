import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { findLast, findLastIndex, includes, isEmpty, isFunction, last } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Checkbox, ScrollView, Skeleton } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import GetHelp from 'src/components/GetHelp';
import previewAttachments, { transformQiniuUrl } from 'src/components/previewAttachments/previewAttachments';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { SpeechSynthesizer } from 'src/utils/audio';
import { browserIsMobile } from 'src/utils/common';
import { getTextContentFromMessage } from 'src/utils/sse';
import FileCard from '../../ChatBot/components/FileCard';
import { convertModelMessageToUIMessage, getContentFromMessage } from '../utils';
import AutoHeightTextArea from './AutoHeightTextArea';
import ReactRemarkable from './ReactRemarkable';
import PlayAnimation from './sound_animation.svg';

const isMobile = browserIsMobile();

const MessageListWrap = styled(ScrollView)`
  flex: 1;
  padding: 0 16px;
  overflow: hidden;
  .messageListContent {
    width: 100%;
    margin: 0 auto;
    padding: 20px 0 30px;
    > *:not(.noPaddingBottom):not(:has(~ *:not(.noPaddingBottom))) {
      min-height: calc(100dvh - 336px);
    }
  }
  &.isMobile {
    padding: 16px 20px 0;
    .messageListContent {
      padding: 20px 0;
    }
  }
  &.isChatbot {
    .assistantOperates {
      .avatar {
        width: 36px;
        height: 36px;
      }
      .avatarName {
        margin-left: 10px;
        font-size: 17px;
      }
    }
  }
`;

export const MessageItemWrap = styled.div`
  position: relative;
  margin-bottom: 10px;
  .tools {
    height: 32px;
    visibility: hidden;
    .splitter {
      width: 1px;
      height: 9px;
      background: var(--color-text-disabled);
      margin: 0 6px;
    }
  }
  .user-tools {
    height: 32px;
    visibility: hidden;
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--color-border-secondary);
  }
  .messageContentWrap {
    display: flex;
  }
  .statusText {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  .messageContent {
    position: relative;
    overflow: hidden;
    display: inline-block;
    max-width: 100%;
    padding: 5px 0;
    font-size: 15px;
    color: var(--color-text-primary);
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
    font-size: 15px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .tokenUsage {
    cursor: pointer;
    &:hover {
      color: var(--color-text-secondary) !important;
    }
  }
  &.isEditing,
  &.isMobile,
  &.alwaysShowTool,
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
    .messageContentWrap {
      justify-content: end;
    }
    .messageContent {
      background: var(--color-mingo-transparent);
      padding: 8px 10px;
      border-radius: 5px;
    }
    &.useAppThemeColor {
      .messageContent {
        background: var(--app-highlight-color, var(--color-mingo-transparent));
      }
    }
    &.isMobile {
      .messageContent {
        margin-top: 24px;
      }
    }
  }
  &.role-assistant {
    .messageContent {
      width: 100%;
    }
  }
  .is-editing-message {
    font-size: 12px;
    color: var(--color-text-tertiary);
    .icon {
      font-size: 15px;
    }
  }
  &.isShareMode {
    border-radius: 8px;
    display: flex;
    margin-left: -41px;
    .shareMode {
      margin: 15px 15px 0 0;
    }
    .messageContentContent {
      flex: 1;
    }
    &.needPaddingLeft {
      padding-left: 41px;
    }
  }
  &.allowShare {
    padding: 0 15px;
  }
`;

const MessageEditTextarea = styled(AutoHeightTextArea)`
  border: 2px solid var(--color-mingo) !important;
  border-radius: 5px !important;
  width: 100% !important;
  padding: 7px 12px !important;
  font-size: 14px !important;
`;

const ScrollToBottom = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 36px;
  background: var(--color-background-primary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
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
  &:not(.isMobile) {
    &:hover {
      color: var(--color-mingo);
      background: var(--color-mingo-transparent);
    }
  }
  &.fadeOut {
    opacity: 0;
    pointer-events: none;
  }
`;

const FilesCon = styled.div`
  display: flex;
  white-space: nowrap;
  gap: 10px;
  overflow: hidden;
  overflow-x: auto;
  margin-bottom: 10px;
  > *:first-child {
    margin-left: auto;
  }
`;

const ClearedLine = styled.div`
  position: relative;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 13px;
  margin: 16px 0;
  .text {
    z-index: 2;
    position: relative;
    padding: 0 8px;
    background: var(--color-background-primary);
  }
  &:before {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background: var(--color-border-secondary);
  }
`;

function MessageItem({
  checked = false,
  loading = false,
  width,
  activeMessageId,
  id,
  instanceId,
  workId,
  modelMessageId,
  hasSubmit,
  content,
  usage,
  deactivated = false,
  files = [],
  role,
  isLastAssistantMessage,
  allowShare = false,
  shareMode = false,
  allowEdit = true,
  showAssistantAvatar = true,
  assistantOperatesPlacement = 'bottom',
  handleSendFromMessage = () => {},
  renderCustomBlock,
  renderToolCalls,
  lastAssistantMessageFooterComp = null,
  taskStatus,
  showLoadingWhenContentIsEmpty,
  customLoadingComp,
  statusText,
  allowRegenerate = false,
  showTokenUsage = false,
  openMessageLog = () => {},
  onBeginShare = () => {},
  onClick = () => {},
  chatbotId,
  showFeedback = false,
  useAppThemeColor = false,
}) {
  const cache = useRef({});
  const isStreaming = id === activeMessageId;
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
  const iconStyle = isMobile ? { fontSize: 22 } : {};
  const contentIsEmpty = !getTextContentFromMessage(content);
  const showLoading = showLoadingWhenContentIsEmpty && isLastAssistantMessage && contentIsEmpty;
  useEffect(() => {
    cache.current.activeMessageId = activeMessageId;
  }, [activeMessageId]);
  useEffect(() => {
    return () => {
      speechSynthesizer.current.clear();
    };
  }, []);
  if (role === 'cleared') {
    return (
      <ClearedLine className="noPaddingBottom">
        <span className="text">{_l('开启新对话')}</span>
      </ClearedLine>
    );
  }
  const assistantOperatesComp = (
    <div className="assistantOperates t-flex t-items-center" onClick={e => e.stopPropagation()}>
      <div className={cx('tools t-flex t-items-center', { noAvatar: !showAssistantAvatar })}>
        <BgIconButton.Group className="t-items-center" gap={6}>
          <BgIconButton
            size="small"
            icon="copy_custom"
            iconStyle={iconStyle}
            popupPlacement="top"
            tooltip={_l('复制')}
            onClick={() => {
              copy(getContentFromMessage(content));
              alert(_l('复制成功'));
            }}
          />
          {window.speechSynthesis && (
            <BgIconButton
              size="small"
              icon="bofang"
              iconComponent={isPlaying ? <img width={16} height={16} src={PlayAnimation} alt="" /> : null}
              iconStyle={{
                ...iconStyle,
                ...(isPlaying ? { color: 'var(--color-mingo)' } : {}),
              }}
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
          )}
          {!window.isMingoShare && allowRegenerate && (
            <BgIconButton
              size="small"
              icon="ic_refresh_black"
              iconStyle={iconStyle}
              popupPlacement="top"
              tooltip={_l('重新生成')}
              disabled={loading || shareMode}
              onClick={() => {
                sendMessageFromMessage({ isRegenerate: true });
              }}
            />
          )}
          {allowShare && (
            <BgIconButton
              disabled={shareMode}
              size="small"
              icon="share"
              iconStyle={iconStyle}
              popupPlacement="top"
              tooltip={_l('分享')}
              nativeOnClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onBeginShare(modelMessageId);
              }}
            />
          )}
          {showTokenUsage && <span className="splitter"></span>}
          {showTokenUsage && (
            <BgIconButton
              size="small"
              icon="wysiwyg"
              iconStyle={iconStyle}
              popupPlacement="top"
              tooltip={_l('查看日志')}
              onClick={() => {
                openMessageLog({
                  messageId: id,
                  workId,
                  instanceId,
                });
              }}
            />
          )}
          {showTokenUsage && usage && usage.total_tokens && (
            <Tooltip title={_l('消耗 %0 个token', usage.total_tokens)}>
              <div className="tokenUsage Font12 textDisabled">Token</div>
            </Tooltip>
          )}
        </BgIconButton.Group>

        {/* 只有对话机器人显示反馈 */}
        {chatbotId && showFeedback && (
          <Fragment>
            <span className="splitter"></span>
            <BgIconButton
              size="small"
              icon="get_help"
              iconStyle={{
                ...iconStyle,
                color: 'var(--app-primary-color)',
              }}
              popupPlacement="top"
              tooltip={_l('反馈')}
              onClick={() => GetHelp({ messageId: modelMessageId, chatbotId })}
            />
          </Fragment>
        )}
      </div>
    </div>
  );
  return (
    <MessageItemWrap
      key={id}
      className={cx('user-message-item role-' + role, {
        isEditing: role === 'user' && isEditing,
        isMobile,
        isSmall: window.innerWidth < 500,
        alwaysShowTool: isLastAssistantMessage,
        useAppThemeColor,
        isShareMode: shareMode,
        needPaddingLeft: width <= 890,
        allowShare,
      })}
      data-id={id}
      onClick={onClick}
    >
      {shareMode && (
        <div className="shareMode">
          <Checkbox checked={checked} />
        </div>
      )}
      <div className="messageContentContent">
        {role === 'assistant' && showAssistantAvatar && (
          <div className="assistantOperates t-flex t-items-center">
            <img src={md.global.SysSettings.aiBrandLogoUrl || mingoHead} className="avatar" alt="" />
            <div className="avatarName">{md.global.SysSettings.aiBrandName || 'Mingo'}</div>
          </div>
        )}
        {role === 'assistant' && assistantOperatesPlacement === 'top' && !isEmpty(content) && assistantOperatesComp}
        {role === 'user' && !!files.length && (
          <FilesCon>
            {files.map(file => (
              <FileCard isMessageList key={file.id} {...file} />
            ))}
          </FilesCon>
        )}
        {showLoading && (
          <div className="t-flex t-items-center mTop10">
            {customLoadingComp || (
              <Fragment>
                <LoadingDots dotNumber={3} />
                {statusText && <div className="statusText mLeft5">{statusText}</div>}
              </Fragment>
            )}
          </div>
        )}
        {!showLoading && (
          <div className="messageContentWrap">
            {!isEditing ? (
              !isEmpty(content) && (
                <div className="messageContent">
                  {role === 'user' ? (
                    <div>{getContentFromMessage(content)}</div>
                  ) : // <ReactRemarkable markdown={content} style={{ backgroundColor: 'transparent' }} />
                  typeof content === 'string' ? (
                    <ReactRemarkable
                      markdown={content}
                      isStreaming={isStreaming}
                      flag={JSON.stringify({ taskStatus, disabled: !isLastAssistantMessage })}
                      renderCustomBlock={
                        renderCustomBlock &&
                        (({ type, content }) =>
                          renderCustomBlock({
                            type,
                            content,
                            deactivated,
                            isStreaming,
                            isLastAssistantMessage,
                            messageId: id,
                          }))
                      }
                    />
                  ) : (
                    content.map((part, key) => {
                      if (part.type === 'text') {
                        return (
                          <ReactRemarkable
                            markdown={part.text}
                            isStreaming={isStreaming}
                            flag={JSON.stringify({ taskStatus, disabled: !isLastAssistantMessage })}
                            renderCustomBlock={
                              renderCustomBlock &&
                              (({ type, content }) =>
                                renderCustomBlock({
                                  type,
                                  content,
                                  deactivated,
                                  isStreaming,
                                  isLastAssistantMessage,
                                  messageId: id,
                                }))
                            }
                          />
                        );
                      } else if (part.type === 'image_url') {
                        return <img key={key} src={part.image_url} alt="" />;
                      } else if (part.type === 'tool_calls') {
                        const lastToolIndex = findLastIndex(content, item => item.type === 'tool_calls');
                        return renderToolCalls ? (
                          renderToolCalls(part.toolCalls, {
                            modelMessageId: modelMessageId,
                            messageId: id,
                            needConfirm: hasSubmit,
                            isLastAssistantMessage,
                            isLastPart: key === lastToolIndex,
                          })
                        ) : (
                          <div key={key}>{JSON.stringify(part.toolCalls)}</div>
                        );
                      }
                    })
                  )}
                </div>
              )
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
        )}
        {role === 'user' && !isEmpty(content) && (
          <div className="user-tools t-flex t-items-center t-justify-between" onClick={e => e.stopPropagation()}>
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
                  iconStyle={iconStyle}
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
                    iconStyle={iconStyle}
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
                  iconStyle={{
                    ...iconStyle,
                    color: 'var(--color-error)',
                  }}
                  icon="close"
                  popupPlacement="top"
                  onClick={() => setIsEditing(false)}
                />
                <BgIconButton
                  size="small"
                  iconStyle={{
                    ...iconStyle,
                    color: 'var(--color-success)',
                  }}
                  icon="hr_ok"
                  popupPlacement="top"
                  onClick={sendMessageFromMessage}
                />
              </BgIconButton.Group>
            )}
          </div>
        )}
        {!isStreaming &&
          role === 'assistant' &&
          assistantOperatesPlacement === 'bottom' &&
          !isEmpty(content) &&
          assistantOperatesComp}
        {!!isLastAssistantMessage && lastAssistantMessageFooterComp}
      </div>
    </MessageItemWrap>
  );
}

MessageItem.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  usage: PropTypes.object,
  chatbotId: PropTypes.string,
  customLoadingComp: PropTypes.node,
  statusText: PropTypes.string,
};

function MessageList(
  {
    width,
    isMobile = false,
    loading = false,
    allowRegenerate = false,
    allowShare = false,
    shareMode = false,
    isSelectAll = false,
    selectedMessageIds = [],
    setSelectedMessageIds = () => {},
    showFeedback,
    useAppThemeColor,
    assistantAvatar,
    assistantName,
    maxWidth,
    isRequesting,
    lastMessageShowTool = false,
    showTokenUsage = false,
    statusText,
    loadingStatus,
    isExecutingToolCalls,
    isLoadingChat,
    messages = [],
    filterHiddenMessage = true,
    allowedRoles = ['user', 'assistant', 'cleared'],
    activeMessageId,
    onSend,
    allowEdit = false,
    showAssistantAvatar = true,
    assistantOperatesPlacement = 'bottom',
    messageListHeader = null,
    messageRecommendComp = null,
    lastAssistantMessageFooterComp = null,
    isLoadingMore = false,
    showLoadingWhenContentIsEmpty = false,
    errorComp = null,
    projectId,
    taskStatus,
    setTaskStatus,
    renderCustomBlock,
    renderToolCalls,
    onBeginCreateWorksheet,
    onBeginGenerateWidgets,
    listContentStyle = {},
    openMessageLog = () => {},
    customLoadingComp = null,
    chatbotId,
    handleRegenerate,
    onScrollToTop = () => {},
    setShareMode = () => {},
    setIsSelectAll = () => {},
  },
  ref,
) {
  const cache = useRef({});
  const scrollViewRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollToBottomRef = useRef(null);
  const handleSelectMessage = useCallback((ids = []) => {
    setSelectedMessageIds(prev => [...prev, ...ids]);
  }, []);
  const handleUnselectMessage = useCallback((ids = []) => {
    setSelectedMessageIds(prev => prev.filter(id => !ids.includes(id)));
  }, []);
  const uiMessages = useMemo(() => {
    return messages
      .map(message => convertModelMessageToUIMessage(message))
      .filter(message => !filterHiddenMessage || !message.hidden);
  }, [messages]);
  const onWheel = useCallback(() => {
    if (!messagesEndRef.current) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollViewRef.current.getScrollInfo();

    // 检测是否滚动到顶部，触发加载更多
    if (scrollTop <= 50 && !isLoadingMore) {
      onScrollToTop();
    }

    if (scrollTop < 120) return;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;
    if (scrollBottom > 120) {
      scrollToBottomRef.current.classList.remove('fadeOut');
    } else {
      scrollToBottomRef.current.classList.add('fadeOut');
    }
  }, [onScrollToTop, isLoadingMore]);
  const latestMessageIsUser = last(uiMessages)?.role === 'user';
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollViewRef: scrollViewRef,
  }));
  useEffect(() => {
    if (uiMessages.length === 0) {
      scrollToBottomRef.current?.classList?.add('fadeOut');
    }
    if (window.isMingoShare || uiMessages.length === 0 || cache.current.prevIsLoadingChat === isLoadingChat) return;
    const lastUserMessageId = findLast(uiMessages, item => item.role === 'user')?.id;
    const lastUserMessageDom = lastUserMessageId && document.querySelector(`[data-id="${lastUserMessageId}"]`);
    if (!isLoadingChat && messagesEndRef.current && lastUserMessageDom) {
      lastUserMessageDom.scrollIntoView();
    }
    cache.current.prevIsLoadingChat = isLoadingChat;
  }, [isLoadingChat, uiMessages]);
  const handleMessageClick = useCallback(e => {
    if (e.target.tagName.toLowerCase() === 'img') {
      e.stopPropagation();
      previewAttachments(transformQiniuUrl(e.target.src, { disableDownload: true, ext: 'png' }));
      return;
    }
  }, []);
  if (isLoadingChat) {
    return (
      <MessageListWrap className="t-flex-1">
        <Skeleton
          active
          style={{ maxWidth, margin: '0 auto', padding: 0, background: 'transparent' }}
          widths={[100, '100%', '100%', '50%']}
        />
      </MessageListWrap>
    );
  }
  return (
    <MessageListWrap
      ref={scrollViewRef}
      className={cx('t-flex-1', { isMobile, isChatbot: !!chatbotId })}
      onWheel={onWheel}
      onClick={handleMessageClick}
    >
      <div className="messageListContent" style={{ maxWidth, ...listContentStyle }}>
        {messageListHeader}
        {isLoadingMore && (
          <div className="t-flex t-justify-center mBottom10">
            <LoadingDots dotNumber={3} />
          </div>
        )}
        {!uiMessages.length && !isLoadingChat && (
          <div>
            {!!messageRecommendComp && (
              <MessageItemWrap>
                <div className="assistantOperates t-flex t-items-center">
                  <Fragment>
                    <img
                      src={assistantAvatar || md.global.SysSettings.aiBrandLogoUrl || mingoHead}
                      className="avatar"
                      alt=""
                    />
                    <div className="avatarName">{assistantName || md.global.SysSettings.aiBrandName || 'Mingo'}</div>
                  </Fragment>
                </div>
                {messageRecommendComp}
              </MessageItemWrap>
            )}
          </div>
        )}
        {uiMessages
          .filter(message => includes(allowedRoles, message.role))
          .map(message => (
            <MessageItem
              width={width}
              checked={
                isSelectAll ||
                selectedMessageIds.includes(message.modelMessageId) ||
                selectedMessageIds.includes(message.id)
              }
              allowShare={allowShare}
              shareMode={shareMode}
              loading={loading}
              showLoadingWhenContentIsEmpty={showLoadingWhenContentIsEmpty}
              showFeedback={showFeedback}
              useAppThemeColor={useAppThemeColor}
              projectId={projectId}
              taskStatus={taskStatus}
              activeMessageId={activeMessageId}
              allowEdit={allowEdit}
              showAssistantAvatar={showAssistantAvatar}
              assistantOperatesPlacement={assistantOperatesPlacement}
              lastMessageShowTool={lastMessageShowTool}
              showTokenUsage={showTokenUsage}
              allowRegenerate={allowRegenerate}
              key={message.id}
              {...message}
              customLoadingComp={customLoadingComp}
              statusText={statusText}
              renderCustomBlock={renderCustomBlock}
              renderToolCalls={renderToolCalls}
              isLastAssistantMessage={
                !isRequesting &&
                !isExecutingToolCalls &&
                message.role === 'assistant' &&
                message.id === uiMessages[uiMessages.length - 1].id
              }
              lastAssistantMessageFooterComp={lastAssistantMessageFooterComp}
              openMessageLog={openMessageLog}
              handleSendFromMessage={({ content, messageId, isRegenerate = false }) => {
                let newContent = content;
                let fromMessageId = messageId;
                let currentMessageIndex = 0,
                  prevMessage = null;
                if (isRegenerate) {
                  currentMessageIndex = messages.findIndex(item => item.id === messageId);
                  prevMessage = messages[currentMessageIndex - 1];
                  newContent = getContentFromMessage(prevMessage.content);
                  fromMessageId = prevMessage.id;
                  if (isFunction(handleRegenerate)) {
                    handleRegenerate({
                      messageId: message.modelMessageId,
                    });
                    return;
                  }
                }
                onSend(newContent, {
                  fromMessageId,
                  originMessageForRegenerate: prevMessage,
                  messageOptions: {
                    hidden: prevMessage ? prevMessage.hidden : undefined,
                  },
                });
              }}
              setTaskStatus={setTaskStatus}
              onBeginCreateWorksheet={onBeginCreateWorksheet}
              onBeginGenerateWidgets={onBeginGenerateWidgets}
              chatbotId={chatbotId}
              onClick={() => {
                if (!shareMode) return;
                const ids = [message.modelMessageId];
                if (message.role === 'user') {
                  const nextMessage =
                    messages[findLastIndex(messages, item => item.modelMessageId === message.modelMessageId) + 1];
                  if (nextMessage) {
                    ids.push(nextMessage.modelMessageId);
                  }
                } else {
                  const prevMessage =
                    messages[findLastIndex(messages, item => item.modelMessageId === message.modelMessageId) - 1];
                  if (prevMessage) {
                    ids.push(prevMessage.modelMessageId);
                  }
                }
                if (isSelectAll) {
                  setIsSelectAll(false);
                  setSelectedMessageIds(
                    messages
                      .filter(message => !ids.includes(message.modelMessageId))
                      .map(message => message.modelMessageId),
                  );
                } else {
                  if (selectedMessageIds.includes(message.modelMessageId)) {
                    handleUnselectMessage(ids);
                  } else {
                    handleSelectMessage(ids);
                  }
                }
              }}
              onBeginShare={modelMessageId => {
                const messageIndex = findLastIndex(
                  messages,
                  item => (item.modelMessageId || item.id) === modelMessageId,
                );
                const prevMessage = messages[messageIndex - 1] || {};
                setShareMode(true);
                setSelectedMessageIds([modelMessageId, prevMessage.modelMessageId || prevMessage.id].filter(Boolean));
              }}
            />
          ))}

        {latestMessageIsUser && (
          <div className="overflowHidden">
            {isRequesting && (
              <MessageItemWrap>
                <div className="assistantOperates t-flex t-items-center">
                  {showAssistantAvatar && (
                    <Fragment>
                      <img src={md.global.SysSettings.aiBrandLogoUrl || mingoHead} className="avatar" alt="" />
                      <div className="avatarName">{md.global.SysSettings.aiBrandName || 'Mingo'}</div>
                    </Fragment>
                  )}
                </div>
                <div className="t-flex t-items-center mTop10">
                  {customLoadingComp || (
                    <Fragment>
                      <LoadingDots dotNumber={3} />
                      {statusText && <div className="statusText mLeft5">{statusText}</div>}
                    </Fragment>
                  )}
                </div>
              </MessageItemWrap>
            )}
          </div>
        )}
        {!!errorComp && <div>{errorComp}</div>}
        {loadingStatus && (
          <div>
            <div className="t-flex t-items-center mTop10" style={loadingStatus.style}>
              <LoadingDots dotNumber={3} />
              {<div className="statusText mLeft5 textSecondary">{loadingStatus.statusText}</div>}
            </div>
          </div>
        )}
        <div className="noPaddingBottom" ref={messagesEndRef} style={isMobile ? { height: 80 } : {}} />

        <ScrollToBottom
          className={cx('fadeOut noPaddingBottom', { isMobile })}
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
  taskStatus: PropTypes.number,
  setTaskStatus: PropTypes.func,
  onBeginCreateWorksheet: PropTypes.func,
  onBeginGenerateWidgets: PropTypes.func,
  chatbotId: PropTypes.string,
};
