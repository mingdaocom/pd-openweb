import styled from 'styled-components';

export const Wrap = styled.div`
  overflow: hidden;
  .sideNav {
    border-right: 1px solid #eaeaea;
    min-height: 80%;
    width: 200px;
    overflow: hidden;
    .ant-list {
      overflow: auto;
      padding-bottom: 8px;
    }
    .ant-list-item {
      padding: 8px 0 0;
      border-bottom: none;
      width: 100%;
      overflow-x: hidden;
    }
    .ant-checkbox-wrapper > span:not(.ant-checkbox) {
      .ant-checkbox {
        width: 38px;
      }
      overflow: hidden;
      flex-shrink: 0;
      min-width: 0;
      flex: 1;
    }
  }
  .con {
    overflow: auto;
    padding: 15px 20px 24px;
    .hasSet {
      color: #34b153;
    }
  }
  .footer {
    border-top: 1px solid #eaeaea;
  }
  .radioCon {
    display: flex;
    &:before {
      content: ' ';
      width: 2px;
      background: #dddddd;
      border-radius: 1px;
      display: block;
      margin-left: 8px;
      margin-right: 20px;
      margin-top: -10px;
      margin-bottom: -15px;
    }
  }
  .conRadioGroupForBtn {
    .ant-radio-group {
      border-radius: 4px;
      overflow: hidden;
      .ant-radio-button-wrapper {
        background: #f5f5f5 !important;
        border: 2px solid #f5f5f5 !important;
        transition: none;
        padding: 0 25px;
      }
      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
        background: #fff !important;
        color: #333 !important;
      }
      .ant-radio-button-wrapper:not(:first-child)::before {
        display: none !important;
      }
      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
        box-shadow: none;
      }
    }
  }
`;
