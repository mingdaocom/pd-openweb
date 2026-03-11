import styled from 'styled-components';

export const Wrap = styled.div(
  ({ len }) => `
  .toRole {
    color: var(--color-text-title);
    &:hover {
      color: var(--color-primary);
    }
  }
  padding: 16px 10px 0 10px;
  .wrapTr .Dropdown--input {
    padding: 0 !important;
  }
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(100% - 70px - 38px) / ${len - 1});
  }
  .wrapTr.nameWrapTr {
    width: calc(calc(100% - 70px - 38px) / ${len - 1}); !important;
    overflow: hidden;
  }
  .moreop {
    color: var(--color-text-tertiary);
  }
  .topAct {
    padding-right: 22px;
    min-height: 54px;
    padding-bottom: 16px;
    display: flex;
    justify-content: right;
    .act {
      .topActDrop {
        width: 180px;
        height: 36px;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-secondary);
        border-radius: 3px;
        .Dropdown--input {
          display: flex;
          line-height: 36px;
          padding: 0 10px !important;
          .value {
            flex: 1;
          }
          i {
            &::before {
              line-height: 36px;
            }
          }
        }
      }
    }
    .toRole {
      border-radius: 3px 3px 3px 3px;
      padding: 0 12px;
      border: 1px solid var(--color-border-primary);
      line-height: 32px;
      display: inline-block;
      &:hover {
        border: 1px solid var(--color-primary);
        color: var(--color-primary);
      }
    }
    .addUser {
      height: 32px;
      overflow: hidden;
      vertical-align: top;
      line-height: 32px;
      border-radius: 3px;
      color: var(--color-white);
      background: var(--color-primary);
      i::before {
        line-height: 32px;
        color: var(--color-white);
      }
      .lAdd {
        padding-left: 12px;
        padding-right: 10px;
        border-radius: 3px 0 0 3px;
      }
      .rAdd {
        border-radius: 0 3px 3px 0;
        padding-right: 6px;
      }
      .rAdd,
      .lAdd {
        cursor: pointer;
        height: 32px;
        display: inline-block;
        background: var(--color-primary);
        &:hover {
          background: var(--color-primary);
        }
      }
    }
    .changeRole,
    .del,
    .download {
      padding: 0 16px;
      height: 32px;
      border-radius: 3px;
      line-height: 32px;
      text-align: center;
      background: var(--color-primary-transparent);
      color: var(--color-primary);
      &:hover {
        background: var(--color-primary-transparent);
      }
    }
    .del {
      background: rgba(244, 67, 54, 0.1);
      color: rgba(244, 67, 54, 1);
      &:hover {
        background: var(--color-error-bg);
      }
    }
  }
  .isCurmemberType {
    color: var(--color-primary);
  }
  .topActDrop .Dropdown--input {
    display: flex;
    align-items: center;
    & > span.value {
      display: inline-block;
      flex: 1;
    }
    .icon {
      display: block;
    }
  }
`,
);
export const WrapPop = styled.div`
  &.uploadUser {
    padding: 6px 0;
    background: var(--color-background-primary);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.13),
      0 2px 6px rgba(0, 0, 0, 0.1);
    opacity: 1;
    border-radius: 3px;
    .Item {
      .Item-content {
        padding-left: 32px;
      }
    }

    .icon {
      color: var(--color-text-tertiary);
    }
    span {
      line-height: 36px;
      display: inline-block;
      vertical-align: top;
    }
  }
`;
