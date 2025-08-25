import styled from 'styled-components';

export const Wrap = styled.div`
  .w120 {
    width: 120px !important;
  }
  input[type='number'] {
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      -webkit-appearance: none !important;
    }
  }
  .fieldIdCon {
    border: 1px solid #ddd;
    box-sizing: border-box;
    height: 36px;
    line-height: 36px;
    border-radius: 3px;
    padding: 0 12px;
    font-size: 14px;
    cursor: no-drop;
    background: #f5f5f5;
  }
  width: 400px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  box-shadow: 0px 8px 36px 1px rgba(0, 0, 0, 0.24);
  background: #fff;
  .con {
    height: 100%;
    .headerCon {
      border-bottom: 1px solid #ededed;
      padding: 0 24px;
      height: 55px;
      line-height: 55px;
    }
    .editCon {
      overflow: auto;
      padding: 0 24px 24px;
    }
  }
  .title {
    font-weight: 600;
  }
  .ming.Radio {
    flex: 1;
  }

  .paramControlDropdown {
    height: auto;
    min-height: 36px;
    .itemT {
      background: #f5f5f5;
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid #e0e0e0;
      i {
        color: #9e9e9e;
        &:hover {
          color: #757575;
        }
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      min-height: 36px !important;
      height: auto !important;
    }
    .Dropdown--input .value {
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
  .ming.Input,
  .Textarea {
    font-size: 13px;
    border: 1px solid #ddd;
    &:hover {
      border-color: #bbb;
    }
    &:focus {
      border-color: #1677ff;
    }
  }
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
`;
