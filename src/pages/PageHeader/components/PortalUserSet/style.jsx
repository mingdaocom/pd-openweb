import { Popup } from 'antd-mobile';
import styled from 'styled-components';
import { MenuItem } from 'ming-ui';

export const WrapHeader = styled.div`
  .ant-drawer-mask {
    background: rgba(0, 0, 0, 0.1);
  }
  .ant-drawer-right .ant-drawer-content-wrapper {
    height: calc(100% - 50px);
    top: 51px;
    position: absolute;
    right: 0;
  }
  &.leftNaviStyle {
    .ant-drawer-right .ant-drawer-content-wrapper {
      height: 100%;
      top: 0;
    }
  }
  &.isMobile {
    .ant-drawer-right .ant-drawer-content-wrapper {
      height: 100%;
      top: 0;
      min-width: 100% !important;
    }
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
      background: var(--color-background-primary);
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
            color: var(--color-white);
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
    color: var(--color-white);
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
    width: 60px;
    padding-right: 5px;
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
  .opt {
    height: 36px;
    width: 36px;
    margin: 16px 16px 16px 10px;
    background: var(--color-background-secondary);
    border-radius: 3px;
    .icon {
      margin: 0 auto;
      color: var(--color-text-tertiary);
      line-height: 36px;
    }
    &:hover {
      .icon {
        color: var(--color-primary);
      }
    }
  }
  .logout {
    flex: 1;
    height: 36px;
    background: rgba(33, 150, 243, 0.1);
    color: var(--color-primary);
    border-radius: 3px;
    line-height: 36px;
    text-align: center;
    margin: 16px 0px 16px 16px;
    .icon:before {
      vertical-align: middle;
    }
    &:hover {
      background: var(--color-primary-transparent);
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
      color: var(--color-white);
      z-index: 2;
    }
    &:hover {
      .hoverAvatar {
        display: block;
      }
    }
  }
  .languagueSetting {
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    overflow: hidden;
    .languagueItem {
      height: 32px;
      line-height: 32px;
      text-align: center;
      border-right: 1px solid var(--color-border-secondary);
      background: var(--color-background-primary);
      color: var(--color-text-disabled);
      &:last-child {
        border-right: none;
      }
      &.active {
        background: var(--color-primary);
        color: var(--color-white);
      }
    }
  }
`;

export const ModalWrap = styled(Popup)`
  &.appMoreActionWrap {
    .header {
      line-height: 24px;
      margin-bottom: 20px;
      text-align: left;
      padding: 20px 15px 0;
      .closeIcon {
        width: 24px;
        height: 24px;
        text-align: center;
        border-radius: 50%;
        background-color: var(--color-border-secondary);
        .icon {
          line-height: 24px;
        }
      }
    }
    .actionContent {
      padding-left: 20px;
      color: var(--color-text-primary);
      line-height: 50px;
      text-align: left;
      font-weight: 600;
      padding-bottom: 15px;
    }
    .RedMenuItem {
      color: var(--color-error) !important;
    }
  }
`;
export const RedMenuItemWrap = styled(MenuItem)`
  &.RedMenuItem {
    .Item-content {
      color: var(--color-error) !important;
      .Icon {
        color: var(--color-error) !important;
      }
    }
  }
`;
