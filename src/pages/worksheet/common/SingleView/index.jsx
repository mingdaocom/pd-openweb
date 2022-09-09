import React, { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { string, bool, element, arrayOf, shape, number } from 'prop-types';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { updateBase } from 'worksheet/redux/actions';
import ViewComp from './ViewComp';
function SingleView(props, ref) {
  const {
    showPageTitle,
    showHeader,
    showAsSheetView,
    appId,
    viewId,
    worksheetId,
    maxCount,
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
        showAsSheetView,
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
