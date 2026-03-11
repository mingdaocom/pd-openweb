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
  .customTreeSelect,
  .customCascader {
    z-index: -1;
    width: 100% !important;
    position: absolute;
    left: 0;
    bottom: 0;
    opacity: 0;
  }
  .CodeMirror-code {
    line-height: 28px;
  }
  .CodeMirror-placeholder {
    color: var(--color-text-placeholder) !important;
    font-size: 14px !important;
    line-height: 27px !important;
    margin-left: 3px !important;
  }
  .datePicker,
  .richInputText {
    width: calc(100% - 36px);
    border-radius: 3px 0 0 3px !important;
    border: 1px solid var(--color-border-tertiary);
    &.editorNull {
      padding: 0px !important;
    }
    .ck-content {
      padding: 0 12px !important;
    }
  }
  .datePicker {
    width: calc(100% - 36px);
    border-radius: 3px 0 0 3px !important;
    border: 1px solid var(--color-border-tertiary) !important;
    padding: 0;
    .ant-picker-input {
      height: 34px;
      line-height: 34px;
      padding: 0 12px;
    }
    .ant-picker-clear {
      right: 12px;
    }
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
    border: 1px solid var(--color-border-tertiary);
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
        background: ${props => (props.hasHoverBg ? 'var(--color-background-secondary)' : 'transparent')};
      }
    }
    .clearOp {
      position: absolute;
      right: 12px;
      display: none;
      height: 26px;
      margin-top: 8px;
      color: var(--color-text-tertiary);
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
      border: 1px solid var(--color-border-tertiary) !important;
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
  color: var(--color-link-hover);
  border: 1px solid var(--color-primary-transparent);
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
    background-color: var(--color-border-secondary);
    color: var(--color-text-tertiary);
    border: var(--color-border-primary);
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
    background: var(--color-success-bg);
    border-color: var(--color-task);
    color: var(--color-success-hover);
    .searchIcon {
      margin-left: 0px;
      margin-right: 6px;
      color: var(--color-success-hover);
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
  border: 1px solid var(--color-border-tertiary);
  border-left: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  justify-content: center;
  transition: all 0.25s;
  color: var(--color-text-disabled);
  &:hover {
    color: var(--color-primary);
    i {
      color: var(--color-primary);
    }
  }
  i {
    font-size: 22px;
    color: var(--color-text-tertiary);
  }
`;

export const FieldInfo = styled(FlexCenter)`
  border-radius: 24px;
  background-color: rgba(0, 0, 0, 0.08);
  padding-right: 8px;
  font-size: 13px;
  line-height: 24px;
  margin: 5px 6px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${props => (props.hideIcon ? 'padding-left: 8px;' : '')}
  .departWrap {
    width: 24px;
    height: 24px;
    text-align: center;
    color: var(--color-white);
    border-radius: 12px;
    background-color: var(--color-text-tertiary);
    flex-shrink: 0;
  }
  .name {
    margin: 0 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .avatar {
    width: 24px;
    border-radius: 50%;
  }
  .remove {
    cursor: pointer;
    .icon-close {
      color: var(--color-text-disabled);
      &:hover {
        color: var(--color-text-tertiary);
      }
    }
  }
`;

export const OtherFieldList = styled(FlexCenter)`
  flex-wrap: wrap;
  width: ${props => (props.totalWidth ? '100%' : 'calc(100% - 36px)')};
  box-sizing: border-box;
  padding: 0 6px 5px 12px;
  min-height: 36px;
  line-height: 32px;
  font-size: 14px;
  word-break: break-all;
  border: 1px solid var(--color-border-primary);
  border-radius: 3px 0 0 3px;
  cursor: pointer;
  background: ${props => (props.isHaveUniqueField ? 'var(--color-background-secondary)' : 'transparent')};
  position: relative;
  .clearOp {
    position: absolute;
    right: 12px;
    display: none;
    height: 26px;
    margin-top: 3px;
    color: var(--color-text-tertiary);
  }
  &:hover {
    .clearOp {
      display: block;
    }
    background: ${props => (props.isHaveClear ? 'var(--color-background-secondary)' : 'transparent')};
  }
`;

export const RelateControl = styled(FlexCenter)`
  background: rgba(0, 0, 0, 0.08);
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

export const OptionControl = styled(FlexCenter)`
  &.option {
    display: flex;
    align-items: center;
    height: 24px;
    background: rgba(0, 0, 0, 0.08);
    margin: 4px 6px 0 0;
    padding: 0 10px;
    border-radius: 12px;
    &.isDeleted {
      .text,
      i {
        color: var(--color-text-tertiary);
      }
    }
    .text {
      margin-right: 4px;
    }
  }
`;

export const DynamicInputStyle = styled(FlexCenter)`
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid var(--color-border-tertiary);
  border-radius: 3px 0 0 3px;
  width: calc(100% - 36px);
  padding: 0 12px;
  height: 36px;
  box-sizing: border-box;
  .error,
  .error .icon-formula {
    color: var(--color-error) !important;
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
    color: var(--color-text-tertiary);
  }
  .delete {
    font-size: 15px;
    color: var(--color-text-disabled);
    display: none;
    margin-right: 10px;
  }
  &:hover {
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    .edit {
      color: var(--color-primary);
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
  .settingItemTitle {
    color: var(--color-text-title);
  }
  .settingItemSubTitle {
    color: var(--color-text-title);
    font-weight: unset;
  }

  .searchRadio .ming.Radio {
    line-height: 28px !important;
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
      background: var(--color-background-disabled);
      border-radius: 3px;
      padding: 0 14px;
    }
    .mappingTitle {
      flex: 1;
      color: var(--color-text-secondary);
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
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    color: var(--color-text-disabled);
    line-height: 34px;
    padding: 0 12px;
    background: var(--color-background-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    .edit {
      font-size: 15px;
      color: var(--color-text-tertiary);
    }
    &.disabled {
      cursor: not-allowed;
      background: var(--color-background-secondary);
      .edit {
        display: none;
      }
    }
  }
  .addFilterIcon {
    width: fit-content;
  }
  .addFilterIcon span {
    color: var(--color-primary);
    display: inline-block;
    padding: 8px;
    font-weight: bold;
    &:hover {
      color: var(--color-link-hover);
      background: var(--color-background-secondary);
      border-radius: 3px;
    }
  }
  .searchWorksheetFilter {
    & > div > div > div:last-child {
      margin: 10px 0 !important;
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
        border-color: var(--color-border-secondary);
        height: 36px;
        border-radius: 4px;
        box-shadow: none !important;
        font-size: 13px;
        margin-right: 12px;
        .ant-select-arrow {
          margin-top: -8px !important;
        }
        .ant-select-selector {
          border-color: var(--color-border-secondary);
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
  box-shadow: var(--shadow-lg);
  width: 100%;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-primary);
  .MenuBox {
    position: relative !important;
  }
  .ming.Menu {
    width: 100%;
    max-height: 300px;
    overflow-x: hidden;
    box-shadow: none !important;
    position: relative;
    border-radius: unset;
  }
  .otherWorksheet {
    width: 100%;
    padding: 6px 0;
    box-sizing: border-box;
    border-top: 1px solid var(--color-border-primary);
    background: var(--color-background-primary);
    cursor: pointer;
    position: relative;
    z-index: 11;
    .otherMenuItem {
      padding: 0 16px;
      line-height: 32px;
      &:hover {
        color: var(--color-white) !important;
        background-color: var(--color-primary) !important;
      }
    }
  }
`;

export const DynamicTextWrap = styled.div`
  display: contents;
  & > div {
    margin-top: 3px;
    margin-bottom: 3px;
  }
  .dynamicText {
    line-height: 30px;
  }
  .haveCloseIcon {
    padding: 0 12px;
    .icon-close {
      display: none;
    }
  }
`;

export const WrapMaxOrMin = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 3px 0 0 3px;
  width: calc(100% - 36px);
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
  }
  .dynamicCityContainer input {
    border: none !important;
    height: 34px;
    line-height: 32px;
  }
  .timeMaxOrMinCon {
    width: 100%;
    border: none;
    line-height: 34px;
    height: 34px;
    box-shadow: none;
  }
`;
