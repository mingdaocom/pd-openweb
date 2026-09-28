import styled from 'styled-components';

export const LOG_TABLE_BODY_SCROLL_Y = 350;

export const Wrap = styled.div`
  .logTabs {
    display: flex;
    height: 40px;
    border-bottom: 1px solid var(--color-border-secondary);
    margin-bottom: 26px;
  }
  .logTabItem {
    position: relative;
    height: 40px;
    line-height: 40px;
    margin-right: 32px;
    color: var(--color-text-secondary);
    cursor: pointer;
    &.active {
      color: var(--color-primary);
      font-weight: bold;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: var(--color-primary);
      }
    }
  }
  .con {
    height: 450px;
    padding-bottom: 0;
    overflow: hidden;
  }
  .topAct {
    display: flex;
    align-items: center;
    height: 32px;
    padding-bottom: 28px;
    box-sizing: content-box;
    .title {
      flex: none;
    }
    .searchWrapper {
      width: 230px;
      height: 32px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      border-radius: 3px;
      vertical-align: middle;
      .cursorText {
        height: 30px;
        border: none;
      }

      align-items: center;
      padding: 0 8px;
      input {
        min-width: 0;
        border: none;
        line-height: 30px;
        box-sizing: border-box;
        vertical-align: top;
      }
      i::before {
        line-height: 32px;
      }
      .none {
        display: none;
      }
    }
    .hap-picker {
      width: 410px;
      border: none;
      .hap-picker-input {
        height: 32px;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-secondary);
        border-radius: 3px;
        padding: 0 15px;
      }
    }
  }
  .accountCell {
    min-width: 0;
    display: flex;
    align-items: center;
    .roleAvatar {
      flex: none;
    }
    .accountName {
      min-width: 0;
      margin-left: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .operationContent {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
  .operationObjectName {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .logInfoTable {
    height: 100%;
    .hap-table {
      border-top: 1px solid var(--color-border-secondary);
    }
    .hap-table-container,
    .hap-table-content,
    .hap-table-header,
    .hap-table-body,
    .hap-table-thead > tr > th,
    .hap-table-tbody > tr > td {
      border-left: none !important;
      border-right: none !important;
    }
    .hap-table-thead > tr > th {
      height: 42px;
      padding: 0 12px;
      background: var(--color-background-primary);
      border-bottom: 1px solid var(--color-border-secondary);
    }
    .hap-table-tbody > tr > td {
      height: 70px;
      padding: 0 12px;
      border-bottom: 1px solid var(--color-border-secondary);
    }
    .hap-table-body {
      overflow-y: auto !important;
    }
    .hap-pagination {
      width: 100%;
      margin: 20px 0 0;
      display: flex;
      justify-content: center;
    }
  }
`;
