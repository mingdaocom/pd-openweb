import React, { createRef, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Input } from 'ming-ui';

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

const AddNewRecordBtn = styled(Button)`
  padding: 0 16px 0 12px !important;
  min-width: auto !important;
  display: inline-flex !important;
  align-items: center;
`;

const FastFiltersExpandBtn = styled.div`
  cursor: pointer;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  margin-left: 10px;
  line-height: 36px;
  text-align: center;
  font-size: 18px;
  color: ${({ active }) => (active ? '#1677ff' : '#9e9e9e')};
  &.filtersVisible {
    color: #9e9e9e;
    border-color: #e0e0e0;
    &:hover {
      color: #1677ff;
      border-color: #1677ff;
      background: #fff;
    }
  }
  &:hover {
    color: #1677ff;
    border-color: #1677ff;
    background: #fff;
  }
`;

export default function Header(props) {
  const {
    btnName,
    entityName,
    showNewRecord,
    showFastFilters,
    isFiltered,
    filtersVisible,

    control = {},
    controls,
    searchConfig,
    onSearch,
    onKeyDown,
    onNewRecord,
    onExpandFastFilters,
  } = props;
  const inputRef = createRef();
  const [keyword, setKeyword] = useState('');
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
            value={keyword}
            onChange={value => {
              setKeyword(value);
              onSearch(value);
            }}
            onKeyDown={onKeyDown}
          />
          {keyword && (
            <span
              className="t-flex t-items-center t-justify-center mLeft5 mRight8"
              onClick={() => {
                setKeyword('');
                onSearch('');
              }}
            >
              <i className="icon icon-cancel Hand Gray_9e Font16"></i>
            </span>
          )}
        </QueryCon>

        {showFastFilters && (
          <Tooltip title={!filtersVisible ? _l('快速筛选') : null}>
            <FastFiltersExpandBtn
              className={filtersVisible ? 'filtersVisible' : ''}
              active={isFiltered}
              onClick={onExpandFastFilters}
            >
              {filtersVisible ? (
                <i className="icon icon-arrow-up-border" />
              ) : (
                <i className="icon icon-worksheet_filter" />
              )}
            </FastFiltersExpandBtn>
          </Tooltip>
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
