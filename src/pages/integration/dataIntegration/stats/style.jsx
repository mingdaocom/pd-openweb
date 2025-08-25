import styled from 'styled-components';

export const Wrap = styled.div`
  .pTop80 {
    padding-top: 80px;
  }
  .pBottom140 {
    padding-bottom: 140px;
  }
  background: #fff;
  overflow-y: auto;
  padding: 32px 32px;
  .timeNum {
    li {
      width: 32%;
      margin-right:16%
      height: 120px;
      background: #fafafa;
      border-radius: 4px;
      text-align: left;
      padding: 0 20px;
      .des {
        font-weight: 600;
        color: #757575;
        padding-top: 25px;
      }
      .txt {
        font-size: 32px;
        font-weight: 400;
        color: #151515;
      }
      .txtTime {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
  .timeDrop {
    width: 300px;
  }
  .tableCon {
    width: 100%;
    height: 207px;
    .chartBox {
      height: 207px;
    }
    .loadingChart {
      position: absolute;
      top: 0;
      z-index: 1;
    }
  }
  .listTable {
    .trCon {
      border-bottom: 1px solid #eaeaea;
      font-weight: 400;
      min-height: 55px;
      &.isErr {
        color: #f44336;
      }
      &.isGreen {
        color: #4caf50;
      }
      .item {
        min-width: 0;
        word-break: break-word;
        flex-shrink: 0;
        padding: 8px 6px;
        &.width100 {
          width: 100px;
        }
      }
    }
    .flex2 {
      flex: 2;
    }
    .sortIcon {
      color: #bfbfbf;
      height: 8px;

      &.selected {
        color: #1677ff;
      }
    }
  }
  .pageCon {
    .pre,
    .next {
      display: inline-block;
      margin: 0 32px;
      cursor: pointer;
      color: #151515;
      &.disable {
        cursor: not-allowed;
        color: #aaaaaa;
      }
    }
  }
  .searchCon {
    border-radius: 4px;
    background: #fff;
    border: 1px solid #bdbdbd;
    font-size: 14px;
  }
`;
