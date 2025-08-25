import styled from 'styled-components';

export const Con = styled.div(
  ({ width }) => `
  width: ${width}px;
  transition: width 0.2s;
  position:relative;
  z-index: 3;
  .searchBar {
    width: ${width}px;
    padding: 0 12px;
    height: 34px;
    .icon {
      line-height: 35px;
      font-size: 20px;
      color: #bdbdbd;
      &.icon-close {
        cursor: pointer;
      }
      &.icon-search{
        &:hover{
          color:#bdbdbd;
        }
      }
      &:hover{
        color: #1677ff;
      }
    }
    input {
      width: 100%;
      height: 36px;
      border: none;
      padding-left: 6px;
      font-size: 13px;
    }
  }
  .groupWrap {
    width: 100%;
    .gList {
      width:auto;
      font-weight: 400;
      padding:0px 6px;
      line-height: 32px;
      .count {
        padding-left: 10px;
        font-size: 13px;
        color: #9e9e9e;
        line-height: 32px;
      }
      &.current {
        .gListDiv{
          background: #e3f3ff;
          &:hover{
            background: #e3f3ff;
          }
        }
      }
      .gListDiv{
        border-radius: 3px;
        padding-left: 6px;
        position:relative;
        height: 32px;
        &:hover{
          background: rgba(0,0,0,0.04);
        }
        .count{
          position: absolute;
          right: 6px;
        }
      }
      .option {
        left: -3px;
        top: 1px;
        height: 30px;
        width: 3px;
        border-radius: 3px 0 0 3px;
        position: absolute;
      }
      .optionTxt {
        width: 100%;
      }
      &.hasCount{
        .optionTxt {
          max-width: calc(100% - 40px);
        }
      }
    }
    &.isTree{
      overflow: auto;
      .canScroll {
        width: auto;
        height: auto;
        display: inline-block;
        min-width: 100%;
      }
      .gList {
        white-space: nowrap;
      }
      .count{
        position: initial!important;
      }
      .arrow{
        display: inline-block;
        width: 22px;
      }
      .iconArrow{
        width: 18px;
        height: 18px;
        display: inline-block;
        line-height: 18px;
        color: #9e9e9e;
        text-align: center;
        border-radius: 4px;
        &:hover{
            background: rgba(0,0,0,0.06);
            color: #757575;
          }
        }
      }
    }
  }
`,
);
