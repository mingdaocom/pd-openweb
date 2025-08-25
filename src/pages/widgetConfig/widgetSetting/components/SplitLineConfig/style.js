import styled from 'styled-components';

export const SelectColorWrap = styled.div(
  ({ inputCoverStyle = true }) => `
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    position: relative;
    box-sizing: border-box;
    width: 350px;
    padding: 10px;
    border: 1px solid #ddd;
    background-color: #fff;
    ul {
      display: flex;
      flex-wrap: wrap;
    }
    li {
      box-sizing: border-box;
      width: 10%;
      padding: 5px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      .colorItemCheck {
        display: none;
      }
      &.active {
        .colorItemCheck {
          display: block;
          color: #fff;
          position: absolute;
          border-radius: 50%;
          z-index: 1;
        }
      }
      &.addActive {
        .colorItem {
          border: 1px solid #bdbdbd;
          padding: 2px;
          box-sizing: border-box;
        }
        .colorItemAdd {
          height: 100%;
          border-radius: 50%;
          margin-left: -0.5px;
        }
      }
    }
    .colorItem {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      position: relative;
    }
    input ${
      inputCoverStyle
        ? `{
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 50%;
      z-index: 1;
      position: absolute;
      opacity: 0;
      cursor: pointer;
      top: 0;
      left: 0;
    }`
        : '{}'
    }
`,
);

export const SectionItem = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  .label {
    display: inline-block;
    width: 60px;
    text-align: left;
    color: #757575;
    &.Width100 {
      width: 100px;
    }
  }
  .selectWrap {
    flex: 1;
    display: flex;
    padding: 2px;
    background: #f5f6f7;
    border-radius: 3px;
    .animaItem {
      height: 32px;
      border-radius: 3px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      font-weight: bold;
      color: #757575;
      flex: 1;
      &:hover {
        color: #1677ff;
      }
      &.active {
        background: #ffffff;
        color: #1677ff;
      }
    }
  }
`;

export const DefaultEmpty = styled.div`
  width: 129px;
  height: 8px;
  margin: 10px 0;
  background: #f5f5f5;
  border-radius: 2px;
`;

export const EmptyControl = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100px;
  border: 1px dashed #e6e6e6;
  border-radius: 4px;
  padding-top: 8px;
  .emptyText {
    line-height: 86px;
    width: 100%;
    text-align: center;
    color: #9e9e9e;
  }
`;

export const SectionItemWrap = styled.div`
  width: 100%;
  background: #fff;
  padding: 4px 0;
  display: flex;
  border-bottom: 1px solid #cccccc;
  .titleBox {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    cursor: ${props => (props.hidetitle && props.enumDefault2 === 0 ? 'default' : 'pointer')};
    ${props => (props.hidetitle ? ' align-items: center' : ' padding: 10px 0')};
    .Width20 {
      width: 20px;
    }
    .rangeIcon {
      width: 3px;
      height: 17px;
      background: ${props => props.theme};
      line-height: 40px;
      flex-shrink: 0;
      margin-right: 7px;
      margin-top: 2px;
    }

    .titleText {
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      flex: 1;
      white-space: break-spaces;
      color: ${props => props.color};
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }

  .starIcon {
    color: ${props => props.theme} !important;
    margin-right: 2px !important;
  }

  .headerArrow {
    flex-shrink: 0;
    font-size: 18px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    margin-left: 8px;
    border-radius: 5px;
    cursor: ${props => (props.hidetitle ? 'default' : 'pointer')};
    .iconBox {
      ${props => (props.visible ? 'transform: rotate(180deg); transition: transform 0.2s ease-in-out;' : '')};
    }
    i {
      color: #000000;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  .headerArrowIcon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 5px !important;
    color: ${props => props.theme} !important;
    i {
      font-size: 20px;
      display: inline-block;
      transform-origin: center;
      ${props => (props.visible ? 'transform: rotate(90deg)' : '')};
    }
  }
  &.mobileSectionItemWrap {
    border-bottom: none;
    align-items: center;
    .titleBox {
      padding: 0;
      .titleText {
        -webkit-line-clamp: initial;
        text-align: justify;
      }
    }
    .headerArrow {
      width: unset;
      height: unset;
      line-height: unset;
      margin-left: 12px;
      i {
        color: #9e9e9e;
      }
      &:hover {
        background: unset;
      }
    }
  }
`;
