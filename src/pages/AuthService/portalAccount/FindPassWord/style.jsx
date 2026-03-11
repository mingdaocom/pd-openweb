import styled from 'styled-components';

export const Wrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
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
  .btnUseOldAccount {
    font-size: 14px;
    color: var(--color-primary);
    display: block;
    margin: 20px auto 0;
    text-align: center;

    &:hover {
      color: var(--color-link-hover);
    }
  }
`;
export const WrapCon = styled.div`
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
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
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
    margin-bottom: 32px;
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
    &.sending {
      background: var(--color-background-secondary);
    }
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
`;
