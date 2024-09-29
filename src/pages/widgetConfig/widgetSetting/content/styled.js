import { Collapse } from 'antd';
import styled from 'styled-components';

export const SettingCollapseWrap = styled(Collapse)`
  &.ant-collapse {
    font-size: unset;
    background-color: #fff !important;
    .ant-collapse-item {
      border-bottom: 1px solid #eaeaea !important;
      &:last-child {
        border-bottom: none !important;
      }
    }
    .ant-collapse-item > .ant-collapse-header {
      padding: 20px 0 !important;
      font-size: 14px !important;
      color: #212121 !important;
      font-weight: bold;
      .anticon {
        color: #757575 !important;
        margin-right: 8px !important;
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
