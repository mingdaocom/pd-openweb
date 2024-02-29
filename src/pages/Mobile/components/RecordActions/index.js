import React from 'react';
import { Button, Icon } from 'ming-ui';
import styled from 'styled-components';

const AddRecordWrap = styled.div`
  position: fixed;
  bottom: 20px;
  width: 100%;
  text-align: center;
  z-index: 1;
  .addRecordBtn {
    height: 44px;
    line-height: 44px;
    display: flex !important;
    border-radius: 24px !important;
    padding: 0px 15px !important;
    margin: 0 auto;
    box-shadow: 0 1px 4px #00000029;
  }
`;

const BatchOperationWrap = styled.div`
  width: 48px;
  height: 48px;
  text-align: center;
  padding: 12px 0;
  border-radius: 50%;
  position: fixed;
  right: 20px;
  bottom: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
  background-color: #fff;
  z-index: 2;
  color: #9e9e9e;
  &.bottom70 {
    bottom: 70px;
  }
`;

export function AddRecordBtn(props) {
  const { entityName, warpStyle = {}, btnClassName, backgroundColor, onClick = () => {} } = props;
  return (
    <AddRecordWrap className="addRecordItemWrapper" style={warpStyle}>
      <Button
        style={{ backgroundColor }}
        className={`addRecordBtn flex valignWrapper ${btnClassName} `}
        onClick={onClick}
      >
        <Icon icon="add" className="Font22 mRight5" />
        {entityName}
      </Button>
    </AddRecordWrap>
  );
}

export function BatchOperationBtn(props) {
  const { style, onClick = () => {} } = props;
  return (
    <BatchOperationWrap style={style} onClick={onClick}>
      <Icon icon={'task-complete'} className="Font24" />
    </BatchOperationWrap>
  );
}
