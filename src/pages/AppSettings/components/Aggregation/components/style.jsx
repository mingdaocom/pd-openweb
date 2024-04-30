import styled from 'styled-components';

export const Wrap = styled.div`
  .setCon {
    overflow-y: auto;
    width: 360px;
    border-right: 1px solid #e8e8e8;
    padding: 24px;
    flex-shrink: 0;
    min-width: 0;
    .line {
      border-bottom: 1px solid #dddddd;
    }
    .cover {
      position: fixed;
      background: #f5f5f5;
      opacity: 0.5;
      left: 0;
      top: 0;
      width: 360px;
      bottom: 0;
      z-index: 9999;
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
    height: calc(100% - 16px);
    position: absolute;
    left: 0;
    top: 8px;
  }
`;

export const WrapDropW = styled.div`
  width: 100%;
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  background-color: #fff;
`;

export const WrapWorksheet = styled.div`
  .flexRowCon {
    display: flex !important;
    min-width: 0;
  }
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0px 1px 2px rgba(51, 51, 51, 0.16);
  &.isAdd {
    background: initial;
    border-radius: initial;
    box-shadow: initial;
  }
  .ming.Dropdown .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      word-break: break-word;
      flex: 1;
    }
    border: none;
  }
  .filterConByWorksheet {
    background: #ffffff;
    border: 1px solid #eaeaea;
    border-radius: 3px;
    margin: 0 12px 0;
    box-sizing: border-box;
    width: calc(100% - 24px);
    padding: 2px 5px 8px 12px;
    &:hover {
      background: #f5f5f5;
    }
  }
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
`;

export const Header = styled.div`
  width: 100%;
  height: 54px;
  background: #ffffff;
  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.16);
  z-index: 1;
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
      max-width: 240px;
      margin-top: 1px;
      padding: 0 10px;
      border-bottom: 1px dashed #9e9e9e;
      cursor: pointer;
    }
    input {
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
