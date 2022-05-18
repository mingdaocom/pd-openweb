import React, { useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { string, bool, element, arrayOf, number } from 'prop-types';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { updateBase } from 'src/pages/Mobile/RecordList/redux/actions';
import ViewComp from './ViewComp';

function SingleView(props, ref) {
  const {
    appId,
    viewId,
    worksheetId,
    maxCount,
    showHeader,
    headerLeft,
    headerRight
  } = props;

  const store = useMemo(configureStore, []);

  useEffect(() => {
    store.dispatch(
      updateBase({
        appId,
        viewId,
        worksheetId,
        maxCount,
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
      />
    </Provider>
  );
}

export default forwardRef(SingleView);
