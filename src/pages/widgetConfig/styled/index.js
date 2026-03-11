import styled from 'styled-components';
import { Dialog } from 'ming-ui';

export const SettingItem = styled.div`
  margin-top: 20px;
  position: relative;
  ${props => (props.hide ? 'display: none;' : '')}
  .ant-input {
    font-size: 13px;
    color: var(--color-text-title);
    line-height: 26px;
    border-radius: 3px;
    background-color: transparent;
    &.inputError {
      border-color: var(--color-error);
      box-shadow: none;
    }
  }
  textarea.ant-input {
    line-height: 1.5715;
  }
  .DropdownBottom {
    position: relative;
    .ming.Menu.List {
      top: 100% !important;
      height: fit-content;
    }
  }
  .savedContent {
    display: flex;
    flex-direction: column;
  }
  .checkboxWrap {
    display: flex;
    align-items: center;
  }
  &.withSplitLine {
    border-top: 1px solid var(--color-border-primary);
    padding-top: 24px;
  }
  .ming.Dropdown {
    background-color: var(--color-background-primary);
    &.disabled {
      background-color: var(--color-background-secondary);
    }
    &.error {
      .Dropdown--border {
        border-color: var(--color-error);
      }
      background-color: rgba(244, 67, 154, 0.1);
    }
  }
  .ming.Radio {
    flex: 1;
    line-height: 24px;
  }
  .ming.RadioGroup.fixedWidth {
    .Radio {
      flex: unset;
      margin-right: 36px;
    }
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
    color: var(--color-text-title);
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
    color: var(--color-text-tertiary);
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
    color: var(--color-text-secondary);
  }
  .text {
    margin: 0 4px;
  }
  .name {
    color: var(--color-primary);
  }
`;
export const InfoWrap = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  color: var(--color-text-secondary);
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
    color: var(--color-text-tertiary);
  }
  .clearBtn {
    visibility: hidden;
  }
  &:hover {
    background-color: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    .clearBtn {
      visibility: visible;
      &:hover {
        color: var(--color-primary);
      }
    }
    .edit {
      color: var(--color-primary);
    }
  }
  &.borderError {
    border-color: var(--color-error);
    background: var(--color-error-bg);
    color: var(--color-error);
  }
  &.disabled {
    cursor: not-allowed;
    background: var(--color-background-secondary) !important;
    height: 36px;
  }
`;

export const DropdownPlaceholder = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 36px;
  border: 1px solid var(--color-border-primary);
  margin-top: 12px;
  border-radius: 3px;
  padding: 0 5px 0 12px;
  cursor: pointer;
  &.active,
  &:hover {
    border-color: var(--color-primary);
    &.disabled {
      border-color: var(--color-border-primary);
    }
    &.deleted {
      border-color: var(--color-error);
    }
    .arrowIcon {
      ${props => (props.cancelAble ? 'display: none;' : '')}
    }
    .clearIcon {
      ${props => (props.cancelAble ? 'display: inline-block;' : '')}
    }
  }
  &.disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }
  &.deleted {
    background-color: rgba(251, 238, 241);
    color: var(--color-error);
    border: 1px solid var(--color-error);
    cursor: pointer;
  }
  &.invalid {
    border-color: currentColor !important;
    color: var(--color-error);
    background-color: var(--color-error-bg);
    i {
      color: var(--color-error);
    }
  }
  &.placeholder {
    color: var(--color-text-disabled);
  }

  .clearIcon {
    display: none;
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
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-primary);
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: var(--color-text-tertiary);
    font-size: 13px;
    text-align: center;
  }
  .clearValue {
    line-height: 36px;
    color: var(--color-primary);
    padding-left: 12px;
    cursor: pointer;
    &:hover {
      background-color: var(--color-primary);
      color: var(--color-white);
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
      border-bottom: 1px solid var(--color-border-primary);
      &::placeholder {
        color: var(--color-text-placeholder);
      }
    }
  }
  .fieldsWrap {
    max-height: ${props => (props.limitWidth ? '400px' : '230px')};
    overflow-y: auto;
  }
  .relateSheetList {
    border-top: 1px solid var(--color-border-primary);
    background-color: var(--color-background-primary);
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
    background-color: var(--color-background-primary);
    overflow: auto;
    li {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 36px;
      ${props => (props.limitWidth ? 'max-width: 320px;' : 'max-width: 100%;')}
      line-height: 36px;
      padding: 0 16px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &:hover {
        background-color: var(--color-primary);
        color: var(--color-white);
        i {
          color: var(--color-white);
        }
      }
      i {
        font-size: 16px;
        color: var(--color-text-tertiary);
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
  border: 1px solid var(--color-border-primary);
  height: ${props => props.height || 34}px;
  line-height: 34px;
  color: var(--color-text-tertiary);
  border-radius: 3px;
  background-color: var(--color-background-primary);
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
    color: var(--color-text-tertiary);
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
  border: 1px solid var(--color-border-primary);
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
  color: var(--color-white);
  ${props =>
    props.direction !== '0' ? 'white-space: normal' : 'white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'};

  &.horizontal {
    ${props => (props.direction === '0' ? `max-width: ${props.width}px;` : '')}
  }
  &.light {
    color: var(--color-text-title);
  }
  &.withoutColor {
    background: transparent;
    color: var(--color-text-title);
    padding: 0 4px;
  }
  background-color: ${props => props.color || 'var(--color-primary)'};
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
    border-right: 1px solid var(--color-border-primary);
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
    background-color: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
  }

  th span {
    color: var(--color-error);
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
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-background-primary);
  }
`;
export const EmptySheetPlaceHolder = styled.div`
  height: 84px;
  line-height: 84px;
  text-align: center;
  font-size: 12px;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-primary);
  color: var(--color-text-tertiary);
`;

