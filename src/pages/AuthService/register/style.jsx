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
    font-weight: 600;
    width: 100%;
    height: 48px;
    line-height: 48px;
    display: block;
    background: var(--color-primary);
    border-radius: 6px;
    font-size: 16px;
    color: var(--color-text-inverse);
    margin-top: 32px;
    text-align: center;
  }

  .createOrgBtn {
    margin-top: 36px;
  }

  .btnSendVerifyCode {
    background: var(--color-primary);
  }

  .btnForRegister:hover,
  .btnSendVerifyCode:hover {
    background: var(--color-primary-dark);
  }

  .btnForRegister:active,
  .btnSendVerifyCode:active {
    background: var(--color-primary-dark);
  }

  .createOrgBtn.disabled,
  .createOrgBtn.disabled:hover,
  .createOrgBtn.disabled:active {
    color: var(--color-text-disabled);
    background: var(--color-background-disabled);
    cursor: not-allowed;
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

  .authSwitchEntry {
    margin-top: 8px;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-text-secondary);
    .authSwitchLink {
      color: var(--color-primary);
      font-size: 15px;
      font-weight: 400;
      &:hover {
        color: var(--color-primary-light);
      }
    }
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
      color: var(--color-primary-light);
    }
  }

  .termsText .terms:hover {
    color: var(--color-primary-light);
  }

  .passThis {
    display: inline-block;
    margin: 32px auto;
  }
`;
