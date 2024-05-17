import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './reducer';
import { init, refresh } from './action';
import thunk from 'redux-thunk';
import { v4 } from 'uuid';
import { get } from 'lodash';

export default function generateStore(
  control,
  {
    from,
    isCharge,
    appId,
    recordId,
    saveSync = true,
    allowEdit,
    worksheetId,
    formData = [],
    instanceId,
    pageSize = 20,
    workId,
  } = {},
) {
  const store = createStore(reducer, compose(applyMiddleware(thunk)));
  store.version = v4();
  store.dispatch({
    type: 'UPDATE_BASE',
    value: {
      from,
      isCharge,
      worksheetId,
      control,
      appId,
      recordId,
      allowEdit: allowEdit && !get(window, 'shareState.isPublicWorkflowRecord') && !(control && control.disabled),
      formData,
      instanceId,
      workId,
      saveSync,
      initialCount: Number(control.value),
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
  store.setEmpty = () => {
    store.dispatch({ type: 'RESET' });
    store.dispatch({ type: 'CLEAR_RECORDS' });
  };
  return store;
}
