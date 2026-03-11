import React from 'react';
import styled, { keyframes } from 'styled-components';

// 动画 keyframes
const load = keyframes`
  0% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.2;
    transform: scale(0.2);
  }
`;

// 容器
const LoadingWrapper = styled.div`
  width: 130px;
  height: 15px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 动画点
const Dot = styled.span`
  display: inline-block;
  width: 15px;
  height: 100%;
  border-radius: 50%;
  background: var(--color-primary);
  animation: ${load} 1.04s ease infinite;
  animation-delay: ${props => props.delay}s;
`;

const Loading = () => {
  // 定义动画延迟数组
  const delays = [0.13, 0.26, 0.39, 0.52, 0.65];

  return (
    <LoadingWrapper>
      {delays.map((d, i) => (
        <Dot key={i} delay={d} />
      ))}
    </LoadingWrapper>
  );
};

export default Loading;
