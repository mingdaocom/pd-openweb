import styled from 'styled-components';

export const AddRelate = styled.div`
  .intro {
    font-size: 14px;
    span {
      margin-left: 6px;
      color: #2196f3;
    }
  }
  .relateWrap {
    position: relative;
    margin-top: 40px;
    min-height: 300px;
    border: 1px solid #dddddd;
    border-radius: 8px;
    padding: 20px 18px;
    .relateWarning {
      height: 44px;
      background: #f5f5f5;
      border: 1px solid #dddddd;
      display: flex;
      align-items: center;
      padding: 0 14px;
      margin-top: 16px;
      &.active {
        background: #f0f8ff;
        border: 1px solid #2196f3;
      }
    }
    .selectItem {
      margin: 24px 0 6px 0;
    }
  }
  .relateTypeTab {
    display: flex;
    position: absolute;
    top: -18px;
    background: #fff;
    left: 50%;
    border-radius: 3px;
    transform: translateX(-50%);
    overflow: hidden;
    li {
      line-height: 34px;
      padding: 0 22px;
      transition: all 0.25s;
      border: 1px solid #bdbdbd;
      cursor: pointer;
      &:last-child {
        margin-left: -1px !important;
        border-left: none !important;
      }
      &:first-child {
        border-right: 1px solid #2196f3 !important;
      }

      &.active,
      &:hover {
        color: #2196f3;
        border: 1px solid #2196f3;
      }
      &.active {
        font-weight: bold;
      }
    }
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
  .existRelateWrap {
    .emptyHint {
      margin-top: 120px;
      text-align: center;
    }
    li {
      height: 36px;
      display: flex;
      align-items: center;
      padding: 0px 8px;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background-color: #f8f8f8;
      }
      &.active {
        background-color: rgba(33, 150, 243, 0.1);
      }
    }
  }
  .relateListWrap {
    max-height: 260px;
    overflow: auto;
    .title {
      margin: 12px 0;
      span {
        margin: 0 4px;
      }
    }
  }
`;

export const FilterContent = styled.div`
  min-height: 344px;
  .filterContent {
    .conditionItemContent {
      padding-right: 0 !important;
      display: flex;
      .dynamicSource {
        width: 130px;
        border-color: #e0e0e0;
        height: 36px;
        border-radius: 4px;
        box-shadow: none !important;
        font-size: 13px;
        &.flexItem {
          flex: 1;
          min-width: 0;
          margin-right: 0px;
        }
        .ant-select-arrow {
          margin-top: -8px !important;
        }
        .ant-select-selector {
          border-color: #e0e0e0;
          height: 36px;
          width: 130px;
          border-radius: 4px;
          box-shadow: none !important;
          .ant-select-selection-search-input {
            height: 34px;
          }
          .ant-select-selection-item {
            line-height: 34px;
          }
        }
      }
      .conditionValue {
        flex: 1;
        margin-left: 12px;
      }
      .deletedColumn {
        margin-left: 12px;
      }
    }
    .worksheetFilterDateCondition {
      & > div {
        width: 100%;
        display: flex;
        align-items: center;
        .dateValue,
        .dateType,
        .customDate {
          flex: 1;
        }
        .dateValue,
        .customDate {
          margin-left: 10px;
          margin-top: 0 !important;
        }
        .dateValue {
          display: flex;
          align-items: center;
        }
        .dateInputCon .ming.Dropdown {
          height: 34px;
          background: none;
        }
      }
    }
    .worksheetFilterNumberCondition {
      .numberRange {
        & > div {
          flex: 1;
          min-width: 0;
          input {
            width: 100%;
          }
        }
      }
    }
  }
`;
