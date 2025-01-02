import styled from 'styled-components';

export const WrapCon = styled.div`
  background: #ffffff;
  flex: 1;
  .pLeft26 {
    padding-left: 26px;
  }
`;
export const WrapHeader = styled.div`
  border-bottom: 1px solid #dddddd;
  display: flex;
  .tabCon {
    flex: 1;
    .tab {
      color: #151515;
      display: inline-block;
      margin-right: 20px;
      padding: 0 12px;
      line-height: 42px;
      border-bottom: 3px solid transparent;
      border-top: 3px solid transparent;
      &.cur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .actCheckCon {
    & > span {
      height: 20px;
    }
  }
  .moreop {
    color: #bdbdbd;
    &:hover {
      color: #2196f3;
    }
  }
`;
export const WrapContext = styled.div`
  overflow: hidden !important;
  &.overflowAuto {
    overflow: auto !important;
  }
`;
export const WrapNav = styled.div`
  border-right: 1px solid #dddddd;
  min-width: 240px;
  max-width: 240px;
  min-height: 100%;
  overflow: auto;
  .addRole {
    margin: 4px 12px;
    padding: 8px;
    border-radius: 24px;
    border: 1px solid #dddddd;
    &:hover {
      color: #2196f3;
      border: 1px solid #2196f3;
    }
  }
  .search {
    padding: 0 15px 0 26px;
  }
  .navCon {
    padding: 10px 8px;
    &.roleSet {
      padding: 6px 8px 10px;
    }
    li {
      .moreop {
        color: #bdbdbd;
        &:hover {
          color: #2196f3;
        }
      }
      cursor: pointer;
      padding: 0 8px 0 18px;
      height: 36px;
      .Icon {
        color: #9e9e9e;
      }
      &.cur {
        color: #2196f3;
        background: #f3faff !important;
        border-radius: 3px 3px 3px 3px;
        font-weight: bold !important;
        position: relative;
        .Icon {
          color: #2196f3;
        }
        &::before {
          content: ' ';
          width: 3px;
          height: 14px;
          background: #2196f3;
          display: inline-block;
          position: absolute;
          left: 0;
          top: 10px;
          z-index: 1;
        }
      }
      &:hover {
        background: #fafafa;
      }
      .num {
        font-weight: 400;
        color: #b9b9b9;
        margin-left: 3px;
        width: 24px;
        text-align: center;
      }
    }
    .title {
      padding: 10px 18px;
    }
    &.bTBorder {
      border-bottom: 1px solid #f0f0f0;
    }
    &.roleSet {
      overflow: auto;
      li {
        color: #151515;
        padding-left: 0;
        .icon {
          color: #9e9e9e;
        }
        .tag {
          padding: 0 6px;
          color: #2196f3;
          background: rgba(33, 150, 243, 0.1);
          border-radius: 11px;
          line-height: 22px;
          height: 22px;
          font-size: 13px;
        }
        &:hover {
          background: #fafafa;
        }
        &.cur {
          color: #2196f3 !important;
          .roleIcon {
            color: #2196f3;
          }
          .icon-drag_indicator {
            color: #9e9e9e !important;
            &:hover {
              color: #2196f3 !important;
            }
          }
          font-weight: bold !important;
        }
        .icon-drag,
        .icon-drag_indicator,
        .moreop {
          opacity: 0;
        }
        &:hover {
          .icon-drag,
          .icon-drag_indicator,
          .moreop {
            opacity: 1;
            &:hover {
              color: #2196f3;
            }
          }
        }
      }
    }
  }
`;
export const WrapTableCon = styled.div`
  min-height: 0;
  .barActionCon {
    padding: 0 44px;
    .toOthers,
    .del {
      font-weight: 400;
      color: #2196f3;
      line-height: 37px;
      height: 37px;
      background: #f3faff;
      padding: 0 20px;
      border-radius: 3px;
      &:hover {
        background: #ebf6fe;
      }
    }
  }
`;

export const WrapFooter = styled.div`
  .saveBtn {
    height: 36px;
    padding: 0 30px;
    color: #fff;
    line-height: 36px;
    border-radius: 4px 4px 4px 4px;
    font-size: 14px;
    font-weight: 400;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
    background: #1e88e5;
    &:hover {
      background: #1565c0;
    }
    &.disabled {
      color: #fff;
      background: #b2dbff;
      cursor: not-allowed;
      &:hover {
        background: #b2dbff;
      }
    }
  }
  .delBtn {
    height: 36px;
    padding: 0 30px;
    line-height: 36px;
    border-radius: 4px 4px 4px 4px;
    font-size: 14px;
    opacity: 1;
    border: 1px solid #eaeaea;
    margin-left: 23px;
    font-weight: 400;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
    &:hover {
      border: 1px solid #ccc;
    }
    &.disabled {
      color: #eaeaea;
      cursor: not-allowed;
      &:hover {
        border: 1px solid #eaeaea;
      }
    }
  }
  .toUser {
    color: #151515;
    height: 36px;
    padding: 0 30px;
    line-height: 36px;
    border-radius: 4px 4px 4px 4px;
    font-size: 14px;
    opacity: 1;
    border: 1px solid #eaeaea;
    font-weight: 400;
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0;
    &:hover {
      border: 1px solid #2196f3;
      color: #2196f3;
    }
  }
  .line {
    height: 24px;
    width: 0;
    border: 1px solid #eaeaea;
    margin: 0 30px;
  }
`;
export const AddWrap = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: #a2a2a2;
  padding: 0 12px;
  line-height: 36px;
  border-radius: 3px 3px 3px 3px;
  &:hover {
    background: #f5f5f5;
  }
`;
