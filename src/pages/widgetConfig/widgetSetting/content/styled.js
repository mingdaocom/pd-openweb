import { Collapse, Drawer } from 'antd';
import styled from 'styled-components';

export const SettingCollapseWrap = styled(Collapse)`
  &.ant-collapse {
    font-size: unset;
    background-color: ${props => props.contentBg || ' #fff'} !important;
    .ant-collapse-item {
      border-bottom: 1px solid #eaeaea !important;
      &:last-child {
        border-bottom: none !important;
      }
    }
    .ant-collapse-item > .ant-collapse-header {
      padding: ${props => `${props.headerPadding || 20}px 0 !important`};
      font-size: 15px !important;
      color: #212121 !important;
      font-weight: bold;
      .anticon {
        color: #757575 !important;
        margin-right: 8px !important;
      }
      .itemAppIcon {
        width: 20px;
        height: 20px;
        margin-right: 6px;
        border-radius: 4px;
        padding: 3px;
      }
    }
    .ant-collapse-content-box {
      padding: 0 0 24px 0 !important;
      & > div:first-child {
        margin-top: 0 !important;
      }

      .labelBetween {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
`;

export const DrawerWrap = styled(Drawer)`
  position: absolute !important;
  padding-top: 50px !important;
  .ant-drawer-header {
    display: none;
  }
  .ant-drawer-body {
    padding: 0 !important;
    font-size: unset !important;
  }
`;
