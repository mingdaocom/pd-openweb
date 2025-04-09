import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import { loadWorksheet, updateFilters, updateSearchRecord, refreshSheet, openNewRecord } from 'worksheet/redux/actions';
import { changePageIndex, changePageSize } from 'worksheet/redux/actions/sheetview';
import { getSearchData } from 'worksheet/views/util';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import Sheet from 'worksheet/common/Sheet/Sheet';
import Header from './Header';
import _ from 'lodash';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0 !important;
  overflow: hidden;
`;

function ViewComp(props) {
  const { forcePageSize, authRefreshTime, showHeader, showPageTitle, headerLeft, headerRight } = props;
  const {
    config,
    worksheetInfo,
    views,
    viewId,
    chartId,
    showControlIds,
    showAsSheetView,
    sheetViewData,
    sheetFetchParams,
    sheetSwitchPermit,
    searchData,
    maxCount,
    filtersGroup,
  } = props;
  const { changePageIndex, changePageSize, updateFilters, updateSearchRecord, refreshSheet, openNewRecord } = props;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};

  return (
    <Con className="SingleViewWrap">
      {showPageTitle && worksheetInfo.name && (
        <DocumentTitle title={`${worksheetInfo.name}${view.name ? ` - ${view.name}` : ''}`} />
      )}
      {showHeader && (
        <Header
          forcePageSize={forcePageSize}
          maxCount={maxCount}
          worksheetInfo={worksheetInfo}
          view={view}
          sheetSwitchPermit={sheetSwitchPermit}
          showAsSheetView={showAsSheetView}
          headerLeft={headerLeft}
          headerRight={headerRight}
          sheetViewData={sheetViewData}
          searchData={searchData}
          sheetFetchParams={sheetFetchParams}
          changePageIndex={changePageIndex}
          changePageSize={changePageSize}
          updateSearchRecord={updateSearchRecord}
          refreshSheet={refreshSheet}
          openNewRecord={openNewRecord}
          fromEmbed={config.fromEmbed}
          isDraft={config.isDraft}
          updateFiltersWithView={value => updateFilters(value, view)}
        />
      )}
      <ViewCon className="SingleViewBody">
        <Sheet
          type="single"
          chartId={chartId}
          showControlIds={showControlIds}
          showAsSheetView={showAsSheetView}
          filtersGroup={filtersGroup}
          authRefreshTime={authRefreshTime}
          config={{
            ...config,
            hideColumnFilter: true,
          }}
        />
      </ViewCon>
    </Con>
  );
}

export default connect(
  state => ({
    forcePageSize: state.sheet.base.forcePageSize,
    appId: state.sheet.base.appId,
    worksheetId: state.sheet.base.worksheetId,
    viewId: state.sheet.base.viewId,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
    worksheetInfo: state.sheet.worksheetInfo,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit,
    searchData: getSearchData(state.sheet),
    // sheetview
    sheetViewData: state.sheet.sheetview.sheetViewData,
    sheetFetchParams: state.sheet.sheetview.sheetFetchParams,
  }),
  dispatch =>
    bindActionCreators(
      {
        loadWorksheet,
        changePageIndex,
        changePageSize,
        updateFilters,
        updateSearchRecord,
        refreshSheet,
        openNewRecord,
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));
