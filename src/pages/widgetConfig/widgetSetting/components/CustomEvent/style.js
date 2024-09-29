import styled from 'styled-components';

export const AddEventWrap = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  ${props =>
    props.type === 'action'
      ? 'width: fit-content;'
      : 'width: 100%; height: 36px;justify-content: center; border: 1px dashed #dddddd;margin-top: 20px;border-radius: 4px;'}
  cursor: pointer;
  color: #2196f3;
  ${props =>
    props.disabled
      ? 'background: #f5f5f5;border-color: #f5f5f5;color: #9e9e9e !important;cursor: not-allowed !important;'
      : ''}
  i {
    margin-right: 4px;
    color: #2196f3;
    font-size: 16px;
    ${props => (props.disabled ? 'color: #9e9e9e !important;' : '')}
  }
  &:hover {
    i {
      color: #1565c0;
    }
    color: #1565c0;
  }
`;

export const IconWrap = styled.span`
  color: #9e9e9e;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    color: ${props => (props.type === 'danger' ? '#F44336' : '#2196f3')};
  }
`;

export const EventActionWrap = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
  .eventHeader {
    display: flex;
    align-items: center;
    cursor: pointer;
    .customEventInput {
      border: none;
      border-bottom: 1px solid #dddddd;
      flex: 1;
      min-width: 0;
    }
    .eventIcon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      text-align: center;
      line-height: 16px;
      background: ${props => props.bgColor};
      margin-right: 10px;
      color: #000000;
    }
    .titleEvent {
      color: ${props => props.eventColor};
      margin-right: 10px;
      font-weight: 600;
    }
  }
  .actionText {
    font-weight: 600;
    margin-top: 12px;
  }
  .eventContent {
    padding-left: 24px;
    display: flex;
    flex-direction: column;
  }
  .eventLine {
    position: absolute;
    top: 16px;
    bottom: 0px;
    left: 6px;
    width: 4px;
    background: ${props => props.bgColor};
  }
`;

export const CustomActionWrap = styled.div`
  .RadioGroup {
    width: 70%;
  }
  .fieldList li {
    max-width: 100% !important;
  }
  .splitLine {
    width: 100%;
    margin: 24px 0;
    height: 1px;
    background: #dddddd;
  }
  .alertContent {
    padding: 0 20px;
    border-radius: 3px;
    line-height: 36px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid #dddddd;
    &:hover {
      border-color: #2196f3;
      .deleteBtn {
        display: block;
      }
    }
    .deleteBtn {
      display: none;
    }
    &.active {
      border-color: #2196f3;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        width: 0;
        height: 0;
        border: 7px solid #2196f3;
        border-bottom-color: transparent;
        border-left-color: transparent;
      }
    }
  }
  .deleteBtn {
    color: #9e9e9e;
    cursor: pointer;
    margin-left: 10px;
    &:hover {
      color: #fb0038;
    }
  }
  .setValueContent {
    display: flex;
    flex-direction: column;
    .Gray_70 {
      color: #707070;
    }
    .setItem {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      .itemFiledTitle {
        width: 140px;
        margin-right: 10px;
      }
      .itemValueTitle {
        flex: 1;
        min-width: 0;
      }
      .itemFiled {
        padding: 0 12px;
        display: flex;
        line-height: 36px;
        align-items: center;
        background: #f5f5f5;
        border-radius: 3px;
      }
      .errorBorder {
        border: 1px solid #ff0000;
        height: 36px;
        border-radius: 3px;
        cursor: not-allowed;
      }
    }
  }
  &.customApiDialog > div:first-child {
    margin-top: 0px !important;
  }
`;

export const DynamicBtn = styled.div`
  height: 36px;
  padding: 0 16px;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 4px;
  color: #2196f3;
  cursor: pointer;
  font-weight: 600;
  i {
    color: #2196f3;
    margin-right: 4px;
    font-size: 15px;
  }
  &:hover(:not(.disabled)) {
    i {
      color: #1565c0;
    }
    color: #1565c0;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ActionWrap = styled.div`
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  .title {
    color: #707070;
  }
  .actionHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .textCon {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .Max215 {
    max-width: 215px;
  }
  .iconBox {
    display: none;
  }
  &:hover {
    .iconBox {
      display: block !important;
    }
  }
`;

export const SpliceWrap = styled.div`
  margin-top: 8px;
  position: relative;
  display: flex;
  justify-content: center;
  .spliceLine {
    position: absolute;
    height: 1px;
    left: 0;
    right: 0;
    top: 12px;
    background: #dddddd;
  }
  .ming.Dropdown {
    background: #fff;
  }
  .ming.Dropdown .Dropdown--input {
    padding: 2px 8px !important;
  }
`;
