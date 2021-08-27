import _ from 'lodash';
import {
  updateWorksheetRow,
  saveWorksheetView,
  getFilterRows,
  getFilterRowsReport,
  getViewPermission,
} from 'src/api/worksheet';
import { SYSTEM_CONTROL, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getLRUWorksheetConfig, saveLRUWorksheetConfig, clearLRUWorksheetConfig } from 'worksheet/util';
import { wrapAjax } from './util';

const wrappedGetFilterRows = wrapAjax(getFilterRows);
const wrappedGetFilterRowsReport = wrapAjax(getFilterRowsReport);

export const fetchRows = ({ isFirst, changeView } = {}) => {
  return (dispatch, getState) => {
    const { base, filters, sheetview, quickFilter } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    let { pageSize, pageIndex, sortControls } = sheetview.sheetFetchParams;
    if (changeView) {
      pageIndex = 1;
      dispatch(resetView());
    }
    if (changeView || isFirst) {
      dispatch(setViewLayout(viewId));
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START',
    });
    dispatch(getWorksheetSheetViewSummary());
    wrappedGetFilterRows({
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      appId,
      viewId,
      sortControls,
      ...filters,
      fastFilters: quickFilter.map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
    }).then(res => {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS',
        rows: res.data,
        count: res.count,
        resultCode: res.resultCode,
      });
    });
  };
};

export const setRowsEmpty = loading => ({
  type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS',
  rows: [],
  count: 0,
});

export const sortByControl = sortControl => ({
  type: 'WORKSHEET_SHEETVIEW_UPDATE_SORTS',
  sortControl,
});

export function updateViewPermission() {
  return (dispatch, getState) => {
    const { base } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    getViewPermission({
      appId,
      worksheetId,
      viewId,
    }).then(data => {
      if (data.view) {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_UPDATE_PERMISSION',
          viewId,
          value: data.view,
        });
      }
    });
  };
}

export function updateControlOfRow({ recordId, controlId, value, editType }, options = {}) {
  return (dispatch, getState) => {
    const { base, controls } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    const control = _.find(controls, { controlId });
    if (!control) {
      return;
    }
    updateWorksheetRow({
      appId,
      viewId,
      worksheetId,
      rowId: recordId,
      newOldControl: [
        {
          ..._.pick(control, ['controlId', 'type', 'controlName', 'dot']),
          editType,
          value,
        },
      ],
    })
      .then(res => {
        if (res.resultCode === 1) {
          if (_.isFunction(options.callback)) {
            options.callback(res.data);
          }
          dispatch({
            type: 'WORKSHEET_SHEETVIEW_UPDATE_ROW_CACHE',
            recordId,
            controlId,
            value: res.data[controlId],
          });
          if (_.isFunction(options.updateSucessCb)) {
            options.updateSucessCb(res.data);
          }
          dispatch(getWorksheetSheetViewSummary());
          // 处理新增自定义选项
          if (
            _.includes([WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN], control.type) &&
            /{/.test(value)
          ) {
            const newoption = {
              index: control.options.length + 1,
              isDeleted: false,
              key: _.last(JSON.parse(res.data[controlId])),
              ...JSON.parse(_.last(JSON.parse(value))),
            };
            const newcontrol = { ...control, options: [...control.options, newoption] };
            dispatch({
              type: 'WORKSHEET_UPDATE_CONTROL',
              control: newcontrol,
            });
          }
        } else if (res.resultCode === 11) {
          if (_.isFunction(options.updateTable)) {
            options.updateTable();
          }
          alert(_l('编辑失败，%0不允许重复', options.cell ? options.cell.controlName : ''), 3);
        } else {
          alert(_l('编辑失败！'), 3);
        }
      })
      .fail(err => {
        alert(_l('编辑失败！'), 3);
      });
  };
}

export function hideRows(rowIds) {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { rows } = sheetview.sheetViewData;
    rowIds = rowIds.filter(rowId => _.find(rows, r => rowId === r.rowid));
    if (rowIds.length) {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_HIDE_ROWS',
        rowIds,
      });
    }
  };
}

export function updateRows(rowIds, value) {
  return {
    type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS_BY_ROWIDS',
    rowIds,
    rowUpdatedValue: value,
  };
}

export function refresh() {
  return (dispatch, getState) => {
    const { filters } = getState().sheet;
    if (filters.keyWords) {
      dispatch(changePageIndex(1));
    }
    dispatch(fetchRows());
  };
}

export const clearHighLight = tableId => {
  return () => {
    $(`.mdTable.id-${tableId}-id .cell`).removeClass('highlight');
    delete window[`sheettablehighlightrow${tableId}`];
  };
};

