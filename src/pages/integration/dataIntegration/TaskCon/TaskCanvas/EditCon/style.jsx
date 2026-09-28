import styled from 'styled-components';

export const WrapL = styled.div`
  .itemOpName {
    // max-width: 100px;
    vertical-align: middle;
    line-height: 14px;
  }
  .icon-expand_more {
    display: none;
  }
  .autosize {
    flex: 1;
  }
  .con {
    margin-top: 14px;
  }
  .addCondition {
    height: 32px;
    line-height: 32px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    display: inline-block;
    padding: 0 18px;
  }
  .joinCondition {
    .dropCondition {
      width: 208px;
      height: 36px;
      background: var(--color-background-primary);
      opacity: 1;
      border-radius: 4px;
      .value {
        width: 168px;
      }
    }
    .andOr {
      height: 36px;
      overflow: hidden;
    }
    .closeBtn {
      opacity: 0;
      color: var(--color-text-tertiary);
    }
    &:hover {
      .closeBtn {
        opacity: 1;
        &:hover {
          color: var(--color-error);
        }
      }
    }
  }
  .addFilter {
    height: 58px;
    background: var(--color-background-primary);
    border: 1px dashed var(--color-border-primary);
    border-radius: 4px;
    color: var(--color-primary);
    line-height: 58px;
    &:hover {
      border: 1px dashed var(--color-primary);
    }
  }
  .dropWorksheet {
    margin-top: 14px;
    width: 100%;
    &.selectGroupDropWorksheet {
      height: 36px;
      width: 100% !important;
      .hap-select {
        margin-bottom: 0 !important;
        width: 100% !important;
      }
    }
  }
  .unionC {
    flex-wrap: wrap;
    justify-content: space-between;
    li {
      flex-shrink: 0;
      flex-grow: 0;
      width: 164px;
      border: 1px solid var(--color-border-primary);
      background: var(--color-background-primary);
      border-radius: 4px;
      color: var(--color-text-secondary);
      padding: 9px 0;
      .er {
        color: var(--color-text-tertiary);
        font-weight: 400;
      }
      &.isCur {
        background: rgba(33, 150, 243, 0.1);
        border: 1px solid var(--color-primary);
        color: var(--color-primary);
      }
    }
  }
  .groupCon {
    .icon {
      color: var(--color-text-disabled);
      &:hover {
        color: var(--color-primary) !important;
      }
    }
  }
  .itemOp {
    line-height: 1;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    padding: 5px 12px;
    border-radius: 14px;
    margin-right: 8px;
    display: inline-block;
  }
`;
