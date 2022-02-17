import React, { Fragment, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { loadWorksheet, updateFilters } from 'worksheet/redux/actions';
import { changePageIndex, changePageSize } from 'worksheet/redux/actions/sheetview';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import View from 'worksheet/views';
import Header from './Header';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0 !important;
`;

function ViewComp(props) {
  const { showHeader, headerLeft, headerRight } = props;
  const {
    isCharge,
    loading,
    appId,
    worksheetId,
    views,
    viewId,
    chartId,
    showControlIds,
    showAsSheetView,
    activeViewStatus,
    sheetViewData,
    sheetFetchParams,
  } = props;
  const { loadWorksheet, changePageIndex, changePageSize, updateFilters } = props;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const basePara = {
    loading,
    appId,
    worksheetId,
    view,
    activeViewStatus,
    viewId,
    chartId,
    showControlIds,
    showAsSheetView,
    isCharge,
  };
  useEffect(() => {
    if (worksheetId) {
      loadWorksheet(worksheetId);
    }
  }, [worksheetId]);
  return (
    !loading && (
      <Con>
        {showHeader && (
          <Header
            headerLeft={headerLeft}
            headerRight={headerRight}
            sheetViewData={sheetViewData}
            sheetFetchParams={sheetFetchParams}
            changePageIndex={changePageIndex}
            changePageSize={changePageSize}
            updateFiltersWithView={value => updateFilters(value, view)}
          />
        )}
        <ViewCon>
          <View {...basePara} />
        </ViewCon>
      </Con>
    )
  );
}

export default connect(
  state => ({
    appId: state.sheet.base.appId,
    worksheetId: state.sheet.base.worksheetId,
    viewId: state.sheet.base.viewId,
    isCharge: state.sheet.isCharge,
    loading: state.sheet.loading,
    views: state.sheet.views,
    activeViewStatus: state.sheet.activeViewStatus,
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
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));
