import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';

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

  ${({ $type }) => typeStyleMap[$type]}

  .icon {
    margin-right: 10px;
    font-size: 16px;
    color: ${({ $type }) => iconColorMap[$type]};
  }

  .icon-agent_loading {
    display: inline-block;
    animation: ${iconRotate} 0.8s linear infinite;
    font-size: 16px;
  }
`;

const Banner = ({ icon, type = 'primary', text, action, className }) => {
  return (
    <BannerWrapper className={className} $type={type}>
      {icon && <Icon icon={icon} />}
      <span className="text">{text}</span>
      {action && (
        <Button
          className="mLeft6"
          color="primary"
          variant="link"
          size="small"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.text}
        </Button>
      )}
    </BannerWrapper>
  );
};

export default Banner;
