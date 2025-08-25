import styled from 'styled-components';

export const PortalBarWrap = styled.div`
  .mRight14 {
    margin-right: 14px;
  }
  flex: 1;
  text-align: right;
  height: 36px;
  .actIcon {
    color: #9e9e9e;
    &:hover {
      color: #1677ff;
    }
  }
  .searchTels {
    cursor: pointer;
    border: 1px solid #ddd;
    border-left: none;
    border-radius: 0 4px 4px 0;
    font-size: 20px;
    color: #9e9e9e;
    line-height: 30px;
    padding: 0 6px;
  }
  i::before {
    line-height: 36px;
  }
  i {
    vertical-align: top;
  }
  .searchInputPortal {
    height: 36px;
    overflow: hidden;
    display: inline-block;
    border-radius: 3px;
    background-color: #fff;
    .inputCon {
      display: flex;
      .inputConLeft {
        line-height: 32px;
        border: 1px solid #ddd !important;
        border-radius: 4px 0 0 4px;
        flex: 1;
        padding-right: 10px;
        position: relative;
        &:hover {
          border: 1px solid #1677ff !important;
        }
        input {
          flex: 1;
          border: none;
          line-height: 34px;
          box-sizing: border-box;
          vertical-align: top;
          padding: 0 12px;
          border-radius: 3px;
          &:-ms-input-placeholder {
            color: #ccc !important;
          }
          &::-ms-input-placeholder {
            color: #ccc;
          }
          &::placeholder {
            color: #ccc;
          }
        }
      }
      i::before {
        line-height: 34px;
      }
      .none {
        display: none;
      }
    }
  }
`;
export const Popup = styled.div`
  background: #fff;
  width: 240px;
  padding: 5px 0;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
  .searchWrapper {
    border-bottom: 1px solid #e0e0e0;
    margin: 8px 16px 0;
    display: flex;
    height: 38px;
    line-height: 38px;
    overflow: hidden;
    .cursorText {
      border: none;
      flex: 1;
      margin: 0;
      padding: 0;
      max-width: 79%;
    }
    .icon {
      width: 20px;
      line-height: 38px;
      color: #bdbdbd;
    }
  }
  .listBox {
    overflow: auto;
    max-height: 844px;
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .widgetList {
      padding: 8px 16px;
      &:hover {
        background: #f5f5f5;
        border-radius: 4px;
      }
      .ant-switch-small {
        min-width: 18px;
        height: 9px;
        line-height: 9px;
        vertical-align: middle;
        margin-right: 18px;
        .ant-switch-handle {
          width: 5px;
          height: 5px;
        }
        .ant-switch-inner {
          margin: 0;
        }
        &.ant-switch-checked {
          .ant-switch-handle {
            left: calc(100% - 5px - 2px);
          }
          .ant-switch-inner {
            margin: 0;
          }
        }
      }
    }
  }
`;
export const ClearIcon = styled.i`
  position: absolute;
  right: 0;
  font-size: 16px;
  color: #9e9e9e;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    color: #777;
  }
`;
