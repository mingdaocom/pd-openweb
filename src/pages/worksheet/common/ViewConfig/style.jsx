import styled from 'styled-components';

export const SwitchStyle = styled.div`
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: var(--color-text-disabled);
    }
  }
  .w30 {
    width: 30px;
    flex-shrink: 0;
  }
  .w28 {
    width: 28px;
    flex-shrink: 0;
  }
`;

export const TimeDropdownChoose = styled.div`
  margin-top: 6px;
  .timeDropdown {
    width: 100%;
    .ant-select-selector {
      border-radius: 3px;
      line-height: 36px;
      height: 36px !important;
      span {
        line-height: 36px;
        height: 36px;
        font-size: 13px;
      }
    }
  }
`;

export const ShowChoose = styled.div`
  .hiddenDaysBox {
    margin-left: 26px;
    display: flex;
    li {
      flex: 1;
      height: 36px;
      display: inline-block;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;
      line-height: 36px;
      border: 1px solid var(--color-border-secondary);
      overflow: hidden;
      margin-right: -1px;
      position: relative;
      &:last-child {
        border-radius: 0 3px 3px 0;
        overflow: hidden;
      }
      &:first-child {
        border-radius: 3px 0px 0px 3px;
        overflow: hidden;
      }
      &.checked {
        background: var(--color-primary);
        color: var(--color-white);
        border-top: 1px solid var(--color-primary);
        border-bottom: 1px solid var(--color-primary);
        z-index: 1;
        &:last-child {
          border-right: 1px solid var(--color-primary);
        }
        &:first-child {
          border-left: 1px solid var(--color-primary);
        }
      }
    }
  }
`;

export const ViewSettingWrap = styled.div`
  .withSwitchConfig {
    display: flex;
    justify-content: space-between;
    .configSwitch {
      display: flex;
      align-items: center;
      .icon {
        vertical-align: middle;
        &-ic_toggle_on {
          color: #00c345;
        }
        &-ic_toggle_off {
          color: var(--color-text-disabled);
        }
      }
      .switchText {
        margin-right: 6px;
        line-height: 24px;
      }
    }
  }
  .title {
    font-weight: bold;
    // margin-top: 12px;
    &:first-child {
      margin: 0;
    }
  }
  .subTitle {
    color: var(--color-text-title);
    &.withDisplayControl {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  .settingContent {
    margin-top: 8px;
  }
  .Dropdown {
    background-color: var(--color-background-primary);
    &.disabled {
      background-color: var(--color-background-secondary);
    }
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
