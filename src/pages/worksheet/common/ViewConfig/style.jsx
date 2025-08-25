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
      color: #bdbdbd;
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
      border: 1px solid #e0e0e0;
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
        background: #1677ff;
        color: #fff;
        border-top: 1px solid #1677ff;
        border-bottom: 1px solid #1677ff;
        z-index: 1;
        &:last-child {
          border-right: 1px solid #1677ff;
        }
        &:first-child {
          border-left: 1px solid #1677ff;
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
          color: #bdbdbd;
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
    color: #515151;
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
    background-color: #fff;
    &.disabled {
      background-color: #f5f5f5;
    }
  }
`;

export const AnimationWrap = styled.div`
  display: flex;
  padding: 2px;
  background: #f0f0f0;
  border-radius: 3px;
  .animaItem {
    height: 32px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    color: #757575;
    flex: 1;
    margin-left: 2px;
    &:first-child {
      margin-left: 0;
    }
    &:hover {
      color: #1677ff;
      i {
        color: #1677ff;
      }
    }
    i {
      color: #757575;
    }
    &.active {
      background: #ffffff;
      color: #1677ff;
      i {
        color: #1677ff;
      }
    }
    &.disabled {
      color: #bdbdbd !important;
      cursor: not-allowed;
    }
  }
`;
