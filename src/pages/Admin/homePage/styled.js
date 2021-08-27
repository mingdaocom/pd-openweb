import styled from 'styled-components';
export const HomePageWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  padding-top: 0;
  box-sizing: border-box;
  overflow-y: auto;
  .infoWrap {
    display: flex;
    @media (max-width: 1320px) {
      display: block;
      .infoBox {
        width: 100%;
      }
    }
  }
  .Hidden {
    display: none !important;
  }
  .infoWrapCopy {
    display: flex;
    .content {
      padding: 32px 24px !important;
      ul li {
        padding-top: 25px !important;
      }
    }
    @media (max-width: 1919px) {
      display: block;
      .infoBox {
        width: 100%;
        padding: 0 !important;
        &.pTitle {
          padding-top: 16px !important;
        }
      }
    }
  }
  .infoWrap,
  .analysis {
    flex-shrink: 0;
    .content {
      background-color: #fff;
      height: 200px;
      box-sizing: border-box;
      padding: 24px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border-radius: 3px;
      .count {
        font-size: 30px;
      }
      .name {
        color: #757575;
        margin-top: 4px;
      }
    }
    .useCount {
      display: flex;
      justify-content: space-between;
      width: 100%;
      color: #757575;
      .dilatation {
        color: #2196f3;
      }
    }
    .workflowTitle {
      margin-top: 4px;
      text-align: left;
      font-weight: 600;
    }
  }
  .infoBox {
    width: 50%;
    padding: 0 12px 0 0;
    &.pTitle {
      padding-top: 56px !important;
    }
  }
  .userInfo,
  .financeInfo {
    flex: 1;
  }
  .userInfo .content {
    display: flex;
    align-items: center;
    padding: 32px 24px 50px 24px;
    position: relative;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    border-radius: 3px;
    .computeMethod {
      position: absolute;
      top: 12px;
      right: 12px;
      color: #9e9e9e;
      font-size: 12px;
      cursor: pointer;
    }
    .limitUser {
      font-size: 13px;
      color: #9e9e9e;
    }
    .name {
      font-size: 14px;
      color: #757575;
      font-weight: 600;
    }
    ul {
      display: flex;
      flex: 1;
      align-items: center;
      height: 100%;
      li {
        flex: 1;
        text-align: center;
        height: 100%;
        padding-top: 20px;
        margin-right: 5%;
        &:last-child {
          margin-right: 0;
        }
        &:hover {
          border-radius: 15px;
          background-color: #f5f5f5;
        }
      }
    }
  }
  .title {
    margin: 24px 0 16px 0;
    font-size: 16px;
    line-height: 16px;
  }

  .purchaseUser,
  .recharge {
    position: absolute;
    right: 24px;
    bottom: 16px;
    padding: 0 24px;
    line-height: 28px;
    transition: background-color 0.25s;
    background: rgba(18, 148, 247, 0.1);
    font-weight: 600;
    &:hover {
      background: rgba(18, 148, 247, 0.2);
    }
    color: rgba(18, 148, 247);
    border-radius: 14px;
    cursor: pointer;
  }
  .financeInfo {
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px 24px;
      border-radius: 3px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }
    .licenseInfoWrap {
      display: flex;
      flex-direction: column;
    }
    .accountInfo {
      display: flex;
      align-items: center;
      i {
        font-size: 24px;
        color: #2196f3;
      }
      span {
        color: #757575;
        font-size: 14px;
        margin: 0 12px 0 10px;
      }
      .balance {
        color: #333;
        font-size: 16px;
        margin: 0;
        font-weight: 600;
      }
    }

    .trialInfo {
      position: absolute;
      top: 4px;
      right: 4px;
      line-height: 26px;
      padding: 0 12px;
      color: #fff;
      border-radius: 3px;
      background: linear-gradient(281deg, #ff9a00 0%, #ffad12 100%);
      z-index: 2;
      i {
        margin-right: 4px;
      }
    }
    .renew {
      display: flex;
      align-items: center;
      align-self: flex-start;
      padding: 0 16px;
      margin-top: 8px;
      line-height: 24px;
      background: #ff9a00;
      color: #fff;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
    }
  }
  .licenseInfo,
  .nextLicenseInfo {
    display: flex;
    position: relative;
    margin-left: 24px;
    align-items: center;
    line-height: 24px;
    padding: 12px 0;

    .licenseFlag {
      position: absolute;
      width: 6px;
      height: 6px;
      top: 22px;
      left: -18px;
      border-radius: 50%;
      background-color: #00c43b;
      &::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: rgba(0, 196, 59, 0.1);
      }
    }
    .expireDays {
      margin: 0 12px;
      span {
        font-size: 16px;
        color: #2196f3;
        margin: 0 4px;
      }
    }
    .expireDate {
      margin: 0 5px;
      font-size: 12px;
      color: #757575;
    }
    .upgrade {
      color: #2196f3;
      margin-left: 6px;
    }
    .delayTrial {
      color: #757575;
      margin-left: 6px;
      cursor: pointer;
      i {
        color: #ff9a00;
      }
      span {
        margin-left: 4px;
        &:hover {
          color: #2196f3;
        }
      }
    }
    .licenseType {
      font-weight: 600;
    }
  }
  .nextLicenseInfo {
    .licenseFlag {
      background-color: #bdbdbd;
      &::before {
        background-color: rgba(189, 189, 189, 0.1);
      }
    }
  }
  .analysis {
    .content {
      height: auto;
      display: flex;
      align-items: center;
      padding: 24px 0;
      border-radius: 3px;
      ul {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 60%;
        padding: 0 12px;
      }
    }

    li {
      height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-radius: 10px;
      flex: 1;
      &:hover {
        background-color: #f5f5f5;
      }
      .name {
        word-break: keep-all;
      }
    }
    @media (max-width: 1320px) {
      .content {
        display: block;
        ul {
          width: 100%;
        }
      }
      .workflowInfo {
        margin-top: 20px;
        padding: 0 calc(10%+24px);
        width: 100%;
      }
    }
  }
  .quickEntry {
    .content {
      padding: 16px;
      background-color: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border-radius: 3px;
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      li {
        width: 25%;
        padding: 8px;
        box-sizing: border-box;
        cursor: pointer;
        .wrap {
          display: flex;
          align-items: center;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          padding: 24px 16px;
          height: 100%;
          box-sizing: border-box;
          &:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
          }
          .iconWrap {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-right: 12px;
            flex-shrink: 0;
            color: #fff;
            font-size: 18px;
          }
          .explain {
            margin-top: 8px;
            color: #bdbdbd;
          }
        }
      }
    }
  }
