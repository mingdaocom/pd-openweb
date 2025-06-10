import styled from 'styled-components';

export const Wrap = styled.div`
  &.messageBox {
    .mesDiv.errorDiv:not(.errorDivCu) {
      .title {
        color: red !important;
        top: -9;
      }
      input[type='text']:not(.iti__search-input),
      input[type='password'],
      .Dropdown--input,
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
        .Dropdown--placeholder {
          opacity: 1;
        }
      }
    }
    .mesDiv:not(.hasValue) {
      .title {
        top: 20px !important;
      }
      input:not(.iti__search-input) .icon-arrow-down-border,
      .Dropdown--input .icon-arrow-down-border {
        position: absolute;
        right: 12px;
        top: 0;
      }
      input[type='text']:not(.iti__search-input),
      input[type='password'],
      .Dropdown--input,
      .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
        .Dropdown--placeholder {
          opacity: 0;
          transition: all 0.3s;
        }
        &.active {
          border: 2px solid #2196f3 !important;
          .title {
            color: #2196f3 !important;
            top: -9;
          }
          .Dropdown--placeholder {
            opacity: 1;
          }
        }
      }
      &.errorDiv {
        .title {
          top: -9px !important;
        }
      }
      &.hasValue {
        .title {
          top: -9px !important;
        }
      }
    }
  }
`;
export const WrapCon = styled.div`
  position: absolute;
  top: 100%;
  background: #fff;
  z-index: 10;
  width: 100%;
  padding: 6px 0;
  box-shadow: 0px 8px 16px rgb(0 0 0 / 24%);
  border-radius: 2px;
  overflow: auto;
  max-height: 400px;
  .cover {
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  & > div.liBox {
    padding: 6px 8px;
    &:hover,
    &.isCur {
      background: #2196f3;
      color: #fff;
      .ThemeColor3 {
        color: #fff !important;
      }
    }
  }
`;

export const WrapConDp = styled.div`
.controlDropdown {
  height: auto;
  .itemT {
    background: #f5f5f5;
    border-radius: 4px 4px 4px 4px;
    padding: 3px 8px 3px 10px;
    border: 1px solid #e0e0e0;
    line-height: 20px;
    i {
      color: #9e9e9e;
      &:hover {
        color: #757575;
      }
    }
  }
  span.itemSpan {
    color: #151515 !important;
    font-size: 15px;
  }
  .ming.Item .Item-content:not(.disabled):hover {
    span.itemSpan {
      color: white !important;
      font-size: 15px;
    }
  }
  .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    height: auto !important;
  }
  .Dropdown--input {
    height: auto !important;
    min-height: 40px;
    padding: 4px !important;
    .Dropdown--placeholder {
      line-height: 42px !important;
    }
    .icon-arrow-down-border {
      line-height: 52px !important;
    }
    .value {
      line-height: 42px !important;
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
}
`;