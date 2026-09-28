import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Input, Tooltip } from 'ming-ui/antd-components';

const Con = styled.div`
  display: flex;
  height: 36px;
`;

const FastFiltersExpandBtn = styled.div`
  cursor: pointer;
  background: var(--color-background-primary);
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  width: 36px;
  height: 36px;
  margin-left: 10px;
  line-height: 36px;
  text-align: center;
  font-size: 18px;
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-tertiary)')};
  &.filtersVisible {
    color: var(--color-text-tertiary);
    border-color: var(--color-border-secondary);
    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
      background: var(--color-background-primary);
    }
  }
  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    background: var(--color-background-primary);
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

    controls,
    searchConfig,
    onSearch,
    onKeyDown,
    onNewRecord,
    onExpandFastFilters,
  } = props;
  const inputRef = useRef();
  const [keyword, setKeyword] = useState('');
  const searchControl = searchConfig.searchControl || _.find(controls, { attribute: 1 }) || {};
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <Con>
      <Input
        allowClear
        className="recordListKeyword flex"
        prefix={<i className="icon icon-search textTertiary Font20" />}
        placeholder={_l('搜索%0', searchControl.controlName || '')}
        ref={inputRef}
        autoFocus
        value={keyword}
        onChange={event => {
          const value = event.target.value;
          setKeyword(value);
          onSearch(value);
        }}
        onKeyDown={onKeyDown}
      />

      {showFastFilters && (
        <Tooltip title={!filtersVisible ? _l('快速筛选') : null}>
          <FastFiltersExpandBtn
            className={filtersVisible ? 'filtersVisible' : ''}
            $active={isFiltered}
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
        <Button type="primary" className="mLeft10" icon={<i className="icon icon-add Font20" />} onClick={onNewRecord}>
          {btnName || entityName || ''}
        </Button>
      )}
    </Con>
  );
}
