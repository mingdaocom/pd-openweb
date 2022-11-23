import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import Empty from './Empty';
import FilterTitleList from './FilterTitleList';

const Con = styled.div`
  padding: 0 6px;
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
`;

export default function SavedFilters(props) {
  const {
    isCharge,
    controls,
    filters,
    addFilter,
    activeFilter,
    onChange,
    onEditFilter,
    onCopy,
    onToggleFilterType,
    onDelete,
    triggerFilter,
    onHideFilterPopup,
  } = props;
  const isEmpty = !filters.length;
  const personalFilters = filters.filter(f => f.type === 1);
  const globalFilters = filters.filter(f => f.type === 2);
  return (
    <Con>
      {isEmpty && <Empty onAdd={addFilter} />}
      {!isEmpty && (
        <Fragment>
          {!!personalFilters.length && (
            <FilterTitleList
              activeFilter={activeFilter}
              isCharge={isCharge}
              title={'个人'}
              controls={controls}
              filters={personalFilters}
              onEditFilter={onEditFilter}
              onChange={onChange}
              onCopy={onCopy}
              onDelete={onDelete}
              onToggleFilterType={onToggleFilterType}
              triggerFilter={triggerFilter}
              onHideFilterPopup={onHideFilterPopup}
            />
          )}
          {!!globalFilters.length && (
            <FilterTitleList
              activeFilter={activeFilter}
              isCharge={isCharge}
              title={'公共'}
              controls={controls}
              filters={globalFilters}
              onEditFilter={onEditFilter}
              onChange={onChange}
              onCopy={onCopy}
              onDelete={onDelete}
              onToggleFilterType={onToggleFilterType}
              triggerFilter={triggerFilter}
              onHideFilterPopup={onHideFilterPopup}
            />
          )}
        </Fragment>
      )}
    </Con>
  );
}
