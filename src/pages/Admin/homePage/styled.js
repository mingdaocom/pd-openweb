import styled from 'styled-components';

export const HomePageWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  padding-top: 19px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #f5f5f5;
  .Red_f00 {
    color: #ff0000;
  }
  .Yellow_de9 {
    color: #de9000;
  }
  .Hover_theme:hover {
    color: #0063b2 !important;
  }
  .Hover_theme.Normal.Bold {
    font-weight: bold !important;
  }
  .mul2_overflow_ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  .basicInfo {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    .infoCard {
      background: #fff;
      border-radius: 6px;
      min-height: 187px;
      padding: 20px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .renewTag {
        color: #4caf50;
        .doneIcon {
          margin-right: 4px;
        }
      }
      .helpIcon {
        color: #d0d0d0 !important;
        &:hover {
          color: #1677ff !important;
        }
      }
      .buttons {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .greenBtn {
        padding: 6px 21px;
        font-size: 14px;
        color: #fff;
        border-radius: 16px;
        background: #4caf59;
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        &:hover {
          color: #fff;
          background: #1d660e;
        }
      }
      .blueBtn {
        padding: 6px 21px;
        font-size: 14px;
        color: #fff;
        border-radius: 16px;
        background: #1677ff;
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        &:hover {
          color: #fff;
          background: #1565c0;
        }
      }
      .whiteBtn {
        padding: 6px 16px;
        font-size: 14px;
        color: #333;
        border-radius: 16px;
        border: 1px solid #dddddd;
        cursor: pointer;
        &:hover {
          color: #1565c0;
          border: 1px solid #1565c0;
          cursor: pointer;
        }
      }
      .trialTag {
        padding: 4px 8px;
        background: #fef5ea;
        color: #de9000;
        margin-left: 10px;
        display: inline-block;
        border-radius: 50px;
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
    }
    @media screen and (max-width: 1320px) {
      .infoCard.row1 {
        width: 100%;
        min-height: 140px;
        flex: auto;
        flex-direction: row;
      }
    }
  }
  .infoWrap {
    display: flex;
    @media (max-width: 1320px) {
      display: block;
    }
  }
  .Hidden {
    display: none !important;
  }
  .hoverColor {
    &:hover {
      color: #1764c0 !important;
    }
  }
  .userInfoWrap {
    .content {
      ul {
        height: 110px !important;
      }
      ul li {
        padding-top: 10px !important;
      }
    }
  }
  .infoWrapCopy {
    display: flex;
    .content {
      padding: 28px 16px !important;
    }
    @media screen and (max-width: 1920px) {
      display: block;
    }
  }
  .infoWrap,
  .analysis {
    flex-shrink: 0;
    .content {
      background-color: #fff;
      box-sizing: border-box;
      padding: 24px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      border-radius: 3px;
      .count {
        font-size: 28px;
      }
      .verticalTxtBottom {
        vertical-align: text-bottom;
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
      span {
        display: inline-block;
      }
    }
    .workflowTitle {
      margin-top: 4px;
      text-align: left;
      font-weight: 600;
    }
  }
  .analysis {
    .content {
      height: 180px;
    }
    .limitUser {
      color: #7d7d7d;
    }
  }
  .infoBox {
    width: 100%;
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
    border-radius: 6px;
    .computeMethod {
      position: absolute;
      top: 12px;
      right: 12px;
      color: #9e9e9e;
      font-size: 12px;
      cursor: pointer;
      .Hover_21:hover {
        color: #1677ff !important;
      }
    }
    .limitUser {
      font-size: 13px;
      color: #9e9e9e;
    }
    .name {
      font-size: 14px;
      color: #7d7d7d;
      font-weight: 600;
    }
    ul {
      display: flex;
      flex: 1;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      li {
        width: calc((100% - 16px) / 3);
        min-height: 132px;
        padding: 10px 20px;
        @media screen and (max-width: 1391px) {
          width: calc(50% - 4px);
          min-width: 320px;
        }
        @media screen and (max-width: 1367px) {
          padding: 10px;
        }
        .detailBtn {
          display: none;
        }
        &:hover {
          border-radius: 15px;
          background-color: #f5f5f5;
          .detailBtn {
            display: inline-block;
          }
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
    padding: 6px 16px;
    transition: background-color 0.25s;
    background: rgba(18, 148, 247, 0.1);
    font-weight: 600;
    color: rgba(18, 148, 247);
    border-radius: 16px;
    cursor: pointer;
    order: 2;
    font-size: 14px;
    &:hover {
      background: rgba(18, 148, 247, 0.2);
    }
  }
  .trialAuthenticate {
    background-color: #fef5e9;
    color: #151515;
    &:hover {
      background-color: #fdebd5;
    }
    .icon-gift {
      color: #f89a2e;
    }
  }

  .inviteUserWrap {
    position: absolute;
    bottom: 16px;
    width: calc(100% - 48px);
    .inviteUser {
      padding: 0 24px;
      line-height: 32px;
      border-radius: 24px;
      position: unset;
      background-color: rgb(76, 175, 80, 0.1);
      color: #4caf50;
      margin: 0 auto;
      display: inline-block;
      white-space: nowrap;
      font-weight: 600;
      &:hover {
        background-color: #c8e6c9;
      }
    }
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
        color: #1677ff;
      }
      span {
        color: #757575;
        font-size: 14px;
        margin: 0 12px 0 10px;
      }
      .balance {
        color: #151515;
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
        color: #1677ff;
        margin: 0 4px;
      }
    }
    .expireDate {
      margin: 0 5px;
      font-size: 12px;
      color: #757575;
    }
    .upgrade {
      color: #1677ff;
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
          color: #1677ff;
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
      border-radius: 6px;
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      li {
        width: 25%;
        min-width: 276px;
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
      @media screen and (max-width: 1519px) {
        li {
          width: calc(100% / 3);
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
      color: #1677ff;
      font-size: 24px;
      margin: 0 6px;
    }
  }
  .expire {
    color: #757575;
    margin: 12px 0;
  }
  .remainTime {
    color: #1677ff;
    margin-left: 6px;
  }
  .inviteRules {
    display: flex;
    align-items: center;
    margin: 36px 0;
    li {
      min-width: 80px;
      .achieveDays {
        color: #1677ff;
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
      background: #1677ff !important;
      .iconWrap {
        background: #1677ff !important;
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

export const TitleWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
  margin-bottom: 16px;
  height: 32px;
  font-weight: bold;
  font-size: 16px;
  color: #333333;
  .titleBtn {
    padding: 0 16px;
    height: 32px;
    background: #fff;
    font-weight: bold;
    font-size: 14px;
    line-height: 32px;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid #fff;
    &:hover {
      color: #1565c0;
      border: 1px solid #1565c0;
      cursor: pointer;
    }
  }
`;
