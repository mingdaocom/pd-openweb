import React, { createRef, useEffect } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Input } from 'ming-ui';
import Filter from './Filter';

const Con = styled.div`
  display: flex;
  height: 36px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  height: 50px;
  line-height: 50px;
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
  margin-left: 10px;
  line-height: 36px;
  text-align: center;
`;

const AddNewRecordBtn = styled(Button)`
  padding: 0 16px 0 12px !important;
  min-width: auto !important;
  display: inline-flex !important;
  align-items: center;
`;

function enrichFilters(filters) {
  return filters.map(f => ({
    ...f,
    advancedSetting: { direction: '2', allowitem: '1' },
  }));
}

export default function Header(props) {
  const {
    loading,
    btnName,
    entityName,
    showNewRecord,
    projectId,
    appId,
    worksheetId,
    control = {},
    controls,
    quickFilters,
    searchConfig,
    onFilter,
    onSearch,
    onKeyDown,
    onNewRecord,
  } = props;
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
          <Input
            className="recordListKeyword"
            placeholder={_l('搜索%0', searchControl.controlName || '')}
            manualRef={inputRef}
            autoFocus
            onChange={onSearch}
            onKeyDown={onKeyDown}
          />
        </QueryCon>
        {!loading && searchFilters && !!searchFilters.length && (
          <FilterCon>
            <Filter
              projectId={projectId}
              appId={appId}
              worksheetId={worksheetId}
              control={control}
              controls={controls}
              quickFilters={quickFilters}
              searchFilters={enrichFilters(searchFilters)}
              onFilter={onFilter}
            />
          </FilterCon>
        )}
        {showNewRecord && (
          <AddNewRecordBtn type="primary" className="mLeft10" onClick={onNewRecord}>
            <i className="icon icon-add mRight3 Font20"></i>
            {btnName || entityName || ''}
          </AddNewRecordBtn>
        )}
      </Con>
    </React.Fragment>
  );
}
