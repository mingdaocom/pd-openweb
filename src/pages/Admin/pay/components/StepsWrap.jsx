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
    color: #1890ff !important;
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
    background-color: #e0e0e0;
  }
  .ant-steps-item > .ant-steps-item-container > .ant-steps-item-tail {
    padding: 31px 0 3px !important;
    left: 14px !important;
  }
  .ant-steps-item-wait .ant-steps-item-icon {
    background-color: #f5f5f5;
    border: 1px solid #f5f5f5;
  }
  .ant-steps-item-finish .ant-steps-item-icon {
    background-color: rgba(33, 150, 243, 0.1);
    border-color: transparent;
  }
  &.isFinished {
    .ant-steps-item:first-child > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: #1890ff !important;
    }
    .ant-steps-item.customTail > .ant-steps-item-container > .ant-steps-item-tail::after {
      background-color: #e0e0e0 !important;
    }
  }
`;

export const Step = Steps.Step;
