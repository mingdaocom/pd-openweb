import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Tooltip } from 'ming-ui';
import Recorder from './Recorder';

const Con = styled.div`
  height: 44px;
  padding: 0 8px;
  > div {
    gap: 12px;
  }
`;

const AbortButton = styled.div`
  cursor: pointer;
  .icon {
    font-size: 25px;
    color: var(--ai-primary-color);
  }
`;

export default function SendButtons({
  isRecording,
  sendDisabled,
  loading,
  abortRequest = () => {},
  onBeginRecord = () => {},
  onSend = () => {},
  focusSendTextArea = () => {},
  onRecognize = () => {},
  onStop = () => {},
  setAutoPlay = () => {},
}) {
  const recorderRef = useRef(null);
  return (
    <Con className="t-flex t-flex-row t-items-center t-space-between">
      {!isRecording && (
        <div className="b-left t-flex t-items-center">
          {/* <BgIconButton icon="icon-ic_attachment_black" /> */}
          <BgIconButton icon="microphone" tooltip={_l('语音输入')} popupPlacement="top" onClick={onBeginRecord} />
        </div>
      )}
      {isRecording && <Recorder ref={recorderRef} onRecognize={onRecognize} onStop={onStop} />}
      <div className="b-right t-flex t-items-center">
        {loading ? (
          <Tooltip text={<span>{_l('停止')}</span>} popupPlacement="top">
            <AbortButton
              onClick={() => {
                abortRequest();
                focusSendTextArea();
              }}
            >
              <i className="icon icon-pause"></i>
            </AbortButton>
          </Tooltip>
        ) : (
          <BgIconButton
            disabled={sendDisabled}
            iconStyle={sendDisabled ? {} : { color: 'var(--ai-primary-color)' }}
            icon="send"
            tooltip={_l('发送(↵)')}
            onClick={() => {
              if (sendDisabled) return;
              if (isRecording) {
                recorderRef.current?.stop({ sendAfterStop: true });
                setAutoPlay(true);
                return;
              }
              onSend();
            }}
          />
        )}
      </div>
    </Con>
  );
}

SendButtons.propTypes = {
  isRecording: PropTypes.bool,
  sendDisabled: PropTypes.bool,
  loading: PropTypes.bool,
  abortRequest: PropTypes.func,
  onBeginRecord: PropTypes.func,
  onSend: PropTypes.func,
  focusSendTextArea: PropTypes.func,
};
