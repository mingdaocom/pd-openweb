import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const SearchWrap = styled.div`
  display: flex;
  width: 197px;
  height: 32px;
  padding: 9px 10px;
  box-sizing: border-box;
  background: var(--color-background-secondary);
  border-radius: 15px;
  input {
    background: var(--color-background-secondary);
    border: none;
  }
`;

export default function SearchInput(props) {
  const { className, placeholder, keywords, onSearch = () => {}, onChange = () => {} } = props;
  const [searchValue, setSearchValue] = useState(keywords);

  useEffect(() => {
    setSearchValue(keywords);
  }, [keywords]);

  return (
    <SearchWrap className={className}>
      <i className="icon icon-search textTertiary" />
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
          setSearchValue(e.target.value);
          onChange(e.target.value);
        }}
      />
    </SearchWrap>
  );
}
