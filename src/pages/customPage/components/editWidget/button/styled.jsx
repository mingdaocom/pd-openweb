import styled from 'styled-components';
import tinycolor from '@ctrl/tinycolor';

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
  padding: 10px 0;
  &.column {
    flex-direction: column;
    &.small {
      .iconWrap {
        width: 56px !important;
        height: 56px !important;
      }
    }
    .iconWrap {
      width: 72px;
      height: 72px;
      margin-bottom: 10px;
    }
    .nameWrap {
      font-size: 15px;
    }
  }
  &.row {
    display: inline-flex;
    flex-direction: row;
    &.small {
      .iconWrap {
        width: 38px !important;
        height: 38px !important;
        svg {
          transform: scale(0.85);
        }
      }
    }
    .iconWrap {
      width: 48px;
      height: 48px;
      margin-right: 10px;
    }
    .nameWrap {
      text-align: left;
      flex: 1;
      width: 90px;
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
        tinycolor(props.color)
          .darken(20)
          .toString()};
    }
    div {
      display: flex;
    }
  }
`;