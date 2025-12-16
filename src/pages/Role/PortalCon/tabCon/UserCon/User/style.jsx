import styled from 'styled-components';

export const Wrap = styled.div(
  ({ len }) => `
  .toRole {
    color: #5a5a5a;
    &:hover {
      color: #1677ff;
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
    color: #9e9e9e;
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
        background: #ffffff;
        border: 1px solid #e0e0e0;
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
      border: 1px solid #dddddd;
      line-height: 32px;
      display: inline-block;
      &:hover {
        border: 1px solid #1677ff;
        color: #1677ff;
      }
    }
    .addUser {
      height: 32px;
      overflow: hidden;
      vertical-align: top;
      line-height: 32px;
      border-radius: 3px;
      color: #fff;
      background: #1677ff;
      i::before {
        line-height: 32px;
        color: #fff;
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
        background: #1677ff;
        &:hover {
          background: #1e88e5;
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
      background: #f3faff;
      color: #1677ff;
      &:hover {
        background: #ebf6fe;
      }
    }
    .del {
      background: rgba(244, 67, 54, 0.1);
      color: rgba(244, 67, 54, 1);
      &:hover {
        background: #fee6e5;
      }
    }
  }
  .isCurmemberType {
    color: #1677ff;
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
    background: #ffffff;
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
      color: #9e9e9e;
    }
    span {
      line-height: 36px;
      display: inline-block;
      vertical-align: top;
    }
  }
`;
