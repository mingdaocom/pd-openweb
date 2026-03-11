import React, { memo } from 'react';
import styled from 'styled-components';
import Loading from './Loading';

const ProcessToastContent = styled.div`
  .toastContentText {
    margin: 50px 0 10px;
    font-size: 1.6em;
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .parseInfo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .tips {
    font-size: 1em;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  .stopRecognitionBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    margin-top: 35px;
    min-width: 180px;
    height: 50px;
    border-radius: 50px;
    font-size: 1em;
    font-weight: 600;
    color: var(--color-error);
    background-color: var(--color-error-bg);
  }
`;

const ProcessToast = props => {
  const { type = 'parse', visible, onAbort = () => {} } = props;
  const text = type === 'parse' ? _l('识别中...') : _l('图片上传中...');

  if (!visible) return null;

  return (
    <div className="toastWrapper">
      <div className="toastMask"></div>
      <ProcessToastContent className="toastContent">
        <Loading />
        <div className="toastContentText">{text}</div>
        <div className="parseInfo" style={{ visibility: type === 'parse' ? 'visible' : 'hidden' }}>
          <div className="tips">{_l('正在分析，请稍后。')}</div>
          <div className="stopRecognitionBtn" onClick={onAbort}>
            {_l('终止识别')}
          </div>
        </div>
      </ProcessToastContent>
    </div>
  );
};

export default memo(ProcessToast);
