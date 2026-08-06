import styled from 'styled-components';

export const Wrap = styled.div`
  overflow: hidden;
  .sideNav {
    border-right: 1px solid var(--color-border-secondary);
    min-height: 80%;
    width: 200px;
    overflow: hidden;
    .ant-list {
      overflow: auto;
      padding-bottom: 8px;
    }
    .ant-list-item {
      padding: 8px 0 0;
      border-bottom: none;
      width: 100%;
      overflow-x: hidden;
    }
    .ant-checkbox-wrapper > span:not(.ant-checkbox) {
      .ant-checkbox {
        width: 38px;
      }
      overflow: hidden;
      flex-shrink: 0;
      min-width: 0;
      flex: 1;
    }
  }
  .con {
    overflow: auto;
    padding: 15px 20px 24px;
    .hasSet {
      color: var(--color-success);
    }
    .rolePermissionInlineRow {
      display: inline-flex;
      align-items: center;
      margin-right: 8px;
      vertical-align: middle;
      & > .ant-checkbox-wrapper {
        display: inline-flex !important;
        align-items: center !important;
        line-height: 1 !important;
      }
      & .ant-checkbox {
        top: 0 !important;
      }
      & .ant-checkbox + span {
        line-height: 1.2;
        display: inline-flex;
        align-items: center;
      }
      :global(.ming.Icon) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .recordLoggingRangeText {
        color: var(--color-text-secondary);
      }
      .recordLoggingSettingIcon:hover {
        color: var(--color-primary) !important;
      }
    }
  }
  .footer {
    border-top: 1px solid var(--color-border-secondary);
  }
  .radioCon {
    display: flex;
    &:before {
      content: ' ';
      width: 2px;
      background: var(--color-border-primary);
      border-radius: 1px;
      display: block;
      margin-left: 8px;
      margin-right: 20px;
      margin-top: -10px;
      margin-bottom: -15px;
    }
  }
  .conRadioGroupForBtn {
    .ant-radio-group {
      border-radius: 4px;
      overflow: hidden;
      .ant-radio-button-wrapper {
        background: var(--color-background-secondary) !important;
        border: 2px solid var(--color-background-secondary) !important;
        transition: none;
        padding: 0 25px;
      }
      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
        background: var(--color-background-primary) !important;
        color: var(--color-text-primary) !important;
      }
      .ant-radio-button-wrapper:not(:first-child)::before {
        display: none !important;
      }
      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
        box-shadow: none;
      }
    }
  }
`;
