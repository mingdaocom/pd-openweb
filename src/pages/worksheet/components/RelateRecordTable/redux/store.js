import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './reducer';
import { init, refresh } from './action';
import thunk from 'redux-thunk';
import { v4 } from 'uuid';
import { find, get, includes, isEmpty } from 'lodash';
import { isRelateRecordTableControl } from 'worksheet/util';

export default function generateStore(
  control,
  {
    mode,
    from,
    isCharge,
    appId,
    recordId,
    saveSync = true,
    allowEdit,
    worksheetId,
    formData = [],
    instanceId,
    pageSize,
    workId,
  } = {},
) {
  if (!pageSize) {
    const defaultPageSize = mode === 'dialog' ? 50 : 20;
    pageSize = localStorage.getItem('relateRecordTablePageSize')
      ? Number(localStorage.getItem('relateRecordTablePageSize'))
      : defaultPageSize;
  }

  const store = createStore(reducer, compose(applyMiddleware(thunk)));
  store.version = v4();
  const treeLayerControlId = get(control, 'advancedSetting.layercontrolid');
  const treeLayerControl = find(control.relationControls, { controlId: treeLayerControlId });
  store.dispatch({
    type: 'UPDATE_BASE',
    value: {
      from,
      isCharge: isCharge || control.isCharge,
      worksheetId,
      control,
      appId,
      recordId,
      allowEdit: allowEdit && !get(window, 'shareState.isPublicWorkflowRecord') && !(control && control.disabled),
      formData,
      instanceId,
      workId,
      saveSync,
      treeLayerControlId,
      isTreeTableView:
        treeLayerControl &&
        treeLayerControl.type === 29 &&
        !isRelateRecordTableControl(treeLayerControl) &&
        !!treeLayerControlId,
      initialCount: Number(control.initialValue || control.value || 0),
    },
  });
  store.dispatch({
    type: 'UPDATE_TABLE_STATE',
    value: { pageSize },
  });
  store.cancelChange = () => {
    store.dispatch({ type: 'RESET' });
    store.dispatch(refresh());
  };
  store.init = () => store.dispatch(init());
  store.setEmpty = ({ ignoreControlId = [] } = {}) => {
    const state = store.getState();
    const { base = {} } = state;
    const controlId = get(base, 'control.controlId');
    if (!isEmpty(ignoreControlId) && includes(ignoreControlId, controlId)) {
      return;
    }
    store.dispatch({ type: 'RESET' });
    store.dispatch({ type: 'CLEAR_RECORDS' });
  };
  return store;
}
