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
import { BgIconButton, PreferenceTime, ScrollView } from 'ming-ui';
import { Checkbox, Skeleton, Tooltip } from 'ming-ui/antd-components';
import { transformQiniuUrl, usePreviewAttachments } from 'src/components/previewAttachments/previewAttachments';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import { SpeechSynthesizer } from 'src/utils/platform/browser/audio';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getTextContentFromMessage } from 'src/utils/platform/network/sse';
import FileCard from '../../ChatBot/components/FileCard';
import { convertModelMessageToUIMessage, getContentFromMessage } from '../utils';
import AutoHeightTextArea from './AutoHeightTextArea';
import useGetHelp from './GetHelp';
import ReactRemarkable from './ReactRemarkable';
import Reasoning from './Reasoning';
import PlayAnimation from './sound_animation.svg';
import WorkPhase from './WorkPhase';

// 阶段标记：<workEnd />、<FINAL_ANSWER>…</FINAL_ANSWER> 曾用来切分工作过程与正式回答，现已改按
// 模型消息边界折叠（见 carveWorkParts），标记只是协议残留，展示前统一抹掉，不让它出现在气泡里。
const WORK_MARK_REGEX = /<workEnd\b[^>]*?\/?>|<\/?FINAL_ANSWER>/gi;

// 消息时间归一化：历史消息取后端 ctime（'YYYY-MM-DD HH:mm:ss' 字符串，Safari 解析不了 - 分隔），
// 在途消息取本地毫秒时间戳。非法时间返回 null，交由调用方跳过展示。
function normalizeMessageTime(time) {
  if (!time) return null;

  const normalized = typeof time === 'number' ? time : String(time).replace(/-/g, '/');

  return isNaN(new Date(normalized).getTime()) ? null : normalized;
}

function stripWorkMarks(text) {
  return typeof text === 'string' ? text.replace(WORK_MARK_REGEX, '') : text;
}

// 正式回答的起点：一轮回答会落成多条模型消息，只有最后一条模型消息的正文是要平铺展示的答案。
// 两个约束取更靠后者——
//   1. 不早于最后一条模型消息的起点：历史消息在 formatMessages 里按条标了 ownerMessageId，据此定位；
//      流式消息拿不到归属，退化成不约束（交给下一条）。
//   2. 不早于最后一次推理 / 工具调用之后：推理与工具调用都属于工作过程，一律收进「已工作」。
function findAnswerStartIndex(parts) {
  const lastOwner = last(parts).ownerMessageId;
  const messageStart = lastOwner ? parts.findIndex(part => part.ownerMessageId === lastOwner) : 0;
  const lastProcess = findLastIndex(parts, part => part.type === 'reasoning' || part.type === 'tool_calls');

  return Math.max(messageStart, lastProcess + 1);
}

// 正式回答之前的推理 / 过程叙述 / 工具调用属「工作过程」，全部折叠进一个 work part。回答起点为 0
// （只有一条模型消息、且没有工具调用）时不折叠；起点越过末尾时（整条消息还停在工具调用上，等结果 /
// 等确认）分界之后为空，气泡里就只剩一条「已工作」。
function carveWorkParts(parts) {
  if (!Array.isArray(parts) || !parts.length) return parts;

  const cutIndex = findAnswerStartIndex(parts);

  if (cutIndex <= 0) return parts;

  return [{ type: 'work', children: parts.slice(0, cutIndex) }, ...parts.slice(cutIndex)];
}

