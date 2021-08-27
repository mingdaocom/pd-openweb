import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { arrayOf, bool, shape, string, func, number } from 'prop-types';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import Pagination from 'worksheet/components/Pagination';
import WorkSheetFilter from 'worksheet/common/WorkSheetFilter';
import SearchInput from 'worksheet/components/SearchInput';

const Con = styled.div`
  height: 62px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.09) !important;
  margin: 0 -24px;
  padding: 0 24px;
  .queryInput {
    margin: 5px 16px 0 0;
  }
  .checkReportPagination {
    margin-right: 10px;
  }
  .worksheetFilterBtn {
    margin-right: 12px;
  }
`;

const Clear = styled.span`
  margin-left: 10px;
  cursor: pointer;
  color: #2196f3;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
`;

const Operate = styled.span`
  display: flex;
  align-items: center;
  .icon-worksheet_filter,
  .inputCon > .icon-search {
    &:hover {
      color: #2196f3 !important;
    }
  }
`;

const Close = styled.span`
  cursor: pointer;
  line-height: 1em;
  font-size: 22px;
  color: #9e9e9e;
  &:hover {
    color: #2196f3;
  }
`;

function Header(props, ref) {
  const {
    title,
    isCharge,
    projectId,
    appId,
    viewId,
    worksheetId,
    pageIndex,
    pageSize = 25,
    count = 0,
    controls = [],
    loadRows = () => {},
    onClear = () => {},
    onCancel = () => {},
    changePageSize = () => {},
    changePageIndex = () => {},
  } = props;
  const filterComp = useRef();
  const [searchActive, setSearchActive] = useState();
  const [searchText, setSearchText] = useState('');
  useImperativeHandle(ref, () => ({
    addFilterByControl: control => {
      try {
        filterComp.current.handleWorksheetHeadAddFilter(control);
      } catch (err) {}
    },
  }));
  return (
    <Con>
      <Title>{title}</Title>
      <Clear
        onClick={() => {
          Dialog.confirm({
            title: _l('是否清空回收站'),
            anim: false,
            // width: 368,
            onOk: onClear,
          });
        }}
      >
        {_l('清空')}
      </Clear>
      <div className="flex"></div>
      <Operate>
        <SearchInput
          active={searchActive}
          value={searchText}
          className="queryInput"
          onFocus={() => !searchActive && setSearchActive(true)}
          onBlur={() => searchActive && setSearchActive(false)}
          onOk={value => {
            setSearchText(value);
            loadRows({ pageIndex: 1, searchText: value });
          }}
          onClear={() => {
            loadRows({ pageIndex: 1, searchText: '' });
            setSearchActive(false);
          }}
        />
        <WorkSheetFilter
          exposeComp={comp => {
            filterComp.current = comp;
          }}
          onlyUseEditing
          zIndex={1000}
          isCharge={isCharge}
          appId={appId}
          viewId={viewId}
          projectId={projectId}
          worksheetId={worksheetId}
          columns={controls}
          onChange={({ searchType, filterControls }) => {
            loadRows({ pageIndex: 1, searchType, filterControls });
          }}
        />
        <Pagination
          className="pagination"
          pageIndex={pageIndex}
          pageSize={pageSize}
          allCount={count}
          onPrev={() => {
            loadRows({ pageIndex: pageIndex - 1 });
          }}
          onNext={() => {
            loadRows({ pageIndex: pageIndex + 1 });
          }}
          changePageSize={changePageSize}
          changePageIndex={changePageIndex}
        />
        <Close onClick={onCancel}>
          <i className="icon icon-close" />
        </Close>
      </Operate>
    </Con>
  );
}

Header.propTypes = {
  isCharge: bool,
  title: string,
  projectId: string,
  appId: string,
  viewId: string,
  worksheetId: string,
  controls: arrayOf(shape({})),
  loadRows: func,
  onCancel: func,
  onClear: func,
  pageIndex: number,
  pageSize: number,
  count: number,
  changePageSize: func,
  changePageIndex: func,
};

export default forwardRef(Header);
