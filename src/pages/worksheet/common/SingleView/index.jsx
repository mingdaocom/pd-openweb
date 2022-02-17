import React, { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { string, bool, element, arrayOf } from 'prop-types';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { updateBase } from 'worksheet/redux/actions';
import ViewComp from './ViewComp';

const store = configureStore();
function SingleView(props, ref) {
  const { showHeader, showAsSheetView, appId, viewId, worksheetId, chartId, showControlIds, headerLeft, headerRight } =
    props;
  useEffect(() => {
    store.dispatch(
      updateBase({
        appId,
        viewId,
        worksheetId,
        chartId,
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
        chartId={chartId}
        showHeader={showHeader}
        showAsSheetView={showAsSheetView}
        showControlIds={showControlIds}
        headerLeft={headerLeft}
        headerRight={headerRight}
      />
    </Provider>
  );
}

export default forwardRef(SingleView);

SingleView.propTypes = {
  showHeader: bool,
  showAsSheetView: bool,
  headerLeft: element,
  headerRight: element,
  appId: string,
  showControlIds: arrayOf(string),
  worksheetId: string,
  viewId: string,
  chartId: string,
};
