import styled from 'styled-components';

export const SelectColorWrap = styled.div`
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
  input {
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
  }
`;

export const SectionItem = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  .label {
    margin-right: 33px;
    font-weight: 600;
  }
  .selectWrap {
    flex: 1;
    display: flex;
    padding: 2px;
    background: #f8f8f8;
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
        color: #2196f3;
      }
      &.active {
        background: #ffffff;
        color: #2196f3;
      }
    }
  }
`;

export const DefaultEmpty = styled.div`
  width: 129px;
  height: 8px;
  background: #f5f5f5;
  border-radius: 2px;
`;

export const EmptyControl = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100px;
  .emptyText {
    margin-top: 40px;
    width: 100%;
    text-align: center;
    color: #9e9e9e;
  }
`;

export const SectionItemWrap = styled.div`
  width: 100%;
  .ant-collapse-borderless > .ant-collapse-item {
    border-bottom: none !important;
  }
  .ant-collapse-borderless,
  .ant-collapse {
    background-color: #fff !important;
  }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 0px !important;
    position: relative;
  }
  .ant-collapse .ant-collapse-item-disabled > .ant-collapse-header,
  .ant-collapse .ant-collapse-item-disabled > .ant-collapse-header > .arrow {
    cursor: pointer !important;
  }
  .ant-collapse-content {
    border-top: 1px solid #d9d9d9 !important;
  }
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 8px !important;
    .customFieldsContainer {
      width: 100%;
      margin: 0 !important;
    }
  }
  .ant-collapse-header-text {
    flex: 1 !important;
    display: block;
    overflow: hidden;
  }
  &.mobileSectionItemWrap {
    position: relative;
    width: 100vw !important;
    margin: 10px -32px -10px;
    &::before {
      content: '';
      position: absolute;
      height: 10px;
      background: #f5f5f5;
      width: 100%;
      top: -10px;
    }
    &::after {
      content: '';
      position: absolute;
      height: 1px;
      background: #fff;
      width: 100%;
      bottom: -7px;
    }
    .ant-collapse {
      border: none;
    }
    .ant-collapse-content {
      border-top: none !important;
    }
    .ant-collapse-content > .ant-collapse-content-box {
      padding: 0px !important;
    }
    .ant-collapse > .ant-collapse-item {
      border-bottom: none;
    }
    .customFieldsContainer {
      padding: 10px 20px 30px;
    }
  }
`;

export const SectionHeader = styled.div`
  flex: 1;
  display: flex;
  background: ${props => props.background || '#fff'};
  border-top: ${props => (props.borderTop ? `3px solid ${props.theme}` : 'none')};
  .headerContent {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: ${props => (props.titlealign === '1' || props.enumDefault === 2 ? 'flex-start' : 'center')};
    .titleBox {
      padding: 8px 0 8px 12px;
      display: flex;
      align-items: flex-start;
      ${props =>
        props.enumDefault === 2
          ? 'padding-right: 20px;flex-wrap: no-wrap;border-radius: 0 25px 25px 0;height: 100%;align-items: center;'
          : ''}
      background: ${props => (props.enumDefault === 2 ? props.theme || '#2196f3' : 'transparent')}

      .rangeIcon {
        width: 4px;
        height: 18px;
        background: ${props => props.iconColor};
        line-height: 40px;
        flex-shrink: 0;
        margin: 2px 8px 0 0;
      }

      .titleText {
        font-size: 15px;
        font-weight: 600;
        flex: 1;
        white-space: break-spaces;
        color: ${props => props.title};
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: ${props => (props.enumDefault === 2 ? 1 : 3)};
        -webkit-box-orient: vertical;
      }
    }
  }

  .headerArrow {
    flex-shrink: 0;
    font-size: 18px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    margin: 8px 12px 8px 8px;
    border-radius: 5px;
    ${props => (props.visible ? 'transform: rotate(90deg)' : '')};
    i {
      color: ${props => (props.enumDefault === 6 ? '#fff' : '#9E9E9E')};
    }
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &.mobileSectionHeader {
    min-height: 40px;
    align-items: center;
    .headerContent {
      .titleBox {
        padding: 8px 0 8px 32px;
      }
    }
    .headerArrow {
      margin: 0;
      transform: none;
      width: unset;
      height: unset;
      line-height: unset;
      font-size: 14px;
      margin-left: 5px;
      &:hover {
        background: #fff;
      }
    }
  }
`;
