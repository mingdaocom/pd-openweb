import sheetAjax from 'src/api/worksheet';
import { getCurrentView, getBoardItemKey } from '../util';
import { getParaIds } from './util';
import update from 'immutability-helper';
import { includes, noop, isEmpty } from 'lodash';
import { uniqBy } from 'lodash/array';
import { getFilterRows, updateWorksheetRow } from 'src/api/worksheet';
import { wrapAjax } from './util';

const wrappedGetFilterRows = wrapAjax(getFilterRows);

export function updateBoardViewRecordCount(data) {
  return { type: 'UPDATE_BOARD_VIEW_RECORD_COUNT', data };
}

export function initBoardViewRecordCount(data) {
  return { type: 'INIT_BOARD_VIEW_RECORD_COUNT', data };
}

export function changeBoardViewData(data) {
  return {
    type: 'CHANGE_BOARD_VIEW_DATA',
    data,
  };
}

export function delBoardViewRecord(data) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    sheetAjax.deleteWorksheetRows({ rowIds: [data.rowId], ...getParaIds(sheet) }).then(res => {
      if (res.isSuccess) {
        dispatch({ type: 'DEL_BOARD_VIEW_RECORD_COUNT', data });
        dispatch(updateBoardViewRecordCount([data.key, -1]));
      }
    });
  };
}

export function addRecord(data) {
  return (dispatch, getState) => {
    const { item, key } = data;
    dispatch({ type: 'ADD_BOARD_VIEW_RECORD', data: { item, key } });
    dispatch(updateBoardViewRecordCount([key, 1]));
  };
}

export function onCopySuccess(data) {
  return (dispatch, getState) => {
    const { item, key } = data;
    dispatch({ type: 'ADD_BOARD_VIEW_RECORD', data: { item, key } });
    dispatch(updateBoardViewRecordCount([key, 1]));
  };
}

export function updateBoardViewRecord(data) {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_BOARD_VIEW_RECORD', data });
    if (data.target) {
      const targetKey = getBoardItemKey(data.target);
      if (targetKey !== data.key) {
        dispatch({ type: 'UPDATE_BOARD_VIEW_RECORD_COUNT', data: [data.key, -1] });
        dispatch({ type: 'UPDATE_BOARD_VIEW_RECORD_COUNT', data: [targetKey, 1] });
      }
    }
  };
}

const getBoardViewPara = (sheet = {}, view) => {
  const { base, controls } = sheet;
  const { viewId, appId, chartId, type } = base;
  view = view || getCurrentView(sheet);
  const { worksheetId, viewControl, advancedSetting } = view;
  if (!viewControl) {
    return;
  }
  let relationWorksheetId;
  const selectControl = _.find(controls, item => item.controlId === viewControl);

  if (selectControl && selectControl.type === 29) {
    relationWorksheetId = selectControl.dataSource;
  }
  let para = {
    type,
    appId,
    worksheetId,
    viewId,
    reportId: chartId || undefined,
    kanbanSize: 20,
    kanbanIndex: 1,
    ...sheet.filters,
  };
  if (relationWorksheetId) {
    para = { ...para, relationWorksheetId, kanbanSize: advancedSetting && advancedSetting.navshow === '1' ? 50 : 20 };
  }
  return para;
};

const dealBoardViewRecordCount = data => {
  if (!data || !_.isArray(data)) return {};
  return data.map(item => ({ [item.key]: item.totalNum })).reduce((p, c) => ({ ...p, ...c }), {});
};

export function initBoardViewData(view) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const para = getBoardViewPara(sheet, view);
    if (!para) return;
    dispatch({
      type: 'CHANGE_BOARD_VIEW_LOADING',
      loading: true,
    });
    dispatch({ type: 'CHANGE_BOARD_VIEW_STATE', payload: { kanbanIndex: 1, hasMoreData: true } });
    getBoardViewDataFillPage({ para, dispatch });
  };
}

