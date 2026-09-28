import styled from 'styled-components';

export const Wrap = styled.div`
  overflow: hidden;
  .sideNav {
    border-right: 1px solid var(--color-border-secondary);
    min-height: 80%;
    width: 200px;
    overflow: hidden;
    .hap-checkbox-wrapper > span:not(.hap-checkbox) {
      .hap-checkbox {
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
      & > .hap-checkbox-wrapper {
        display: inline-flex !important;
        align-items: center !important;
        line-height: 1 !important;
      }
      & .hap-checkbox {
        top: 0 !important;
      }
      & .hap-checkbox + span {
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
    .hap-radio-group {
      border-radius: 4px;
      overflow: hidden;
      .hap-radio-button-wrapper {
        background: var(--color-background-secondary) !important;
        border: 2px solid var(--color-background-secondary) !important;
        transition: none;
        padding: 0 25px;
      }
      .hap-radio-button-wrapper-checked:not(.hap-radio-button-wrapper-disabled) {
        background: var(--color-background-primary) !important;
        color: var(--color-text-primary) !important;
      }
      .hap-radio-button-wrapper:not(:first-child)::before {
        display: none !important;
      }
      .hap-radio-button-wrapper-checked:not(.hap-radio-button-wrapper-disabled):focus-within {
        box-shadow: none;
      }
    }
  }
`;
