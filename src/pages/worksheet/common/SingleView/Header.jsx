import React from 'react';
import { Button } from 'antd';
import cx from 'classnames';
import _, { get } from 'lodash';
import { bool, element, func, shape } from 'prop-types';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import Pagination from 'worksheet/components/Pagination';
import SearchInput from 'worksheet/components/SearchInput';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import SearchRecord from 'worksheet/views/components/SearchRecord';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { browserIsMobile } from 'src/utils/common';
import { renderText as renderCellText } from 'src/utils/control';
import { isPublicLink } from '../../../../components/newCustomFields/tools/utils';

const Con = styled.div`
  display: flex;
  padding: 6px 0;
  align-items: center;
`;

const Flex = styled.div`
  flex: 1;
`;

const EmbedAddRecord = styled.div`
  cursor: pointer;
  i {
    color: #757575;
  }
  &:hover {
    color: #1677ff;
    i {
      color: #1677ff;
    }
  }
`;

const isMobile = browserIsMobile();

export default function Header(props) {
  const { headerLeft, headerRight } = props;
  const {
    maxCount,
    forcePageSize,
    worksheetInfo,
    view,
    searchData,
    sheetViewData,
    showAsSheetView,
    sheetFetchParams,
    sheetSwitchPermit,
    fromEmbed = false,
    isDraft,
  } = props;
  const { changePageSize, changePageIndex, updateFiltersWithView, updateSearchRecord, refreshSheet, openNewRecord } =
    props;
  const { count } = sheetViewData;
  const { pageIndex, pageSize } = sheetFetchParams;
  const { entityName, allowAdd } = worksheetInfo;
  const viewType = String(view.viewType);

  const handleSearchData = () => {
    if (!searchData) return;

    const controls = _.get(worksheetInfo, 'template.controls') || [];
    const titleField = controls.find(m => m.controlId === searchData.queryKey);
    const searchRecordData = searchData.data.map(l => {
      return {
        ...l,
        [searchData.queryKey]: renderCellText({
          ...titleField,
          value: searchData.queryKey ? l[searchData.queryKey] : undefined,
        }),
      };
    });

    return searchRecordData;
  };

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
      {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
        allowAdd &&
        fromEmbed &&
        !_.isEmpty(view) &&
        !isPublicLink() && (
          <EmbedAddRecord className="addRecord flexCenter Block" onClick={() => openNewRecord({ isDraft })}>
            <Icon icon="plus" className="Font14 mRight2" />
            <span className="Bold Font14">{_.get(worksheetInfo, 'advancedSetting.btnname') || entityName}</span>
          </EmbedAddRecord>
        )}
      {headerLeft}

      <Flex />
      {[VIEW_DISPLAY_TYPE.structure, VIEW_DISPLAY_TYPE.gunter, VIEW_DISPLAY_TYPE.map].includes(viewType) &&
      get(view, 'advancedSetting.hierarchyViewType') !== '3' &&
      !showAsSheetView ? (
        <SearchRecord
          queryKey={searchData.queryKey}
          data={handleSearchData()}
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
            refreshSheet(view, { isRefreshBtn: true });
          }}
        />
      </Tooltip>
      {(showAsSheetView || viewType === VIEW_DISPLAY_TYPE.sheet) && (
        <Pagination
          allowChangePageSize={!forcePageSize}
          className="pagination"
          pageIndex={pageIndex}
          pageSize={forcePageSize || pageSize}
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
      {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && !fromEmbed && (
        <Button
          type="primary"
          shape="round"
          className="mLeft15 addRecord"
          icon={<Icon icon="plus" className="mRight2" />}
          onClick={openNewRecord}
        >
          {_.get(worksheetInfo, 'advancedSetting.btnname') || entityName}
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