const isMobile = browserIsMobile();
// 距底多少像素以内视为「贴底」，贴底时流式内容变高会自动跟随
const STICK_TO_BOTTOM_THRESHOLD = 40;
// 距底超过多少像素显示「回到底部」按钮
const BACK_TO_BOTTOM_THRESHOLD = 120;
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
  .creditsUsage,
  .messageTime {
    white-space: nowrap;
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
  /* 生成失败的内容分段：比正文小一号的错误色系统旁白，读起来与模型回答区分开，
     同一条消息里成功的分段不受影响 */
  .failedPart {
    display: flex;
    align-items: flex-start;
    margin: 6px 0;
    font-size: 13px;
    line-height: 20px;
    color: var(--color-error);
    .failedIcon {
      flex-shrink: 0;
      /* 图标字体的字形在 em box 内偏上，仅靠 line-height 对齐会比文字高一截：
         这里给它一个与首行等高的盒子再让字形在盒内居中，多行时也只跟第一行对齐 */
      display: inline-flex;
      align-items: center;
      height: 20px;
      margin-right: 6px;
      font-size: 14px;
      line-height: 1;
      color: var(--color-error);
    }
    .failedPartContent {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      line-height: 20px;
      /* 文案经 markdown 渲染成 <p>，正文那条 0.6em 段落外边距会把首行推下去，
         图标看起来就比文字高一截；这里收掉段落外边距，多段之间另给间距 */
      p {
        margin: 0;
      }
      p + p {
        margin-top: 6px;
      }
      > *:first-child {
        margin-top: 0;
      }
      > *:last-child {
        margin-bottom: 0;
      }
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
  price,
  time,
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
  showCredits = false,
  showTime = false,
  foldWorkPhase = false,
  roundIsRunning = false,
  openMessageLog = () => {},
  onBeginShare = () => {},
  onClick = () => {},
  openGetHelp,
  chatbotId,
  showFeedback = false,
  useAppThemeColor = false,
  openPreviewAttachments,
  disableAttachmentActions = false,
  recordInfoAppId,
  recordInfoIsCharge,
}) {
  const cache = useRef({});
  const isStreaming = id === activeMessageId;
  // 在途：本条正在流式输出，或本轮还没跑完（请求中、工具执行中、续跑的流式内容落在本条上）
  const isInFlight = isStreaming || roundIsRunning;
  const timeValue = normalizeMessageTime(time);
  // 消息时间：与信用点同一行，显隐跟随所在工具栏（最新一条常驻、旧消息 hover 才显现）。
  // 展示口径与记录讨论一致——默认相对时间，点击在「相对 / 完整」之间切换并全局同步
  const messageTimeComp = showTime && !!timeValue && (
    <PreferenceTime className="messageTime Font12 textDisabled" value={timeValue} />
  );
  // 仅用于渲染：抹掉正文里的阶段标记，并把正式回答之前的过程折叠成 work part
  // （复制/编辑等仍用原始 content，不受影响）
  const displayContent = useMemo(() => {
    if (typeof content === 'string') return stripWorkMarks(content);

    if (!Array.isArray(content)) return content;

    const parts = content
      .map(part => (part.type === 'text' ? { ...part, text: stripWorkMarks(part.text) } : part))
      // 整段只有标记时抹完就空了，留着会在气泡里多出一个空行
      .filter(part => !(part.type === 'text' && !(part.text || '').trim()));

    // 在途消息一律不折叠：分段是边流边追加的，折叠边界会跟着最后一段反复前移——只有推理时整条被折成
    // 一行「已工作」（实时推理流也就没了），追加工具调用时刚流出来的正文又会突然被折走。等这一轮彻底
    // 跑完再折叠，过程中保持平铺
    return foldWorkPhase && !isInFlight ? carveWorkParts(parts) : parts;
  }, [content, foldWorkPhase, isInFlight]);
  // 生成失败的分段只在这条消息「以失败收尾」时才展示：中途某轮失败但随后又产出了内容（重试成功、
  // 继续追加回答），那段失败提示对用户已经没有意义，直接不渲染，只保留真正让本轮止步的那段
  const showFailedParts = Array.isArray(displayContent) && !!last(displayContent)?.failed;
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
  const iconStyle = isMobile
    ? {
        fontSize: 22,
      }
    : {};
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
      <div
        className={cx('tools t-flex t-items-center', {
          noAvatar: !showAssistantAvatar,
        })}
      >
        <BgIconButton.Group className="t-items-center" gap={6}>
          <BgIconButton
            size="small"
            icon="copy_custom"
            iconStyle={iconStyle}
            popupPlacement="top"
            tooltip={_l('复制')}
            onClick={() => {
              copy(stripWorkMarks(getContentFromMessage(content)));
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
                ...(isPlaying
                  ? {
                      color: 'var(--color-mingo)',
                    }
                  : {}),
              }}
              popupPlacement="top"
              tooltip={isPlaying ? _l('停止朗读') : _l('朗读')}
              onClick={() => {
                if (isPlaying) {
                  speechSynthesizer.current.clear();
                  setIsPlaying(false);
                  return;
                }
                const text = stripWorkMarks(getContentFromMessage(content));
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
                sendMessageFromMessage({
                  isRegenerate: true,
                });
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
          {messageTimeComp}
          {/* 本轮消耗的信用点：非平台版无计费体系，不展示 */}
          {showCredits && !!price && window.platformENV.isPlatform && (
            <div className="creditsUsage Font12 textDisabled">{_l('%0 信用点', price)}</div>
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
              onClick={() =>
                openGetHelp({
                  messageId: modelMessageId,
                  chatbotId,
                })
              }
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
              <FileCard
                isMessageList
                readonly
                key={file.id}
                {...file}
                disableActions={disableAttachmentActions}
                openPreviewAttachments={openPreviewAttachments}
              />
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
                  typeof displayContent === 'string' ? (
                    <ReactRemarkable
                      markdown={displayContent}
                      isStreaming={isStreaming}
                      appId={recordInfoAppId}
                      isCharge={recordInfoIsCharge}
                      flag={JSON.stringify({
                        taskStatus,
                        disabled: !isLastAssistantMessage,
                      })}
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
                    displayContent.map((part, key) => {
                      if (part.failed && !showFailedParts) return null;

                      const partNode = (() => {
                        if (part.type === 'work') {
                          // 正式回答之前的过程折叠成「已工作」。折叠区里最后一个工具调用可能正等着用户
                          // 确认，确认入口必须留出来：needConfirm 照常透传，并在等待确认时默认展开
                          return (
                            <WorkPhase
                              key={key}
                              items={part.children}
                              appId={recordInfoAppId}
                              isCharge={recordInfoIsCharge}
                              defaultOpen={!!hasSubmit}
                              renderToolCalls={
                                renderToolCalls
                                  ? (toolCalls, { isLastToolCall } = {}) =>
                                      renderToolCalls(toolCalls, {
                                        modelMessageId,
                                        messageId: id,
                                        needConfirm: hasSubmit,
                                        isLastAssistantMessage,
                                        isLastPart: isLastToolCall,
                                      })
                                  : undefined
                              }
                            />
                          );
                        } else if (part.type === 'reasoning') {
                          // 推理段只在「它是流式消息的最后一段」时显示为「思考中」，一旦其后追加了文本/工具调用
                          // （进入下一轮）即收起为「已思考」，从而与多轮「推理→文本→工具」循环对应
                          return (
                            <Reasoning key={key} streaming={isStreaming && key === displayContent.length - 1}>
                              {part.text}
                            </Reasoning>
                          );
                        } else if (part.type === 'text') {
                          return (
                            <ReactRemarkable
                              key={key}
                              markdown={part.text}
                              isStreaming={isStreaming}
                              appId={recordInfoAppId}
                              isCharge={recordInfoIsCharge}
                              flag={JSON.stringify({
                                taskStatus,
                                disabled: !isLastAssistantMessage,
                              })}
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
                          const lastToolIndex = findLastIndex(displayContent, item => item.type === 'tool_calls');
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
                      })();

                      // 只给生成失败的那一段加错误图标与错误色，同一条消息里其它段照常展示
                      return part.failed ? (
                        <div key={key} className="failedPart">
                          <i className="icon icon-error1 failedIcon" />
                          <div className="failedPartContent">{partNode}</div>
                        </div>
                      ) : (
                        partNode
                      );
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
              <BgIconButton.Group className="t-items-center" gap={6}>
                {messageTimeComp}
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
  price: PropTypes.number,
  time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chatbotId: PropTypes.string,
  customLoadingComp: PropTypes.node,
  statusText: PropTypes.string,
  openGetHelp: PropTypes.func,
  openPreviewAttachments: PropTypes.func,
  disableAttachmentActions: PropTypes.bool,
  recordInfoAppId: PropTypes.string,
  recordInfoIsCharge: PropTypes.bool,
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
    showCredits = false,
    showTime = false,
    foldWorkPhase = false,
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
    disableAttachmentActions = false,
    recordInfoAppId,
    recordInfoIsCharge,
  },
  ref,
) {
  const { open: openGetHelp, holder: getHelpHolder } = useGetHelp();
  const { open: openPreviewAttachments, holder: previewAttachmentsHolder } = usePreviewAttachments();
  const cache = useRef({});
  const scrollViewRef = useRef(null);
  const messagesEndRef = useRef(null);
  const contentRef = useRef(null);
  // 是否处于「贴底」：贴底时流式内容变高会自动跟随，用户主动上滚后停止跟随，滚回底部或点「回到底部」恢复
  const stickToBottomRef = useRef(true);
  const [showBackToBottom, setShowBackToBottom] = useState(false);
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
  // 滚动时同步「贴底」状态与「回到底部」按钮的显隐
  const handleScroll = useCallback(() => {
    if (!scrollViewRef.current) return;
    const scrollInfo = scrollViewRef.current.getScrollInfo();
    if (!scrollInfo) return;
    const { scrollHeight, scrollTop, clientHeight } = scrollInfo;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    stickToBottomRef.current = distanceToBottom <= STICK_TO_BOTTOM_THRESHOLD;
    setShowBackToBottom(distanceToBottom > BACK_TO_BOTTOM_THRESHOLD);
  }, []);
  // 滚动到顶部边界时，触发加载更多
  const handleReachVerticalEdge = useCallback(
    ({ direction }) => {
      if (direction === 'up' && !isLoadingMore) {
        onScrollToTop();
      }
    },
    [onScrollToTop, isLoadingMore],
  );
  // 借助 ScrollView 的 scrollToElement 滚动到底部
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (scrollViewRef.current && messagesEndRef.current) {
      scrollViewRef.current.scrollToElement(messagesEndRef.current, behavior);
    }
  }, []);
  // 主动要求滚到底（发送消息、插入卡片、点「回到底部」）时恢复跟随
  const scrollToBottomAndStick = useCallback(() => {
    stickToBottomRef.current = true;
    scrollToBottom();
  }, [scrollToBottom]);
  // 流式输出时内容会持续变高，贴底状态下跟随到底部。
  // ResizeObserver 是「内容长高了」唯一可靠的信号，不必靠 setTimeout 猜渲染时机。
  useEffect(() => {
    const content = contentRef.current;

    if (!content || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        // 跟随必须是瞬时的，smooth 会让连续的高度变化互相打断动画
        scrollToBottom('auto');
      }
    });

    observer.observe(content);

    return () => observer.disconnect();
  }, [scrollToBottom, isLoadingChat]);
  // 贴底判定必须实时：ScrollView 的 onScroll 带 300ms 节流，用户上滚后若延迟更新状态，
  // 期间的跟随会把用户又拽回底部。这里直接监听 viewport 原生滚动，onScroll 仅作兜底。
  useEffect(() => {
    const viewport = scrollViewRef.current?.getScrollInfo?.()?.viewport;

    if (!viewport) return;

    viewport.addEventListener('scroll', handleScroll, { passive: true });

    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isLoadingChat]);
  const latestMessageIsUser = last(uiMessages)?.role === 'user';
  // 工具调用确认后的续跑不会新建气泡，useChat 下发的是一个列表里不存在的新 id（见其 toolMessageId 分支），
  // 流式内容实际落在最后一条助手消息上。此时 activeMessageId 匹配不到任何一条消息，只能靠「有在途流 +
  // 匹配不上」判定最后一条正在接收流式内容
  const streamLandsOnLastMessage = !!activeMessageId && !uiMessages.some(message => message.id === activeMessageId);
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => scrollToBottomAndStick(),
    scrollViewRef: scrollViewRef,
  }));
  useEffect(() => {
    if (window.isMingoShare || uiMessages.length === 0 || cache.current.prevIsLoadingChat === isLoadingChat) return;
    const lastUserMessageId = findLast(uiMessages, item => item.role === 'user')?.id;
    const lastUserMessageDom = lastUserMessageId && document.querySelector(`[data-id="${lastUserMessageId}"]`);
    if (!isLoadingChat && scrollViewRef.current && lastUserMessageDom) {
      // 定位到最后一条用户消息（不在底部），此时不应再自动跟随
      stickToBottomRef.current = false;
      scrollViewRef.current.scrollToElement(lastUserMessageDom);
    }
    cache.current.prevIsLoadingChat = isLoadingChat;
  }, [isLoadingChat, uiMessages]);
  const handleMessageClick = useCallback(
    e => {
      if (e.target.tagName.toLowerCase() === 'img') {
        e.stopPropagation();
        openPreviewAttachments(
          transformQiniuUrl(e.target.src, {
            disableDownload: true,
            ext: 'png',
          }),
        );
        return;
      }
    },
    [openPreviewAttachments],
  );
  if (isLoadingChat) {
    return (
      <MessageListWrap className="t-flex-1">
        {previewAttachmentsHolder}
        <Skeleton
          active
          style={{
            maxWidth,
            margin: '0 auto',
            padding: 0,
            background: 'transparent',
          }}
          paragraph={{
            rows: 4,
            width: [100, '100%', '100%', '50%'],
          }}
        />
      </MessageListWrap>
    );
  }
  return (
    <MessageListWrap
      ref={scrollViewRef}
      className={cx('t-flex-1', {
        isMobile,
        isChatbot: !!chatbotId,
      })}
      onScroll={handleScroll}
      onReachVerticalEdge={handleReachVerticalEdge}
      onClick={handleMessageClick}
    >
      {getHelpHolder}
      {previewAttachmentsHolder}
      <div
        className="messageListContent"
        ref={contentRef}
        style={{
          maxWidth,
          ...listContentStyle,
        }}
      >
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
                {showAssistantAvatar && (
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
                )}
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
              showCredits={showCredits}
              showTime={showTime}
              foldWorkPhase={foldWorkPhase}
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
              roundIsRunning={
                (isRequesting || isExecutingToolCalls || streamLandsOnLastMessage) &&
                message.role === 'assistant' &&
                message.id === uiMessages[uiMessages.length - 1].id
              }
              lastAssistantMessageFooterComp={lastAssistantMessageFooterComp}
              openMessageLog={openMessageLog}
              openGetHelp={openGetHelp}
              openPreviewAttachments={openPreviewAttachments}
              disableAttachmentActions={disableAttachmentActions}
              recordInfoAppId={recordInfoAppId}
              recordInfoIsCharge={recordInfoIsCharge}
              handleSendFromMessage={({ content, messageId, isRegenerate = false }) => {
                let newContent = content;
                let fromMessageId = messageId;
                let currentMessageIndex = 0,
                  prevMessage = null;
                if (isRegenerate) {
                  currentMessageIndex = messages.findIndex(item => item.id === messageId);
                  prevMessage = messages[currentMessageIndex - 1];
                  if (!prevMessage) return;
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
        <div
          className="noPaddingBottom"
          ref={messagesEndRef}
          style={
            isMobile
              ? {
                  height: 80,
                }
              : {}
          }
        />

        <ScrollToBottom
          className={cx('noPaddingBottom', {
            isMobile,
            // 无消息时必然不展示，直接在渲染期派生，无需 effect 同步
            fadeOut: !showBackToBottom || uiMessages.length === 0,
          })}
          onClick={() => scrollToBottomAndStick()}
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
  recordInfoAppId: PropTypes.string,
  recordInfoIsCharge: PropTypes.bool,
};
