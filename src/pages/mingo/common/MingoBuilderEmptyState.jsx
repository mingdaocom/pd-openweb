import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import mingoLogo from './images/mingo-logo.png';

const APP_BUILDER_SELECTOR = '[data-mingo-app-builder="true"]:not([aria-hidden="true"])';

const gradientShiftDiagonal = keyframes`
  0% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

const Wrap = styled.div`
  position: absolute;
  top: 0;
  right: ${p => p.$rightOffset}px;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px 10vh;
  text-align: center;
  pointer-events: none;
  overflow: hidden;
  background: var(--color-background-primary);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      135deg,
      #fff 0%,
      #fbf9ff 20%,
      #ddcdff 35%,
      #ffb4d3 50%,
      #ddcdff 65%,
      #fbf9ff 80%,
      #fff 100%
    );
    background-size: 400% 400%;
    animation: ${gradientShiftDiagonal} 6s linear infinite;
    opacity: 0.2;
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 3;
  }

  .brand-wordmark {
    display: block;
    width: 328px;
    max-width: 60%;
    height: auto;
    margin: 0 auto;
  }

  .title {
    margin-top: ${p => (p.$compact ? 20 : 30)}px;
    color: var(--color-text-primary);
    font-size: ${p => (p.$compact ? 24 : 28)}px;
    line-height: 48px;
    font-weight: 500;
  }

  .description {
    margin-top: ${p => (p.$compact ? 0 : 8)}px;
    color: var(--color-text-secondary);
    font-size: ${p => (p.$compact ? 16 : 20)}px;
    line-height: ${p => (p.$compact ? 'normal' : '34px')};
    font-weight: 500;
  }
`;

export function useMingoAppBuilderVisible(containerRef, { disabled = false, onVisibleChange } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (disabled) return undefined;

    const node = containerRef.current;

    if (!node) return undefined;

    const syncVisible = () => {
      const nextVisible = !!node.querySelector(APP_BUILDER_SELECTOR);

      setVisible(nextVisible);

      if (onVisibleChange) onVisibleChange(nextVisible);
    };

    const timer = setTimeout(syncVisible, 0);

    if (typeof MutationObserver === 'undefined') return () => clearTimeout(timer);

    const observer = new MutationObserver(syncVisible);

    observer.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-mingo-app-builder'],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef, disabled, onVisibleChange]);

  return disabled ? false : visible;
}

export default function MingoBuilderEmptyState({ rightOffset = 0, compact = false }) {
  return (
    <Wrap $rightOffset={rightOffset} $compact={compact} data-mingo-builder-empty-state="true">
      <div>
        <img className="brand-wordmark" src={mingoLogo} alt="mingo" />
        <div className="title">{_l('正在为您搭建应用...')}</div>
        <div className="description">{_l('确认信息后，即可为您规划应用')}</div>
      </div>
    </Wrap>
  );
}
