import React, { Fragment } from 'react';
import { Popup } from 'antd-mobile';
import { Icon } from 'ming-ui';
import Search from './Search';
import QuickFilter from './';
import cx from 'classnames';
import styled from 'styled-components';

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
    excludeTextFilter,
    isFilter,
    filters = {},
    detail = {},
    view,
    worksheetInfo,
    sheetControls,
    className,
    showSearch = true,
    updateFilters = () => {},
  } = props;

  const handleOpenDrawer = () => {
    updateFilters({ visible: !filters.visible }, view);
  };

  const renderSidebar = view => {
    const { fastFilters = [] } = view;
    const filtersControl = fastFilters
      .map(filter => ({
        ...filter,
        control: _.find(sheetControls, c => c.controlId === filter.controlId),
      }))
      .filter(c => c.control);
    return (
      <QuickFilter
        projectId={worksheetInfo.projectId}
        appId={worksheetInfo.appId}
        worksheetId={worksheetInfo.worksheetId}
        view={view}
        filters={filtersControl}
        controls={sheetControls}
        onHideSidebar={handleOpenDrawer}
      />
    );
  };

  return (
    <SearchWrapper className={`searchWrapper flexRow valignWrapper pLeft12 pRight12 pTop15 pBottom5 ${className}`}>
      {showSearch && <Search textFilters={[]} viewType={view.viewType} />}
      {!_.isEmpty(excludeTextFilter) && (
        <FilterWrapper>
          <Icon icon="filter" className={cx('Font20 Gray_9e', { active: isFilter })} onClick={handleOpenDrawer} />
        </FilterWrapper>
      )}
      <Popup
        className={cx('filterStepListWrapper', {
          open: filters.visible,
        })}
        bodyStyle={{
          borderRadius: '14px 0 0 14px',
          overflow: 'hidden'
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
