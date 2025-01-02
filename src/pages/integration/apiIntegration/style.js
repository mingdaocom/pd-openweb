import styled from 'styled-components';
import { MenuItem, Menu } from 'ming-ui';

export const TableWrap = styled.div`
  .ant-table-thead > tr > th {
    background: #fff !important;
    color: #151515;
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
  background: #ffffff;
  opacity: 1;
  border-radius: 8px;
  color: #bdbdbd;
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
  background: #fff;
  opacity: 1;
  border-radius: 17px;
  line-height: 34px;
  &:hover {
    background: #f7f7f7;
  }
  margin-left: 8px;
`;
export const BtnWrap = styled.div`
  background: #2196f3;
  &:hover {
    background: #1764c0;
  }
`;
export const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

export const RedMenuItemWrap = styled(MenuItemWrap)`
  .Item-content {
    color: #f44336 !important;
    .Icon {
      color: #f44336 !important;
    }
  }
  &:not(.disabled):hover {
    .Icon {
      color: #fff !important;
    }
  }
`;
export const WrapFooter = styled.div`
  .btn {
    padding: 0 32px;
    background: #2196f3;
    color: #fff;
    line-height: 36px;
    border-radius: 3px;
    &:hover {
      background: #1764c0;
    }
    &.disable {
      opacity: 0.5;
    }
  }
  .cancel {
    color: #757575;
    margin-right: 52px;
    &:hover {
      color: #2196f3;
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
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      position: relative;
      .iconParam {
        color: #757575;
      }
      &.isEdit {
        .iconParam {
          color: #2196f3;
        }
        border: 1px solid #2196f3;
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
      color: #2196f3;
      border: 1px solid #2196f3;
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
  background: #ffffff;
  border-radius: 18px;
  color: #bdbdbd;
  padding: 8px 12px;
  margin: 0 auto;
  &:hover {
    color: #2196f3;
  }
  &.btnToAccount {
    background: #fff;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #2196f3;
    color: #2196f3;
    &.disable {
      border: 1px solid #e0e0e0;
      color: #151515;
      background: #f4f4f3;
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
  color: #9e9e9e;
  font-size: 18px;
  &:hover {
    color: #2196f3;
  }
`;

export const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
`;
