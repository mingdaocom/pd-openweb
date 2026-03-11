import styled from 'styled-components';
import { Switch } from 'ming-ui';

export const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: normal;
  margin-left: -3px;
  &:hover {
    box-shadow: inset 0 0 20px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding-right: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
  background-color: var(--color-background-primary);
  z-index: 1;
  .textDisabled {
    &:hover {
      color: var(--color-text-tertiary) !important;
    }
  }
  .valignWrapper {
    &.isAbsolute {
      position: absolute;
      right: 24px;
    }
  }
`;

export const WrapTabCon = styled.div`
  flex: 1;
  display: block;
  text-align: center;
  & > span {
    padding: 0 12px;
    margin: 0 10px;
    line-height: 48px;
    display: inline-block;
    box-sizing: border-box;
    line-height: 44px;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    &.current {
      position: relative;
      color: var(--color-primary);
      border-bottom: 3px solid var(--color-primary);
    }
  }
`;
export const WrapOpenPortalBtn = styled.div`
  padding: 0 14px 0 8px;
  line-height: 34px;
  height: 34px;
  background: var(--color-primary-transparent);
  border-radius: 18px;
  color: var(--color-primary);
  font-weight: 500;
  &:hover {
    background: var(--color-primary-transparent);
  }
  .set {
    margin-top: -4px;
    display: inline-block;
    vertical-align: middle;
  }
`;
export const WrapPop = styled.div`
  width: 640px;
  background: var(--color-background-primary);
  box-shadow: 0px 5px 24px rgba(0, 0, 0, 0.24);
  border-radius: 5px;
  overflow: hidden;
  img {
    width: 100%;
  }
  .con {
    padding: 24px;
    line-height: 26px;
    h6 {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-title);
    }
    li {
      color: var(--color-text-secondary);
      line-height: 24px;
      font-weight: 400;
      &::before {
        content: ' ';
        width: 5px;
        height: 5px;
        display: inline-block;
        background: var(--color-text-secondary);
        border-radius: 50%;
        line-height: 32px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }
    .btn {
      margin-top: 16px;
      line-height: 36px;
      background: var(--color-primary);
      border-radius: 3px;
      padding: 0 24px;
      color: var(--color-white);
      font-weight: 600;
      &:hover {
        background: var(--color-primary);
      }
    }
    .helpPortal {
      line-height: 36px;
      float: right;
      margin-top: 16px;
      font-weight: 500;
    }
  }
`;

export const RoleDebugSwitch = styled(Switch)`
  width: 23px !important;
  height: 14px !important;
  border-radius: 7px !important;
  &.ming.Switch.small .dot {
    width: 10px;
    height: 10px;
  }
  &.ming.Switch--off .dot {
    left: 2px;
  }
  &.ming.Switch--on.small .dot {
    left: 11px;
  }
`;

export const DividerVertical = styled.div`
  width: 1px;
  height: 25px;
  opacity: 1;
  border: none;
  background: var(--color-border-secondary);
`;