// 拉取看板数据以填满页面
function getBoardViewDataFillPage({ para, dispatch }) {
  (para.type === 'single' ? getFilterRows : wrappedGetFilterRows)(para).then(({ data, resultCode }) => {
    if (resultCode !== 1) {
      dispatch({
        type: 'WORKSHEET_UPDATE_ACTIVE_VIEW_STATUS',
        resultCode,
      });
      dispatch({
        type: 'CHANGE_BOARD_VIEW_LOADING',
        loading: false,
      });
    }

    dispatch(changeBoardViewData(data));
    dispatch(initBoardViewRecordCount(dealBoardViewRecordCount(data)));

    dispatch({
      type: 'CHANGE_BOARD_VIEW_LOADING',
      loading: false,
    });
    dispatch({
      type: 'CHANGE_BOARD_VIEW_STATE',
      payload: { kanbanIndex: para.kanbanIndex, hasMoreData: !(data.length < 20) },
    });
  });
}

export function getBoardViewPageData({ alwaysCallback = noop }) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { boardView } = sheet;
    const { boardViewState, boardViewRecordCount, boardData } = boardView;
    const { hasMoreData, kanbanIndex } = boardViewState;
    const para = getBoardViewPara(sheet);
    const { relationWorksheetId, kanbanSize } = para || {};
    // 关联看板隐藏无数据看板，开启不允许拉取数据，关闭时允许
    const isRelateHide = relationWorksheetId && kanbanSize === 50;
    if (isRelateHide || !hasMoreData || !para) {
      alwaysCallback();
      return;
    }
    wrappedGetFilterRows({ ...para, kanbanIndex: kanbanIndex + 1 })
      .then(({ data }) => {
        // 将已经存在的看板过滤掉
        const existedKeys = boardData.map(item => item.key);
        const filterData = data.filter(item => !includes(existedKeys, item.key));
        dispatch(changeBoardViewData(boardData.concat(filterData)));
        dispatch(initBoardViewRecordCount({ ...boardViewRecordCount, ...dealBoardViewRecordCount(filterData) }));
        let nextState = { kanbanIndex: kanbanIndex + 1 };
        if (data.length < 20) nextState = { ...nextState, hasMoreData: false };
        dispatch({ type: 'CHANGE_BOARD_VIEW_STATE', payload: nextState });
      })
      .always(() => {
        alwaysCallback();
      });
  };
}
function mergeUniqBoardData(boardViewData, currentData) {
  return uniqBy(boardViewData.concat(currentData), value => {
    return _.get(JSON.parse(value), 'rowid');
  });
}
// 分页获取单个看板数据
export function getSingleBoardPageData({ pageIndex, kanbanKey, alwaysCallback, checkIsMore }) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { boardView, searchArgs } = sheet;
    const { boardData } = boardView;
    const para = getBoardViewPara(sheet);
    if (!para) {
      alwaysCallback();
      return;
    }
    wrappedGetFilterRows({ ...para, pageIndex, kanbanKey })
      .then(({ data }) => {
        dispatch({ type: 'CHANGE_BOARD_VIEW_LOADING', loading: false });
        const boardViewIndex = _.findIndex(boardData, item => item.key === kanbanKey);
        const nextData = _.get(
          _.find(data, item => item.key === kanbanKey),
          'rows',
        );
        dispatch({
          type: 'CHANGE_BOARD_VIEW_DATA',
          data:
            pageIndex === 1
              ? data
              : update(boardData, {
                  // 分页更新对应key下的记录数据
                  [boardViewIndex]: {
                    rows: {
                      $set: mergeUniqBoardData(boardData[boardViewIndex].rows, nextData),
                    },
                  },
                }),
        });
        dispatch(initBoardViewRecordCount(dealBoardViewRecordCount(data)));
        checkIsMore((nextData || []).length >= para.kanbanSize);
      })
      .always(() => {
        alwaysCallback();
      });
  };
}

export function sortBoardRecord({ srcKey, targetKey, value, ...para }) {
  return (dispatch, getState) => {
    const { sheet } = getState();
    const { rowId } = para;
    updateWorksheetRow(para).then(res => {
      if (!isEmpty(res.data)) {
        dispatch({ type: 'SORT_BOARD_VIEW_RECORD', data: { key: srcKey, rowId, targetKey } });
        dispatch(updateBoardViewRecordCount([srcKey, -1]));
        dispatch(updateBoardViewRecordCount([targetKey, 1]));
      } else {
        alert(_l('拖拽更新失败!'));
      }
    });
  };
}

export function updateTitleData(data) {
  return { type: 'UPDATE_BOARD_TITLE_DATA', data };
}

// 更新多选看板
export const updateMultiSelectBoard = data => ({ type: 'UPDATE_MULTI_SELECT_BOARD', data });
