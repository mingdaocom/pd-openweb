import styled, { css } from 'styled-components';

export const WrapL = styled.div`
  // 暂时不开放
  .Dropdown--input {
    .icon-arrow-down-border {
      display: none;
    }
  }
  .icon-expand_more {
    display: none;
  }
  .ming.Dropdown.disabled,
  .dropdownTrigger.disabled {
    background-color: #fff;
  }
  //
  .autosize {
    flex: 1;
  }
  .con {
    margin-top: 14px;
  }
  .addCondition {
    height: 32px;
    line-height: 32px;
    background: #f5f5f5;
    border: 1px solid #dddddd;
    border-radius: 4px;
    display: inline-block;
    padding: 0 18px;
  }
  .joinCondition {
    .dropCondition {
      width: 208px;
      height: 36px;
      background: #ffffff;
      opacity: 1;
      border-radius: 4px;
      .value {
        width: 168px;
      }
    }
    .andOr {
      height: 36px;
      overflow: hidden;
    }
    .closeBtn {
      opacity: 0;
      color: #9e9e9e;
    }
    &:hover {
      .closeBtn {
        opacity: 1;
        &:hover {
          color: red;
        }
      }
    }
  }
  // .addSource,
  .addFilter {
    height: 58px;
    background: #ffffff;
    border: 1px dashed #dddddd;
    border-radius: 4px;
    color: #2196f3;
    line-height: 58px;
    &:hover {
      border: 1px dashed #2196f3;
    }
  }
  // .sourceCard {
  //   padding: 12px 20px;
  //   background: #ffffff;
  //   border: 1px solid #e2e2e2;
  //   border-radius: 4px;
  //   img {
  //     width: 32px;
  //     height: 32px;
  //     border: 2px solid #ffffff;
  //     border-radius: 50%;
  //   }
  // }
  .dropWorksheet {
    margin-top: 14px;
    width: 100%;
  }
  .unionC {
    flex-wrap: wrap-reverse;
    justify-content: space-between;
    li {
      flex-shrink: 0;
      flex-grow: 0;
      width: 164px;
      border: 1px solid #dddddd;
      background: #ffffff;
      border-radius: 4px;
      color: #757575;
      padding: 9px 0;
      .er {
        color: #9e9e9e;
        font-weight: 400;
      }
      &.isCur {
        background: rgba(33, 150, 243, 0.1);
        border: 1px solid #2196f3;
        color: #2196f3;
      }
    }
  }
  .groupCon {
    .icon {
      color: #bdbdbd;
      &:hover {
        color: #2196f3 !important;
      }
    }
  }
  .itemOp {
    background: #f5f5f5;
    border: 1px solid #dfdfdf;
    padding: 5px 12px;
    border-radius: 14px;
    margin-right: 8px;
    display: inline-block;
  }
`;
