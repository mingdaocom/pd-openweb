import styled from 'styled-components';

export const ConnetWrap = styled.div`
  .maxWidth100 {
    max-width: 100px;
  }
  .scrollDiv {
    height: 0px;
  }
  p {
    margin: 0;
  }
  .chooseTypeContent {
    gap: 10px;
  }
  .chooseTypeCon {
    .Radio-text {
      font-weight: 600;
    }
  }
  height: 100%;
  position: relative;
  .head {
    transition: height 0.2s;
    &.isFix {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      padding-top: 10px;
      z-index: 10;
      .leftCon {
        position: absolute;
        z-index: 0;
        max-width: calc(50% - 230px);
        .des {
          display: none;
        }
        .logo {
          width: 32px;
          height: 32px;
          i {
            display: inline;
          }
        }
      }
      .tabCon {
        z-index: 1;
        li {
          padding-top: 10px;
        }
      }
      .node {
        position: fixed;
        right: 24px;
        height: 35px;
      }
    }
    .node {
    }
    padding: 20px 20px 0 37px;
    border-bottom: 1px solid rgb(235, 235, 235);
    background: #ffffff;
    .logo {
      width: 64px;
      height: 64px;
      background: #ffffff;
      border: 1px solid #efefef;
      border-radius: 32px;
    }
  }
  .connectTop {
    .icon {
      opacity: 0;
    }
    .docUrl {
      opacity: 1;
    }
    &:hover {
      .icon {
        opacity: 1;
        &:hover {
          color: #1677ff !important;
        }
      }
    }
  }
  .tabCon {
    text-align: center;
    li {
      font-size: 15px;
      font-weight: 600;
      color: #151515;
      display: inline-block;
      margin: 0 18px;
      padding: 24px 8px 10px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      &.disble {
        color: #757575;
      }
      &.isCur {
        color: #1677ff;
        border-bottom: 3px solid #1677ff;
      }
    }
  }
  .listCon {
    .chooseAuthType {
      width: 880px;
      padding: 24px;
      margin: 22px auto 0;
      background: #ffffff;
      border: 1px solid #dddddd;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.16);
      border-radius: 10px;
      text-align: center;
      .title {
        height: 24px;
        font-size: 17px;
        font-weight: 600;
        line-height: 22px;
        color: #151515;
      }
      .btn {
        margin: 40px auto 0;
        padding: 11px 50px;
        background: #1677ff;
        color: #fff;
        line-height: 1em;
        border-radius: 30px;

        &.disabled {
          opacity: 0.5;
        }
        &:hover {
          background: #1764c0;
        }
      }
    }
  }
  .infoDes {
    height: 34px;
  }
`;

export const UpgradeContentWrap = styled.div`
  display: flex;
  height: 100%;
  bottom: 0;
  position: absolute;
  left: 0;
  right: 0;
  z-index: -1;
  .unusualSkeletonWrap {
    width: 240px;
    height: 100%;
    background-color: #fff;
  }
  .unusualContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
    .imgWrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 110px;
      height: 110px;
      line-height: 110px;
      border-radius: 50%;
      text-align: center;
      background-color: #f5f5f5;
    }
  }
`;
