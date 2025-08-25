import styled from 'styled-components';

export const Wrap = styled.div`
  background-color: #f2f5f7;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100%;
  background-position: center;
  height: auto;
  .contentWrap {
    background: #f2f5f7;
    height: 100vh;
    .contentBox {
      width: 80%;
      max-width: 1000px;
      height: 396px;
      border-radius: 3px;
      margin: 0 auto;
      background: #fff;
      &.mobileContainerWidth {
        width: 95%;
      }
      &.privacyHieght {
        height: calc(~'100% - 50px');
        padding-bottom: 24px;
      }
    }
    .title {
      margin-bottom: 64px;
    }
    .protocol {
      .Checkbox {
        .Checkbox-box {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }
      }
    }
    .password {
      width: 300px;
      margin-bottom: 80px;
    }
    .disabled {
      background-color: #9e9e9e;
      cursor: not-allowed;
    }
  }
  .w300 {
    width: 300px;
  }
  .pLeft26 {
    padding-left: 26px;
  }

  .privacyContent {
    height: 1000px;
    margin: 0 80px;
    overflow: auto;
    .termsCon {
      background: #fff;
      max-width: 900px;
      padding: 50px;
      border-radius: 4px;
      border: #dce2e4 1px solid;
      box-sizing: border-box;
    }
    .titleMain {
      text-align: center;
      font-size: 28px;
      margin: 0px 0 10px;
    }
    .desMain {
      text-align: center;
      font-size: 12px;
      margin-bottom: 50px;
    }
    .sytkConTitle {
      margin-top: 40px;
      font-size: 18px;
      line-height: 34px;
    }
    .sytkcon p {
      font-size: 14px;
      line-height: 24px;
      margin: 0;
    }
    #ckepop {
      height: 30px;
      padding: 60px 0 60px 10px;
    }
    .bold {
      font-weight: bold;
    }
  }
`;
