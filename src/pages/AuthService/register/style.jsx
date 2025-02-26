import styled from 'styled-components';

export const Wrap = styled.div`
  .termsText {
    margin-top: 13px;
    font-size: 14px;
    .terms {
      color: #2196f3;
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
    color: #fff;
    margin-top: 32px;
    text-align: center;
  }

  .btnSendVerifyCode {
    background: #2296f3;
  }

  .btnForRegister:hover,
  .btnSendVerifyCode:hover {
    background: #1182dd;
  }

  .btnForRegister:active,
  .btnSendVerifyCode:active {
    background: #1585dd;
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
      border: 1px solid #e6e6e6;
    }
    .textG,
    .textG:hover {
      color: #757575;
    }
    .textB {
      color: #2196f3;
    }

    .textB:hover {
      color: #1182dd;
    }
  }

  .termsText .terms:hover {
    color: #1182dd;
  }

  .passThis {
    display: inline-block;
    margin: 32px auto;
  }
`;
