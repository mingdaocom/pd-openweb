import styled from 'styled-components';

export const Wrap = styled.div`
  p {
    margin: 0;
  }
  .Bold400 {
    font-weight: 400;
  }
  .Green_right {
    color: #4caf50;
  }
  .iconCon {
    width: 44px;
    height: 44px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    position: relative;
    text-align: center;
    line-height: 50px;
  }
  width: 880px;
  margin: 0 auto;
  background: #ffffff;
  // border: 1px solid #dddddd;
  border-radius: 10px;
  .con {
    padding: 20px 24px;
    .title {
      width: 130px;
      padding-right: 20px;
    }
  }
  .workflowSettings {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  .line {
    padding: 10px 0;
    border-bottom: 1px solid #f2f2f2;
  }
  .btn {
    &.disable {
      background: #f5f5f5;
      color: #bdbdbd;
      border: 1px solid #bdbdbd;
    }
  }
  .customTextareaCon {
    margin-top: -10px;
    padding: 0 24px 24px;
    .actionControlMore {
      width: 34px;
      height: 34px;
      border-width: 1px 1px 1px 0;
      border-style: solid;
      box-sizing: border-box;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border-color: #ddd;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:not(:hover) {
        color: #757575 !important;
      }
    }
  }
  .urlForCopy {
    border-radius: 3px;
    height: 36px;
    line-height: 36px;
    background: #f4f4f3;
    border: 1px solid #e0e0e0;
    color: #151515;
    font-size: 14px;
    padding: 0 10px;
    overflow: hidden;
  }
  .copyBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 25px;
    background: #f4f4f3;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #e0e0e0;
    &:hover {
      color: #2196f3;
    }
  }
`;
