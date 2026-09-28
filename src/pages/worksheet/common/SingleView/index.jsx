import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { Provider } from 'react-redux';
import { arrayOf, bool, element, number, shape, string } from 'prop-types';
import { updateAppPkgData, updateBase, updateIsCharge } from 'worksheet/redux/actions';
import { syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { configureStore } from 'src/redux/configureStore';
import ViewComp from './ViewComp';

function SingleView(props, ref) {
  const {
    allowOpenRecord,
    config = {},
    showPageTitle,
    showHeader,
    showAsSheetView,
    singleAppId,
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
    appPermissions = {},
  } = props;
  const { isCharge = false, isLock, permissionType } = appPermissions;
  const store = useMemo(() => configureStore(), []);
  useEffect(() => {
    store.dispatch(
      updateBase({
        singleAppId: singleAppId || appId,
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
  }, [appId, chartId, maxCount, pageSize, showAsSheetView, singleAppId, store, viewId, worksheetId]);
  useEffect(() => {
    store.dispatch(updateIsCharge(isCharge));
    store.dispatch(updateAppPkgData({ appRoleType: permissionType, isLock }));
    store.dispatch(syncAppDetail({ permissionType, isLock }));
  }, [isCharge, isLock, permissionType, store]);
  useImperativeHandle(ref, () => ({
    dispatch: store.dispatch,
    getState: store.getState,
  }));
  return (
    <Provider store={store}>
      <ViewComp
        appId={appId}
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
  appPermissions: shape({
    isCharge: bool,
    isLock: bool,
    permissionType: number,
  }),
};
