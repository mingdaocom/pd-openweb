import styled from 'styled-components';

export const ReferenceWrap = styled.div`
  min-height: 500px;
  height: ${props => `${props.height}px`};
  display: flex;
  border-top: 1px solid #dddddd;

  .infoContent {
    background: #fff6d6;
    padding: 16px 20px;
    span {
      word-break: keep-all;
    }
  }

  .sidebarContainer {
    width: 216px;
    border-right: 1px solid #dddddd;
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
        color: #b2b2b2;
      }
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      &.active {
        background: #e3f3ff;
      }
    }
  }
  .referenceContainer {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: #fafafa;
    .navDesc {
      padding: 12px 0;
    }
    .subnavContainer {
      height: 43px;
      border-bottom: 1px solid #eaeaea;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 0 20px;
      .subnavItem {
        padding: 0 12px;
        color: #757575;
        line-height: 42px;
        cursor: pointer;
        border-bottom: 3px solid transparent;
        &:hover {
          color: #1677ff;
        }
        &.active {
          color: #1677ff;
          border-bottom-color: #1677ff;
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
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.08);

        .controlName {
          cursor: pointer;
          i {
            color: #757575;
          }
          &:not(.isPassive):hover {
            color: #1677ff !important;
            i {
              color: #1677ff !important;
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
  color: #9e9e9e;
  .getBtn {
    ${props =>
      props.isLoading ? 'display:inline-block;animation: rotate 2s linear infinite;color: #1677ff;' : 'display:none;'}
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
