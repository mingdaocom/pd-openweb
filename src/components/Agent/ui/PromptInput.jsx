import React, {
  cloneElement,
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import styled from 'styled-components';
import { BgIconButton, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/common';
import MentionInput from './MentionInput';

const Recorder = lazy(() => import('src/components/Mingo/ChatBot/components/Recorder'));
const isMobile = browserIsMobile();

const Wrap = styled.div`
  overflow: hidden;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 10px;
  background: var(--color-background-card);
  transition: border-color 0.2s ease;
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}

  .promptInputHeader {
    margin: 10px 12px 0;
    border-bottom: 1px solid var(--color-border-secondary);
  }

  &.focused {
    border-color: var(--color-mingo);
  }

  &:not(.focused):hover {
    border-color: var(--color-border-hover);
  }

  &.disabled {
    border-color: var(--color-border-primary);
    background-color: var(--color-border-secondary);
    .mentionEditor {
      background-color: var(--color-border-secondary);
    }
    .sendButton {
      background-color: var(--color-text-tertiary) !important;
    }
  }

  &.useAppThemeColor.focused {
    border-color: var(--app-primary-color, var(--color-mingo));
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 8px;

  > div {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .footerStart.recording {
    display: flex;
    flex: 1;
  }

  .sendButton.disabled {
    opacity: 0.3;
  }
`;

const AbortButton = styled.div`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 32px;
    color: var(--color-mingo);
  }
  &.useAppThemeColor .icon {
    color: var(--app-primary-color, var(--color-mingo));
  }
`;

function PromptInput(
  {
    value,
    onChange,
    onSubmit,
    onStop,
    onAttachmentClick,
    attachmentSlot,
    attachments,
    sendHeader,
    footerStart,
    footerEnd,
    rightButtons,
    placeholder = _l('输入问题或任务...'),
    disabled = false,
    loading = false,
    submitting = false,
    canSendWhenEmpty = false,
    useAppThemeColor = false,
    autoFocus = false,
    enableVoice = true,
    forceEnableVoice = false,
    getVoiceAuthConfig,
    className,
    inputId,
    attachmentTooltip,
    mentionButtonIcon = 'alternate_email',
    mentionButtonText,
    // @应用 相关：projectId 决定 @ 浮层数据源；enableMention 控制 @ 按钮和手输 @ 浮层
    projectId,
    enableMention = true,
  },
  ref,
) {
  const editorRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingRef = useRef(false);
  const recordingTextRef = useRef('');
  const recordingBaseRef = useRef('');
  // 编辑器最近一次上报的 mentions，供调用方按需取用（ref.getValue()）
  const mentionsRef = useRef([]);
  const [focused, setFocused] = useState(false);
  // text 镜像编辑器纯文本，用于发送禁用态计算（编辑器本身非受控）
  const [text, setText] = useState(value || '');
  const textRef = useRef(value || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [focusSignal, setFocusSignal] = useState(0);
  const isLoading = !!(loading || submitting);

  // 默认与 Mingo SendButtons 一致；官网免登录入口无 accountId，由调用方显式放开录音入口。
  const voiceEnabled =
    voiceAvailable &&
    enableVoice &&
    (forceEnableVoice || (!!get(md, 'global.Account.accountId') && md.global.SysSettings.enableVoiceToText));

  // 外部把 value 清空时（如提交后 setDraft('')）同步清空编辑器
  useEffect(() => {
    if ((value || '') === '' && textRef.current) {
      if (editorRef.current) editorRef.current.clear();
    }
  }, [value]);

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current && editorRef.current.focus(),
    blur: () => editorRef.current && editorRef.current.blur(),
    setInputValue: v => editorRef.current && editorRef.current.setText(v),
    // 聚焦并插入 '@' 呼出应用浮层（供外部「@ 应用开始提问」入口调用）
    insertAt: () => editorRef.current && editorRef.current.insertAt(),
    getValue: () => (editorRef.current ? editorRef.current.getValue() : { text: '', mentions: [] }),
  }));

  const hasRecordingText = isRecording && !!recordingText.trim();
  const sendDisabled = disabled || (!(text || '').trim() && !hasRecordingText && !canSendWhenEmpty) || isLoading;

  const focusEditor = useCallback(() => {
    if (editorRef.current) editorRef.current.focus();
  }, []);

  const requestEditorFocus = useCallback(() => {
    setFocusSignal(count => count + 1);
  }, []);

  useEffect(() => {
    if (focusSignal) focusEditor();
  }, [focusSignal, focusEditor]);

  function handleEditorChange({ text: t, mentions }) {
    mentionsRef.current = mentions;
    textRef.current = t;
    setText(t);
    onChange && onChange(t);
  }

  function handleSubmit(textOverride) {
    if (sendDisabled && typeof textOverride !== 'string') return;
    // 提交瞬间实时从编辑器序列化取 @ 应用列表，避免依赖 onChange 缓存（mentionsRef）的时序，
    // 第二参回抛给调用方拼进发送 context（设计稿 mentions 字段）。
    const mentions = enableMention
      ? editorRef.current
        ? editorRef.current.getValue().mentions
        : mentionsRef.current
      : [];
    onSubmit && onSubmit(typeof textOverride === 'string' ? textOverride : text, mentions);
  }

  function beginRecord() {
    if (disabled) return;
    recordingRef.current = true;
    recordingTextRef.current = '';
    recordingBaseRef.current = text; // 录音前已有文本作为拼接基底
    setRecordingText('');
    setIsRecording(true);
  }

  function handleRecognize(t) {
    recordingTextRef.current = t;
    setRecordingText(t);
    // 录音中用户不手动编辑，可整体把「基底 + 识别中」写回编辑器做实时预览
    if (editorRef.current) editorRef.current.setText((recordingBaseRef.current || '') + t);
  }

  function handleRecorderStop({ sendAfterStop } = {}) {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    const finalValue = (recordingBaseRef.current || '') + recordingTextRef.current;

    recordingTextRef.current = '';
    setRecordingText('');
    setIsRecording(false);
    if (editorRef.current) editorRef.current.setText(finalValue);
    if (sendAfterStop) handleSubmit(finalValue);
    setTimeout(() => focusEditor(), 0);
  }

  return (
    <Wrap className={cx(className, 'textAreaCon t-flex t-flex-col', { focused, disabled, useAppThemeColor })}>
      {focused && sendHeader && cloneElement(sendHeader, { onFocus: requestEditorFocus })}
      {attachments}
      <MentionInput
        ref={editorRef}
        embedded
        inputId={inputId}
        projectId={projectId}
        enableMention={enableMention}
        placeholder={placeholder}
        disabled={disabled || isRecording}
        autoFocus={autoFocus}
        onChange={handleEditorChange}
        onSubmit={({ text: t }) => handleSubmit(t)}
        onFocusChange={setFocused}
      />
      <Footer>
        <div className={cx('footerStart', { recording: isRecording })}>
          {isRecording ? (
            <Suspense fallback={null}>
              <Recorder
                ref={recorderRef}
                getAuthConfig={getVoiceAuthConfig}
                onRecognize={handleRecognize}
                onStop={handleRecorderStop}
                onUnavailable={() => setVoiceAvailable(false)}
              />
            </Suspense>
          ) : (
            <>
              {attachmentSlot
                ? attachmentSlot
                : onAttachmentClick && (
                    <BgIconButton
                      disabled={disabled}
                      style={{ borderRadius: '8px', padding: '6px' }}
                      icon="attachment"
                      tooltip={attachmentTooltip || _l('添加附件')}
                      popupPlacement="top"
                      onClick={onAttachmentClick}
                    />
                  )}
              {enableMention && (
                <BgIconButton
                  className="promptMentionButton"
                  disabled={disabled}
                  style={{ borderRadius: '8px', padding: '6px' }}
                  icon={mentionButtonIcon}
                  text={mentionButtonText}
                  popupPlacement="top"
                  // BgIconButton 把 onClick 绑在 mousedown 上：阻止其默认失焦，
                  // 否则编辑器 blur 会触发 closePopup 定时器，导致 @ 浮层刚开就被关
                  onClick={e => {
                    if (e) e.preventDefault();
                    if (editorRef.current) editorRef.current.insertAt();
                  }}
                />
              )}
              {footerStart}
            </>
          )}
        </div>
        <div>
          {!isRecording && rightButtons}
          {!isRecording && footerEnd}
          {voiceEnabled && !isRecording && !isLoading && (
            <BgIconButton
              className="promptVoiceButton"
              disabled={disabled}
              style={{ borderRadius: '8px', padding: '6px' }}
              icon="microphone"
              tooltip={_l('语音输入')}
              popupPlacement="top"
              onClick={beginRecord}
            />
          )}
          {isLoading ? (
            <Tooltip title={isMobile ? null : _l('停止')} placement="top">
              <AbortButton
                className={cx({ useAppThemeColor })}
                onClick={() => {
                  if (onStop) onStop();
                  focusEditor();
                }}
              >
                <Icon icon="pause" />
              </AbortButton>
            </Tooltip>
          ) : (
            <BgIconButton
              className={cx('sendButton', 'promptSendButton')}
              disabled={sendDisabled}
              style={{
                backgroundColor: useAppThemeColor
                  ? 'var(--app-primary-color, var(--color-mingo))'
                  : 'var(--color-mingo)',
                borderRadius: '8px',
                padding: '6px',
              }}
              iconStyle={{ color: 'white' }}
              icon="send"
              tooltip={_l('发送(↵)')}
              popupPlacement="top"
              onClick={() => {
                if (sendDisabled) return;
                if (isRecording) {
                  recorderRef.current?.stop({ sendAfterStop: true });
                  return;
                }

                handleSubmit();
              }}
            />
          )}
        </div>
      </Footer>
    </Wrap>
  );
}

const Forwarded = forwardRef(PromptInput);

export { Forwarded as PromptInput };
export default Forwarded;
