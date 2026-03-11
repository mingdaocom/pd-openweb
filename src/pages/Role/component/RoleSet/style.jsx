import styled from 'styled-components';

export const Wrap = styled.div`
  .w35 {
    width: 35%;
  }
  .mLeft52 {
    margin-left: 52px;
  }
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  background: var(--color-background-primary);
  .header {
    padding: 14px 32px;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .footer {
    padding: 15px 48px 28px;
    background-color: var(--color-background-primary);
  }
  .setBody {
    flex: 1 1 0;
    .settingForm {
      padding: 25px 48px 30px;
      max-width: 1250px;
    }

    .nameInput {
      width: 400px;
    }

    .subCheckbox :global(.Checkbox-box) {
      margin-right: 10px !important;
    }

    .authTable {
      .tableHeader {
        background-color: var(--color-background-secondary);
        display: flex;
        flex-flow: row nowrap;
        height: 40px;
        line-height: 40px;
        position: sticky;
        top: 0;
        z-index: 1;
        .tableHeaderItemMax {
          text-align: center;
          font-weight: bold;
        }
        .tableHeaderOption {
          padding-left: 32px;
          width: 15%;
          max-width: 170px;
          min-width: 100px;
          justify-content: center !important;
        }
        .tableHeaderOther {
          width: 25%;
        }
        .tableHeaderItem {
          font-weight: bold;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: left;
        }
      }
      .emptyContent {
        border-bottom: 1px solid var(--color-border-secondary);
        color: var(--color-text-disabled);
        line-height: 45px;
        padding-left: 24px;
      }
      .tableRow {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        border-bottom: 1px solid var(--color-border-secondary);
        text-align: center;

        .viewsGroup {
          border-right: 1px solid var(--color-border-secondary);
        }

        .viewSetting {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          line-height: normal;
          line-height: 32px;
          svg {
            vertical-align: middle !important;
          }
          .arrowIconShow {
            border-radius: 50%;
            display: inline-block;
            margin-right: 20px;
            opacity: 0;
            transition: all 0.4s ease;
            width: 32px;
            text-align: center;
            i {
              color: var(--color-text-disabled);
              line-height: 1;
            }
            &.canShow:hover {
              background-color: var(--color-background-hover);
              opacity: 1;
              i {
                color: var(--color-primary);
              }
            }
            &.show {
              opacity: 1;
              i {
                color: var(--color-warning) !important;
              }
            }
          }
          &:hover {
            .arrowIconShow.canShow {
              opacity: 1;
            }
          }
          .viewSettingItem {
            flex: 13;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: left;
          }
        }

        .settingGroup {
          width: 15%;
          max-width: 170px;
          min-width: 100px;
          padding: 0 10px;
          &.showSet {
            span {
              padding: 5px 10px;
              &:hover {
                background-color: var(--color-background-hover);
                border-radius: 5px;
              }
            }
          }
        }

        .arrowIcon {
          width: 20px;
          line-height: 32px;
          transition: transform 0.2s ease;
          transform: rotate(0deg);
          transform-origin: 6px center;
          &.rotated {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
  .list {
    margin-top: 15px;
    li {
      width: 25%;
      float: left;
      margin-bottom: 15px;
      padding-right: 20px;
      box-sizing: border-box;
    }
  }
`;
