import styled from 'styled-components';

export const Wrap = styled.div`
  .pTop80 {
    padding-top: 80px;
  }
  .pBottom140 {
    padding-bottom: 140px;
  }
  background: var(--color-background-primary);
  overflow-y: auto;
  padding: 32px 32px;
  .timeNum {
    li {
      width: 32%;
      margin-right:16%
      height: 120px;
      background: var(--color-background-secondary);
      border-radius: 4px;
      text-align: left;
      padding: 0 20px;
      .des {
        font-weight: 600;
        color: var(--color-text-secondary);
        padding-top: 25px;
      }
      .txt {
        font-size: 32px;
        font-weight: 400;
        color: var(--color-text-title);
      }
      .txtTime {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  .timeDrop {
    width: 300px;
  }
  .tableCon {
    width: 100%;
    height: 207px;
    .chartBox {
      height: 207px;
    }
    .loadingChart {
      position: absolute;
      top: 0;
      z-index: 1;
    }
  }
  .listTable {
    .trCon {
      border-bottom: 1px solid var(--color-border-secondary);
      font-weight: 400;
      min-height: 55px;
      &.isErr {
        color: var(--color-error);
      }
      &.isGreen {
        color: var(--color-success);
      }
      .item {
        min-width: 0;
        word-break: break-word;
        flex-shrink: 0;
        padding: 8px 6px;
        &.width100 {
          width: 100px;
        }
      }
    }
    .flex2 {
      flex: 2;
    }
    .sortIcon {
      color: var(--color-text-disabled);
      height: 8px;

      &.selected {
        color: var(--color-primary);
      }
    }
  }
  .pageCon {
    .pre,
    .next {
      display: inline-block;
      margin: 0 32px;
      cursor: pointer;
      color: var(--color-text-title);
      &.disable {
        cursor: not-allowed;
        color: var(--color-text-tertiary);
      }
    }
  }
  .searchCon {
    border-radius: 4px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-text-disabled);
    font-size: 14px;
  }
`;
