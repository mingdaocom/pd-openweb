import styled from 'styled-components';
import { browserIsMobile } from 'src/util';

export const Wrap = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: ${browserIsMobile() ? '#fff' : '#f2f5f7'};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  /* 隐藏Chrome、Safari和Opera的滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
  /* 隐藏Internet Explorer和Edge的滚动条 */
  -ms-overflow-style: none; /* Internet Explorer和Edge */
  scrollbar-width: none; /* Firefox */
  .loginBox {
    padding-top: 80px;
    z-index: 1;
    .loginContainer {
      max-width: 480px;
      padding: 48px;
      box-sizing: border-box;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      margin-bottom: 15px;
      position: relative;
      .loadingLine {
        height: 3px;
        width: 10px;
        position: absolute;
        left: 0;
        top: 0;
        background: #2196f3;
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
          left: 386px;
        }
      }
      .titleHeader {
        line-height: 1;
        .title {
          text-align: left;
          font-size: 26px;
          color: #333333;
          line-height: 1.75;

          span {
            display: block;
            width: 8px;
            height: 3px;
            background: #2196f3;
            margin-top: 12px;
          }
        }
      }
    }
  }

  @media screen and (max-width: 414px) {
    .loginBox {
      padding: 46px 0;
      .loginContainer {
        margin: 0;
        padding: 48px 24px 23px;
      }
    }
  }
`;
