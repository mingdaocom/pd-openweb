import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Provider } from 'react-redux';
import WorkSheetLeft from 'worksheet/common/WorkSheetLeft/WorkSheetLeft';
import { configureStore } from 'src/redux/configureStore';

function SinglelLeftGroup(props, ref) {
  const { appId, projectId, groupId, worksheetId, isCharge, appPkg, groupData, firstGroupIndex } = props;

  const store = useMemo(configureStore, []);

  useImperativeHandle(ref, () => ({
    dispatch: store.dispatch,
    getState: store.getState,
  }));

  return (
    <Provider store={store}>
      <WorkSheetLeft
        appId={appId}
        projectId={projectId}
        groupId={groupId}
        worksheetId={worksheetId}
        isCharge={isCharge}
        appPkg={appPkg}
        groupData={groupData}
        firstGroupIndex={firstGroupIndex}
        secondLevelGroup={true}
      />
    </Provider>
  );
}

export default forwardRef(SinglelLeftGroup);
