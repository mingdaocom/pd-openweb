import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.4); }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const Bar = styled.div`
  width: 2px;
  height: 12px;
  background: var(--color-background-primary);
  border-radius: 2px;
  transform-origin: center center;

  animation: ${bounce} ${({ speed }) => speed}ms ease-in-out infinite;
`;

const VoiceMeterCSS = ({ speed = 900 }) => {
  const delays = [-200, -100, 0, -100, -200];

  return (
    <Wrapper>
      {delays.map((delay, i) => (
        <Bar key={i} speed={speed} style={{ animationDelay: `${delay}ms` }} />
      ))}
    </Wrapper>
  );
};

export default memo(VoiceMeterCSS);