export const setHighLight = (tableId, rowIndex) => {
  return dispatch => {
    dispatch(clearHighLight(tableId));
    $(`.mdTable.id-${tableId}-id .cell.row-${rowIndex}`).addClass('highlight');
    window[`sheettablehighlightrow${tableId}`] = rowIndex;
  };
};

export const clearSelect = () => ({
  type: 'WORKSHEET_SHEETVIEW_CLEAR_SELECT',
});

export function selectRows({ rows = [], selectAll }) {
  if (typeof selectAll !== 'undefined') {
    return {
      type: 'WORKSHEET_SHEETVIEW_SELECT_ALL',
      value: selectAll,
      rows,
    };
  } else {
    return {
      type: 'WORKSHEET_SHEETVIEW_SELECT_ROWS',
      rows,
    };
  }
}

export const updateSheetColumnWidths = (controlId, value) => ({
  type: 'WORKSHEET_SHEETVIEW_UPDATE_COLUMN_WIDTH',
  controlId,
  value,
});

export const hideColumn = controlId => ({
  type: 'WORKSHEET_SHEETVIEW_HIDE_COLUMN',
  controlId,
});

export const clearHiddenColumn = () => ({
  type: 'WORKSHEET_SHEETVIEW_CLEAR_HIDDEN_COLUMN',
});

export function frozenColumn(columnIndex) {
  return { type: 'WORKSHEET_SHEETVIEW_UPDATE_FIXED_COLUMN_COUNT', value: columnIndex };
}

export function saveSheetLayout({ closePopup = () => {} }) {
  return function (dispatch, getState) {
    const { base, controls, views, sheetview } = getState().sheet;
    const { appId, worksheetId, viewId } = base;
    const { fixedColumnCount, sheetHiddenColumns, sheetColumnWidths } = sheetview.sheetViewConfig;
    const view = _.find(views, v => v.viewId === viewId);
    if (!view) {
      return;
    }
    const updates = {
      appId,
      worksheetId,
      viewId,
      editAttrs: ['AdvancedSetting'],
    };
    if (sheetHiddenColumns.length) {
      updates.editAttrs = updates.editAttrs.concat('ShowControls');
      if (view.advancedSetting.customdisplay === '1' && view.showControls.length) {
        updates.showControls = view.showControls.filter(cid => !_.find(sheetHiddenColumns, hcid => hcid === cid));
      } else {
        updates.advancedSetting = { ...view.advancedSetting, customdisplay: '1' };
        updates.showControls = controls
          .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
          .concat(SYSTEM_CONTROL)
          .filter(c => !_.find(sheetHiddenColumns, hcid => hcid === c.controlId))
          .map(c => c.controlId);
      }
    }
    updates.advancedSetting = {
      ...view.advancedSetting,
      fixedcolumncount: fixedColumnCount,
      sheetcolumnwidths: JSON.stringify(sheetColumnWidths),
      layoutupdatetime: new Date().getTime(),
    };
    delete updates.advancedSetting.fixedColumnCount;
    delete updates.advancedSetting.layoutUpdateTime;
    delete updates.advancedSetting.sheetColumnWidths;
    dispatch(clearHiddenColumn());
    dispatch({
      type: 'WORKSHEET_UPDATE_VIEW',
      view: { ...view, ...updates },
    });
    closePopup();
    saveWorksheetView(updates)
      .then(() => {})
      .fail(err => {
        alert(_l('保存表格外观失败！'), 3);
        console.log(err);
      });
  };
}
export function resetSehetLayout() {
  return function (dispatch, getState) {
    const { base, views } = getState().sheet;
    const { viewId } = base;
    const view = _.find(views, v => v.viewId === viewId);
    if (!view) {
      return;
    }
    const { advancedSetting = {} } = view;
    let sheetColumnWidths = {};
    if (advancedSetting.sheetcolumnwidths) {
      try {
        sheetColumnWidths = JSON.parse(advancedSetting.sheetcolumnwidths);
      } catch (err) {}
    }
    dispatch(clearHiddenColumn());
    dispatch(frozenColumn(Number(advancedSetting.fixedcolumncount || 0)));
    saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId, advancedSetting.fixedcolumncount || 0);
    dispatch({ type: 'WORKSHEET_SHEETVIEW_INIT_COLUMN_WIDTH', value: sheetColumnWidths });
    saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId, JSON.stringify(sheetColumnWidths));
    clearLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
  };
}

export const updateDefaultScrollLeft = value => ({
  type: 'WORKSHEET_SHEETVIEW_UPDATE_SCROLL_LEFT',
  value,
});

// 更新每页数量
export function changePageSize(pageSize) {
  return function (dispatch, getState) {
    const { base } = getState().sheet;
    saveLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', base.viewId, pageSize);
    dispatch({ type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE', pageSize });
  };
}
// 分页
export function changePageIndex(pageIndex, sleep) {
  return function (dispatch) {
    if (sleep) {
      setTimeout(() => {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGEINDEX',
          pageIndex,
        });
      }, sleep);
    } else {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGEINDEX',
        pageIndex,
      });
    }
  };
}

