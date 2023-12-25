import styled from 'styled-components';
export const BillInfoWrap = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .billInfoHeader {
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    background-color: #fff;
    padding: 0 24px;
    box-sizing: border-box;
    .title {
      color: '#333333';
      font-size: 17px;
      font-weight: 600;
    }
    .invoiceSetting {
      color: #2196f3;
      margin: 0 8px;
    }
  }
  .billInfoBox {
    flex: 1;
    padding: 30px 24px 0;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .accountInfo {
    display: flex;
    align-items: center;
    i,
    .recharge,
    .balance {
      color: #2196f3;
      margin: 0 8px;
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
      width: 20%;
    }
    .type {
      width: 20%;
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
        width: 20%;
      }
      .type {
        width: 20%;
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
      >span {
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
