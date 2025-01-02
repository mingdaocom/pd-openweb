import styled from 'styled-components';
import { Menu } from 'ming-ui';

export const Wrap = styled.div`
  .setCon {
    width: 360px;
    border-right: 1px solid #e8e8e8;
    flex-shrink: 0;
    min-width: 0;
    .line {
      border-bottom: 1px solid #dddddd;
    }
    .cover {
      position: fixed;
      background: #f5f5f5;
      opacity: 0.45;
      left: 0;
      top: 0;
      width: 360px;
      bottom: 0;
      z-index: 9999;
    }
    .setConB {
      padding: 24px;
      overflow-y: auto;
    }
  }
  .preview {
    background: #fff;
    flex-shrink: 0;
    min-width: 0;
  }
  .hoverBoxShadow {
    &:hover {
      box-shadow: 0px 1px 2px rgba(33, 150, 243, 0.3);
    }
  }
  .colorByWorksheet {
    width: 2px;
    height: calc(100% - 18px);
    position: absolute;
    left: 0;
    top: 9px;
    border-radius: 2px;
  }
`;

export const WrapDropW = styled.div`
  width: 100%;
  border-radius: 3px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  background-color: #fff;
`;
export const WrapSelectCon = styled.div`
  .topCon {
    height: 12px;
  }
`;
export const WrapSource = styled.div`
  .selectWorksheetCommon .dropdownWrapper .aroundList {
    z-index: 10000;
    .selectWorksheetCommonContent {
      input {
        &::placeholder {
          color: #bdbdbd;
        }
        margin-left: -8px;
      }
      .icon-search {
        font-size: 18px !important;
        left: 16px;
        top: 16px;
      }
    }
  }
  &.isTopChild {
    .selectWorksheetCommon .dropdownWrapper .aroundList {
      top: 48px;
    }
  }
`;
export const WrapWorksheet = styled.div`
  .flexRowCon {
    display: flex !important;
    min-width: 0;
  }
  &.isRelative {
    background: #f5f5f5;
  }
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 1px 2px rgba(51, 51, 51, 0.16);
  &.isAdd {
    background: initial;
    border-radius: initial;
    box-shadow: initial;
  }
  .Dropdown--border,
  .Dropdown--border {
    span {
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      flex: 1 !important;
    }
    border: none !important;
  }
  .filterConByWorksheet {
    background: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 3px;
    margin: 0 12px 0;
    box-sizing: border-box;
    width: calc(100% - 24px);
    padding: 2px 5px 8px 12px;
    display: flex !important;
    &:hover {
      background: #f5f5f5;
    }
    .renderFilterItem {
      span {
        display: inline-flex !important;
      }
    }
  }
`;

export const Header = styled.div`
  width: 100%;
  height: 54px;
  background: #ffffff;
  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.16);
  z-index: 10000;
  .pageName {
    .iconWrap {
      padding-right: 24px;
      .back {
        color: #757575;
        &:hover {
          color: #2196f3;
        }
      }
    }
    display: flex;
    align-items: center;
    font-size: 17px;
    .name {
      box-sizing: border-box;
      max-width: 500px;
      margin-top: 1px;
      padding: 0 10px;
      border-bottom: 1px dashed #9e9e9e;
      cursor: pointer;
    }
    input {
      max-width: 500px;
      border: none;
      font-size: 17px;
      border-bottom: 2px solid #2196f3;
    }
  }
  .ming.Button--secondary {
    color: #757575;
    background: #f5f5f5;
    &:hover {
      background: #e0e0e0;
    }
  }
  .reset {
    box-sizing: border-box;
    padding: 0 22px;
    line-height: 34px;
    color: #fff;
    cursor: not-allowed;
    border-radius: 3px;
    text-align: center;
    font-weight: 600;
    border: 1px solid #9e9e9e;
    &.Hand {
      cursor: pointer;
      &:hover {
        border: 1px solid #2196f3;
      }
    }
  }
  .publishBtn {
    box-sizing: border-box;
    padding: 0 32px;
    line-height: 36px;
    color: #fff;
    cursor: pointer;
    border-radius: 3px;
    text-align: center;
    font-weight: 600;
    background: #2196f3;
    &:hover {
      background: #1e88e5;
    }
  }
  .disable,
  .disable:hover {
    background: #bdbdbd;
    background-color: #bdbdbd !important;
    border: 1px solid #bdbdbd;
    border-color: #bdbdbd;
    cursor: not-allowed !important;
    color: #fff;
  }
  .workflowStatusWrap {
    .disable,
    .disable:hover {
      .iconWrap .workflowSwitchIcon-active {
        color: #bdbdbd !important;
      }
    }
  }
`;

