import React, { memo, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import useRecorder from 'src/components/Mingo/ChatBot/components/Recorder/useRecorder';
import { COMPOSITE_INPUT_TYPE } from '../../core/config';
import { secondToMMSS } from '../../core/utils';
import { useVoice } from '../VoiceProvider';
import VoiceMeter from './VoiceMeter';

const VoiceToTextWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-primary);
  .recordingContent {
    padding-top: 2px;
    padding-left: 2px;
    width: 100%;
    height: 200px;
    overflow-y: auto;
  }
  .footer {
    padding: 10px;
    .footerRecordingBox {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      width: 100%;
      height: 36px;
      border-radius: 36px;
      background: linear-gradient(129deg, #d56dfd 0%, #3e15fd 100%);
      color: var(--color-white);
      .icon {
        font-size: 30px;
        color: var(--color-white);
      }
      .holder {
        width: 24px;
      }
      .pendingCenter {
        display: flex;
        align-items: center;
        justify-content: center;
        .pendingInfo {
          margin-left: 15px;
          color: var(--color-white);
          font-size: 13px;
          font-weight: 600;
          .pendingTime {
            margin-left: 6px;
          }
        }
      }
    }
  }
`;

const VoiceToText = props => {
  const { from, lastText = '' } = props;
  const { authConfig, onReset, onComplete } = useVoice();

  const { status, recognizedText, recordTime, start, stop } = useRecorder({
    authConfig,
    onError: () => {
      alert(_l('暂不支持当前设备'), 3);
      onReset();
    },
  });

  const handleComplete = () => {
    stop();
    setTimeout(() => onComplete(recognizedText), 300);
  };

  const handleCancel = () => {
    stop();
    setTimeout(() => onReset(), 300);
  };

  useEffect(() => {
    start();
    return () => stop();
  }, []);

  useEffect(() => {
    if (status === 'error') {
      handleCancel();
    }
  }, [status]);

  return (
    <VoiceToTextWrapper>
      <div className="content">
        <div className="recordingContent">
          {lastText}
          {recognizedText}
        </div>
      </div>
      <div className="footer">
        <div className="footerRecordingBox">
          {from !== COMPOSITE_INPUT_TYPE.COMPOSITE ? (
            <Icon icon="cancel" onClick={handleCancel} />
          ) : (
            <div className="holder"></div>
          )}
          <div className="pendingCenter">
            <VoiceMeter />
            <div className="pendingInfo">
              {_l('正在倾听')}
              <span className="pendingTime">{secondToMMSS(recordTime)}</span>
            </div>
          </div>
          <Icon type="check_circle" onClick={handleComplete} />
        </div>
      </div>
    </VoiceToTextWrapper>
  );
};

export default memo(VoiceToText);
