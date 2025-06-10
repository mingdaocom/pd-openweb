import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { find, includes, isFunction, isNaN, isNumber } from 'lodash';
import { get } from 'lodash';
import { isEmpty } from 'lodash';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { canAsUniqueWidget } from 'src/pages/widgetConfig/util/setting';
import { parseAdvancedSetting } from 'src/utils/control';
import { getSubListUniqueError } from 'src/utils/record';
import { handleUpdateDefsourceOfControl } from 'src/utils/record';
import { getSubListError } from '../utils';
import { clearRows, loadRows, resetRows, setRowsFromStaticRows } from './actions';
import reducer from './reducer';

function loadWorksheetInfo(worksheetId, { controlId, relationWorksheetId, recordId, instanceId, workId } = {}) {
  const args = { worksheetId, getTemplate: true, getRules: true, relationWorksheetId };
  let getWorksheetInfoPromise;
  if (window.shareState.isPublicWorkflowRecord && window.shareState.shareId) {
    args.linkId = window.shareState.shareId;
    args.controlId = controlId;
    getWorksheetInfoPromise = sheetAjax.getWorksheetInfoByWorkItem;
  } else if (recordId && instanceId && workId) {
    args.instanceId = instanceId;
    args.workId = workId;
    args.controlId = controlId;
    getWorksheetInfoPromise = sheetAjax.getWorksheetInfoByWorkItem;
  } else if (get(window, 'shareState.isPublicForm')) {
    getWorksheetInfoPromise = publicWorksheetAjax.getWorksheetInfo;
  } else {
    getWorksheetInfoPromise = sheetAjax.getWorksheetInfo;
  }
  return getWorksheetInfoPromise(args);
}

export default function generateStore(
  control,
  {
    appId,
    from,
    relationWorksheetId,
    controls,
    searchConfig,
    masterData,
    recordId,
    instanceId,
    workId,
    initRowIsCreate,
    DataFormat,
  } = {},
) {
  let worksheetInfo;
  const logger = () => next => action => {
    const emptyCount = Number(get(control, 'advancedSetting.blankrow'));
    action.emptyCount = isNumber(emptyCount) && !isNaN(emptyCount) ? emptyCount : 1;
    return next(action);
  };
  const worksheetId = control.dataSource;
  const enhancers = [];
  if (process.env.NODE_ENV !== 'production') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }
  const store = createStore(reducer, compose(applyMiddleware(thunk, logger), ...enhancers));
  store.name = Math.floor(Math.random() * 1000);
  async function init() {
    if (store.initialized) return;
    store.initialized = true;
    let { max, treeLayerControlId } = parseAdvancedSetting(control.advancedSetting);
    if (!controls) {
      worksheetInfo = await loadWorksheetInfo(worksheetId, {
        relationWorksheetId,
        controlId: control.controlId,
        recordId,
        instanceId,
        workId,
      });
      controls = get(worksheetInfo, 'template.controls');
      controls = handleUpdateDefsourceOfControl({
        recordId,
        relateRecordControl: { ...control, worksheetId: relationWorksheetId },
        masterData,
        controls,
      });
    }
    if (!searchConfig) {
      const queryRes = await sheetAjax.getQueryBySheetId({ worksheetId });
      searchConfig = formatSearchConfigs(queryRes).filter(i => i.eventType !== 1);
    }
    const { uniqueControlIds } = parseAdvancedSetting(control.advancedSetting);
    controls = controls.map(c => ({
      ...c,
      uniqueInRecord: includes(uniqueControlIds, c.controlId) && canAsUniqueWidget(c),
    }));
    const isWorkflow =
      ((instanceId && workId) || window.shareState.isPublicWorkflowRecord) &&
      worksheetInfo.workflowChildTableSwitch !== false;
    if (isWorkflow && isFunction(control.updateRelationControls)) {
      control.updateRelationControls(control.dataSource, controls);
    }

    store.dispatch({
      type: 'UPDATE_BASE',
      value: {
        from,
        control,
        max,
        searchConfig,
        controls,
        masterData,
        recordId,
        instanceId,
        workId,
        worksheetInfo,
        initRowIsCreate,
      },
    });
    store.dispatch({ type: 'UPDATE_BASE_LOADING', value: false });
    if (typeof control.value === 'string' && !isEmpty(safeParse(control.value))) {
      const params = {
        recordId,
        masterData,
        staticRows: safeParse(control.value),
      };
      setRowsFromStaticRows(params)(store.getState, store.dispatch, DataFormat);
    }
    if (!isEmpty(store.waitList)) {
      store.waitList.forEach(fn => fn());
      store.waitList = [];
    }
  }
  store.init = init;
  store.waitList = [];
  store.reset = () => {
    store.dispatch({ type: 'RESET' });
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: {},
    });
  };
  store.resetRows = () => {
    store.dispatch(resetRows());
  };
  store.setEmpty = () => {
    store.dispatch(clearRows());
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: {},
    });
  };
  store.cancelChange = () => {
    store.dispatch(resetRows());
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: {},
    });
  };
  store.resetRows = () => {
    store.dispatch(resetRows());
  };
  store.clearSubListErrors = () => {
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: {},
    });
  };
  store.initAndLoadRows = async ({ worksheetId, recordId, controlId } = {}) => {
    await store.init();
    const state = store.getState();
    const { base = {} } = state;
    store.dispatch(
      loadRows({
        worksheetId,
        recordId,
        controlId,
        from: get(base, 'from'),
      }),
    );
  };
  store.setUniqueError = ({ badData = [] } = {}) => {
    const { controlId, error } = getSubListUniqueError({ store, badData, control });
    if (controlId !== control.controlId) return;
    if (!isEmpty(error)) {
      store.dispatch({
        type: 'UPDATE_CELL_ERRORS',
        value: error,
      });
    }
  };
  return store;
}
