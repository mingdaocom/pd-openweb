import React from 'react';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import emptyPng from './empty.png';

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
  const { isNew, onAdd = () => {} } = props;
  return (
    <Con>
      <img src={emptyPng} />
      <div className="tip">{isNew ? _l('添加筛选条件，查询工作表数据') : _l('没有保存的筛选器')}</div>
      {isNew && (
        <Button className="addFilter mTop20" onClick={onAdd}>
          <i className="icon icon-plus Font13 mRight5 White"></i>
          {_l('添加筛选条件')}
        </Button>
      )}
    </Con>
  );
}
