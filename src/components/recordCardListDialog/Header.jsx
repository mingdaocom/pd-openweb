import React, { useEffect, createRef } from 'react';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import Filter from './Filter';

const Con = styled.div`
  display: flex;
  height: 36px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin: 10px 0 11px;
`;

const Icon = styled.span`
  font-size: 20px;
  color: #9e9e9e;
  margin: 2px 0 0 8px;
`;
const QueryCon = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  flex: 1;
  display: flex;
  .Input {
    border: none !important;
    flex: 1;
    height: auto !important;
    padding-left: 5px !important;
  }
`;
const FilterCon = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  line-height: 36px;
  margin-left: 10px;
  text-align: center;
`;

function enrichFilters(filters) {
  return filters.map(f => ({
    ...f,
    advancedSetting: { direction: '2', allowitem: '1' },
  }));
}

export default function Header(props) {
  const { entityName, control = {}, controls, quickFilters, searchConfig, onFilter, onSearch } = props;
  const inputRef = createRef();
  const { searchFilters } = searchConfig;
  const searchControl = searchConfig.searchControl || _.find(controls, { attribute: 1 }) || {};
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <React.Fragment>
      <Title>{_l('选择%0', control.controlName || entityName || '')}</Title>
      <Con>
        <QueryCon>
          <Icon>
            <i className="icon icon-search"></i>
          </Icon>
          <Input placeholder={_l('搜索%0', searchControl.controlName || '')} manualRef={inputRef} onChange={onSearch} />
        </QueryCon>
        {searchFilters && !!searchFilters.length && (
          <FilterCon>
            <Filter
              controls={controls}
              quickFilters={quickFilters}
              searchFilters={enrichFilters(searchFilters)}
              onFilter={onFilter}
            />
          </FilterCon>
        )}
      </Con>
    </React.Fragment>
  );
}
