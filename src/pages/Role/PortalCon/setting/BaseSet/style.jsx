import styled from 'styled-components';

export const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .setCheckbox {
    width: 130px;
  }
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .LineHeight18 {
    line-height: 18px;
  }
  .pageTitle {
    width: 592px;
    height: 36px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 0 14px;
    &:hover {
      border: 1px solid #bdbdbd;
    }
    &:focus {
      border: 1px solid #1677ff;
    }
  }
  .urlH,
  .urlEnd {
    padding: 0 20px;
    height: 36px;
    background: #f5f5f5;
    border-radius: 3px 0px 0px 3px;
    line-height: 36px;
    box-sizing: border-box;
    vertical-align: middle;
    &.url {
      border-radius: 3px;
    }
  }
  .urlEnd {
    border-radius: 0px 3px 3px 0px;
  }
  input.domainName {
    width: 200px;
    height: 36px;
    padding: 0 12px;
    line-height: 36px;
    background: #ffffff;
    border-top: 1px solid #f5f5f5;
    border-bottom: 1px solid #f5f5f5;
    box-sizing: border-box;
    vertical-align: middle;
    border-left: 0;
    border-right: 0;
  }
  .noWX,
  .WX {
    min-width: 299px;
    padding: 10px 16px;
    background: #f8f8f8;
    border-radius: 6px;
    a {
      color: #1677ff;
    }
    &.WX {
      a {
        color: green;
      }
    }
  }
  .exAccountSendCon {
    height: 36px;
    background: #f5f5f5;
    border-radius: 3px;
    border: 1px solid #dddddd;
    padding: 0 16px;
    line-height: 36px;
    .editFlow {
      color: #1677ff;
    }
  }
  .rangePicker {
    width: 420px;
    margin-left: 44px;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  .cardSelect {
    font-size: 12px !important;
    .ant-select-selection-item-remove:hover {
      color: #1677ff !important;
    }
  }
`;
export const SwitchStyle = styled.div`
  display: inline-block;
  .switchText {
    line-height: 24px;
    font-size: 13px;
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
`;
