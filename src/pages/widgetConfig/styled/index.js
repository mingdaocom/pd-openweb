import styled from 'styled-components';

export const SettingItem = styled.div`
  margin-top: 20px;
  position: relative;
  .ant-input {
    font-size: 13px;
    color: #333;
    line-height: 26px;
    border-radius: 3px;
    &.inputError {
      border-color: #ff0000;
      box-shadow: none;
    }
  }
  .checkboxWrap {
    display: flex;
    align-items: center;
  }
  &.withSplitLine {
    border-top: 1px solid #eee;
    padding-top: 24px;
  }
  .ming.Dropdown {
    background-color: #fff;
    &.disabled {
      background-color: #f5f5f5;
    }
  }
  .ming.Radio {
    flex: 1;
    line-height: 24px;
  }
  .ming.Checkbox {
    display: flex;
    align-items: center;
  }
  .settingItemTitle {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: bold;
    color: #515151;
    .icon-help {
      margin-left: 5px;
    }
  }
  .Dropdown {
    /* margin: 16px 0; */
    width: 100%;
  }
  .ming.Menu {
    width: 100%;
  }
  .dropdownWrapper {
    display: block;
  }
  .singleLineRadio {
    label {
      width: 50%;
      margin: 0;
    }
  }
  textarea {
    resize: none;
  }
  .credTypesWrap {
    .ming.Radio {
      margin: 12px 0 0 0;
      flex-basis: 50%;
    }
  }
  .customTip {
    margin-top: 6px;
    position: relative;
  }
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: #9e9e9e;
    font-size: 13px;
    text-align: center;
  }
  .subTitle {
    margin-bottom: 6px;
  }
  .Calendar-column-header {
    flex: 1;
  }
  .attachmentDisplayType {
    width: 310px !important;
    .ming.Item {
      height: auto !important;
      line-height: normal !important;
    }
    .ming.Item .Item-content .Icon {
      line-height: normal !important;
      position: relative;
      left: 0px !important;
    }
  }
`;
export const RelateInfo = styled.div`
  margin-top: 12px;
  i {
    font-size: 18px;
    color: #757575;
  }
  .text {
    margin: 0 4px;
  }
  .name {
    color: #2196f3;
  }
`;
export const InfoWrap = styled.div`
  border: 1px solid #ddd;
  border-radius: 3px;
  color: #757575;
  line-height: 34px;
  padding: 0 12px;
  background: ${props => props.bgColor || '#fff'};
`;

export const EditInfo = styled(InfoWrap)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  .edit,
  .clearBtn {
    font-size: 15px;
    color: #9e9e9e;
  }
  .clearBtn {
    visibility: hidden;
  }
  &:hover {
    background-color: #fafafa;
    border: 1px solid #d8d8d8;
    .clearBtn {
      visibility: visible;
      &:hover {
        color: #2196f3;
      }
    }
    .edit {
      color: #2196f3;
    }
  }
  &.borderError {
    border-color: #f44336;
    background: #fef2f4;
    color: #f44336;
  }
  &.disabled {
    cursor: not-allowed;
    background: #f7f7f7 !important;
    height: 36px;
  }
`;

export const DropdownPlaceholder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 36px;
  border: 1px solid #ddd;
  margin-top: 12px;
  border-radius: 3px;
  padding: 0 5px 0 12px;
  cursor: pointer;
  &.active,
  &:hover {
    border-color: #2196f3;
    &.disabled {
      border-color: #ddd;
    }
    &.deleted {
      border-color: #ff0000;
    }
  }
  &.disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  &.deleted {
    background-color: rgba(251, 238, 241);
    color: #ff0000;
    border: 1px solid #ff0000;
    cursor: pointer;
  }
  &.invalid {
    border-color: currentColor !important;
    color: #f44336;
    background-color: #fff2f4;
    i {
      color: #f44336;
    }
  }
  &.placeholder {
    color: #bdbdbd;
  }
`;

export const SelectFieldsWrap = styled.div`
  &.isolate {
    position: absolute;
    width: 100%;
    z-index: 3;
  }
  padding: 6px 0;
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid #eee;
  background-color: #fff;
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: #9e9e9e;
    font-size: 13px;
    text-align: center;
  }
  .clearValue {
    line-height: 36px;
    color: #2196f3;
    padding-left: 12px;
    cursor: pointer;
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
  .search {
    position: relative;
    margin-bottom: 8px;
    i {
      position: absolute;
      top: 11px;
      left: 16px;
      font-size: 16px;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      padding-left: 40px;
      border-bottom: 1px solid #eee;
      &::placeholder {
        color: #ccc;
      }
    }
  }
  .fieldsWrap {
    max-height: 400px;
    overflow-y: auto;
  }
  .relateSheetList {
    border-top: 1px solid #ddd;
    background-color: #fff;
    margin-top: 8px;
    &:first-child {
      border-top: none;
      margin-top: 0px;
    }
    .title {
      padding: 12px 0 0 16px;
      font-weight: bold;
      max-width: 220px;
      margin-bottom: 8px;
    }
  }
  .fieldList {
    background-color: #fff;
    overflow: auto;
    li {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 36px;
      max-width: 320px;
      line-height: 36px;
      padding: 0 16px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &:hover {
        background-color: #2196f3;
        color: #fff;
        i {
          color: #fff;
        }
      }
      i {
        font-size: 16px;
        color: #9e9e9e;
        margin-right: 8px;
      }
    }
  }
`;

