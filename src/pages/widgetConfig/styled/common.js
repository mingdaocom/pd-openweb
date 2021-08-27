import styled from 'styled-components';
export const Button = styled.div`
  line-height: 36px;
  text-align: center;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  transition: all 0.25s;
  i {
    margin-right: 4px;
    &.active {
      color: #4caf50;
    }
  }
  &:hover {
    background-color: #f8f8f8;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.01);
  }
`;

export const DropdownOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  min-height: 36px;
  overflow: auto;
  border-radius: 3px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.24);
  padding: 6px 0;
  .searchWrap {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
    margin-bottom: 6px;
    border-bottom: 1px solid #f0f0f0;
    input {
      line-height: 36px;
      border: none;
      outline: none;
      padding-left: 8px;
    }
  }

  .dropdownContent {
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    .emptyText {
      margin: 0 auto;
      line-height: 38px;
      color: #9e9e9e;
      font-size: 13px;
      text-align: center;
    }
    .item {
      display: flex;
      align-items: center;
      line-height: 36px;
      padding: 0 16px;
      cursor: pointer;
      transition: background-color color 0.25s;
      i {
        margin-right: 8px;
        color: #9e9e9e;
      }
      .text {
        margin-right: 6px;
      }
      &.invalid {
        color: #f44336;
        i {
          color: #f44336;
        }
        &:not(disabled):hover {
          background-color: #f44336;
          color: #ffffff;
          i {
            color: #ffffff;
          }
        }
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
  }
`;
