import styled from 'styled-components';

export const Wrap = styled.div`
  .termsText {
    margin-top: 13px;
    font-size: 14px;
    .terms {
      color: var(--color-primary);
      text-decoration: none;
    }
  }

  .btnForRegister {
    font-weight: bold;
    width: 100%;
    height: 48px;
    line-height: 48px;
    display: block;
    background: #2296f3;
    border-radius: 4px;
    font-size: 16px;
    color: var(--color-white);
    margin-top: 32px;
    text-align: center;
  }

  .btnSendVerifyCode {
    background: #2296f3;
  }

  .btnForRegister:hover,
  .btnSendVerifyCode:hover {
    background: var(--color-link-hover);
  }

  .btnForRegister:active,
  .btnSendVerifyCode:active {
    background: var(--color-primary-focus);
  }

  .line {
    width: 100%;
    height: 0px;
    opacity: 1;
    display: block;
    margin-top: 40px;
  }

  .line.mTopH {
    margin-top: 130px;
  }

  .footerCon {
    margin: 20px auto 0;
    text-align: center;
    .changeBtn {
      font-size: 14px;
      font-weight: bold;
    }
    .lineCenter {
      width: 1px;
      height: 11px;
      border: 1px solid var(--color-border-secondary);
    }
    .textG,
    .textG:hover {
      color: var(--color-text-secondary);
    }
    .textB {
      color: var(--color-primary);
    }

    .textB:hover {
      color: var(--color-link-hover);
    }
  }

  .termsText .terms:hover {
    color: var(--color-link-hover);
  }

  .passThis {
    display: inline-block;
    margin: 32px auto;
  }
`;