export const CommonDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 12px;
  border: 1px solid #ddd;
  height: ${props => props.height || 34}px;
  line-height: 34px;
  color: #9e9e9e;
  border-radius: 3px;
  background-color: #fff;
  overflow: hidden;
  .intro {
    display: flex;
    align-items: center;
  }
  .hint {
    flex: 1;
    overflow: hidden;
    padding-right: 12%;
  }
  .unit {
    max-width: 20%;
    flex-shrink: 0;
    padding-left: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.prefix {
      padding: 0 12px 0 0;
    }
  }
  &.select {
    i {
      margin: 0;
    }
  }
  i {
    font-size: 13px;
    color: #9e9e9e;
    margin-right: 4px;
  }
`;

export const CircleAdd = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size || 24}px;
  height: ${props => props.size || 24}px;
  border-radius: 50%;
  border: 1px solid #ddd;
  margin-top: ${props => (props.displayRow ? '5px' : '12px')};
  i {
    font-size: 14px;
  }
`;

export const OptionsWrap = styled.div`
  display: flex;
  flex-direction: column;
  &.horizontal {
    flex-direction: row;
  }
  flex-wrap: wrap;
  .option {
    display: flex;
    .optionItem {
      display: flex;
      max-width: 100%;
      margin-right: 16px;
      margin-top: 8px;
      ${props => (props.direction === '0' ? `width: ${props.width}px;` : 'width: fit-content;')}
    }
    .ming.Radio {
      margin: 0;
      line-height: 22px;
    }
    .ming.Checkbox {
      flex-shrink: 0;
      line-height: 22px;
    }
  }
`;
export const OptionWrap = styled.div`
  padding: 0 12px;
  line-height: 24px;
  border-radius: 18px;
  color: #fff;
  ${props =>
    props.direction !== '0' ? 'white-space: normal' : 'white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'};

  &.horizontal {
    ${props => (props.direction === '0' ? `max-width: ${props.width}px;` : '')}
  }
  &.light {
    color: #333;
  }
  &.withoutColor {
    background: transparent;
    color: #333;
    padding: 0 4px;
  }
  background-color: ${props => props.color || '#2196f3'};
`;

export const EditModelWrap = styled.div`
  ${props => (props.isTab ? 'padding: 8px 20px;' : '')}
  .desc {
    line-height: 13px;
    &.subList {
      margin-bottom: 8px;
    }
  }
  .operationWrap.isActive {
    visibility: true;
  }
  .operationIconWrap {
    padding: 0 4px;
    i {
      font-size: 18px;
    }
  }
  .resizeWidth {
    border-right: 1px solid #e0e0e0;
  }
  .tableWrap {
    position: relative;
    z-index: 2;
    overflow: auto;
  }

  th,
  td {
    box-sizing: border-box;
    padding-left: 6px;
    width: 160px;
    max-width: 160px;
    height: 42px;
    font-weight: normal;
    background-color: #fff;
    border: 1px solid #ddd;
  }

  th span {
    color: #f44336;
    vertical-align: middle;
    margin-right: 2px;
  }
  .unSupport {
    font-size: 12px;
    vertical-align: initial;
  }
  .addControl {
    height: 84px;
    line-height: 84px;
    text-align: center;
    font-size: 12px;
    border: 1px solid #ddd;
    background-color: #fff;
  }
`;
export const EmptySheetPlaceHolder = styled.div`
  height: 84px;
  line-height: 84px;
  text-align: center;
  font-size: 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #9e9e9e;
`;

export const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  &.invalid {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    border-color: #f44336;
  }
`;

export const IntroMenu = styled.div`
  width: 160px;
  padding: 5px 0;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  .menuItem {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background: #2196f3;
      color: #fff;
      i {
        color: #fff;
      }
    }
    i {
      margin-right: 10px;
      color: #757575;
      font-size: 16px;
    }
  }
`;

export const WidgetIntroWrap = styled.div`
  margin: 11px 20px 0 20px;
  padding-bottom: 9px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    display: flex;
    align-items: center;
    .switchType {
      padding: 6px;
      background: #fff;
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      &.disabled {
        cursor: default;
      }
      &:hover:not(.disabled) {
        background: #f5f5f5;
      }
      span {
        margin-left: 8px;
        font-size: 15px;
        font-weight: 600;
      }
    }
  }
  .iconWrap {
    &:hover {
      color: #2196f3;
    }
  }

  .introOptions {
    display: flex;
    align-items: center;
    .optionIcon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 3px;
      margin-right: 10px;
      cursor: pointer;
      &:last-child {
        margin-right: 0;
      }
      i {
        color: #9e9e9e;
      }
      &:hover {
        background: #f5f5f5;
      }
      &.active {
        background: #f5f5f5;
        i {
          color: #2196f3;
        }
      }
    }
  }
