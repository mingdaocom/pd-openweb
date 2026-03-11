import styled from 'styled-components';

export const Con = styled.div`
  p {
    margin: 0;
  }
  max-width: 1000px;
  margin: 0 40px;
  padding-bottom: 100px;
  h5,
  h6 {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-title);
    margin-top: 38px;
  }
  .title {
    width: 100%;
    padding: 0px 9px;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid var(--color-border-primary);
    box-sizing: border-box;
    &:-ms-input-placeholder {
      color: var(--color-text-tertiary) !important;
    }
    &::-ms-input-placeholder {
      color: var(--color-text-tertiary);
    }
    &::placeholder {
      color: var(--color-text-tertiary);
    }
    &:focus {
      border: 1px solid var(--color-primary);
    }
  }
  .con {
    width: 100%;
    padding: 24px 16px;
    background: var(--color-background-primary);
    border-radius: 8px;
    border: 1px solid var(--color-border-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    .ming.Dropdown {
      .Dropdown--input {
        padding-left: 0px;
      }
      .currentMenu {
        color: var(--color-primary);
      }
    }
    .ming.MenuItem .Item-content:not(.disabled):hover {
      background-color: var(--color-background-secondary) !important;
      color: var(--color-text-title) !important;
    }

    .btnCon {
      width: 180px;
      margin-right: 34px;
      & > div {
        height: 32px;
      }
      .btnStr {
        color: var(--color-white);
        line-height: 32px;
        min-height: 32px;
        padding: 0 20px;
        background: var(--color-primary);
        border-radius: 4px;
        max-width: 155px;
        box-sizing: border-box;
      }
      i {
        color: var(--color-text-disabled);
        opacity: 0;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
    &:hover {
      border: 1px solid var(--color-border-tertiary);
      i {
        opacity: 1;
      }
    }
    &.nextBtn {
      .btnCon {
        .btnStr {
          background: var(--color-background-primary);
          border: 1px solid var(--color-border-secondary);
          color: var(--color-text-title);
        }
      }
      &.noAction {
        opacity: 0.5;
        position: relative;
      }
    }
    .cover {
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }
    .switchBtn {
      z-index: 2;
    }
  }
  .moreActionCon {
    border-top: 1px solid var(--color-border-secondary);
    padding-bottom: 20px;
    align-items: center;
    justify-content: center;
    .SwitchDisable {
      position: absolute;
      right: 0;
      width: 48px;
      height: 24px;
      cursor: not-allowed;
    }
    &.borderB {
      border-bottom: 1px solid var(--color-border-secondary);
    }
  }
  .autoreserveCon {
    .Radio {
      margin-top: 12px;
    }
  }
  .w200 {
    width: 200px;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
  }
  .act {
    flex-shrink: 0;
    min-width: 0;
  }
  .controlsDropdown {
    flex-shrink: 0;
    min-width: 0;
    height: auto;
    min-height: 36px;
    .itemT {
      background: var(--color-background-secondary);
      border-radius: 4px 4px 4px 4px;
      padding: 2px 8px 2px 10px;
      line-height: 18px;
      border: 1px solid var(--color-border-secondary);
      overflow: hidden;
      span {
        max-width: 200px;
        overflow: hidden;
      }
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-text-secondary);
        }
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      min-height: 36px !important;
      height: auto !important;
    }
    .Dropdown--input .value {
      display: flex !important;
      & > div {
        flex: 1 !important;
        display: flex !important;
        flex-flow: row wrap !important;
        gap: 5px;
      }
    }
  }
`;
export const Wrap = styled.div`
  width: 340px;
  background: var(--color-background-primary);
  box-shadow: 0px 3px 12px 1px rgba(0, 0, 0, 0.1607843137254902);
  border-radius: 3px;
  padding: 16px;
  p {
    margin: 0;
  }
  .btnName {
    width: 100%;
    line-height: 36px;
    border-radius: 3px;
    border: 1px solid var(--color-border-primary);
    padding: 0 12px;
    &:focus {
      border: 1px solid var(--color-primary);
    }
  }
`;
export const WrapTxt = styled.div`
   {
    width: 100%;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    padding: 16px;
    box-sizing: border-box;
    color: var(--color-text-title);
    margin-top: 12px;
    display: flex;
    &.createCon {
      background: var(--color-background-primary);
      display: block;
    }

    .txtFilter {
      flex-shrink: 0;
      min-width: 0;
      flex: 1;
      font-size: 13px;
      color: var(--color-text-title);
      line-height: 24px;

      p {
        line-height: 22px;
        padding: 0;
        margin: 0;
        display: flex;

        .titleTxt {
          width: 100px;
          font-size: 13px;
          line-height: 22px;
          display: inline-block;
          min-width: 0;
          flex-shrink: 0;
        }

        .txt {
          flex: 1;
          font-weight: 500;
          font-size: 13px;
          min-width: 0;
          flex-shrink: 0;
        }
      }
    }

    .editFilter {
      width: 20px;

      &:hover {
        color: var(--color-primary) !important;
      }
    }

    .editWorkflow {
      width: auto;
      color: var(--color-primary);
    }
  }
`;
