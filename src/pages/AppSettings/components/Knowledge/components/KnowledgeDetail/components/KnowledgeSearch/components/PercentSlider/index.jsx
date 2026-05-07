import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  .percentSlider {
    width: 100px;
    height: 4px;
    border-radius: 4px;
    background-color: var(--color-border-secondary);
    .percentBar {
      width: ${({ percent }) => `${Math.min(percent, 100)}%`};
      height: 100%;
      border-radius: 4px;
      background-color: var(--color-primary);
    }
  }
  .percentText {
    font-size: 12px;
    color: var(--color-text-primary);
  }
`;

const PercentSlider = ({ percent, dimension = 100 }) => {
  const value = Number(percent * dimension).toFixed(4);

  return (
    <Container percent={value}>
      <div className="percentSlider">
        <div className="percentBar" />
      </div>
      <div className="percentText">{Number(value).toFixed(4)}</div>
    </Container>
  );
};

export default memo(PercentSlider);
