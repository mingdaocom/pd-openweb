import styled from 'styled-components';

export const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  z-index: 1;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .addControl {
    margin-left: 22px;
    width: 99px;
    height: 36px;
    background: #f8f8f8;
    border-radius: 3px;
    color: #1677ff;
    line-height: 34px;
    text-align: center;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

export const WrapSortControls = styled.div`
  &.firstWrapSorh {
    margin-left: -11px;
  }
  &.title {
    margin-left: 0px;
    border-radius: 3px;
    overflow: hidden;
    background: #f8f8f8;
    padding-left: 16px;
  }
  label {
    width: 65px;
    &.required {
      margin-left: 10px;
    }
  }
  .controlName,
  .controlN {
    &.title {
      background: none;
      border: 0;
      margin-left: 5px;
    }
  }
`;
