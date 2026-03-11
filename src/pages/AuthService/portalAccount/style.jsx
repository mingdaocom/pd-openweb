import styled from 'styled-components';

export const FixedContent = styled.div`
  width: 100%;
  box-sizing: border-box;
  height: calc(100% - 80px);
  overflow-y: auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 31px;
  .iconInfo {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    text-align: center;
    background-color: var(--color-background-secondary);
    .Font48 {
      font-size: 48px;
    }
    i {
      line-height: 110px;
    }
  }
  .fixeding {
    color: var(--color-text-title);
    font-size: 17px;
    font-weight: 600;
  }
  .fixedInfo {
    color: var(--color-text-tertiary);
    font-size: 14px;
  }
  .fixRemark {
    font-size: 13px;
    color: var(--color-text-title);
    font-weight: 600;
  }
`;

export const Wrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
  &.isCenter {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow-y: auto;
    background-position: center center;
    .con {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
  .backImageUrl {
    background-color: var(--color-border-secondary);
    background-position: center;
    flex: 1;
    background-repeat: no-repeat;
    background-size: cover;
    &.isM {
      position: fixed;
      width: 100%;
      min-height: 100%;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
`;
export const WrapWx = styled.div`
  padding: 0 32px;
  padding-top: 100px;
  text-align: center;
  img {
    max-width: 100%;
    object-fit: contain;
    margin: 0 auto;
    display: block;
  }
  border-radius: 4px;
  box-sizing: border-box;
  height: 100%;
  background: var(--color-background-primary);
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .pageTitle {
    margin-top: 40px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    width: 100%;
    text-align: center;
    overflow: hidden;
    line-height: 1.5;
  }
  .actCon {
    padding-bottom: 60px;
    & > div {
      text-align: center;
      height: 40px;
      width: 100%;
      border-radius: 4px;
      background: var(--color-background-secondary);
      color: var(--color-text-title);
      line-height: 40px;
      font-size: 14px;
      margin-top: 13px;
      .icon {
        margin-right: 13px;
        font-size: 20px;
        color: var(--color-text-tertiary);
      }
      &.wxLogin {
        background: var(--color-success);
        color: var(--color-white);
        .icon {
          color: var(--color-white);
        }
      }
    }
  }
`;
export const WrapContainer = styled.div`
  .Hide {
    display: none;
  }
  .back {
    &:hover {
      color: var(--color-primary) !important;
    }
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  border-radius: 4px;
  padding: 48px 48px 72px 48px;
  box-sizing: border-box;
  width: 50%;
  max-width: 840px;
  min-width: 360px;
  height: 100%;
  background: var(--color-background-primary);
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  p {
    margin: 0;
    padding: 0;
  }
  .messageConBox {
    max-width: 400px;
    margin: 100px auto;
  }
  .tipConBox {
    margin: 80px auto 0;
    font-weight: 600;
  }
  &.isCenterCon {
    border-radius: 4px;
    width: 480px;
    background: var(--color-background-primary);
    height: auto;
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
    position: relative;
    margin: 100px auto;
    .messageConBox {
      margin: 0 auto;
    }
    &.isTipCon {
      height: 500px;
    }
  }
  &.isM {
    width: 95%;
    min-width: 95%;
    height: auto;
    padding: 48px 24px;
    margin: 0 auto;
    .messageConBox {
      margin: 0 auto;
    }
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.isTipCon {
      height: 500px;
    }
  }
  .txtIcon {
    text-align: center;
    padding-bottom: 10px;
    .Icon {
      font-size: 74px;
    }
  }
  .txtConsole {
    font-size: 20px;
    font-weight: 500;
    text-align: center;
  }
  .pageTitle {
    margin-bottom: 24px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    width: 100%;
    overflow: hidden;
    line-height: 1.5;
  }
  .loginBtn {
    background: var(--color-primary);
    height: 48px;
    border-radius: 4px;
    line-height: 48px;
    color: var(--color-white);
    font-weight: bold;
    font-size: 16px;
    &:hover {
      background: var(--color-link-hover);
    }
    // &.sending {
    //   background: var(--color-background-secondary);
    // }
    &.disable {
      cursor: default;
      background: var(--color-text-disabled) !important;
    }
  }
  &.isR {
    margin: 0 0 0 auto;
    overflow: auto;
    .messageBox .mesDiv.errorDiv .warnTips {
      top: 100%;
      left: 0;
    }
  }
  .lang {
    position: absolute;
    right: 10px;
    top: 10px;
  }
`;
export const WrapUl = styled.div`
  ul.loginWays {
    & > li {
      padding-right: 30px;
      &:last-child {
        padding-right: 0;
      }
      span {
        color: var(--color-text-secondary);
        padding-bottom: 8px;
        border-bottom: 3px solid var(--color-white);
        word-break: break-all;
        &.isCur {
          color: var(--color-primary);
          border-bottom: 3px solid rgba(33, 150, 243);
        }
      }
    }
  }
  .footerTxt {
    margin-top: 40px;
    border-top: 1px solid var(--color-background-secondary);
    padding-top: 24px;
  }
`;

export const WrapWXCon = styled.div`
  .erweima {
    text-align: center;
    width: 100%;
    min-height: 312px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-background-disabled);
    border-radius: 8px;
    margin: 0 auto;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 8px;
    img {
      width: 100%;
      height: 100%;
    }
    .isOverTime {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background: rgba(250, 250, 250, 0.95);
      i {
        color: var(--color-primary);
        margin: 80px 0 0;
        display: inline-block;
      }
      p {
        margin: 24px auto;
      }
      .refresh {
        padding: 10px 24px;
        background: var(--color-primary);
        opacity: 1;
        border-radius: 18px;
        color: var(--color-white);
      }
    }
  }
`;
