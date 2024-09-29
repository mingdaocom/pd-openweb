import styled from 'styled-components';
export const Con = styled.div`
  p {
    margin: 0;
  }
  max-width: 800px;
  margin: 0 40px;
  padding-bottom: 100px;
  h5,
  h6 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin-top: 38px;
  }
  .title {
    width: 100%;
    padding: 0px 9px;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    &:-ms-input-placeholder {
      color: #9e9e9e !important;
    }
    &::-ms-input-placeholder {
      color: #9e9e9e;
    }
    &::placeholder {
      color: #9e9e9e;
    }
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .con {
    width: 100%;
    padding: 24px 16px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: center;
    .ming.Dropdown {
      .Dropdown--input {
        padding-left: 0px;
      }
      .currentMenu {
        color: #2196f3;
      }
    }
    .ming.MenuItem .Item-content:not(.disabled):hover {
      background-color: #f5f5f5 !important;
      color: #333 !important;
    }

    .btnCon {
      width: 180px;
      margin-right: 34px;
      & > div {
        height: 32px;
      }
      .btnStr {
        color: #fff;
        line-height: 32px;
        min-height: 32px;
        padding: 0 20px;
        background: #2196f3;
        border-radius: 4px;
        max-width: 155px;
        box-sizing: border-box;
      }
      i {
        color: #bdbdbd;
        opacity: 0;
        &:hover {
          color: #2196f3;
        }
      }
    }
    &:hover {
      border: 1px solid #ccc;
      i {
        opacity: 1;
      }
    }
    &.nextBtn {
      .btnCon {
        .btnStr {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          color: #333;
        }
      }
      &.noAction {
        opacity: 0.5;
        position: relative;
      }
    }
    .cover {
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
    .switchBtn {
      z-index: 2;
    }
  }
  .moreActionCon {
    border-top: 1px solid #eaeaea;
    padding-bottom: 20px;
    align-items: center;
    justify-content: center;
    .SwitchDisable {
      position: absolute;
      right: 0;
      width: 48px;
      height: 24px;
      cursor: not-allowed;
    }
    &.borderB {
      border-bottom: 1px solid #eaeaea;
    }
  }
  .autoreserveCon {
    .Radio {
      margin-top: 12px;
    }
  }
  .w200 {
    width: 200px;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
  }
  .act {
    flex-shrink: 0;
    min-width: 0;
  }
  .controlsDropdown {
    flex-shrink: 0;
    min-width: 0;
    height: auto;
    min-height: 36px;
    .itemT {
      background: #f5f5f5;
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      span {
        max-width: 200px;
        overflow: hidden;
      }
      i {
        color: #9e9e9e;
        &:hover {
          color: #757575;
        }
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      min-height: 36px !important;
      height: auto !important;
    }
    .Dropdown--input .value {
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
`;
export const Wrap = styled.div`
  width: 340px;
  background: #ffffff;
  box-shadow: 0px 3px 12px 1px rgba(0, 0, 0, 0.1607843137254902);
  border-radius: 3px;
  padding: 16px;
  p {
    margin: 0;
  }
  .btnName {
    width: 100%;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid #dddddd;
    padding: 0 12px;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
`;
export const WrapTxt = styled.div`
   {
    width: 100%;
    background: #f8f8f8;
    border: 1px solid #dddddd;
    border-radius: 3px;
    padding: 16px;
    box-sizing: border-box;
    color: #333;
    margin-top: 12px;
    display: flex;
    &.createCon {
      background: #fff;
      display: block;
    }

    .txtFilter {
      flex-shrink: 0;
      min-width: 0;
      flex: 1;
      font-size: 13px;
      color: #333;
      line-height: 24px;

      p {
        line-height: 22px;
        padding: 0;
        margin: 0;
        display: flex;

        .titleTxt {
          width: 100px;
          font-size: 13px;
          line-height: 22px;
          display: inline-block;
          min-width: 0;
          flex-shrink: 0;
        }

        .txt {
          flex: 1;
          font-weight: 500;
          font-size: 13px;
          min-width: 0;
          flex-shrink: 0;
        }
      }
    }

    .editFilter {
      width: 20px;

      &:hover {
        color: #2196f3 !important;
      }
    }

    .editWorkflow {
      width: auto;
      color: #2196f3;
    }
  }
`;
