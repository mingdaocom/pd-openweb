import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const AddRecordWrap = styled.div`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  line-height: 50px;
  border-radius: 50%;
  color: var(--color-white);
  text-align: center;
  z-index: 10;
  box-shadow: var(--shadow-lg);
`;

const BatchOperationWrap = styled.div`
  width: 44px;
  height: 44px;
  text-align: center;
  border-radius: 50%;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: var(--color-background-card);
  box-shadow: var(--shadow-md);
  z-index: 2;
  color: var(--color-text-tertiary);
  &.bottom70 {
    bottom: 70px;
  }
`;

export function AddRecordBtn(props) {
  const { className, warpStyle = {}, backgroundColor, onClick = () => {} } = props;
  return (
    <AddRecordWrap
      className={`addRecordItemWrapper ${className}`}
      style={{ ...warpStyle, backgroundColor }}
      onClick={onClick}
    >
      <Icon icon="add" className="Font36 LineHeight60" />
    </AddRecordWrap>
  );
}

export function BatchOperationBtn(props) {
  const { style, className, onClick = () => {} } = props;
  return (
    <BatchOperationWrap className={className} style={style} onClick={onClick}>
      <Icon icon={'done_all'} className="Font24 LineHeight44" />
    </BatchOperationWrap>
  );
}
