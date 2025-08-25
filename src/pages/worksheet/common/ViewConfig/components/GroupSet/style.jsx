import styled from 'styled-components';
import { FlexCenter } from 'worksheet/styled';

export const Wrap = styled.div`
  .hasData {
    .icon-rename_input {
      color: #9e9e9e;
      padding-right: 10px;
      &:hover {
        color: #1677ff;
      }
    }
    .cancle {
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        color: #757575;
      }
    }
    .Dropdown {
      width: 100%;
      display: flex;
      line-height: 36px;
      height: 36px;
      opacity: 1;
      background: #ffffff;
      border-radius: 4px;
      margin: 8px 0;
      box-sizing: border-box;
      &.mTop0 {
        margin: 0 8px 0 0;
      }
      .actionIcon {
        width: 13px;
      }
      & > div {
        flex: 1;
      }
      .Dropdown--input {
        padding: 0 12px 0 12px;
        width: 100%;
        display: flex;
        border: 1px solid #dddddd;
        border-radius: 4px;
        height: 36px;
        &.active {
          border: 1px solid #1677ff;
        }
        .value,
        .Dropdown--placeholder {
          flex: 1;
          max-width: 100%;
        }
        .Icon {
          line-height: 34px;
        }
        .List {
          width: 100%;
          top: 104% !important;
        }
      }
    }
    .inputBox {
      width: 100%;
      display: flex;
      line-height: 36px;
      height: 36px;
      opacity: 1;
      background: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 4px;
      padding: 0 12px 0 12px;
      .icon {
        line-height: 35px;
      }
      .itemText {
        text-align: left;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .checkBox {
      vertical-align: middle;
    }
    .ming.Checkbox.Checkbox--disabled {
      color: #151515;
    }
    .iconWrap {
      display: inline-block;
      vertical-align: middle;
      margin-left: 8px;
    }
  }
  .noData {
    .cover {
      padding-top: 60px;
      img {
        width: 100%;
        display: block;
      }
    }
    h6 {
      font-size: 20px;
      font-weight: 500;
      color: #151515;
      text-align: center;
      padding: 0;
      padding-top: 32px;
      margin: 0;
    }
    .text {
      font-weight: 400;
      text-align: center;
      color: #9e9e9e;
      line-height: 20px;
      font-size: 13px;
      width: 80%;
      margin: 24px auto 0;
    }
    .addFilterCondition {
      width: 100% !important;
      position: relative;
      width: auto !important;
      height: auto !important;
      border: 0px !important;
      line-height: 1 !important;
      text-align: center;
      &.nodata {
        margin: 32px auto 0 !important;
      }
      & > span {
        width: 100% !important;
        display: block !important;
        padding: 0 0 !important;
      }
      span.addIcon {
        position: relative;
        background: #1677ff;
        border-radius: 3px;
        color: #fff;
        display: inline-block;
        padding: 12px 32px;
        cursor: pointer;
        font-weight: bold;
        .icon {
          font-size: 20px;
        }
        &:hover {
          background: #1565c0;
        }
      }
    }
  }
  .RelateRecordDropdown-selected {
    height: auto;
  }
`;

const DisplayControlOption = styled(FlexCenter)`
  .icon {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.4);
    margin-right: 4px;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
  }
`;

export const SelectValue = styled(DisplayControlOption)`
  &：hover {
    .icon {
      color: #1677ff;
    }
  }
`;
