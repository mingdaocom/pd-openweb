import styled from 'styled-components';

const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;

export const DynamicValueInputWrap = styled(FlexCenter)`
  position: relative;
  .tagTextAreaWrap {
    width: calc(100% - 36px);
  }
  .CodeMirror-code {
    line-height: 28px;
  }
  .CodeMirror-placeholder {
    color: #ccc !important;
    font-size: 14px !important;
    line-height: 27px !important;
    margin-left: 3px !important;
  }
  .tagInputarea {
    .tagInputareaIuput {
      border-radius: 3px 0 0 3px;
      min-height: 36px;
      .CodeMirror {
        .CodeMirror-lines {
          padding: 3px 0;
        }
        .CodeMirror-sizer {
          min-height: auto !important;
        }
      }
    }
  }
  .otherFieldWrap {
    box-sizing: border-box;
    width: calc(100% - 36px);
    padding: 5px 8px;
    min-height: 36px;
    line-height: 32px;
    font-size: 14px;
    word-break: break-all;
    border: 1px solid #ccc;
    border-radius: 3px 0 0 3px;
  }
  .dynamicCityContainer {
    width: calc(100% - 36px);
    position: relative;
    &:hover {
      .clearOp {
        display: block;
      }
      input {
        background: ${props => (props.hasHoverBg ? '#f5f5f5' : '#fff')};
      }
    }
    .clearOp {
      position: absolute;
      right: 12px;
      display: none;
      height: 26px;
      margin-top: 8px;
      color: #9d9d9d;
    }
    .CityPicker-wrapper {
      display: flex;
    }
    .CityPicker-input-container {
      width: 100%;
    }
    input {
      width: 100%;
      height: 36px;
      line-height: 34px;
      padding: 0 12px;
      border: 1px solid #ccc !important;
      border-radius: 3px 0 0 3px;
      box-sizing: border-box;
      cursor: pointer;
    }
  }
  & > div:nth-child(3) {
    ${props => (props.triggerStyle ? 'top: 100% !important' : '')}
    .rc-trigger-popup {
      ${props => (props.triggerStyle ? 'top: 0px !important' : '')}
    }
  }
`;
export const OtherFieldWrap = styled(FlexCenter)`
  margin-right: 6px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  padding: 0 12px;
  font-size: 12px;
  box-sizing: border-box;
  height: 24px;
  margin-top: 5px;
  max-width: 100%;
  &.timeField {
    margin: 0 6px 0 12px;
  }
  &.haveCloseIcon {
    padding: 0 6px 0 12px;
  }
  &.deleted {
    background-color: #eaeaea;
    color: #9e9e9e;
    border: #ddd;
  }
  /* 文本默认值标签样式 */
  &.tagTextField {
    margin: 0;
  }
  .recordName {
    margin: 0 6px;
    color: #789dba;
  }
  &:hover {
    i {
      color: rgba(51, 51, 51, 0.4);
    }
  }
  i {
    margin-left: 6px;
    color: rgba(51, 51, 51, 0.2);
  }
  &.isGreenTag {
    background: #d8f2d9;
    border-color: #9dd59f;
    color: #307433;
    .searchIcon {
      margin-left: 0px;
      margin-right: 6px;
      color: #307433;
    }
  }
`;

export const SelectOtherFieldWrap = styled(FlexCenter)`
  position: absolute;
  box-sizing: border-box;
  right: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  justify-content: center;
  transition: all 0.25s;
  color: #bdbdbd;
  &:hover {
    color: #2196f3;
  }
  i {
    font-size: 22px;
    color: #9e9e9e;
  }
`;

export const FieldInfo = styled(FlexCenter)`
  border-radius: 24px;
  background-color: #e5e5e5;
  padding-right: 8px;
  font-size: 13px;
  line-height: 24px;
  margin: 5px 6px 0 0;
  .departWrap {
    width: 24px;
    height: 24px;
    text-align: center;
    color: #fff;
    border-radius: 12px;
    background-color: #aaa;
  }
  .name {
    margin: 0 5px;
  }
  .avatar {
    width: 24px;
    border-radius: 50%;
  }
  .remove {
    cursor: pointer;
    .icon-close {
      color: #bdbdbd;
      &:hover {
        color: #9e9e9e;
      }
    }
  }
`;

export const OtherFieldList = styled(FlexCenter)`
  flex-wrap: wrap;
  width: calc(100% - 36px);
  box-sizing: border-box;
  width: calc(100% - 36px);
  padding: 0 6px 5px 12px;
  min-height: 36px;
  line-height: 32px;
  font-size: 14px;
  word-break: break-all;
  border: 1px solid #ccc;
  border-radius: 3px 0 0 3px;
  cursor: pointer;
  background: ${props => (props.isHaveUniqueField ? '#f8f8f8' : '#fff')};
  position: relative;
  .clearOp {
    position: absolute;
    right: 12px;
    display: none;
    height: 26px;
    margin-top: 3px;
    color: #9d9d9d;
  }
  &:hover {
    .clearOp {
      display: block;
    }
    background: ${props => (props.isHaveClear ? '#f5f5f5' : '#fff')};
  }
`;

