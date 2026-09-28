import styled from 'styled-components';

export const PortalBarWrap = styled.div`
  .mRight14 {
    margin-right: 14px;
  }
  flex: 1;
  text-align: right;
  height: 36px;
  .actIcon {
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-primary);
    }
  }
  i::before {
    line-height: 36px;
  }
  i {
    vertical-align: top;
  }
  .searchInputPortal {
    height: 36px;
    overflow: hidden;
    display: inline-block;
    border-radius: 3px;
    background-color: var(--color-background-primary);
    .inputCon {
      i::before {
        line-height: 34px;
      }
      .none {
        display: none;
      }
    }
  }
`;
