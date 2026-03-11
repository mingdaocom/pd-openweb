import styled from 'styled-components';

export const HomePageWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  padding-top: 19px;
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--color-background-secondary);
  .Red_f00 {
    color: var(--color-error);
  }
  .Yellow_de9 {
    color: var(--color-warning);
  }
  .Hover_theme:hover {
    color: var(--color-link-hover) !important;
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
      background: var(--color-background-primary);
      border-radius: 6px;
      min-height: 187px;
      padding: 20px 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .renewTag {
        color: var(--color-success);
        .doneIcon {
          margin-right: 4px;
        }
      }
      .helpIcon {
        color: var(--color-text-tertiary) !important;
        &:hover {
          color: var(--color-primary) !important;
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
        color: var(--color-white);
        border-radius: 16px;
        background: var(--color-success);
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        &:hover {
          color: var(--color-white);
          background: var(--color-success-hover);
        }
      }
      .blueBtn {
        padding: 6px 21px;
        font-size: 14px;
        color: var(--color-white);
        border-radius: 16px;
        background: var(--color-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        &:hover {
          color: var(--color-white);
          background: var(--color-link-hover);
        }
      }
      .whiteBtn {
        padding: 6px 16px;
        font-size: 14px;
        color: var(--color-text-primary);
        border-radius: 16px;
        border: 1px solid var(--color-border-primary);
        cursor: pointer;
        &:hover {
          color: var(--color-link-hover);
          border: 1px solid var(--color-link-hover);
          cursor: pointer;
        }
      }
      .trialTag {
        padding: 4px 8px;
        background: var(--color-warning-bg);
        color: var(--color-warning);
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
          background: var(--color-background-hover);
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
      color: var(--color-link-hover) !important;
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
      background-color: var(--color-background-primary);
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
        color: var(--color-text-secondary);
        margin-top: 4px;
      }
    }
    .useCount {
      display: flex;
      justify-content: space-between;
      width: 100%;
      color: var(--color-text-secondary);
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
      color: var(--color-text-secondary);
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
      color: var(--color-text-tertiary);
      font-size: 12px;
      cursor: pointer;
      .hoverColorPrimary:hover {
        color: var(--color-primary) !important;
      }
    }
    .limitUser {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
    .name {
      font-size: 14px;
      color: var(--color-text-secondary);
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

        .percentResult,
        .detailBtn {
          display: none;
          .line {
            color: var(--color-text-disabled);
            margin: 0 5px;
          }
        }
        &:hover {
          border-radius: 15px;
          background-color: var(--color-background-hover);
          .detailBtn {
            display: inline-block;
          }
          .percentResult {
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
    background-color: var(--color-warning-bg);
    color: var(--color-text-title);
    &:hover {
      background-color: var(--color-warning-bg);
    }
    .icon-gift {
      color: var(--color-warning);
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
      color: var(--color-success);
      margin: 0 auto;
      display: inline-block;
      white-space: nowrap;
      font-weight: 600;
      &:hover {
        background-color: var(--color-success-bg);
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
        color: var(--color-primary);
      }
      span {
        color: var(--color-text-secondary);
        font-size: 14px;
        margin: 0 12px 0 10px;
      }
      .balance {
        color: var(--color-text-title);
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
      color: var(--color-white);
      border-radius: 3px;
      background: linear-gradient(281deg, var(--color-warning) 0%, #ffad12 100%);
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
      background: var(--color-warning);
      color: var(--color-white);
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
        color: var(--color-primary);
        margin: 0 4px;
      }
    }
    .expireDate {
      margin: 0 5px;
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .upgrade {
      color: var(--color-primary);
      margin-left: 6px;
    }
    .delayTrial {
      color: var(--color-text-secondary);
      margin-left: 6px;
      cursor: pointer;
      i {
        color: var(--color-warning);
      }
      span {
        margin-left: 4px;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .licenseType {
      font-weight: 600;
    }
  }
  .nextLicenseInfo {
    .licenseFlag {
      background-color: var(--color-text-disabled);
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
        background-color: var(--color-background-hover);
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
      background-color: var(--color-background-primary);
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
          border: 1px solid var(--color-background-disabled);
          border-radius: 4px;
          padding: 24px 16px;
          height: 100%;
          box-sizing: border-box;
          &:hover {
            background-color: var(--color-background-hover);
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
            color: var(--color-white);
            font-size: 18px;
          }
          .explain {
            margin-top: 8px;
            color: var(--color-text-disabled);
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
      color: var(--color-primary);
      font-size: 24px;
      margin: 0 6px;
    }
  }
  .expire {
    color: var(--color-text-secondary);
    margin: 12px 0;
  }
  .remainTime {
    color: var(--color-primary);
    margin-left: 6px;
  }
  .inviteRules {
    display: flex;
    align-items: center;
    margin: 36px 0;
    li {
      min-width: 80px;
      .achieveDays {
        color: var(--color-primary);
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
      background: var(--color-primary) !important;
      .iconWrap {
        background: var(--color-primary) !important;
      }
    }
    .symbolWrap {
      position: relative;
      background-color: var(--color-background-secondary);
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
        background: var(--color-border-secondary);
        text-align: center;
        line-height: 36px;
        color: var(--color-white);
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
  color: var(--color-text-primary);
  .titleBtn {
    padding: 0 16px;
    height: 32px;
    background: var(--color-background-primary);
    font-weight: bold;
    font-size: 14px;
    line-height: 32px;
    border-radius: 3px;
    cursor: pointer;
    border: 1px solid var(--color-border-primary);
    &:hover {
      color: var(--color-link-hover);
      border: 1px solid var(--color-link-hover);
      cursor: pointer;
    }
  }
`;
