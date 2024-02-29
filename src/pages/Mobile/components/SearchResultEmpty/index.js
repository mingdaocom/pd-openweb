import React from 'react';
import styled from 'styled-components';

const EmptyWrap = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #bdbdbd;
  .Font50 {
    font-size: 50px;
    margin-bottom: 27px;
  }
`;

export default function SearchResultEmpty() {
  return (
    <EmptyWrap className="flexColumn">
      <i className="icon icon-h5_search Font50" />
      <div className="Gray_bd Font17 Bold">{_l('没有搜索结果')}</div>
    </EmptyWrap>
  );
}
