import React from 'react';
import cx from 'classnames';
import styled, { css, keyframes } from 'styled-components';
import { Icon } from 'ming-ui';

const typeStyleMap = {
  warning: css`
    background-color: var(--color-warning-bg);
  `,
  error: css`
    background-color: var(--color-error-bg);
  `,
  primary: css`
    background-color: var(--color-primary-transparent);
  `,
};

const iconColorMap = {
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  primary: 'var(--color-primary)',
};

const iconRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const BannerWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  width: 100%;
  height: 42px;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);

  ${({ type }) => typeStyleMap[type]}

  .icon {
    margin-right: 10px;
    font-size: 16px;
    color: ${({ type }) => iconColorMap[type]};
  }

  .icon-agent_loading {
    display: inline-block;
    animation: ${iconRotate} 0.8s linear infinite;
    font-size: 16px;
  }

  .action {
    margin-left: 6px;
    color: var(--color-primary);
    cursor: pointer;
    &:hover {
      color: var(--color-primary-light);
    }
    &:active {
      color: var(--color-primary-dark);
    }
    &.disabled {
      color: var(--color-text-disabled) !important;
      cursor: not-allowed;
    }
  }
`;

const Banner = ({ icon, type = 'primary', text, action, className }) => {
  return (
    <BannerWrapper className={className} type={type}>
      {icon && <Icon icon={icon} />}
      <span className="text">{text}</span>
      {action && (
        <span
          className={cx('action', { disabled: action.disabled })}
          onClick={() => {
            if (action.disabled) return;
            action.onClick?.();
          }}
        >
          {action.text}
        </span>
      )}
    </BannerWrapper>
  );
};

export default Banner;
