import styled from 'styled-components';

export const Wrap = styled.div`
  .line {
    border-top: 1px solid var(--color-border-secondary);
    margin-top: 24px;
  }
`;

export const AnimationWrap = styled.div`
  display: flex;
  padding: 2px;
  background: var(--color-background-tertiary);
  border-radius: 3px;
  .animaItem {
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    color: var(--color-text-secondary);
    flex: 1;
    margin-left: 2px;
    &:first-child {
      margin-left: 0;
    }
    &:hover {
      color: var(--color-primary);
      i {
        color: var(--color-primary);
      }
    }
    i {
      color: var(--color-text-secondary);
    }
    &.active {
      background: var(--color-background-primary);
      color: var(--color-primary);
      i {
        color: var(--color-primary);
      }
    }
    &.disabled {
      color: var(--color-text-disabled) !important;
      cursor: not-allowed;
    }
  }
`;

export const WrapCount = styled.div`
  .showCount {
    width: 80px;
    .text {
      right: 10px;
      top: 0px;
      line-height: 36px;
    }
  }
`;

export const WrapPopover = styled.div`
  width: 437px;
  font-weight: 400;
  padding: 12px 6px;
  .btn {
    padding: 0 16px;
    height: 36px;
    line-height: 36px;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid var(--color-border-secondary);
    color: var(--color-text-primary);
    &.first {
      color: var(--color-white);
      background: var(--color-success);
      border: 1px solid var(--color-success);
    }
    i {
      color: var(--color-text-secondary);
      &.del {
        color: var(--color-error);
      }
      &.first {
        color: var(--color-white);
      }
    }
  }
`;
