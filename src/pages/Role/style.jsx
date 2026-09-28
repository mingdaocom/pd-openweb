import styled from 'styled-components';

export const WrapCon = styled.div`
  background: var(--color-background-primary);
  flex: 1;
  .pLeft26 {
    padding-left: 26px;
  }
`;
export const WrapHeader = styled.div`
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  .tabCon {
    flex: 1;
    .tab {
      color: var(--color-text-title);
      display: inline-block;
      margin-right: 20px;
      padding: 0 12px;
      line-height: 42px;
      border-bottom: 3px solid transparent;
      border-top: 3px solid transparent;
      &.cur {
        color: var(--color-primary);
        border-bottom: 3px solid var(--color-primary);
      }
    }
  }
  .actCheckCon {
    & > span {
      height: 20px;
    }
  }
  .moreop {
    color: var(--color-text-disabled);
    &:hover {
      color: var(--color-primary);
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
  border-right: 1px solid var(--color-border-primary);
  min-width: 240px;
  max-width: 240px;
  min-height: 100%;
  overflow: auto;
  .search {
    padding: 0 15px;
  }
  .navCon {
    padding: 10px 8px;
    &.roleSet {
      padding: 6px 8px 10px;
    }
    li {
      .moreop {
        color: var(--color-text-disabled);
        &:hover {
          color: var(--color-primary);
        }
      }
      cursor: pointer;
      padding: 0 8px 0 18px;
      height: 36px;
      .Icon {
        color: var(--color-text-tertiary);
      }
      &.cur {
        color: var(--color-primary);
        background: var(--color-primary-transparent) !important;
        border-radius: 3px 3px 3px 3px;
        font-weight: bold !important;
        position: relative;
        .Icon {
          color: var(--color-primary);
        }
        &::before {
          content: ' ';
          width: 3px;
          height: 14px;
          background: var(--color-primary);
          display: inline-block;
          position: absolute;
          left: 0;
          top: 10px;
          z-index: 1;
        }
      }
      &:hover {
        background: var(--color-background-hover);
      }
      .num {
        font-weight: 400;
        color: var(--color-text-disabled);
        margin-left: 3px;
        width: 24px;
        text-align: center;
      }
    }
    &.bTBorder {
      border-bottom: 1px solid var(--color-background-disabled);
    }
    &.roleSet {
      overflow: auto;
      li {
        color: var(--color-text-title);
        padding-left: 0;
        .icon {
          color: var(--color-text-tertiary);
        }
        .tag {
          padding: 0 6px;
          color: var(--color-primary);
          background: rgba(33, 150, 243, 0.1);
          border-radius: 11px;
          line-height: 22px;
          height: 22px;
          font-size: 13px;
        }
        &:hover {
          background: var(--color-background-hover);
        }
        &.cur {
          color: var(--color-primary) !important;
          .roleIcon {
            color: var(--color-primary);
          }
          .icon-drag {
            color: var(--color-text-tertiary) !important;
            &:hover {
              color: var(--color-primary) !important;
            }
          }
          font-weight: bold !important;
        }
        .icon-drag,
        .moreop {
          opacity: 0;
        }
        &:hover {
          .icon-drag,
          .moreop {
            opacity: 1;
            &:hover {
              color: var(--color-primary);
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
  }
`;

export const WrapFooter = styled.div`
  .line {
    height: 24px;
    width: 0;
    border: 1px solid var(--color-border-secondary);
    margin: 0 30px;
  }
`;
export const AddWrap = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-tertiary);
  padding: 0 12px;
  line-height: 36px;
  border-radius: 3px 3px 3px 3px;
  &:hover {
    background: var(--color-background-hover);
  }
`;
