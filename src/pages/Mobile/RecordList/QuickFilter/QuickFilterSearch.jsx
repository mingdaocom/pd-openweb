import React from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getGroupControlId } from 'src/utils/worksheet';
import QuickFilter from './';
import Search from './Search';

const SearchWrapper = styled.div`
  background-color: #f2f2f3;
  .filterStepListWrapper {
    -webkit-overflow-scrolling: touch;
    position: inherit;
  }
  &.fixedMobileQuickFilter {
    position: fixed;
    bottom: 20px;
    left: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    padding: 0 !important;
    background-color: #fff;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
    z-index: 2;
    display: flex !important;
    &.bottom70 {
      bottom: 70px;
    }
    > div {
      margin: 0;
      width: 100%;
      height: 100%;
    }
  }
`;
const FilterWrapper = styled.div`
  background-color: #fff;
  padding: 10px;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  .active {
    color: #33a3f4 !important;
  }
`;

export default function QuickFilterSearch(props) {
  const {
    isFilter,
    filters = {},
    view,
    worksheetInfo,
    sheetControls,
    className,
    showSearch = true,
    savedFilters,
    activeSavedFilter = {},
    quickFilterWithDefault = [],
    updateFilters = () => {},
    updateActiveSavedFilter = () => {},
    base = {},
  } = props;
  const showSavedFilter = !_.get(window, 'shareState.shareId') && base.type !== 'single';

  const filtersControl = quickFilterWithDefault
    .map(filter => ({
      ...filter,
      control: _.find(sheetControls, c => c.controlId === filter.controlId),
    }))
    .filter(c => c.control);
  const groupControlId = getGroupControlId(view);

  const handleOpenDrawer = () => {
    updateFilters({ visible: !filters.visible }, view);
  };

  const renderSidebar = view => {
    return (
      <QuickFilter
        projectId={worksheetInfo.projectId}
        appId={worksheetInfo.appId}
        worksheetId={worksheetInfo.worksheetId}
        worksheetInfo={worksheetInfo}
        view={view}
        filters={filtersControl}
        controls={sheetControls}
        savedFilters={savedFilters}
        activeSavedFilter={activeSavedFilter}
        filterControls={props.filterControls}
        onHideSidebar={handleOpenDrawer}
        updateActiveSavedFilter={updateActiveSavedFilter}
      />
    );
  };

  return (
    <SearchWrapper className={`searchWrapper flexRow valignWrapper pLeft10 pRight10 pTop10 pBottom10 ${className}`}>
      {showSearch && (
        <Search inputPlaceholder={groupControlId ? _l('搜索') : ''} textFilters={[]} viewType={view.viewType} />
      )}
      {(window.isMingDaoApp || !_.isEmpty(filtersControl) || (showSavedFilter && !_.isEmpty(savedFilters))) && (
        <FilterWrapper>
          <Icon
            icon="filter"
            className={cx('Font20 Gray_9e', {
              active:
                isFilter || !_.isEmpty(activeSavedFilter) || (window.isMingDaoApp && !_.isEmpty(props.filterControls)),
            })}
            onClick={handleOpenDrawer}
          />
        </FilterWrapper>
      )}
      <Popup
        className={cx('filterStepListWrapper', {
          open: filters.visible,
        })}
        bodyStyle={{
          borderRadius: '14px 0 0 14px',
          overflow: 'hidden',
        }}
        position="right"
        visible={filters.visible}
        onMaskClick={handleOpenDrawer}
        onClose={handleOpenDrawer}
      >
        {_.isEmpty(view) ? null : renderSidebar(view)}
      </Popup>
    </SearchWrapper>
  );
}
