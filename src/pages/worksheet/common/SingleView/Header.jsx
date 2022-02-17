import React from 'react';
import { func, shape, element } from 'prop-types';
import Pagination from 'worksheet/components/Pagination';
import SearchInput from 'worksheet/components/SearchInput';
import styled from 'styled-components';

const Con = styled.div`
  display: flex;
  padding: 6px 0;
  height: 40px;
`;

const Flex = styled.div`
  flex: 1;
`;

export default function Header(props) {
  const { headerLeft, headerRight } = props;
  const { sheetViewData, sheetFetchParams, changePageSize, changePageIndex, updateFiltersWithView } = props;
  const { count } = sheetViewData;
  const { pageIndex, pageSize } = sheetFetchParams;
  return (
    <Con>
      {headerLeft}
      <Flex />
      <SearchInput
        className="queryInput"
        onOk={value => {
          updateFiltersWithView({ keyWords: (value || '').trim() });
        }}
        onClear={() => {
          updateFiltersWithView({ keyWords: '' });
        }}
      />
      <Pagination
        className="pagination"
        pageIndex={pageIndex}
        pageSize={pageSize}
        allCount={count}
        changePageSize={changePageSize}
        changePageIndex={changePageIndex}
        onPrev={() => {
          changePageIndex(pageIndex - 1);
        }}
        onNext={() => {
          changePageIndex(pageIndex + 1);
        }}
      />
      {headerRight}
    </Con>
  );
}

Header.propTypes = {
  headerLeft: element,
  headerRight: element,
  sheetViewData: shape({}),
  sheetFetchParams: shape({}),
  changePageSize: func,
  changePageIndex: func,
};
