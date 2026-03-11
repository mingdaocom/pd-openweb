import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';

export const TableWrap = styled.div`
  .ant-table-thead > tr > th {
    background: var(--color-background-primary) !important;
    color: var(--color-text-title);
    font-size: 13px;
    font-weight: normal;
    &:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
      display: none;
    }
  }
  .ant-switch-checked {
    background-color: rgba(40, 202, 131, 1);
  }
`;

export const LogoWrap = styled.div(
  ({ width }) => `
  text-align: center;
  position: relative;
  overflow: hidden;
  width: ${width || 48}px;
  height: ${width || 48}px;
  min-width: ${width || 48}px;
  background: var(--color-background-primary);
  opacity: 1;
  border-radius: 8px;
  color: var(--color-text-disabled);
  svg,
  .ming {
    display: inline-block;
  }
  .bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0.08;
    z-index: 0;
  }
`,
);
export const ActWrap = styled.div`
  cursor: pointer;
  display: inline-block;
  width: 34px;
  height: 34px;
  background: var(--color-background-primary);
  opacity: 1;
  border-radius: 17px;
  line-height: 34px;
  &:hover {
    background: var(--color-background-hover);
  }
  margin-left: 8px;
`;
export const BtnWrap = styled.div`
  background: var(--color-primary);
  &:hover {
    background: var(--color-link-hover);
  }
`;
export const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

export const RedMenuItemWrap = styled(MenuItemWrap)`
  .Item-content {
    color: var(--color-error) !important;
    .Icon {
      color: var(--color-error) !important;
    }
  }
`;
export const WrapFooter = styled.div`
  .btn {
    padding: 0 32px;
    background: var(--color-primary);
    color: var(--color-white);
    line-height: 36px;
    border-radius: 3px;
    &:hover {
      background: var(--color-link-hover);
    }
    &.disable {
      opacity: 0.5;
    }
  }
  .cancel {
    color: var(--color-text-secondary);
    margin-right: 52px;
    &:hover {
      color: var(--color-primary);
    }
    padding: 8px 32px;
  }
`;

export const CardTopWrap = styled.div`
   {
    padding: 24px;
    align-items: center;
    .iconCon {
      width: 44px;
      height: 44px;
      border: 1px solid var(--color-border-secondary);
      border-radius: 6px;
      position: relative;
      .iconParam {
        color: var(--color-text-secondary);
      }
      &.isEdit {
        .iconParam {
          color: var(--color-primary);
        }
        border: 1px solid var(--color-primary);
      }
      .tip {
        position: absolute;
        font-size: 20px;
        left: -10px;
        top: -10px;
      }
    }
    .btn {
      padding: 0 20px;
      margin-right: 12px;
      line-height: 26px;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: 26px;
      height: 28px;
      &:hover {
        color: rgba(23, 100, 192, 1);
        border: 1px solid rgba(23, 100, 192, 1);
      }
    }
  }
`;
export const WrapBtn = styled.div`
  background: var(--color-background-primary);
  border-radius: 18px;
  color: var(--color-text-disabled);
  padding: 8px 12px;
  margin: 0 auto;
  &:hover {
    color: var(--color-primary);
  }
  &.btnToAccount {
    background: var(--color-background-primary);
    border-radius: 4px 4px 4px 4px;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    &.disable {
      border: 1px solid var(--color-border-secondary);
      color: var(--color-text-title);
      background: var(--color-background-disabled);
    }
  }
`;

export const MoreOperate = styled.span`
  cursor: pointer;
  text-align: center;
  border-radius: 3px;
  line-height: 24px;
  display: inline-block;
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
  font-size: 18px;
  &:hover {
    color: var(--color-primary);
  }
`;

export const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
`;
