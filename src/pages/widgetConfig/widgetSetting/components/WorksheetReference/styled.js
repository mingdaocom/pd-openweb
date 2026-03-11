import styled from 'styled-components';

export const ReferenceWrap = styled.div`
  min-height: 500px;
  height: ${props => `${props.height}px`};
  display: flex;
  border-top: 1px solid var(--color-border-primary);

  .infoContent {
    background: var(--color-yellow-black);
    padding: 16px 20px;
    span {
      word-break: keep-all;
    }
  }

  .sidebarContainer {
    width: 216px;
    border-right: 1px solid var(--color-border-primary);
    box-sizing: border-box;
    padding: 12px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    .sidebarItem {
      width: 100%;
      line-height: 32px;
      border-radius: 4px;
      cursor: pointer;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .Num {
        color: var(--color-text-disabled);
      }
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      &.active {
        background: var(--color-primary-transparent);
      }
    }
  }
  .referenceContainer {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-background-secondary);
    .navDesc {
      padding: 12px 0;
    }
    .subnavContainer {
      height: 43px;
      border-bottom: 1px solid var(--color-border-primary);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 0 20px;
      .subnavItem {
        padding: 0 12px;
        color: var(--color-text-secondary);
        line-height: 42px;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        &:hover {
          color: var(--color-primary);
        }
        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }
      }
    }
    .referenceContent {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 0 20px;
      .emptyContent {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .referenceItem {
        width: 100%;
        height: auto;
        margin-bottom: 10px;
        padding: 12px 16px;
        box-sizing: border-box;
        background: var(--color-background-primary);
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.08);

        .controlName {
          cursor: pointer;
          i {
            color: var(--color-text-secondary);
          }
          &:not(.isPassive):hover {
            color: var(--color-primary) !important;
            i {
              color: var(--color-primary) !important;
            }
          }
        }
        .pLeft22 {
          padding-left: 22px;
        }
        .pLeft44 {
          padding-left: 44px;
        }

        .ruleContent {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .ruleStatus {
            width: 80px;
            text-align: right;
            .point {
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
          }
        }
      }
    }
  }
`;

export const ExtraTime = styled.span`
  display: inline-block;
  width: 125px;
  font-size: 13px;
  font-weight: normal;
  text-align: right;
  color: var(--color-text-tertiary);
  .getBtn {
    ${props =>
      props.isLoading
        ? 'display:inline-block;animation: rotate 2s linear infinite;color: var(--color-primary);'
        : 'display:none;'}
  }
  .time {
    ${props => (props.isLoading ? 'display: none;' : 'display: block;')}
  }
  &:hover {
    .time {
      display: none;
    }
    .getBtn {
      display: inline-block;
    }
  }
`;
