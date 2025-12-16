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
  border: 1px solid #ccc;
  overflow: hidden;
  .try-try-con {
    margin: 10px 12px 0;
    border-bottom: 1px solid #eee;
  }
  &.focused {
    border-color: var(--ai-primary-color);
  }
  &:not(.focused):hover {
    border-color: var(--color-border-hover);
  }
  &.disabled {
    border-color: #ddd;
    background-color: #eee;
    textarea {
      background-color: #eee;
      &::placeholder {
        color: #999;
      }
    }
    .sendButton {
      background-color: #aaa !important;
    }
  }
  &.useAppThemeColor.focused {
    border-color: var(--app-primary-color, var(--ai-primary-color));
  }
`;

const SendTextArea = styled(AutoHeightTextArea)`
  border: none;
  width: 100%;
  height: 100%;
  resize: none;
  padding: 8px 12px;
  font-size: 15px;
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
    <Con className={cx('t-flex t-flex-col', { disabled, focused, useAppThemeColor })}>
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
        }}
        onKeyDown={e => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) {
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
