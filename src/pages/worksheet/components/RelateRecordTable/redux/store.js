import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { find, get, includes, isEmpty } from 'lodash';
import { v4 } from 'uuid';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { isRelateRecordTableControl } from 'src/utils/control';
import { init, refresh } from './action';
import reducer from './reducer';

export default function generateStore(
  control,
  {
    mode,
    from,
    isCharge,
    appId,
    recordId,
    allowEdit,
    worksheetId,
    formData = [],
    instanceId,
    pageSize,
    workId,
    isDraft,
    openFrom,
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
      saveSync:
        includes(
          [String(RELATE_RECORD_SHOW_TYPE.LIST), String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE)],
          String(get(control, 'advancedSetting.showtype', true)),
        ) || openFrom === 'cell',
      treeLayerControlId,
      isTreeTableView:
        treeLayerControl &&
        treeLayerControl.type === 29 &&
        !isRelateRecordTableControl(treeLayerControl) &&
        !!treeLayerControlId,
      initialCount: Number(control.initialValue || control.value || 0),
      isDraft,
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
