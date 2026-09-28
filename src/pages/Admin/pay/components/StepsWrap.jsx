import styled from 'styled-components';
import { Steps } from 'ming-ui/antd-components';

export const StepsWrap = styled(Steps)`
  height: 235px;
  width: unset !important;
  .hap-steps-item-title {
    font-weight: 700;
    margin-bottom: 60px;
  }
  .hap-steps-item-icon {
    width: 28px;
    height: 28px;
    line-height: 26px;
    border-radius: 28px;
    font-weight: 500;
  }
  .hap-steps-item-process > .hap-steps-item-container > .hap-steps-item-tail::after,
  .hap-steps-item-wait > .hap-steps-item-container > .hap-steps-item-tail::after {
    background-color: var(--color-background-tertiary);
  }
  .hap-steps-item > .hap-steps-item-container > .hap-steps-item-tail {
    padding: 31px 0 3px !important;
    left: 14px !important;
  }
  &.isFinished {
    .hap-steps-item:first-child > .hap-steps-item-container > .hap-steps-item-tail::after {
      background-color: var(--color-primary) !important;
    }
    .hap-steps-item.customTail > .hap-steps-item-container > .hap-steps-item-tail::after {
      background-color: var(--color-background-tertiary) !important;
    }
  }

  .hap-steps-item-wait {
    .hap-steps-item-icon {
      background-color: var(--color-background-tertiary);
      border-color: var(--color-background-tertiary);
      .hap-steps-icon {
        color: var(--color-text-placeholder);
      }
    }
    .hap-steps-item-container > .hap-steps-item-content > .hap-steps-item-title {
      color: var(--color-text-disabled);
    }
  }
  .hap-steps-item-finish {
    .hap-steps-item-icon {
      background-color: rgba(33, 150, 243, 0.15);
      border-color: transparent;
    }
    .hap-steps-item-container > .hap-steps-item-content > .hap-steps-item-title {
      color: var(--color-primary);
    }
  }
  .hap-steps-item-process {
    .hap-steps-item-container > .hap-steps-item-icon {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    .hap-steps-item-container > .hap-steps-item-content > .hap-steps-item-title {
      color: var(--color-primary);
    }
  }
`;
