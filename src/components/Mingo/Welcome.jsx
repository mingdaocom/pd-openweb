import React from 'react';
import styled, { keyframes } from 'styled-components';
import mingoHead from 'src/pages/chat/containers/ChatList/Mingo/images/mingo.png';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
`;

const WelcomeWrap = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 30px 50px;
  white-space: pre-line;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-in-out;
  .mongoHead {
    width: 124px;
    height: 124px;
    border-radius: 50%;
    background: url(${mingoHead}) no-repeat center center;
    background-size: 100% 100%;
    border: 1px solid #eaeaea;
  }
  .mainTitle {
    font-size: 22px;
    font-weight: bold;
    color: #151515;
    line-height: 34px;
    margin-top: 20px;
  }
  .description {
    font-size: 14px;
    color: #151515;
    line-height: 28px;
    margin-top: 20px;
  }
  .beginButton {
    width: 124px;
    height: 40px;
    background: #991de7;
    border-radius: 3px;
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    line-height: 40px;
    cursor: pointer;
    margin-top: 30px;
    &:hover {
      background: #5400c7;
    }
  }
`;

export default function Welcome(props) {
  const { onClose = () => {} } = props;
  return (
    <WelcomeWrap>
      <div className="mongoHead"></div>
      <div className="mainTitle">{_l('👋您好！我是mingo')}</div>
      <div className="description">
        {_l('我是您的AI助手，我可以为您回答HAP使用问题，辅助您进行应用搭建和数据输入。')}
      </div>
      <div className="beginButton" onClick={onClose}>
        {_l('开始使用')}
      </div>
    </WelcomeWrap>
  );
}
