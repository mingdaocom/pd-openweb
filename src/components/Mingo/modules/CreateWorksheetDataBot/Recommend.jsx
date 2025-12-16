import React from 'react';
import styled from 'styled-components';

const Con = styled.div`
  font-size: 15px;
  margin-top: 8px;
  .direct-add {
    border: 1px solid #eaeaea;
    border-radius: 6px;
    padding: 12px;
    font-size: 14px;
    color: #6e09f9;
    cursor: pointer;
    margin: 15px 0;
    font-weight: bold;
    &:hover {
      border-color: var(--color-border-hover);
      background: var(--color-background-hover);
    }
  }
`;

export default function Recommend({ onSelect = () => {} }) {
  return (
    <Con className="t-flex t-flex-col">
      <div>
        {_l('我可以为您的工作表添加一些示例数据，方便你进行数据测试。如果您对添加的数据有具体要求也可以告诉我。')}
      </div>
      <div className="direct-add" onClick={() => onSelect(_l('生成'))}>
        {_l('直接添加')}
      </div>
    </Con>
  );
}
