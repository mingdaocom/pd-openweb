import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { find, includes, isFunction, isNaN, isNumber } from 'lodash';
import { get } from 'lodash';
import { isEmpty } from 'lodash';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { setRowsFromStaticRows } from 'worksheet/components/ChildTable/redux/actions';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { canAsUniqueWidget } from 'src/pages/widgetConfig/util/setting';
import { isRelateRecordTableControl, parseAdvancedSetting } from 'src/utils/control';
import { getSubListUniqueError } from 'src/utils/record';
import { handleUpdateDefsourceOfControl } from 'src/utils/record';
import { clearRows, loadRows, resetRows, updateTreeTableViewData } from './actions';
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
  async function init({ noMountInit = false } = {}) {
    if (store.initialized) return;
    if (isFunction(store.setLoadingInfo)) {
      store.setLoadingInfo('store_' + control.controlId, true);
    }

    if (
      !noMountInit &&
      isFunction(store.setLoadingInfo) &&
      ((recordId && instanceId && workId) || get(window, 'shareState.isPublicWorkflowRecord'))
    ) {
      store.setLoadingInfo('loadRows_' + control.controlId, true);
    }

    store.initialized = true;
    try {
      let { max, treeLayerControlId } = parseAdvancedSetting(control.advancedSetting);

      if (!controls) {
        worksheetInfo = await loadWorksheetInfo(worksheetId, {
          relationWorksheetId,
          controlId: control.controlId,
          recordId,
          instanceId,
          workId,
        });
        // await new Promise(resolve => setTimeout(resolve, 5000)); // TEST: 测试子表未加载完成时的提交问题
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
        control.updateRelationControls(control.controlId, controls);
      }

      const treeLayerControl = find(controls, { controlId: treeLayerControlId });
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
          discussId: control.discussId,
          isTreeTableView:
            treeLayerControl &&
            treeLayerControl.type === 29 &&
            !isRelateRecordTableControl(treeLayerControl) &&
            !!treeLayerControlId,
          originControls: controls,
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
    } catch (err) {
      // init 失败后 loadRows 不会再发起，需清掉上面打的 loadRows_ 标记，否则保存被永久挂起
      if (isFunction(store.setLoadingInfo)) {
        store.setLoadingInfo('loadRows_' + control.controlId, false);
      }

      throw err;
    } finally {
      if (isFunction(store.setLoadingInfo)) {
        store.setLoadingInfo('store_' + control.controlId, false);
      }
    }
  }

  store.init = init;
  store.waitList = [];
  store.waitListForLoadRows = [];
  store.reset = () => {
    // 保存成功后大表单会调用 reset 清理脏态(changes/errors)，但并不会重新拉取 rows，
    // 此时 state.rows 仍是筛选后的子集。RESET 会顺带清空 filterControls / realCount，
    // 造成"数据仍是筛选结果、筛选器指示却消失"的状态错位，并让筛选态判空必填回退失真。
    // 故 RESET 后回填当前筛选条件与未筛选真实总数，使筛选视图前后保持一致。
    const { filterControls, realCount, treeTableViewData } = store.getState();
    store.dispatch({ type: 'RESET' });
    if (!isEmpty(filterControls)) {
      store.dispatch({ type: 'UPDATE_FILTER_CONTROLS', filterControls });
      if (isNumber(realCount)) {
        store.dispatch({ type: 'SET_REAL_COUNT', value: realCount });
      }
    }

    // RESET 会清空树形 treeMap 但 rows 并未重置（RESET 不在 rows 处理列表，引用不变），
    // 组件自愈按 rows 引用去重会拒绝重建，导致保存后展开 icon 消失且只能手动刷新恢复。
    // 这里按当前 rows 立即重建，并复用清空前的 treeMap 保留用户已展开的层级。
    store.dispatch(updateTreeTableViewData({ prevTreeMap: get(treeTableViewData, 'treeMap') }));

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

    // 预取路径（编辑记录/草稿的校验前置加载）打上行加载标记，让大表单保存挂起等待行数据返回，
    // 否则 rows 未加载完时保存，行内必填校验对空 rows 空转放过
    if (isFunction(store.setLoadingInfo)) {
      store.setLoadingInfo('loadRows_' + controlId, true);
    }

    store.dispatch(
      loadRows({
        worksheetId,
        recordId,
        controlId,
        from: get(base, 'from'),
        // 与组件内 ChildTable.loadRows 同口径传入：loadRows 只认参数不读 base，
        // 漏传时预加载（必填子表/草稿箱）只落 rows 不建树，树形展示全靠组件自愈兜底
        isTreeTableView: get(base, 'isTreeTableView'),
        setLoadingInfo: store.setLoadingInfo,
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
