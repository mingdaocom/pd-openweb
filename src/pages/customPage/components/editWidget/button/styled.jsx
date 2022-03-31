import styled from 'styled-components';
import color from 'color';

export const ButtonListWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-content: center;

  .chunkListWrap {
    display: flex;
    &.center {
      justify-content: center;
      align-items: center;
    }
  }
`;

export const GraphWrap = styled.div`
  justify-content: center;
  padding: 10px;
  &.column {
    flex-direction: column;
    .iconWrap {
      width: 72px;
      height: 72px;
      margin-bottom: 12px;
    }
    .nameWrap {
      font-size: 14px;
      min-height: 39px;
    }
  }
  &.row {
    display: inline-flex;
    flex-direction: row;
    .iconWrap {
      width: 48px;
      height: 48px;
      margin-right: 10px;
    }
    .nameWrap {
      flex: 1;
      width: 100px;
      max-width: 200px;
    }
  }
  .name {
    display: -webkit-box;
    vertical-align: middle;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    word-wrap: break-word;
    overflow: hidden;
  }
  .iconWrap {
    color: #fff;
    font-size: 28px;
    border-radius: ${props => props.radius};
    justify-content: center;
    background-color: ${props => props.color};
    transition: color ease-in 0.2s, border-color ease-in 0.2s, background-color ease-in 0.2s;
    &:hover {
      background-color: ${props =>
        color(props.color)
          .darken(0.2)
          .string()};
    }
    div {
      display: flex;
    }
  }
`;