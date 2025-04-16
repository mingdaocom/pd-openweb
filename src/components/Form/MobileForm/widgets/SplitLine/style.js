import styled from 'styled-components';

export const SectionItemWrap = styled.div`
  width: 100%;
  padding: 4px 0;
  display: flex;
  align-items: center;

  .titleBox {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    ${props => (props.hidetitle ? ' align-items: center' : '')};
    .svgIcon {
      margin-right: 3px;
      width: 20px;
      flex-shrink: 0;
    }
    .rangeIcon {
      width: 3px;
      height: 17px;
      background: ${props => props.theme};
      flex-shrink: 0;
      margin-right: 7px;
      margin-top: 2px;
    }

    .titleText {
      font-size: 15px;
      font-weight: 600;
      line-height: 20px;
      white-space: break-spaces;
      color: ${props => props.color};
      display: -webkit-box;
      -webkit-box-orient: vertical;
      text-align: justify;
    }
  }

  .starIcon {
    color: ${props => props.theme} !important;
    margin-right: 2px !important;
  }

  .headerArrow {
    flex-shrink: 0;
    font-size: 18px;
    margin-left: 12px;
    .iconBox {
      ${props => (props.visible ? 'transform: rotate(180deg); transition: transform 0.2s ease-in-out;' : '')};
    }
    i {
      color: var(--gray-9e);
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
`;
