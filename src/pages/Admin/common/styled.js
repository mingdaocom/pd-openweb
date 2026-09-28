import styled from 'styled-components';

export const BillInfoWrap = styled.div`
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .billInfoHeader {
    .title {
      color: var(--color-text-title);
      font-size: 17px;
      font-weight: 600;
    }
    .invoiceSetting {
      color: var(--color-primary);
      margin: 0 8px;
      font-size: 15px;
    }
  }
  .accountInfo {
    display: flex;
    align-items: center;
    i,
    .balance {
      color: var(--color-primary);
      margin-right: 8px;
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
        background: var(--color-background-hover);
      }
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
    margin-top: 12px;
    .recordType {
      display: flex;
      li {
        border-bottom: 2px solid transparent;
        transition: all 0.25s;
        line-height: 44px;
        cursor: pointer;
        &.active,
        &:hover {
          border-bottom-color: var(--color-primary);
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
        background: var(--color-primary-transparent);
        color: var(--color-primary);
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
          color: var(--color-text-secondary);
          cursor: not-allowed;
        }
      }
    }
  }
  .listTitle {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-primary);
    border-bottom: 1px solid var(--color-border-primary);
    .item {
      text-align: left;
      width: 10%;
    }
    .time {
      width: 160px;
    }
    .type {
      width: 24%;
    }
    .operation {
      width: 60px;
      text-align: center;
    }
    .agentBillingDetail {
      width: 80px;
      text-align: center;
      flex: 0 0 80px;
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
      align-items: center;
      height: 48px;
      cursor: pointer;
      transition: all 0.25s;
      &:hover {
        background-color: var(--color-background-hover);
      }

      .item {
        text-align: left;
        width: 10%;
      }
      .time {
        width: 160px;
      }
      .type {
        width: 24%;
        > span {
          max-width: 100%;
        }
      }
      .operation {
        width: 60px;
        text-align: center;
      }
      .agentBillingDetail {
        width: 80px;
        text-align: center;
        flex: 0 0 80px;
      }

      .billStatus {
        padding: 0 5px;
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

  .listTitle.aiBenefitListTitle,
  .recordList.aiBenefitRecordList li {
    display: flex;
    justify-content: flex-start;
    gap: 18px;
    .item {
      min-width: 0;
    }
    .time {
      flex: 0 0 200px;
      width: 200px;
    }
    .type {
      flex: 1;
      padding-right: 0;
    }
    .aiBenefitPoint {
      text-align: right;
    }
    .aiBenefitPoint {
      flex: 0 0 180px;
      width: 180px;
    }
    .createPerson {
      flex: 0 0 180px;
      width: 180px;
      margin-left: 50px;
    }
    .agentBillingDetail {
      flex: 0 0 80px;
      width: 80px;
      text-align: center;
    }
  }
`;
