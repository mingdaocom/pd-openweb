import { Steps } from 'antd';
import styled from 'styled-components';

export const StepsWrap = styled(Steps)`
  height: 235px;
  width: unset !important;
  .ant-steps-item-title {
    font-weight: 700;
    margin-bottom: 60px;
  }
  .ant-steps-item-process .ant-steps-item-title {
    color: var(--color-link-hover) !important;
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
    background-color: var(--color-background-secondary);
  }
  .ant-steps-item > .ant-steps-item-container > .ant-steps-item-tail {
    padding: 31px 0 3px !important;
    left: 14px !important;
  }
  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-background-secondary);
  }
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: rgba(33, 150, 243, 0.1);
    border-color: transparent;
  }
  &.isFinished {
    .ant-steps-item:first-child > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: var(--color-link-hover) !important;
    }
    .ant-steps-item.customTail > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: var(--color-background-secondary) !important;
    }
  }
`;

export const Step = Steps.Step;
