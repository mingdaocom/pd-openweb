import React, { cloneElement, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import AddedFiles from './AddedFiles';
import AutoHeightTextArea from './AutoHeightTextArea';
import SendButtons from './SendButtons';

const Con = styled.div`
  border-radius: 10px;
  border: 1px solid var(--color-border-tertiary);
  overflow: hidden;
  ${() => (md.global.SysSettings.aiBrandThemeColor ? `--color-mingo: ${md.global.SysSettings.aiBrandThemeColor};` : '')}
  .try-try-con {
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
    textarea {
      background-color: var(--color-border-secondary);
      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }
    .sendButton {
      background-color: var(--color-text-tertiary) !important;
    }
  }
  &.useAppThemeColor.focused {
    border-color: var(--app-primary-color, var(--color-mingo));
  }
`;

const SendTextArea = styled(AutoHeightTextArea)`
  border: none;
  width: 100%;
  height: 100%;
  resize: none;
  padding: 8px 12px;
  font-size: 15px;
  background: transparent;
  &::placeholder {
    font-size: 15px;
    color: var(--color-text-placeholder)
  }
}
`;

const Footer = styled.div``;

function Send(
  {
    isMobile,
    disabled,
    chatbotId,
    conversationId,
    needOcr = false,
    useAppThemeColor = false,
    chatId,
    isChatting,
    placeholder,
    sendHeader = null,
    allowUpload = false,
    allowMimeTypes,
    tokenType = 71,
    uploadFileToolTip,
    onSend = () => {},
    loading,
    abortRequest,
    setAutoPlay,
    rightButtons = null,
    uploadPermission,
  },
  ref,
) {
  const cache = useRef({});
  const [dropFileElementId] = useState(uuidv4());
  const [files, setFiles] = useState([]);
  const [focused, updateFocused] = useState(false);
  function setFocused(v) {
    updateFocused(v);
  }
  const [isRecording, setIsRecording] = useState(false);
  const [value, setValue] = useState('');
  const [recordingText, setRecordingText] = useState('');
  const sendTextAreaRef = useRef(null);
  const sendButtonsRef = useRef(null);
  const isComposingRef = useRef(false);
  const compositionEndTimeRef = useRef(0);
  const handSend = useCallback(
    (forceValue = '') => {
      onSend(forceValue || value, { files });
      setFiles([]);
      setValue('');
      localStorage.removeItem(`chatbot_textarea_value_${chatbotId}_${conversationId}`);
      sendButtonsRef.current?.uploader?.uploader?.refresh();
    },
    [value, files, onSend],
  );
  disabled = disabled || window.isPublicApp;
  const sendDisabled =
    disabled ||
    (!((value && value.trim()) || (isRecording && recordingText.trim())) &&
      !files.filter(f => f.status === 'uploaded').length) ||
    loading ||
    files.some(f => f.status !== 'uploaded');
  useEffect(() => {
    if (chatId) {
      setValue('');
    }
  }, [chatId]);
  useEffect(() => {
    setTimeout(() => {
      if (!isMobile) {
        sendTextAreaRef.current?.focus();
      }
    }, 100);
  }, [isChatting]);
  useEffect(() => {
    const cacheValue = localStorage.getItem(`chatbot_textarea_value_${chatbotId}_${conversationId}`);
    setValue(cacheValue || '');
    setFiles([]);
  }, [conversationId]);
  useImperativeHandle(ref, () => ({
    focus: () => {
      sendTextAreaRef.current.focus();
    },
    setInputValue: value => {
      setValue(value);
    },
  }));
  return (
    <Con className={cx('textAreaCon t-flex t-flex-col', { disabled, focused, useAppThemeColor })}>
      {focused && sendHeader && cloneElement(sendHeader, { onFocus: () => sendTextAreaRef.current.focus() })}
      {!!files.length && (
        <AddedFiles
          files={files}
          onRemove={id => {
            setFiles(files.filter(f => f.id !== id));
            sendButtonsRef.current?.uploader?.uploader?.removeFile({ id });
          }}
        />
      )}
      <SendTextArea
        id={dropFileElementId}
        autoFocus={!isMobile}
        placeholder={placeholder || _l('发消息')}
        disabled={disabled || isRecording}
        minHeight={48}
        ref={sendTextAreaRef}
        value={value + (isRecording ? recordingText : '')}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          try {
            // if (e.relatedTarget && e.relatedTarget.className.includes('drawer')) {
            //   setFocused(false);
            //   return;
            // }
          } catch (err) {
            console.error(err);
          }
          if (window.isTryRefreshClicked) {
            delete window.isTryRefreshClicked;
            return;
          }
          setTimeout(() => setFocused(false), 100);
        }}
        onChange={e => {
          localStorage.setItem(`chatbot_textarea_value_${chatbotId}_${conversationId}`, e.target.value);
          setValue(e.target.value);
          // 如果不在输入法组合状态，且距离 compositionend 已超过 100ms，清除时间戳
          // 这样可以确保正常输入后能正常发送，同时不影响输入法选择候选词的判断
          if (!isComposingRef.current) {
            const timeSinceCompositionEnd = Date.now() - compositionEndTimeRef.current;
            if (timeSinceCompositionEnd > 100) {
              compositionEndTimeRef.current = 0;
            }
          }
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          // 记录 compositionend 的时间戳，用于 Safari 兼容性处理
          compositionEndTimeRef.current = Date.now();
          isComposingRef.current = false;
        }}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
            return;
          }
          // 检查是否正在输入法组合中
          if (isComposingRef.current || e.nativeEvent.isComposing) {
            return;
          }
          // Safari 中，当用户按 Enter 选择候选词时，compositionend 和 keydown 几乎同时触发
          // 如果 compositionend 在 50ms 内触发，则认为是选择候选词的操作
          // 使用较短的时间窗口，避免误判正常输入后的快速回车
          const timeSinceCompositionEnd = Date.now() - compositionEndTimeRef.current;
          if (timeSinceCompositionEnd < 50) {
            return;
          }
          if (e.shiftKey) {
            return;
          }
          e.stopPropagation();
          e.preventDefault();
          if (sendDisabled) {
            return;
          }
          handSend();
        }}
      />
      <Footer>
        <SendButtons
          useAppThemeColor={useAppThemeColor}
          disabled={disabled}
          chatbotId={chatbotId}
          needOcr={needOcr}
          uploadFileToolTip={uploadFileToolTip}
          ref={sendButtonsRef}
          allowUpload={allowUpload}
          allowMimeTypes={allowMimeTypes}
          tokenType={tokenType}
          dropFileElementId={dropFileElementId}
          existingFiles={files}
          onUpdateFiles={setFiles}
          isRecording={isRecording}
          loading={loading}
          sendDisabled={sendDisabled}
          abortRequest={abortRequest}
          uploadPermission={uploadPermission}
          onBeginRecord={() => {
            cache.current.isRecording = true;
            setIsRecording(true);
          }}
          onSend={() => {
            if (loading) {
              return;
            }
            handSend();
          }}
          focusSendTextArea={() => {
            sendTextAreaRef.current.focus();
          }}
          onRecognize={text => {
            setRecordingText(text);
          }}
          onStop={({ sendAfterStop } = {}) => {
            if (!cache.current.isRecording) {
              return;
            }
            setRecordingText(oldText => {
              setValue(value + oldText);
              setIsRecording(false);
              cache.current.isRecording = false;
              if (sendAfterStop) {
                handSend(value + oldText);
              }
              sendTextAreaRef.current.focus();
              return '';
            });
          }}
          setAutoPlay={setAutoPlay}
          rightButtons={rightButtons}
        />
      </Footer>
    </Con>
  );
}

Send.propTypes = {
  loading: PropTypes.bool,
  isChatting: PropTypes.bool,
  onSend: PropTypes.func,
  abortRequest: PropTypes.func,
  setAutoPlay: PropTypes.func,
  uploadFileToolTip: PropTypes.string,
};

export default forwardRef(Send);
