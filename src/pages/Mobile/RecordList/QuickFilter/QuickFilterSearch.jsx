import React, { Fragment } from 'react';
import { Drawer } from 'antd-mobile';
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
    .am-drawer-sidebar {
      z-index: 100;
      border-radius: 14px 0 0 14px;
      background-color: #fff;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .am-drawer-overlay,
    .am-drawer-content {
      position: inherit;
    }
    &.am-drawer-open {
      z-index: 100;
      position: fixed;
    }
    &.bottom50 {
      bottom: 50px;
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
    updateFilters = () => {},
  } = props;
  
  const handleOpenDrawer = () => {
    updateFilters({ visible: !filters.visible });
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
    <SearchWrapper className="searchWrapper flexRow valignWrapper pLeft12 pRight12 pTop15 pBottom5">
      <Search textFilters={[]} />
      {!_.isEmpty(excludeTextFilter) && (
        <FilterWrapper>
          <Icon icon="filter" className={cx('Font20 Gray_9e', { active: isFilter })} onClick={handleOpenDrawer} />
        </FilterWrapper>
      )}
      <Drawer
        className={cx('filterStepListWrapper', {
          open: filters.visible,
          bottom50: detail.appNaviStyle === 2 && location.href.includes('mobile/app'),
        })}
        position="right"
        sidebar={_.isEmpty(view) ? null : renderSidebar(view)}
        open={filters.visible}
        onOpenChange={handleOpenDrawer}
      >
        <Fragment />
      </Drawer>
    </SearchWrapper>
  );
}