function resetView() {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_CLEAR',
    });
  };
}

function setViewLayout(viewId) {
  return (dispatch, getState) => {
    const { views } = getState().sheet;
    const view = _.find(views, { viewId });
    if (!view) {
      return;
    }
    const { advancedSetting } = view;
    let sheetColumnWidths = {};
    const localLayoutUpdateTime = getLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    const pageSize = parseInt(getLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', viewId), 10);
    let frozonIndex = getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId);
    try {
      sheetColumnWidths = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId));
    } catch (err) {}
    // advancedSetting 内属性名需为全小写 兼容老数据
    if (advancedSetting.layoutUpdateTime) advancedSetting.layoutupdatetime = advancedSetting.layoutUpdateTime;
    if (advancedSetting.fixedColumnCount) advancedSetting.fixedcolumncount = advancedSetting.fixedColumnCount;
    if (advancedSetting.sheetColumnWidths) advancedSetting.sheetcolumnwidths = advancedSetting.sheetColumnWidths;
    if (
      advancedSetting.layoutupdatetime &&
      (!localLayoutUpdateTime || Number(advancedSetting.layoutupdatetime) > Number(localLayoutUpdateTime))
    ) {
      if (advancedSetting.fixedcolumncount) {
        frozonIndex = Number(advancedSetting.fixedcolumncount);
        clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId);
      }
      if (advancedSetting.sheetcolumnwidths) {
        try {
          sheetColumnWidths = JSON.parse(advancedSetting.sheetcolumnwidths);
          clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId);
        } catch (err) {}
      }
    }
    if (!_.isEmpty(sheetColumnWidths)) {
      dispatch({ type: 'WORKSHEET_SHEETVIEW_INIT_COLUMN_WIDTH', value: sheetColumnWidths });
    }
    if (_.isNumber(pageSize) && !_.isNaN(pageSize)) {
      dispatch({ type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE', pageSize });
    }
    if (_.isNumber(parseInt(frozonIndex, 10)) && !_.isNaN(parseInt(frozonIndex, 10))) {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_UPDATE_FIXED_COLUMN_COUNT',
        value: parseInt(frozonIndex, 10),
      });
    }
  };
}

export function getWorksheetSheetViewSummary() {
  return (dispatch, getState) => {
    const { base, sheetview, filters, quickFilter } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    const { rowsSummary } = sheetview.sheetViewData;
    let savedData = {};
    try {
      savedData = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_SUMMARY_TYPES', viewId));
    } catch (err) {}
    const types = Object.assign(savedData, rowsSummary.types);
    const columnRpts = Object.keys(types).map(controlId => ({
      controlId,
      rptType: parseInt(types[controlId], 10),
    }));
    if (!columnRpts.length) {
      return;
    }
    wrappedGetFilterRowsReport({
      appId,
      viewId,
      worksheetId,
      columnRpts,
      filterControls: [],
      keyWords: '',
      searchType: 1,
      ...filters,
      fastFilters: quickFilter.map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
    }).then(data => {
      if (data && data.length) {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_FETCH_REPORT_SUCCESS',
          types: types,
          values: [{}, ...data].reduce((a, b) => Object.assign({}, a, { [b.controlId]: b.value })),
        });
      }
    });
  };
}

export function changeWorksheetSheetViewSummaryType({ controlId, value }) {
  return (dispatch, getState) => {
    const { sheetview, base } = getState().sheet;
    const { rowsSummary } = sheetview.sheetViewData;
    const { viewId } = base;
    const newTypes = Object.assign({}, rowsSummary.types, { [controlId]: value });
    if (value === 0) {
      delete newTypes[controlId];
    }
    saveLRUWorksheetConfig('WORKSHEET_VIEW_SUMMARY_TYPES', viewId, JSON.stringify(newTypes));
    if (value === 0) {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_FETCH_REPORT_SUCCESS',
        types: newTypes,
      });
      return;
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_FETCH_REPORT_SUCCESS',
      types: newTypes,
      values: {},
    });
    dispatch(getWorksheetSheetViewSummary());
  };
}

export function addRecord(record, afterRowId) {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { rows, count } = sheetview.sheetViewData;
    if (afterRowId) {
      const afterRowIndex = _.findIndex(rows, row => row.rowid === afterRowId);
      const newRows = _.isUndefined(afterRowId)
        ? [record, ...rows]
        : [...rows.slice(0, afterRowIndex + 1), record, ...rows.slice(afterRowIndex + 1)];
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS',
        rows: newRows,
        count: count + 1,
      });
    } else {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS',
        rows: [record, ...rows],
        count: count + 1,
      });
    }
  };
}
