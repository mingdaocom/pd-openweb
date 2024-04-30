import styled from 'styled-components';
import unCheckedIcon from './img/unCheckedIcon.png';
import checkedIcon from './img/checkedIcon.png';
import weixinIcon from './img/weixinIcon.png';
import personalQQIcon from './img/personalQQIcon.png';
import workWeixinIcon from './img/workWeixinIcon.png';
import ssoIcon from './img/ssoIcon.png';
export const Wrap = styled.div`
  min-height: 400px;
  .hTitle {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow: hidden;
  }
  .footerCon {
    margin-top: 32px;
    width: 100%;
    text-align: center;
    .changeBtn {
      font-size: 14px;
      color: #2196f3;
      &:hover {
        color: #1182dd;
      }
    }
    .lineCenter {
      width: 1px;
      height: 11px;
      border: 1px solid #e6e6e6;
    }
  }
  .btnForLogin {
    font-weight: 600;
    width: 100%;
    height: 40px;
    line-height: 40px;
    display: block;
    background: #2296f3;
    border-radius: 4px;
    font-size: 14px;
    color: #fff;
    margin-top: 32px;
    text-align: center;

    &:hover {
      background: #1182dd;
    }
    &:active {
      background: #1585dd;
    }
  }

  p {
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }
  .findPassword {
    color: #757575 !important;
    &:hover {
      color: #1182dd !important;
    }
  }
  .cbRememberPasswordDiv {
    color: #757575;
    line-height: 18px;
    cursor: pointer;
  }
  .cbRememberPasswordDiv .cb {
    margin-right: 5px;
    margin-top: 1px;
    float: left;
    display: inline-block;
    width: 16px;
    height: 16px;
    cursor: pointer;
    &.unCheckedIcon {
      background: url(${unCheckedIcon}) no-repeat;
    }
    &.checkedIcon {
      background: url(${checkedIcon}) no-repeat;
    }
  }
  .tpLogin {
    .title {
      font-weight: 400;
      font-size: 13px;
      color: #757575;
      margin: 32px auto 0;
      padding-bottom: 6px;
    }

    a {
      width: 100%;
      line-height: 40px;
      height: 40px;
      background: #ffffff;
      border-radius: 3px;
      border: 1px solid #e6e6e6;
      display: block;
      text-decoration: none;
      text-align: center;
      display: flex;
      min-width: 0;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
      margin-top: 10px;
      // font-weight: 600;
      font-size: 13px;
      color: #333333;

      i {
        display: inline-block;
        width: 20px;
        height: 20px;
        background-size: cover;
        background-repeat: no-repeat;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -moz-osx-font-smoothing: grayscale;
      }
      &:hover {
        box-shadow: 0px 1px 2px #00000014;
        background-color: #fafafa;
      }
    }
  }
  .tpLogin .weixinIcon {
    background-image: url(${weixinIcon});
  }
  .tpLogin .personalQQIcon {
    background-image: url(${personalQQIcon});
  }
  .tpLogin .workWeixinIcon {
    background-image: url(${workWeixinIcon});
  }
  .tpLogin .ssoIcon {
    background-image: url(${ssoIcon});
  }
`;
