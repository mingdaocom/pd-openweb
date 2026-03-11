import styled from 'styled-components';
import { Menu } from 'ming-ui';

export const Wrap = styled.div`
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  background: var(--color-background-primary);
  min-height: 68px;
  padding: 12px 0;
  margin: 0 40px;
  .iconCon {
    width: 36px;
    height: 36px;
    border-radius: 5px;
    flex-shrink: 0;
    min-width: 0;
    background: var(--color-text-disabled);
    &.isRun {
      background: var(--color-primary);
    }
    .iconTitle {
      color: var(--color-white);
    }
  }
  .moreActive {
    opacity: 0;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    background: var(--color-background-secondary);
    .moreActive {
      opacity: 1;
    }
  }
  .ant-switch-checked {
    background-color: var(--color-task);
  }
`;

export const WrapS = styled(Menu)`
  .ming.Item .Item-content .Icon {
    left: 15px;
  }
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background: var(--color-background-secondary) !important;
    color: initial !important;
    .icon {
      color: var(--color-text-tertiary) !important;
    }
    .Red {
      color: var(--color-error) !important;
    }
  }
  .Red.ming.MenuItem .Item-content:not(.disabled):hover {
    color: var(--color-error) !important;
  }
`;
export const WrapDialog = styled.div`
  .ic {
    span {
      padding: 4px 6px;
      border-radius: 3px;
      margin-left: -6px;
      &:hover {
        background: var(--color-background-hover);
      }
    }
  }
`;