`;

export const FreeTrialWrap = styled.div`
  text-align: center;
  padding: 0 24px;
  .title {
    font-size: 28px;
  }
  .subTitle {
    margin-top: 8px;
    font-size: 16px;
  }
  .invitePerson {
    font-size: 18px;
    margin-top: 20px;
    span {
      color: #2196f3;
      font-size: 24px;
      margin: 0 6px;
    }
  }
  .expire {
    color: #757575;
    margin: 12px 0;
  }
  .remainTime {
    color: #2196f3;
    margin-left: 6px;
  }
  .inviteRules {
    display: flex;
    align-items: center;
    margin: 36px 0;
    li {
      min-width: 80px;
      .achieveDays {
        color: #2196f3;
        font-size: 14px;
        span {
          margin-right: 4px;
          font-size: 28px;
        }
      }
      &:last-child {
        text-align: right;
        .iconWrap {
          left: auto;
          right: 0;
          transform: none;
        }
      }
    }
    .activeSymbolWrap {
      background: #2196f3 !important;
      .iconWrap {
        background: #2196f3 !important;
      }
    }
    .symbolWrap {
      position: relative;
      background-color: #e0e0e0;
      height: 8px;
      margin: 24px 0;
      .iconWrap {
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-18px);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #e8e8e8;
        text-align: center;
        line-height: 36px;
        color: #fff;
        font-size: 20px;
      }
    }
  }
`;
