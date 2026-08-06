import React from 'react';
import styled from 'styled-components';
import { IconArrowDown } from 'src/components/Agent/ui/icons';

const Wrap = styled.button`
  position: absolute;
  left: 50%;
  bottom: ${p => p.$bottom || '20px'};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  flex: none;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  border: 1px solid var(--color-border-secondary);
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  z-index: 3;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  [data-theme='dark'] & {
    background: var(--color-background-card);
  }

  &:focus-visible,
  &:active {
    border-color: var(--color-mingo);
    background: var(--color-background-hover);
    color: var(--color-mingo);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function ScrollToBottom({ bottom, className, onClick }) {
  return (
    <Wrap type="button" aria-label={_l('滚动到底部')} $bottom={bottom} className={className} onClick={onClick}>
      <IconArrowDown />
    </Wrap>
  );
}
