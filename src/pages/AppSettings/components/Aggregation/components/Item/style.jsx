import styled from 'styled-components';
import { Menu } from 'ming-ui';

export const Wrap = styled.div`
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  background: #fff;
  min-height: 68px;
  padding: 12px 0;
  margin: 0 40px;
  .iconCon {
    width: 36px;
    height: 36px;
    border-radius: 5px;
    flex-shrink: 0;
    min-width: 0;
    background: #bdbdbd;
    &.isRun {
      background: #1677ff;
    }
    .iconTitle {
      color: #fff;
    }
  }
  .moreActive {
    opacity: 0;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    background: #fafafa;
    .moreActive {
      opacity: 1;
    }
  }
  .ant-switch-checked {
    background-color: #01ca83;
  }
`;

export const WrapS = styled(Menu)`
  .ming.Item .Item-content .Icon {
    left: 15px;
  }
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background: #f5f5f5 !important;
    color: initial !important;
    .icon {
      color: #9e9e9e !important;
    }
    .Red {
      color: red !important;
    }
  }
  .Red.ming.MenuItem .Item-content:not(.disabled):hover {
    color: red !important;
  }
`;
export const WrapDialog = styled.div`
  .ic {
    span {
      padding: 4px 6px;
      border-radius: 3px;
      margin-left: -6px;
      &:hover {
        background: #f5f5f5;
      }
    }
  }
`;
