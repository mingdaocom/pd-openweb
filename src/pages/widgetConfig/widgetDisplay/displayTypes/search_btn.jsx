import React from 'react';
import styled from 'styled-components';

const Search_Btn_Wrap = styled.div`
  display: flex;
  align-items: center;
  line-height: 36px;
  padding: 0 24px;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  text-align: center;
  background-color: var(--color-background-primary);
  font-weight: 500;
  max-width: 320px;
  justify-content: center;
  span {
    width: 100%;
  }
`;

export default function Search_Btn({ data }) {
  return (
    <Search_Btn_Wrap>
      <span className="overflow_ellipsis">{data.hint || _l('查询')}</span>
    </Search_Btn_Wrap>
  );
}
