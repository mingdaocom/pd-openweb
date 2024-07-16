import React, { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { string, bool, element, arrayOf, number } from 'prop-types';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { updateBase } from 'mobile/RecordList/redux/actions';
import ViewComp from './ViewComp';

function SingleView(props, ref) {
  const { appId, viewId, worksheetId, maxCount, showHeader, headerLeft, headerRight, filtersGroup, showPageTitle } =
    props;

  const store = useMemo(configureStore, []);

  useEffect(() => {
    store.dispatch(
      updateBase({
        appId,
        viewId,
        worksheetId,
        maxCount,
        type: 'single'
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
        showHeader={showHeader}
        headerLeft={headerLeft}
        headerRight={headerRight}
        filtersGroup={filtersGroup}
        showPageTitle={showPageTitle}
      />
    </Provider>
  );
}

export default forwardRef(SingleView);
