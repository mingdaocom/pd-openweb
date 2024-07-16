import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
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
  .pagination {
    line-height: 1em;
    margin-right: 8px;
  }
  .worksheetFilterBtn {
    line-height: 1em;
    margin-top: 2px;
    margin-right: 12px;
  }
`;

const Tip = styled.div`
  margin-top: 2px;
  color: #9e9e9e;
`;

const Clear = styled.span`
  margin-left: 10px;
  margin-top: 2px;
  font-weight: 600;
  cursor: pointer;
  color: #2196f3;
`;

const Title = styled.div`
  font-size: 17px;
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
    entityName,
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
  const inputRef = useRef();
  const [searchActive, setSearchActive] = useState();
  const [searchText, setSearchText] = useState('');
  useImperativeHandle(ref, () => ({
    addFilterByControl: control => {
      try {
        filterComp.current.handleWorksheetHeadAddFilter(control);
      } catch (err) {}
    },
  }));
  useEffect(() => {
    if (!props.searchText) {
      try {
        inputRef.current.clear();
      } catch (err) {}
    }
  }, [props.searchText]);
  return (
    <Con>
      <div className="flex flexRow overflow_ellipsis">
        <Title className="overflow_ellipsis">{title}</Title>
        <Tip> {_l('%0%1天后将被自动删除', entityName, md.global.SysSettings.worksheetRowRecycleDays)} </Tip>
        {isCharge && (
          <Clear
            onClick={() => {
              Dialog.confirm({
                title: <span style={{ color: '#f44336' }}>{_l('是否清空回收站')}</span>,
                buttonType: 'danger',
                anim: false,
                description: _l('清空后，记录无法恢复，请谨慎操作！'),
                onOk: onClear,
              });
            }}
          >
            {_l('立即清空')}
          </Clear>
        )}
      </div>
      <Operate>
        <SearchInput
          ref={inputRef}
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
          type="trash"
          onlyUseEditing
          zIndex={1000}
          isCharge={isCharge}
          appId={appId}
          viewId={viewId}
          projectId={projectId}
          worksheetId={worksheetId}
          filterResigned={false}
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
  searchText: string,
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
