import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import AutoHeightTextArea from './AutoHeightTextArea';
import SendButtons from './SendButtons';
import TryTry from './TryTry';

const Con = styled.div`
  border-radius: 3px;
  border: 1px solid #ddd;
  overflow: hidden;
  .try-try-con {
    margin: 10px 12px 0;
    border-bottom: 1px solid #eee;
  }
  &.focused,
  &:hover {
    border-color: var(--ai-primary-color);
  }
`;

const SendTextArea = styled(AutoHeightTextArea)`
  border: none;
  width: 100%;
  height: 100%;
  resize: none;
  padding: 8px 12px;
}
`;

const Footer = styled.div``;

export default function Send({ chatId, isChatting, onSend = () => {}, loading, abortRequest, setAutoPlay }) {
  const [focused, setFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [value, setValue] = useState('');
  const [recordingText, setRecordingText] = useState('');
  const sendTextAreaRef = useRef(null);
  const sendDisabled = !((value && value.trim()) || (isRecording && recordingText.trim())) || loading;
  useEffect(() => {
    if (chatId) {
      setValue('');
    }
  }, [chatId]);
  useEffect(() => {
    setTimeout(() => {
      sendTextAreaRef.current?.focus();
    }, 100);
  }, [isChatting]);
  return (
    <Con className={cx('t-flex t-flex-col', { focused })}>
      {!isChatting && <TryTry className="try-try-con" onSelect={onSend} />}
      <SendTextArea
        autoFocus
        placeholder={_l('HAP使用中有任何问题，请随时提问喔～')}
        disabled={isRecording}
        ref={sendTextAreaRef}
        value={value + (isRecording ? recordingText : '')}
        focused={focused}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key !== 'Enter') {
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
          onSend(e.target.value);
          setValue('');
        }}
      />
      <Footer>
        <SendButtons
          isRecording={isRecording}
          loading={loading}
          sendDisabled={sendDisabled}
          abortRequest={abortRequest}
          onBeginRecord={() => setIsRecording(true)}
          onSend={() => {
            if (loading) {
              return;
            }
            onSend(value);
            setValue('');
          }}
          focusSendTextArea={() => {
            sendTextAreaRef.current.focus();
          }}
          onRecognize={text => {
            setRecordingText(text);
          }}
          onStop={({ sendAfterStop }) => {
            setRecordingText(oldText => {
              setValue(value + oldText);
              setIsRecording(false);
              if (sendAfterStop) {
                onSend(value + oldText);
                setValue('');
              }
              sendTextAreaRef.current.focus();
              return '';
            });
          }}
          setAutoPlay={setAutoPlay}
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
};
