import styled from 'styled-components';
export const WrapHeader = styled.div`
  .cover {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 999;
  }
  .headerCenter {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .appNameHeaderBoxPortal {
    top: 0;
    width: 100%;
    z-index: 2;
    display: flex;
    position: relative;
    &.isMobile {
      height: 70px;
      background: #fff;
      .avatarM {
        line-height: 70px;
      }
    }
    .appName {
      height: 100%;
      width: 100%;
      max-width: 188px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.isFixed {
        width: auto;
      }
      &.appNameM {
        max-width: 280px;
        font-weight: bold;
        font-size: 24px !important;
        padding-left: 16px;
        line-height: 70px;
      }
    }
    .appItemsOuterWrap {
      &.Hidden {
        display: none;
      }
      display: flex;
      height: 100%;
      align-items: center;
      flex: 1 1 0%;
      position: relative;
      overflow: hidden;
      .appItemsInnerWrap {
        position: absolute;
        top: 0;
        left: 0;
        height: 70px;
        width: 100%;
        overflow-x: scroll;
        overflow-y: hidden;
        .appItemsWrap {
          display: flex;
          position: absolute;
          left: 0;
          width: 100%;
          height: 50px;
          li {
            display: flex;
            height: 100%;
            align-items: center;
            position: relative;
            box-sizing: border-box;
            white-space: nowrap;
            cursor: pointer;
            color: #fff;
            flex-shrink: 0;
            font-weight: bold;
            padding: 0 20px;
            &.active {
              background-color: rgba(0, 0, 0, 0.15);
            }
          }
        }
      }
    }
  }
  .appFixed {
    border-radius: 13px;
    color: #fff;
    height: 22px;
    line-height: 22px;
    box-sizing: border-box;
    white-space: nowrap;
    font-weight: bold;
    padding: 0 10px;
    font-size: 12px;
    margin-left: 5px;
    background: #fd7558;
  }
`;
export const Wrap = styled.div`
  position: absolute;
  right: 0;
  height: calc(100% - 50px);
  top: 51px;
  width: 480px;
  max-width: 80%;
  background: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 24%);
  z-index: 1000;
  &.leftNaviStyle {
    height: 100%;
    top: 0;
    position: fixed;
  }
  .infoConBox {
    height: calc(100% - 70px);
    overflow: auto;
    padding: 24px;
  }
  .infoBox {
    overflow: auto;
    .cellOptions {
      max-width: 100%;
      .cellOption {
        max-width: 100%;
      }
    }
  }
  &.isMobile {
    top: 0;
    height: 100%;
    min-width: 100% !important;
    .back {
      height: 70px;
      line-height: 70px;
    }
    .infoConBox {
      height: calc(100% - 140px);
      padding: 6px 24px 24px;
    }
  }
  .closeBtnN {
    position: absolute;
    right: 10px;
    top: 10px;
  }
  img.userAvatar {
  }
  .userName {
    line-height: 56px;
    word-wrap: break-word;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
  .title {
    width: 56px;
  }
  .rInfo {
    width: calc(100% - 56px);
    &.isOption {
      .editableCellCon {
        padding-left: 0px !important;
      }
    }
  }
  .logoutBox {
    display: flex;
  }
  .del {
    flex: 4;
    height: 36px;
    background: rgba(243, 33, 33, 0.1);
    color: #f44336;
    border-radius: 36px;
    line-height: 36px;
    text-align: center;
    margin: 16px 16px 16px 8px;
    .icon:before {
      vertical-align: middle;
    }
    &:hover {
      // background: #ebf6fe;
    }
  }
  .logout {
    flex: 6;
    height: 36px;
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    border-radius: 36px;
    line-height: 36px;
    text-align: center;
    margin: 16px 8px 16px 16px;
    .icon:before {
      vertical-align: middle;
    }
    &:hover {
      background: #ebf6fe;
    }
  }
  .userImage {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    .hoverAvatar {
      display: none;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      text-align: center;
      line-height: 60px;
      color: #ffffff;
      z-index: 2;
    }
    &:hover {
      .hoverAvatar {
        display: block;
      }
    }
  }
`;
