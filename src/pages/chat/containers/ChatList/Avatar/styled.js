import styled from 'styled-components';

export const Wrap = styled.div`
  .header {
    background-color: #f3f4f5;
  }
  .horizontalPadding {
    padding: 0 12px;
  }
  .content {
    flex: 1;
    background-color: #ffffff;
  }
  .footer {
    padding: 24px 10px;
  }
  .divider {
    width: 100%;
    height: 1px;
    background-color: #eaeaea;
  }
  .itemWrap {
    padding: 7px 20px;
    &:hover {
      background-color: #f5f5f5;
    }
  }
  .logout:hover {
    color: red !important;
  }
  .myAccount {
    padding: 3px 8px;
    border-radius: 2px;
    &:hover {
      background-color: #e7e8e9;
    }
  }
`;

export const PopoverWrap = styled.div`
  width: 280px;
  .horizontalPadding {
    padding: 7px 20px;
  }
  .itemWrap {
    padding: 7px 20px;
    &:hover,
    &.active {
      background-color: #f5f5f5;
    }
    .trial {
      color: #ffb100 !important;
    }
    .free {
      color: #4caf50 !important;
    }
  }
`;
