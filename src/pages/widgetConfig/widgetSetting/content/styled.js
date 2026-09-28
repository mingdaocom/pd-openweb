import React from 'react';
import styled from 'styled-components';
import { Collapse, Drawer } from 'ming-ui/antd-components';

export const SettingCollapseWrap = styled(Collapse)`
  &.hap-collapse {
    font-size: unset;
    background-color: ${props => props.$contentBg || 'var(--color-background-primary)'} !important;
    .hap-collapse-item {
      border-bottom: 1px solid var(--color-border-primary) !important;
      &:last-child {
        border-bottom: none !important;
      }
      .hap-collapse-content {
        color: var(--color-text-primary) !important;
      }
    }
    .hap-collapse-item > .hap-collapse-header {
      padding: ${props => `${props.$headerPadding || 20}px 0 !important`};
      font-size: 15px !important;
      color: var(--color-text-primary) !important;
      font-weight: bold;
      .anticon {
        color: var(--color-text-secondary) !important;
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
    .hap-collapse-body {
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

export const DrawerWrap = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  position: absolute !important;
  padding-top: 50px !important;
  .hap-drawer-header {
    display: none;
  }
  .hap-drawer-body {
    padding: 0 !important;
    font-size: unset !important;
  }
`;