export const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-transparent);
  &.invalid {
    color: var(--color-error);
    background: rgba(244, 67, 54, 0.06);
    border-color: var(--color-error);
  }
`;

export const IntroMenu = styled.div`
  width: 160px;
  padding: 5px 0;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-lg);
  .menuItem {
    display: flex;
    align-items: center;
    line-height: 36px;
    padding: 0 16px;
    cursor: pointer;
    &:hover {
      background: var(--color-primary);
      color: var(--color-white);
      i {
        color: var(--color-white);
      }
    }
    i {
      margin-right: 10px;
      color: var(--color-text-secondary);
      font-size: 16px;
    }
  }
`;

export const WidgetIntroWrap = styled.div`
  flex: 1;
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  flex-direction: column;
  .title {
    display: flex;
    align-items: center;
    .switchType {
      padding: 2px 6px;
      background: var(--color-background-primary);
      border-radius: 3px;
      cursor: pointer;
      display: flex;
      align-items: center;
      &.disabled {
        cursor: default;
      }
      &:hover:not(.disabled) {
        background: var(--color-background-secondary);
      }
      span {
        margin-left: 8px;
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  .iconWrap {
    &:hover {
      color: var(--color-primary);
    }
  }

  .introOptions {
    margin-top: 6px;
    width: 100%;
    display: flex;
    align-items: center;
    .optionIcon {
      flex: 1;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      i {
        color: var(--color-text-secondary);
      }
      &:hover {
        i {
          color: var(--color-primary);
        }
      }
      &.active {
        border-bottom-color: var(--color-primary);
        i {
          color: var(--color-primary);
        }
      }
    }
  }
`;

export const DropdownContent = styled.div`
  min-height: 36px;
  overflow: auto;
  background: var(--color-background-card);
  border-radius: 3px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  .empty {
    padding: 0 16px;
    color: var(--color-text-tertiary);
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
      color: var(--color-text-tertiary);
    }
    .text {
      margin-right: 6px;
    }
    &.disabled {
      cursor: not-allowed;
      color: var(--color-text-disabled);
    }
    &:not(disabled):hover {
      background-color: var(--color-primary);
      color: var(--color-white);
      i {
        color: var(--color-white);
      }
    }
  }
`;

export const DropdownContentWrap = styled(DropdownContent)`
  overflow: hidden;
  .searchWrap {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid --color-background-disabled;
    input {
      line-height: 36px;
      border: none;
      outline: none;
      padding-left: 8px;
    }
  }
  .emptyText {
    margin: 0 auto;
    line-height: 38px;
    color: var(--color-text-tertiary);
    font-size: 13px;
    text-align: center;
  }
  .countryContent {
    width: 100%;
    max-height: 260px;
    overflow-x: hidden;
  }
  .item {
    display: flex;
    align-items: center;
    line-height: 36px;
    &:not(disabled):hover {
      background-color: var(--color-background-hover);
      color: var(--color-text-title);
    }
    &.justityBetween {
      justify-content: space-between;
    }
    .countryName {
      margin: 0 6px;
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
      color: var(--color-error);
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
      color: var(--color-text-tertiary);
      font-size: 16px;
    }
    .controlName {
      margin-left: 6px;
      font-weight: 700;
      text-align: ${props => (props.textAlign === '1' ? 'left' : 'right')};
      font-size: ${props => props.titleSize};
      line-height: ${props => (parseInt(props.titleSize) > 18 ? props.titleSize : '18px')};
      color: ${props => props.titleColor || 'var(--color-text-title)'};
      ${props => props.titleStyle || ''};
      &.hideTitle {
        color: var(--color-text-tertiary) !important;
      }
      &.isMingo {
        color: var(--color-mingo);
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
    background: var(--color-background-secondary);
    border-radius: 8px 8px 0 0;
    & > div {
      &:first-child {
        border-radius: 5px 0 0 0;
      }
    }
  }

  .desc {
    color: var(--color-text-tertiary);
    margin-top: 8px;
    line-height: 13px;
  }
`;

export const RelateDetail = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
  .flexWidth {
    flex: 1;
    max-width: max-content;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text {
    margin: 0 6px;
  }
  .name {
    flex: 1;
    &.needLink {
      cursor: pointer;
      color: var(--color-primary);
    }
  }
`;

export const AnimationWrap = styled.div`
  display: flex;
  padding: 2px;
  background: var(--color-background-disabled);
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
    &.breakText {
      word-break: break-word;
      text-align: center;
      line-height: 12px;
    }
  }
`;

export const SheetViewWrap = styled.div`
  display: flex;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  margin-top: 8px;
  .Dropdown--input {
    border: none !important;
  }
  .ming.Dropdown.disabled {
    background-color: var(--color-background-primary) !important;
  }
  .ming.Dropdown {
    .ming.Menu {
      width: 100%;
    }
  }
  .viewCon {
    padding: 0 16px;
    background: var(--color-background-secondary);
    line-height: 34px;
    text-align: center;
    color: var(--color-text-secondary);
  }
  .filterEditIcon {
    width: 36px;
    text-align: center;
    cursor: pointer;
    border-left: 1px solid var(--color-border-primary);
    color: var(--color-text-tertiary);
    &:hover {
      background: var(--color-background-secondary);
      color: var(--color-primary);
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
    color: var(--color-text-tertiary);
  }
  input {
    width: 100%;
  }
`;

export const BothRelateInfo = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  padding: 10px 12px;
  background-color: var(--color-background-primary);
  .displayType {
    margin-top: 8px;
  }
  span {
    margin: 0 4px;
  }
  .sourceName {
    color: var(--color-primary);
  }
`;

export const DisplayTabs = styled.div`
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  .tabItem {
    padding: 5px 20px;
    border-bottom: 3px solid transparent;
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    &.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary) !important;
    }
    &:hover {
      color: var(--color-primary);
    }
  }
`;

export const DisplayMode = styled.div`
  display: flex;
  padding: 8px 0;
  justify-content: space-between;
  .displayItem {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 12px;
    &:last-child {
      margin-right: 0;
    }
    .text {
      color: var(--color-text-secondary);
    }
    div {
      width: 100%;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px 3px 3px 3px;
      border: 1px solid var(--color-border-primary);
      i {
        color: var(--color-text-secondary);
      }
    }

    &.active {
      div {
        border: 2px solid var(--color-primary) !important;
      }
      .text,
      i {
        color: var(--color-primary) !important;
      }
    }
    &:hover {
      div {
        border-color: var(--color-border-tertiary);
      }
    }
  }
`;

export const EditOptionDialog = styled(Dialog)`
  .editOptionDialog {
    display: flex;
    flex-direction: column;
    padding: 0 0 36px !important;
    min-height: 0;
  }
  .setOption {
    color: var(--color-text-tertiary);
    span:hover {
      color: var(--color-primary);
    }
  }
  .optionsWrap {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0 24px;
    box-sizing: border-box;
  }
  .handleOption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 58px;
    background: var(--color-background-primary);
    padding: 12px 36px;
  }
`;

export const SetConfig = styled.div`
  height: 36px;
  line-height: 34px;
  text-align: center;
  border-radius: 3px;
  cursor: pointer;
  border: ${props =>
    props.hasSet ? '1px solid var(--color-border-primary)' : '1px dashed var(--color-border-primary)'};
  i {
    font-size: 15px;
    color: var(--color-success);
    margin-right: 7px;
  }
  &:hover {
    border-color: var(--color-primary);
  }
`;

export const CoverWrap = styled.div`
  width: 308px;
  max-height: 350px;
  overflow-x: hidden;
  background: var(--color-background-primary);
  box-shadow: 0px 4px 12px 1px rgba(0, 0, 0, 0.1608);
  padding: 16px;
  .coverTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .coverType {
    display: Inline-block;
    border-radius: 3px 0px 0px 3px;
    border: 1px solid var(--color-border-primary);
    padding: 6px 18px;
    color: var(--color-text-secondary);
    &.active {
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
    &:last-child {
      border-radius: 0px 3px 3px 0px;
    }
  }
`;

export { Button, DropdownOverlay } from './common';
