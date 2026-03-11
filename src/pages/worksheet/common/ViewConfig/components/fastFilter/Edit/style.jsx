import styled from 'styled-components';

export const Wrap = styled.div`
  width: 400px;
  .boxEditFastFilterCover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 12;
    background: rgba(0, 0, 0, 0.2);
  }
  .boxEditFastFilter {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 400px;
    background: var(--color-background-primary);
    box-shadow: 0px 8px 36px 0px rgba(0, 0, 0, 0.24);
    right: 0;
    z-index: 12;
    .ant-radio-checked::after {
      position: absolute;
      top: initial;
      left: 0;
      width: 16px;
      height: 16px;
      bottom: 0;
    }
    .topHeader {
      height: 56px;
      min-height: 56px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: start;
      border-bottom: 1px solid var(--color-border-secondary);
      font-size: 16px;
      font-weight: 500;
      span {
        flex: 1;
      }
      .icon-close {
        color: var(--color-text-tertiary) !important
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .con {
      overflow: auto;
      padding: 0 24px;
      .title {
        padding-top: 24px;
        margin-top: 0!important;
        font-weight: bold;
        font-size: 13px;
        font-size: 13px;
      }
      .ant-radio-input {
        display: none !important;
      }
      .active {
        .inputBox {
          border: 1px solid var(--color-primary);
        }
      }
      .inputBox {
        width: 100%;
        display: flex;
        line-height: 36px;
        height: 36px;
        opacity: 1;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-primary);
        border-radius: 4px;
        padding: 0 12px 0 12px;
        .icon {
          line-height: 35px;
        }
        &.timeRange {
          padding: 0 0 0 12px;
          .act{
            width: 18px;
            height: 18px;
            margin-right: 5px;
          }
          .clearTimeRange,
          .changeTimeRange{
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            display:block;
            &.clearTimeRange{
              display:none;
            }
          }
          &:hover{
            .clearTimeRange{
              display:block;
            }
            .changeTimeRange{
              display:none;
            }
          }
        }
        .itemText {
          text-align: left;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .Dropdown {
        width: 100%;
        display: flex;
        line-height: 36px;
        height: 36px;
        opacity: 1;
        background: var(--color-background-primary);
        border-radius: 4px;
        margin-top: 8px;
        box-sizing: border-box;
        & > div {
          flex: 1;
        }
        .Dropdown--input {
          padding: 0 8px 0 12px;
          width: 100%;
          display: flex;
          border: 1px solid var(--color-border-primary);
          border-radius: 4px;
          height: 36px;
          &.active {
            border: 1px solid var(--color-primary);
          }
          .value,
          .Dropdown--placeholder {
            flex: 1;
            max-width: 100%;
          }
          .Icon {
            line-height: 36px;
            font-size: 18px;
          }
          .icon-arrow-down-border{
            font-size: 14px;
          }
          .List {
            width: 100%;
            top: 104% !important;
          }
        }
      }
      .ming.Menu {
        width: 100%;
        top: 104% !important;
      }
      .ant-radio-group {
        display: block;
        .ant-radio-wrapper {
          width: 50%;
          display: inline-block;
          margin: 0;
          vertical-align: top;
        }
      }
    }

    .dropTimeWrap {
      .aroundList {
        max-height: 320px;
        overflow: scroll;
        label {
          display: block;
          padding: 8px 15px;
        }
      }
      .Dropdown--hr {
        height: 1px;
        margin-top: 6px;
        margin-bottom: 6px;
        background: var(--color-border-primary);
        &:last-child {
          display: none;
        }
      }
    }
  }
  .RelateRecordDropdown-selected {
    height: auto;
  }
  input[type='number'] {
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none !important;
    }
  }
  .ming.Input{
    font-size: 13px;
  }
  .disabledBtn {
    cursor: not-allowed;
  }
  .loadingMask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.3);
    z-index: 1000;
    cursor: not-allowed;
    pointer-events: all;
  }
`;
