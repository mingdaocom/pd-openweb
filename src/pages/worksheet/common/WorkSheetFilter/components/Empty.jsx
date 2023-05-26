import React from 'react';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import emptyPng from './empty.png';
import SelectControls from './SelectControls';

const Con = styled.div`
  text-align: center;
  padding: 10px 0 8px;
  img {
    height: 160px;
  }
  .tip {
    color: #999;
    margin-top: -2px;
  }
  .addFilter {
    border-radius: 36px !important;
    padding: 0 16px !important;
    background-color: #2196f3;
    &:hover {
      background-color: #1565c0;
    }
  }
`;

export default function Empty(props) {
  const { isNew, maxHeight, controls, onAdd = () => {} } = props;
  return isNew ? (
    <SelectControls
      maxHeight={maxHeight}
      style={{
        boxShadow: 'none',
      }}
      className="inEmpty"
      controls={controls}
      onAdd={onAdd}
    />
  ) : (
    <Con>
      <img src={emptyPng} />
      <div className="tip">{_l('没有保存的筛选器')}</div>
    </Con>
  );
}
