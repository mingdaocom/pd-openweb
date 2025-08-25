import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { Provider } from 'react-redux';
import { arrayOf, bool, element, number, shape, string } from 'prop-types';
import { updateBase } from 'worksheet/redux/actions';
import { configureStore } from 'src/redux/configureStore';
import ViewComp from './ViewComp';

function SingleView(props, ref) {
  const {
    allowOpenRecord,
    config = {},
    showPageTitle,
    showHeader,
    showAsSheetView,
    appId,
    viewId,
    worksheetId,
    maxCount,
    pageSize,
    authRefreshTime,
    chartId,
    showControlIds,
    headerLeft,
    headerRight,
    filtersGroup,
  } = props;
  const store = useMemo(configureStore, []);
  useEffect(() => {
    store.dispatch(
      updateBase({
        appId,
        viewId,
        worksheetId,
        chartId,
        maxCount,
        forcePageSize: pageSize,
        showAsSheetView,
        type: 'single',
      }),
    );
  }, []);
  useImperativeHandle(ref, () => ({
    dispatch: store.dispatch,
    getState: store.getState,
  }));
  return (
    <Provider store={store}>
      <ViewComp
        config={{
          ...config,
          allowOpenRecord,
        }}
        authRefreshTime={authRefreshTime}
        showPageTitle={showPageTitle}
        chartId={chartId}
        maxCount={maxCount}
        showHeader={showHeader}
        showAsSheetView={showAsSheetView}
        showControlIds={showControlIds}
        headerLeft={headerLeft}
        headerRight={headerRight}
        filtersGroup={filtersGroup}
      />
    </Provider>
  );
}

export default forwardRef(SingleView);

SingleView.propTypes = {
  showPageTitle: bool,
  showHeader: bool,
  showAsSheetView: bool,
  config: shape({}),
  headerLeft: element,
  headerRight: element,
  maxCount: number,
  appId: string,
  showControlIds: arrayOf(string),
  filtersGroup: arrayOf(shape({})),
  worksheetId: string,
  viewId: string,
  chartId: string,
};
