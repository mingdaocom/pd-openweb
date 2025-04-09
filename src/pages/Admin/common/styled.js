import styled from 'styled-components';
export const BillInfoWrap = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .billInfoHeader {
    .title {
      color: '#151515';
      font-size: 17px;
      font-weight: 600;
    }
    .invoiceSetting {
      color: #2196f3;
      margin: 0 8px;
    }
  }
  .accountInfo {
    display: flex;
    align-items: center;
    i,
    .balance {
      color: #2196f3;
      margin: 0 8px;
    }
    .eyeIcon {
      width: 20px;
      height: 20px;
      font-size: 14px;
      display: inline-block;
      text-align: center;
      vertical-align: middle;
      line-height: 20px;
      border-radius: 50%;
      &:hover {
        background: #f5f5f5;
      }
    }
    .recharge,
    .warningBtn {
      display: inline-block;
      height: 24px;
      line-height: 24px;
      background-color: #2196f3;
      color: #fff;
      font-size: 12px;
      padding: 0 16px;
      border-radius: 3px;
      &:hover {
        background-color: #1565c0;
      }
    }
    .warningBtn {
      background-color: #fff;
      border: 1px solid #2196f3;
      line-height: 22px;
      color: #2196f3;
      &:hover {
        background-color: #fff;
        border: 1px solid #1565c0;
        color: #1565c0;
      }
    }
    .moneySymbol {
      margin-left: 4px;
    }
  }
  .emptyList {
    text-align: center;
    padding: 24px 0;
  }

  .listHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    .recordType {
      display: flex;
      li {
        border-bottom: 2px solid transparent;
        transition: all 0.25s;
        line-height: 36px;
        cursor: pointer;
        padding: 6px;
        &.active,
        &:hover {
          border-bottom-color: #2196f3;
        }
      }
    }
    .dataFilter {
      display: flex;
      align-items: center;
      .rows {
        margin: 0 12px;
      }
      .date {
        transition: all 0.25s;
        max-width: 240px;
        cursor: pointer;
      }
      .dateRange {
        margin: 0 8px;
        background: #e2f2fd;
        color: #2196f3;
        padding: 0 12px;
        border-radius: 4px;
        display: inline-block;
        line-height: 28px;
        cursor: pointer;
        i {
          margin-left: 4px;
        }
      }
    }

    .switchPage {
      cursor: pointer;
      display: flex;
      .prevPage,
      .nextPage {
        &.disable {
          color: #757575;
          cursor: not-allowed;
        }
      }
    }
    .recordType {
      li:last-child {
        margin-left: 20px;
      }
    }
  }
  .listTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    .item {
      text-align: left;
      width: 10%;
      .ming.Dropdown .Dropdown--input {
        padding: 0;
      }
    }
    .time {
      width: 16%;
    }
    .type {
      width: 24%;
    }
    .operation {
      text-align: center;
    }
    .rechargeType {
      flex: 1;
      padding-right: 10px;
    }
  }
  .recordList {
    flex: 1;
    li {
      display: flex;
      justify-content: space-between;
      line-height: 48px;
      cursor: pointer;
      transition: all 0.25s;
      &:hover {
        background-color: #f8f8f8;
      }

      .item {
        text-align: left;
        width: 10%;
      }
      .time {
        width: 16%;
      }
      .type {
        width: 24%;
      }
      .operation {
        text-align: center;
      }

      .amount {
        color: #ff9a00;
        &.isPositive {
          color: #47b14b;
        }
      }
      .billStatus {
        padding: 0 5px;
        .ming.Menu {
          width: 100px;
        }
      }
      .rechargeType {
        flex: 1;
        padding-right: 10px;
      }
    }
  }

  .createPerson,
  .paidPerson {
    .billOwner {
      font-size: 0;
      img {
        vertical-align: baseline;
      }
    }
  }

  .goToPay {
    padding: 0 12px;
    background-color: #fd9c27;
    color: #fff;
    line-height: 24px;
    border-radius: 12px;
  }

  .recordItem {
    .createPerson,
    .paidPerson {
      display: flex;
      align-items: center;
      img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      > span {
        margin-left: 6px;
      }
    }
  }
`;
export const AccountIdOperation = styled.ul`
  padding: 6px 0;
  border-radius: 3px;
  min-width: 120px;
  background-color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  position: relative;
  input {
    /* display: none; */
  }
  li {
    padding: 0 24px;
    cursor: pointer;
    line-height: 36px;
    transition: all 0.25s;
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
`;

export const DatePickerFilterWrap = styled(AccountIdOperation)``;
