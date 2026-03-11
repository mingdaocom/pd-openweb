import styled from 'styled-components';

export const Wrap = styled.div`
  p {
    margin: 0;
  }
  .Bold400 {
    font-weight: 400;
  }
  .Green_right {
    color: var(--color-success);
  }
  .iconCon {
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 6px;
    position: relative;
    text-align: center;
    line-height: 50px;
  }
  width: 880px;
  margin: 0 auto;
  background: var(--color-background-primary);
  // border: 1px solid var(--color-border-primary);
  border-radius: 10px;
  .con {
    padding: 20px 24px;
    .title {
      width: 130px;
      padding-right: 20px;
    }
  }
  .workflowSettings {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .line {
    padding: 10px 0;
    border-bottom: 1px solid var(--color-background-disabled);
  }
  .btn {
    &.disable {
      background: var(--color-background-secondary);
      color: var(--color-text-disabled);
      border: 1px solid var(--color-text-disabled);
    }
  }
  .customTextareaCon {
    margin-top: -10px;
    padding: 0 24px 24px;
    .actionControlMore {
      width: 34px;
      height: 34px;
      border-width: 1px 1px 1px 0;
      border-style: solid;
      box-sizing: border-box;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border-color: var(--color-border-primary);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:not(:hover) {
        color: var(--color-text-secondary) !important;
      }
    }
  }
  .urlForCopy {
    border-radius: 3px;
    height: 36px;
    line-height: 36px;
    background: var(--color-background-disabled);
    border: 1px solid var(--color-border-secondary);
    color: var(--color-text-title);
    font-size: 14px;
    padding: 0 10px;
    overflow: hidden;
  }
  .copyBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 25px;
    background: var(--color-background-disabled);
    border-radius: 4px 4px 4px 4px;
    border: 1px solid var(--color-border-secondary);
    &:hover {
      color: var(--color-primary);
    }
  }
`;