export const RelateControl = styled(FlexCenter)`
  background: #f0f0f0;
  padding: 0 12px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 5px;
  margin-right: 8px;
  max-width: 100%;
  span {
    margin: 0 4px;
  }
`;

export const DynamicInputStyle = styled(FlexCenter)`
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 3px 0 0 3px;
  width: calc(100% - 36px);
  padding: 0 12px;
  height: 36px;
  box-sizing: border-box;
  .error,
  .error .icon-formula {
    color: #f44336 !important;
  }
  .text {
    flex: 1;
    min-width: 0;
  }
  .text,
  .options {
    display: flex;
    align-items: center;
  }
  .edit {
    font-size: 15px;
    color: #9e9e9e;
  }
  .delete {
    font-size: 15px;
    color: #bdbdbd;
    display: none;
    margin-right: 10px;
  }
  &:hover {
    background-color: #fafafa;
    border: 1px solid #d8d8d8;
    .edit {
      color: #2196f3;
    }
    .delete {
      display: block;
    }
  }
`;

export const SearchWorksheetWrap = styled.div`
  .addFilterCondition span {
    font-weight: 700 !important;
    .icon {
      font-size: 13px !important;
      margin-right: 0 !important;
      font-weight: 700 !important;
    }
  }
  .mappingItem {
    display: flex;
    align-items: center;
    height: 36px;
    margin-bottom: 12px;
    .mappingControlName {
      flex: 1;
      min-width: 0;
      line-height: 36px;
      background: #f4f4f4;
      border-radius: 3px;
      padding: 0 14px;
    }
    .mappingTitle {
      flex: 1;
      color: #757575;
      &:last-child {
        padding-left: 40px;
      }
    }
    .mapppingDropdown {
      flex: 1;
      min-width: 0;
    }
    & > span {
      flex-shrink: 0;
    }
  }
  .searchRecord {
    display: flex;
    align-items: center;
  }
  .settingWorksheetInput {
    border: 1px solid #ddd;
    border-radius: 3px;
    color: #bdbdbd;
    line-height: 34px;
    padding: 0 12px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    .edit {
      font-size: 15px;
      color: #9e9e9e;
    }
    &.disabled {
      cursor: not-allowed;
      background: #f7f7f7;
      .edit {
        display: none;
      }
    }
  }
  .addFilterIcon span {
    color: #2196f3;
    display: inline-block;
    padding: 8px;
    font-weight: bold;
    &:hover {
      color: #1780d3;
      background: #f5f5f5;
      border-radius: 3px;
    }
  }
  .searchWorksheetFilter {
    & > div > div > div:last-child {
      margin: 0 !important;
      .addFilterCondition {
        i,
        span {
          color: #2196f3;
        }
        display: inline-block;
        padding: 8px;
        & > div > div {
          margin-right: 0 !important;
        }
        &:hover {
          i,
          span {
            color: #1780d3;
          }
          background: #f5f5f5;
          border-radius: 3px;
        }
      }
    }
  }
  .conditionRelationBox {
    display: none !important;
  }
  .conditionItem {
    margin-bottom: 12px !important;
  }
  .conditionItemForDynamicStyle {
    .conditionItemHeader {
      display: flex;
      align-items: center;
      padding-right: 0 !important;
      .deleteBtn {
        right: 0 !important;
      }
      .relation {
        .ming.Dropdown {
          background: transparent;
        }
        .ming.Dropdown .Dropdown--input {
          padding: 0 5px 0 12px;
        }
      }
    }
    .conditionItemContent {
      padding-right: 0 !important;
      display: flex;
      .deletedColumn {
        position: absolute;
      }
      .dynamicSource {
        width: 130px;
        border-color: #e0e0e0;
        height: 36px;
        border-radius: 4px;
        box-shadow: none !important;
        font-size: 13px;
        margin-right: 12px;
        .ant-select-arrow {
          margin-top: -8px !important;
        }
        .ant-select-selector {
          border-color: #e0e0e0;
          height: 36px;
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
        min-width: 0;
        .optionCheckbox {
          word-break: break-all;
          display: inline-block;
          line-height: 26px;
        }
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

export const WorksheetListWrap = styled.div`
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #eee;
  background-color: #fff;
  .MenuBox {
    position: relative !important;
  }
  .ming.Menu {
    width: 100%;
    max-height: 300px;
    overflow-x: hidden;
    box-shadow: none !important;
    position: relative;
  }
  .otherWorksheet {
    width: 100%;
    line-height: 44px;
    padding: 6px 16px 0 16px;
    box-sizing: border-box;
    vertical-align: middle;
    height: 45px;
    border-top: 1px solid #eaeaea;
    background: #ffffff;
    cursor: pointer;
    position: relative;
    z-index: 11;
    &:hover {
      color: #fff !important;
      background-color: #1e88e5 !important;
    }
  }
`;
