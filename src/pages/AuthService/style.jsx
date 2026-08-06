import styled from 'styled-components';
import { browserIsMobile } from 'src/utils/common';

export const WrapCom = styled.div`
  .mHeight100 {
    min-height: 100%;
  }
  flex-direction: column;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: auto;
  background-color: ${browserIsMobile() ? 'var(--color-background-primary)' : 'var(--color-background-tertiary)'};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  .loginBox {
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: auto;
    box-sizing: border-box;
    padding: 24px 0;
    .loginContainer {
      width: 100%;
      min-width: 400px;
      max-width: 480px;
      min-height: 540px;
      padding: 32px 40px 40px;
      box-sizing: border-box;
      margin: 0 auto;
      background: var(--color-background-primary);
      border-radius: 12px;
      margin-bottom: 15px;
      position: relative;
      box-shadow: var(--shadow-sm);
      transition:
        min-width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
        max-width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
        padding 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
      .authServiceLang {
        position: absolute;
        top: 36px;
        right: 40px;
        z-index: 2;
        gap: 4px;
        .iconCon {
          font-size: 16px;
        }
        .txt,
        .iconCon,
        .icon-arrow-down-border {
          color: var(--color-text-secondary);
        }
        .ming.Dropdown {
          line-height: 20px;
          .Dropdown--input {
            min-height: 20px;
            padding: 0;
            background: transparent;
          }
          .value {
            max-width: none;
          }
        }
      }
      .loadingLine {
        height: 3px;
        width: 10px;
        position: absolute;
        left: 0;
        top: 0;
        background: var(--color-primary);
        animation-name: fadeMove;
        animation-duration: 1s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: normal;
        animation-fill-mode: forwards;
      }
      @keyframes fadeMove {
        from {
          width: 10px;
          left: 0;
        }
        50% {
          width: 100px;
          left: 40%;
        }
        to {
          width: 10px;
          left: calc(100% - 10px);
        }
      }
      .titleHeader {
        line-height: 1;
        .title {
          text-align: left;
          font-size: 28px;
          font-weight: bold;
          color: var(--color-text-primary);
          line-height: 1.35;

          span {
            display: block;
            width: 8px;
            height: 3px;
            background: var(--color-primary);
            margin-top: 12px;
          }
        }
      }
      &.createOrgContainer {
        flex: 0 0 auto;
        min-height: auto;
        margin-bottom: 0;
        padding-bottom: 64px;

        .titleHeader {
          p {
            line-height: 22px;
          }
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    .loginBox {
      flex: 1 0 auto;
      padding: 46px 0;
      align-items: flex-start;
      min-height: auto;
      .loginContainer {
        margin: 0;
        min-width: 0;
        min-height: 0;
        width: 100%;
        max-width: 100%;
        padding: 32px 24px 23px;
        border-radius: 0;
        box-shadow: none;
        &.createOrgContainer {
          padding-bottom: 40px;
        }
        .authServiceLang {
          top: 32px;
          right: 24px;
        }
      }
    }
  }
`;
