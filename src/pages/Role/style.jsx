import styled from 'styled-components';

export const WrapCon = styled.div`
  margin: 16px 25px 0;
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 5px 5px 5px 5px;
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
      color: #333;
      display: inline-block;
      margin-right: 20px;
      padding: 20px 12px 17px;
      border-bottom: 3px solid transparent;
      &.cur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .moreop {
    color: #bdbdbd;
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
    li {
      .moreop {
        color: #bdbdbd;
        &:hover {
          color: #2196f3;
        }
      }
      cursor: pointer;
      padding: 12px 8px 12px 18px;
      &.cur {
        color: #2196f3;
        background: #f3faff !important;
        border-radius: 3px 3px 3px 3px;
        font-weight: bold !important;
        position: relative;
        &::before {
          content: ' ';
          width: 3px;
          height: 14px;
          background: #2196f3;
          display: inline-block;
          position: absolute;
          left: 0;
          top: 14px;
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
        color: #333;
        padding-left: 0;
        .icon {
          color: #9e9e9e;
        }
        .tag {
          padding: 1px 7px;
          color: #2196f3;
          background: rgba(33, 150, 243, 0.1);
          border-radius: 9px 9px 9px 9px;
        }
        &:hover {
          background: #fafafa;
        }
        &.cur {
          color: #2196f3 !important;
          .icon,
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
`;
