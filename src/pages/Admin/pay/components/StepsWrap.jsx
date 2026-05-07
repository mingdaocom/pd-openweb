import { Steps } from 'antd';
import styled from 'styled-components';

export const StepsWrap = styled(Steps)`
  height: 235px;
  width: unset !important;
  .ant-steps-item-title {
    font-weight: 700;
    margin-bottom: 60px;
  }
  .ant-steps-item-icon {
    width: 28px;
    height: 28px;
    line-height: 26px;
    border-radius: 28px;
    font-weight: 500;
  }
  .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-tail::after,
  .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-tail::after {
    background-color: var(--color-background-tertiary);
  }
  .ant-steps-item > .ant-steps-item-container > .ant-steps-item-tail {
    padding: 31px 0 3px !important;
    left: 14px !important;
  }
  &.isFinished {
    .ant-steps-item:first-child > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: var(--color-primary) !important;
    }
    .ant-steps-item.customTail > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: var(--color-background-tertiary) !important;
    }
  }

  .ant-steps-item-wait {
    .ant-steps-item-icon {
      background-color: var(--color-background-tertiary);
      border-color: var(--color-background-tertiary);
      .ant-steps-icon {
        color: var(--color-text-placeholder);
      }
    }
    .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
      color: var(--color-text-disabled);
    }
  }
  .ant-steps-item-finish {
    .ant-steps-item-icon {
      background-color: rgba(33, 150, 243, 0.15);
      border-color: transparent;
    }
    .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
      color: var(--color-primary);
    }
  }
  .ant-steps-item-process {
    .ant-steps-item-container > .ant-steps-item-icon {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
      color: var(--color-primary);
    }
  }
`;

export const Step = Steps.Step;
