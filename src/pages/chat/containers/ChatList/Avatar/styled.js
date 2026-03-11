import styled from 'styled-components';

export const Wrap = styled.div`
  .header {
    background-color: var(--color-background-tertiary);
  }
  .horizontalPadding {
    padding: 0 12px;
  }
  .content {
    flex: 1;
    background-color: var(--color-background-card);
  }
  .footer {
    padding: 24px 10px;
    background-color: var(--color-background-card);
  }
  .divider {
    width: 100%;
    height: 1px;
    background-color: var(--color-border-secondary);
  }
  .itemWrap {
    padding: 7px 20px;
    &.notHover:hover {
      background-color: initial;
    }
    &:hover {
      background-color: var(--color-background-hover);
    }
  }
  .logout:hover {
    color: var(--color-error) !important;
  }
  .myAccount {
    padding: 3px 8px;
    border-radius: 2px;
    &:hover {
      background-color: var(--color-border-secondary);
    }
  }
  .accountStatus {
    height: 32px;
    background-color: var(--color-background-primary);
    border-radius: 16px;
    padding: 10px 12px;
    cursor: pointer;
    margin: 16px 20px 0;
    width: calc(100% - 24px);
    max-width: unset !important;
    &:hover {
      background-color: var(--color-border-primary);
    }
  }
  .shortcutKey {
    padding: 0px 5px;
    margin-right: -5px;
    text-align: center;
    border-radius: 3px;
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    font-family: -apple-system、Segoe UI Variable Display、Segoe UI-MONOSPACE;
  }
`;

export const PopoverWrap = styled.div`
  width: 280px;
  .horizontalPadding {
    padding: 7px 20px;
  }
  .itemWrap {
    padding: 7px 20px;
    &:hover,
    &.active {
      background-color: var(--color-background-hover);
    }
    .trial {
      color: var(--color-warning) !important;
    }
    .free {
      color: var(--color-success) !important;
    }
  }
`;
