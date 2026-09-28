import styled from 'styled-components';

export const Wrap = styled.div`
  .setCon {
    width: 360px;
    border-right: 1px solid var(--color-border-secondary);
    flex-shrink: 0;
    min-width: 0;
    .line {
      border-bottom: 1px solid var(--color-border-secondary);
    }
    .cover {
      position: fixed;
      background: var(--color-background-secondary);
      opacity: 0.45;
      left: 0;
      top: 0;
      width: 360px;
      bottom: 0;
      z-index: 9999;
    }
    .setConB {
      padding: 24px;
      overflow-y: auto;
    }
  }
  .preview {
    background: var(--color-background-primary);
    flex-shrink: 0;
    min-width: 0;
  }
  .hoverBoxShadow {
    &:hover {
      box-shadow: 0px 1px 2px rgba(33, 150, 243, 0.3);
    }
  }
  .colorByWorksheet {
    width: 2px;
    height: calc(100% - 18px);
    position: absolute;
    left: 0;
    top: 9px;
    border-radius: 2px;
  }
`;

export const WrapDropW = styled.div`
  width: 100%;
  border-radius: 3px;
  box-shadow: var(--shadow-lg);
  padding: 6px 0;
  background-color: var(--color-background-card);
`;
export const WrapSelectCon = styled.div`
  .topCon {
    height: 12px;
  }
`;
export const WrapWorksheet = styled.div`
  .flexRowCon {
    display: flex !important;
    min-width: 0;
  }
  &.isRelative {
    background: var(--color-background-secondary);
  }
  background: var(--color-background-primary);
  border-radius: 4px;
  box-shadow: 0px 1px 2px rgba(51, 51, 51, 0.16);
  &.isAdd {
    background: initial;
    border-radius: initial;
    box-shadow: initial;
  }
  .filterConByWorksheet {
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    margin: 0 12px 0;
    box-sizing: border-box;
    width: calc(100% - 24px);
    padding: 2px 5px 8px 12px;
    display: flex !important;
    &:hover {
      background: var(--color-background-hover);
    }
    .renderFilterItem {
      span {
        display: inline-flex !important;
      }
    }
  }
`;

export const Header = styled.div`
  width: 100%;
  height: 54px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-md);
  z-index: 10000;
  .pageName {
    display: flex;
    align-items: center;
    font-size: 17px;
    .name {
      box-sizing: border-box;
      max-width: 500px;
      margin-top: 1px;
      padding: 0 10px;
      border-bottom: 1px dashed var(--color-text-tertiary);
      cursor: pointer;
    }
    input {
      max-width: 500px;
      border: none;
      font-size: 17px;
      border-bottom: 2px solid var(--color-primary);
    }
  }
  .disable,
  .disable:hover {
    background: var(--color-text-disabled);
    background-color: var(--color-text-disabled) !important;
    border: 1px solid var(--color-text-disabled);
    border-color: var(--color-text-disabled);
    cursor: not-allowed !important;
    color: var(--color-white);
  }
  .workflowStatusWrap {
    .disable,
    .disable:hover {
      .iconWrap .workflowSwitchIcon-active {
        color: var(--color-text-disabled) !important;
      }
    }
  }
`;

export const WrapPreview = styled.div`
  .pagination {
    .icon-arrow-left-border,
    .icon-arrow-right-border {
      font-size: 16px;
    }
  }
  .sheetViewTable {
    border-left: 0;
    border-right: 0;
  }
  .finished {
    color: var(--color-success);
  }
  .stop {
    color: var(--color-warning);
  }
  .coverTab {
    position: absolute;
    right: 20px;
    top: 12px;
    bottom: 0;
    left: 20px;
    z-index: 1;
    background: var(--color-background-secondary);
    opacity: 0.5;
  }
  .warnCon {
    border-radius: 5px;
    padding: 8px 14px;
    margin: 20px 24px 0;
    &.isERR {
      background: var(--color-error-bg);
    }
    &.isRunning {
      background: var(--color-primary-transparent);
    }
    &.hasRun {
      background: rgba(76, 175, 80, 0.09);
    }
    &.isStop {
      background: var(--color-warning-bg);
    }
    &.hasChange {
      .icon {
        color: var(--color-warning);
      }
      background: var(--color-warning-bg);
    }
  }
  .searchInputComp.default .icon-search {
    font-size: 20px;
    &:hover {
      color: var(--color-primary) !important;
    }
  }
  .previewHeader {
    padding: 16px 24px 0;
  }
  .previewEmpty {
    & > div {
      margin-top: -100px;
    }
  }
  .previewBtn {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .tableCon {
    width: 100%;
    min-height: 0;
    flex-shrink: 0;
  }
  .icon-task-later {
    margin-top: 2px;
  }
`;

export const TextAbsoluteCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .iconBox {
    width: 130px;
    height: 130px;
    display: inline-block;
    border-radius: 50%;
    background-size: 130px 130px;
    background-color: var(--color-background-secondary);
    text-align: center;
    line-height: 130px;
    font-size: 80px;
  }
`;
