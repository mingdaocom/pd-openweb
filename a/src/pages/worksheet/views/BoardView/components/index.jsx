import React from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { FlexCenter, Fixed, Text } from 'worksheet/styled';
import { Icon } from 'ming-ui';

const BoardIconWrap = styled(FlexCenter)`
  flex-basis: auto;
  align-items: end;
  justify-content: space-between;
  box-sizing: border-box;
  min-width: ${props => props.size || '56px'};
  height: ${props => props.size || '56px'};
  padding: 8px;
  background-color: #4caf50;
  border-radius: 6px;
`;
const VerticalItem = styled.div`
  background-color: #fff;
  width: 10px;
  height: ${props => props.height || '100%'};
`;
export const BoardIcon = ({ size }) => (
  <BoardIconWrap size={size}>
    <VerticalItem height="50%" />
    <VerticalItem />
    <VerticalItem height="75%" />
  </BoardIconWrap>
);

const ConfigHeaderWrap = styled(FlexCenter)`
  padding: 0 24px;
  border: 1px solid #e0e0e0;
`;
export const ConfigHeader = ({ text }) => (
  <ConfigHeaderWrap>
    <BoardIcon size="18px" />
    <Text>{text}</Text>
    <Icon icon="close" />
  </ConfigHeaderWrap>
);

const AddWrap = styled(FlexCenter)`
  justify-content: center;
  background-color: rgba(3, 3, 3, 0.05);
  border-radius: 3px;
  cursor: pointer;
  width: ${props => `${props.width ? props.width : 280}px`};
  height: 36px;
  min-height: 36px;
  margin: ${props => (props.noItem ? '0 auto' : ' 0 auto 8px auto')};
  border-radius: 3px;
  text-align: center;
  transition: all 0.25s;
  color: #9d9d9d;
  &:hover {
    background-color: rgba(3, 3, 3, 0.1);
    color: #2196f3;
  }
`;

const AddBoardWrap = styled(AddWrap)`
  text-align: left;
  margin: 0 auto 8px auto;
`;

export const AddRecord = ({ onAddRecord, ...rest }) => (
  <AddWrap onClick={onAddRecord} {...rest}>
    <Icon icon="add" style={{ fontSize: '22px' }} />
  </AddWrap>
);

export const AddBoard = ({ onAddBoard, text = _l('添加看板') }) => (
  <AddBoardWrap onClick={onAddBoard}>
    <Icon icon="add" style={{ fontSize: '22px' }} />
    <Text>{text}</Text>
  </AddBoardWrap>
);
