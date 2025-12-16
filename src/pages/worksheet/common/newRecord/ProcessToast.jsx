import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import robot from 'src/pages/worksheet/assets/robot.png';

const breathe = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
`;

const ProcessToastWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  font-size: 16px;
  white-space: nowrap;
  .toastMask {
    width: 100%;
    height: 100%;
    background: var(--color-background-primary);
    opacity: 0.9;
  }
  .toastContent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .robotImg {
      width: 120px;
      animation: ${breathe} 1.3s ease-in-out infinite;
    }
    .toastContentText {
      margin: 32px 0 6px;
      font-size: 1.8em;
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
    .closeBtn {
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
  }
`;

const ProcessToast = props => {
  const { type, visible, onAbort = () => {} } = props;
  const text = type === 'upload' ? _l('图片上传中...') : _l('识别中...');

  if (!visible) return null;

  return (
    <ProcessToastWrap>
      <div className="toastMask"></div>
      <div className="toastContent">
        <img className="robotImg" src={robot} />
        <div className="toastContentText">{text}</div>
        <div className="parseInfo" style={{ visibility: type === 'parse' ? 'visible' : 'hidden' }}>
          <div className="tips">{_l('正在分析图片信息，请稍后。')}</div>
          <div className="closeBtn" onClick={onAbort}>
            {_l('终止识别')}
          </div>
        </div>
      </div>
    </ProcessToastWrap>
  );
};

export default memo(ProcessToast);
