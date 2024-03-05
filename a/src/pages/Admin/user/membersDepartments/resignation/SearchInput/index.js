import React, { useState } from 'react';
import styled from 'styled-components';

const SearchWrap = styled.div`
  display: flex;
  width: 197px;
  height: 32px;
  padding: 9px 10px;
  box-sizing: border-box;
  background: #f5f5f5;
  border-radius: 15px;
  input {
    background: #f5f5f5;
    border: none;
  }
`;

export default function SearchInput(props) {
  const { className, placeholder, onSearch = () => {} } = props;
  const [searchValue, setSearchalue] = useState();

  return (
    <SearchWrap className={className}>
      <i className="icon icon-search Gray_9e" />
      <input
        placeholder={placeholder || _l('搜索')}
        type="search"
        value={searchValue}
        onKeyUp={e => {
          if (e.keyCode === 13) {
            onSearch(e.target.value);
          }
        }}
        onChange={e => {
          setSearchalue(e.target.value);
        }}
      />
    </SearchWrap>
  );
}
