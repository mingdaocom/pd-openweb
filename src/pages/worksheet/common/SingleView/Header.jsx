import React from 'react';
import { func, shape, element, bool } from 'prop-types';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { Button } from 'antd';
import Pagination from 'worksheet/components/Pagination';
import SearchInput from 'worksheet/components/SearchInput';
import SearchRecord from 'worksheet/views/components/SearchRecord';
import styled from 'styled-components';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  padding: 6px 0;
  align-items: center;
`;

const Flex = styled.div`
  flex: 1;
`;

const isMobile = browserIsMobile();

export default function Header(props) {
  const { headerLeft, headerRight } = props;
  const {
    maxCount,
    worksheetInfo,
    view,
    searchData,
    sheetViewData,
    showAsSheetView,
    sheetFetchParams,
    sheetSwitchPermit,
  } = props;
  const {
    changePageSize,
    changePageIndex,
    updateFiltersWithView,
    updateSearchRecord,
    refreshSheet,
    openNewRecord
  } = props;
  const { count } = sheetViewData;
  const { pageIndex, pageSize } = sheetFetchParams;
  const { entityName, allowAdd } = worksheetInfo;
  const viewType = String(view.viewType);

  if (isMobile) {
    return (
      <Con className="SingleViewHeader mobile">
        {headerLeft}
        <Flex />
        {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
          <Icon
            icon="plus"
            className="addRecord Font20 Gray_9e"
            onClick={() => {
              const { appId, worksheetId } = worksheetInfo;
              const { viewId } = view;
              window.mobileNavigateTo && window.mobileNavigateTo(`/mobile/addRecord/${appId}/${worksheetId}/${viewId}`);
            }}
          />
        )}
        {headerRight}
      </Con>
    );
  }

  return (
    <Con className={cx('SingleViewHeader', { Border0: !_.isEmpty(view.fastFilters) })}>
      {headerLeft}
      <Flex />
      {[VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.gunter].includes(viewType) && !showAsSheetView ? (
        <SearchRecord
          queryKey={searchData.queryKey}
          data={searchData.data}
          onSearch={record => {
            updateSearchRecord(view, record);
          }}
          onClose={() => {
            updateSearchRecord(view, null);
          }}
        >
          <Tooltip popupPlacement="bottom" text={<span>{_l('查找')}</span>}>
            <Icon icon="search" className="Gray_9e Font22 pointer ThemeHoverColor3 mTop2 mRight15" />
          </Tooltip>
        </SearchRecord>
      ) : (
        <SearchInput
          className="queryInput"
          onOk={value => {
            updateFiltersWithView({ keyWords: (value || '').trim() });
          }}
          onClear={() => {
            updateFiltersWithView({ keyWords: '' });
          }}
        />
      )}
      <Tooltip popupPlacement="bottom" text={<span>{_l('刷新')}</span>}>
        <Icon
          icon="task-later"
          className="Gray_9e Font20 pointer mLeft2 mRight2"
          onClick={() => {
            refreshSheet(view);
          }}
        />
      </Tooltip>
      {(showAsSheetView || viewType === VIEW_DISPLAY_TYPE.sheet) && (
        <Pagination
          className="pagination"
          pageIndex={pageIndex}
          pageSize={pageSize}
          allCount={count}
          maxCount={maxCount}
          changePageSize={changePageSize}
          changePageIndex={changePageIndex}
          onPrev={() => {
            changePageIndex(pageIndex - 1);
          }}
          onNext={() => {
            changePageIndex(pageIndex + 1);
          }}
        />
      )}
      {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && (
        <Button
          type="primary"
          shape="round"
          className="mLeft15 addRecord"
          icon={<Icon icon="plus" className="mRight2" />}
          onClick={openNewRecord}
        >
          {entityName}
        </Button>
      )}
      {headerRight}
    </Con>
  );
}

Header.propTypes = {
  headerLeft: element,
  headerRight: element,
  sheetViewData: shape({}),
  showAsSheetView: bool,
  sheetFetchParams: shape({}),
  changePageSize: func,
  changePageIndex: func,
  updateFiltersWithView: func,
  updateSearchRecord: func,
  refreshSheet: func,
  openNewRecord: func,
};
