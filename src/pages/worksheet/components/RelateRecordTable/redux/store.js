import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { find, get, includes, isEmpty } from 'lodash';
import { v4 } from 'uuid';
import { RELATE_RECORD_SHOW_TYPE } from 'worksheet/constants/enum';
import { isRelateRecordTableControl } from 'src/utils/control';
import { init, updateTreeTableViewData } from './action';
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
    const defaultPageSize = 50;
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
      direction: get(control, 'advancedSetting.direction') === '1' ? 'vertical' : 'horizontal',
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
      // 全屏 Dialog 渲染的关联表格：改统计方式时写回 window 缓存，供关闭后内联表格读回，保持两边一致
      isDialog: mode === 'dialog',
    },
  });
  store.dispatch({
    type: 'UPDATE_TABLE_STATE',
    value: { pageSize },
  });

  // 全屏入口（Operate.jsx）按 `${recordId}_${controlId}` 把内联表格当前已选统计方式暂存到 window。
  // 这里在新建 store 时读取一次：无论有无内容都立即清除（避免空壳残留 / 下次新建沿用旧值），
  // 有内容才 seed 进新 store；init 以 merge 口径拉取使其生效。
  const summaryCacheKey = `${recordId}_${get(control, 'controlId')}`;
  const summaryCache = window.relateRecordSummaryTypesCache;

  if (summaryCache && summaryCacheKey in summaryCache) {
    const cachedSummaryTypes = summaryCache[summaryCacheKey];
    delete summaryCache[summaryCacheKey];

    if (cachedSummaryTypes && Object.keys(cachedSummaryTypes).length) {
      store.dispatch({ type: 'UPDATE_ROWS_SUMMARY', types: cachedSummaryTypes, values: {} });
    }
  }

  store.cancelChange = () => {
    const state = store.getState();

    if (get(state, 'base.isTab')) {
      return;
    }

    const { originFirstPageResult = {} } = state;
    store.dispatch({
      type: 'CANCEL_CHANGE',
      records: originFirstPageResult.records,
      count: originFirstPageResult.count,
    });
    // CANCEL_CHANGE 只还原了 records / changes，treeMap 仍保留撤销前新增/取消关联子记录留下的展开与 childrenIds，
    // 会导致树形结构错乱（已无子记录的节点仍显示展开 icon、节点层级错位等）。
    // 这里必须基于还原后的 records 干净重建：传 resetExpansion 丢弃旧 treeMap，不复用撤销前的展开状态。
    store.dispatch(updateTreeTableViewData({ resetExpansion: true }));
  };

  store.init = () => store.dispatch(init());
  store.reset = () => {
    store.dispatch({
      type: 'UPDATE_TABLE_STATE',
      value: { highlightRows: {} },
    });
  };

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