`;

export const WidgetIntroWrap2 = styled.div``;

export const DropdownContent = styled.div`
  min-height: 36px;
  overflow: auto;
  background: #ffffff;
  border-radius: 3px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  .empty {
    padding: 0 16px;
    color: #9e9e9e;
    cursor: pointer;
  }
  .title {
    font-weight: bold;
    padding: 6px 16px 6px;
  }
  .item {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 16px;
    cursor: pointer;
    transition: background-color color 0.25s;
    i {
      margin-right: 6px;
      color: #9e9e9e;
    }
    .text {
      margin-right: 6px;
    }
    &.disabled {
      cursor: not-allowed;
      color: #bdbdbd;
    }
    &:not(disabled):hover {
      background-color: #2196f3;
      color: #ffffff;
      i {
        color: #ffffff;
      }
    }
  }
`;

export const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleContentWrap = styled.div`
  position: relative;
  border-radius: 3px;
  display: flex;
  flex-direction: ${props => (props.displayRow ? 'row' : 'column')};
  ${props => (props.readOnly ? 'opacity: 0.6;' : '')}
  .nameAndStatus {
    display: flex;
    ${props => (props.displayRow ? 'line-height: 18px;' : 'align-items: center;')}
    margin-right: ${props => (props.displayRow ? '1px' : '0px')};
    margin-bottom: ${props => (props.displayRow ? '0px' : '6px')};
    padding-top: ${props => (props.displayRow ? '7px' : '0px')};
    .required {
      position: absolute;
      top: ${props => (props.displayRow ? '8px' : '4px')};
      left: -8px;
      color: #f44336;
      transition: all 0.25s;
    }
    .titleContent {
      display: flex;
      position: relative;
      margin-right: 10px;
      ${({ displayRow, titleWidth }) => (displayRow && titleWidth ? `width:${titleWidth}px` : '')}
    }
    .iconWrap {
    }
    .typeIcon {
      color: #9e9e9e;
      font-size: 16px;
    }
    .controlName {
      margin-left: 6px;
      font-weight: 700;
      text-align: ${props => (props.textAlign === '1' ? 'left' : 'right')};
      font-size: ${props => props.titleSize};
      line-height: ${props => (parseInt(props.titleSize) > 18 ? props.titleSize : '18px')};
      color: ${props => props.titleColor || '#757575'};
      ${props => props.titleStyle || ''};
      &.hideTitle {
        color: #9e9e9e !important;
      }
    }
    .isSplitLine {
      font-size: 15px;
      font-weight: bold;
    }
    &.minHeight18 {
      min-height: 18px;
    }
  }

  .tabHeaderTileWrap {
    width: 100%;
    box-size: border-box;
    background: #f8f8f8;
    border-radius: 8px 8px 0 0;
    & > div {
      &:first-child {
        border-radius: 5px 0 0 0;
      }
    }
  }

  .desc {
    color: #9e9e9e;
    margin-top: 8px;
    line-height: 13px;
  }
`;

export const RelateDetail = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  .text {
    margin: 0 6px;
  }
  .name {
    flex: 1;
    &.needLink {
      cursor: pointer;
      color: #2196f3;
    }
  }
`;

export const AnimationWrap = styled.div`
  display: flex;
  padding: 2px;
  background: #f8f8f8;
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
      color: #2196f3;
      i {
        color: #2196f3;
      }
    }
    i {
      color: #757575;
    }
    &.active {
      background: #ffffff;
      color: #2196f3;
      i {
        color: #2196f3;
      }
    }
    &.disabled {
      color: #bdbdbd !important;
      cursor: not-allowed;
    }
  }
`;

export const SheetViewWrap = styled.div`
  display: flex;
  border-radius: 3px;
  border: 1px solid #dddddd;
  margin-top: 8px;
  .Dropdown--input {
    border: none !important;
  }
  .ming.Dropdown.disabled {
    background-color: #fff !important;
  }
  .ming.Dropdown {
    .ming.Menu {
      width: 100%;
    }
  }
  .viewCon {
    padding: 0 16px;
    background: #fafafa;
    line-height: 34px;
    text-align: center;
    color: #757575;
  }
  .filterEditIcon {
    width: 36px;
    text-align: center;
    cursor: pointer;
    border-left: 1px solid #dddddd;
    color: #989898;
    &:hover {
      background: #f5f5f5;
      color: #2196f3;
    }
  }
`;

export const NumberRange = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    margin: 0 8px;
    color: #9e9e9e;
  }
  input {
    width: 100%;
  }
`;

export const BothRelateInfo = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 10px 12px;
  background-color: #fff;
  .displayType {
    margin-top: 8px;
  }
  span {
    margin: 0 4px;
  }
  .sourceName {
    color: #2196f3;
  }
`;

export { Button, DropdownOverlay } from './common';