export const WrapPreview = styled.div`
  .pagination {
    .icon-arrow-left-border,
    .icon-arrow-right-border {
      font-size: 16px;
    }
  }
  .sheetViewTable {
    border-left: 0;
    border-right: 0;
  }
  .finished {
    color: #4caf50;
  }
  .stop {
    color: #ffa340;
  }
  .coverTab {
    position: absolute;
    right: 20px;
    top: 12px;
    bottom: 0;
    left: 20px;
    z-index: 1;
    background: #f5f5f5;
    opacity: 0.5;
  }
  .warnCon {
    border-radius: 5px;
    padding: 8px 14px;
    margin: 20px 24px 0;
    &.isERR {
      background: #ffedeb;
    }
    &.isRunning {
      background: #edf6ff;
    }
    &.hasRun {
      background: rgba(76, 175, 80, 0.09);
    }
    &.isStop {
      background: #fef9ed;
    }
    &.hasChange {
      .icon {
        color: #ff6c00;
      }
      background: #fff9ed;
    }
    .btn {
      padding: 0 16px;
      height: 32px;
      line-height: 32px;
      background: #ffffff;
      border-radius: 3px;
      border: 1px solid #bfbfbf;
      &:hover {
        color: #2196f3;
        border: 1px solid #2196f3;
      }
      &.refreshBtn:hover {
        color: #ffa340;
        border: 1px solid #ffa340;
      }
      &.finishedBtn:hover {
        color: #4caf50;
        border: 1px solid #4caf50;
      }
      &.errBtn:hover {
        color: #f44336;
        border: 1px solid #f44336;
      }
    }
  }
  .searchInputComp.default .icon-search {
    font-size: 20px;
    &:hover {
      color: #2196f3 !important;
    }
  }
  .previewHeader {
    padding: 16px 24px 0;
  }
  .previewEmpty {
    & > div {
      margin-top: -100px;
    }
  }
  .previewBtn {
    padding: 0 24px;
    line-height: 36px;
    min-width: 0;
    position: absolute;
    height: 36px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.disable {
      color: #bdbdbd;
      border: 1px solid #bdbdbd;
      &:hover {
        background: #fff;
      }
    }
  }
  .tableCon {
    width: 100%;
    min-height: 0;
    flex-shrink: 0;
  }
  .icon-task-later {
    margin-top: 2px;
  }
  .previewBtnCon {
  }
`;

export const TextAbsoluteCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .iconBox {
    width: 130px;
    height: 130px;
    display: inline-block;
    border-radius: 50%;
    background-size: 130px 130px;
    background-color: #f5f5f5;
    text-align: center;
    line-height: 130px;
    font-size: 80px;
  }
`;

export const WrapS = styled(Menu)`
  // &.rowsCountItem {
  //   height: 40px;
  // }
  // height: 120px;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background: #f5f5f5 !important;
    color: initial !important;
    .icon {
      color: #9e9e9e !important;
    }
    .Red {
      color: red !important;
    }
  }
  .ming.Item.ThemeColor3 .Item-content:not(.disabled):hover {
    color: #1e88e5 !important;
  }
  .Red.ming.MenuItem .Item-content:not(.disabled):hover {
    color: red !important;
  }
  .ming.Item .Item-content {
    padding: 0 8px 0 16px;
    & > span {
      display: flex;
      .Icon {
        position: initial;
      }
    }
  }
  .gray_75 {
    color: #757575;
  }
`;
