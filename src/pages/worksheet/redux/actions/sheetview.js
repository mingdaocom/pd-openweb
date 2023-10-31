import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import {
  SYSTEM_CONTROL,
  WORKFLOW_SYSTEM_CONTROL,
  WIDGETS_TO_API_TYPE_ENUM,
} from 'src/pages/widgetConfig/config/widget';
import {
  getLRUWorksheetConfig,
  saveLRUWorksheetConfig,
  clearLRUWorksheetConfig,
  formatQuickFilter,
} from 'worksheet/util';
import { getNavGroupCount } from './index';
import { getFilledRequestParams } from 'worksheet/util';

const DEFAULT_PAGESIZE = 50;

let fetchRowsAjax;
let fetchRowsNumAjax;

export const fetchRows = ({ isFirst, changeView, noLoading, noClearSelected, updateWorksheetControls } = {}) => {
  return (dispatch, getState) => {
    const { base, filters, sheetview, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId, maxCount, chartId, showAsSheetView } = base;
    let savedPageSize = parseInt(getLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', viewId), 10);
    if (_.isNaN(savedPageSize)) {
      savedPageSize = undefined;
    }
    let { pageIndex, sortControls } = sheetview.sheetFetchParams;
    if (changeView) {
      pageIndex = 1;
      dispatch(resetView());
    }
    const args = {
      worksheetId,
      pageSize: savedPageSize || DEFAULT_PAGESIZE,
      pageIndex,
      status: 1,
      appId,
      viewId,
      reportId: chartId || undefined,
      sortControls,
      notGetTotal: true,
      ...filters,
      fastFilters: formatQuickFilter(quickFilter),
      navGroupFilters,
      isGetWorksheet: updateWorksheetControls,
      ...(showAsSheetView ? { getType: 0 } : {}),
    };
    if (maxCount) {
      args.pageIndex = 1;
      args.pageSize = maxCount;
    }
    if (changeView || isFirst) {
      dispatch(setViewLayout(viewId));
    }
    if (savedPageSize && savedPageSize !== DEFAULT_PAGESIZE) {
      dispatch(changePageSize(savedPageSize, args.pageIndex));
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START',
      value: {
        noLoading,
        noClearSelected,
      },
    });
    dispatch(getWorksheetSheetViewSummary());
    if (changeView && fetchRowsAjax && _.isFunction(fetchRowsAjax.abort)) {
      fetchRowsAjax.abort();
    }
    fetchRowsAjax = worksheetAjax.getFilterRows(getFilledRequestParams(args));
    fetchRowsAjax.then(res => {
      if (updateWorksheetControls && _.get(res, 'template.controls')) {
        try {
          dispatch({
            type: 'WORKSHEET_UPDATE_CONTROLS',
            controls: _.get(res, 'template.controls').filter(
              c =>
                c.controlId.length === 24 ||
                _.includes(
                  SYSTEM_CONTROL.conact(WORKFLOW_SYSTEM_CONTROL).map(c => c.controlId),
                  c.controlId,
                ),
            ),
          });
        } catch (err) {}
        dispatch(setViewLayout(viewId));
      }
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS',
        rows: res.data,
        resultCode: res.resultCode,
      });
      if (chartId) {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
          count: res.count,
        });
      }
    });
    if (pageIndex === 1 && !chartId) {
      if (changeView && fetchRowsNumAjax && _.isFunction(fetchRowsNumAjax.abort)) {
        fetchRowsNumAjax.abort();
      }
      fetchRowsNumAjax = worksheetAjax.getFilterRowsTotalNum(getFilledRequestParams(args));
      fetchRowsNumAjax.then(data => {
        if (!data) {
          dispatch({
            type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT_ABNORMAL',
          });
        } else {
          const count = parseInt(data, 10);
          if (!_.isNaN(count)) {
            dispatch({
              type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
              count,
            });
          }
        }
      });
    }
  };
};

// 更新分组筛选
export const updateNavGroup = () => {
  return (dispatch, getState) => {
    const { views, base } = getState().sheet;
    const { viewId = '' } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
    navGroup.controlId && dispatch(getNavGroupCount());
  };
};

export const setRowsEmpty = () => dispatch => {
  dispatch({
    type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS',
    rows: [],
  });
  dispatch({
    type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
    count: 0,
  });
};

export const sortByControl = sortControl => ({
  type: 'WORKSHEET_SHEETVIEW_UPDATE_SORTS',
  sortControl,
});

export function updateViewPermission() {
  return (dispatch, getState) => {
    const { base } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    worksheetAjax
      .getViewPermission({
        appId,
        worksheetId,
        viewId,
      })
      .then(data => {
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

export function updateControlOfRow({ cell = {}, cells = [], recordId }, options = {}) {
  return (dispatch, getState) => {
    if (!_.isEmpty(cell) && _.isEmpty(cells)) {
      cells = [cell];
    }
    const { base, controls } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    const { controlId, value } = cell;
    const control = _.find(controls, { controlId });
    const newOldControl = cells
      .map(cell => {
        const { controlId, editType } = cell;
        let { value } = cell;
        const control = _.find(controls, { controlId });
        if (control.type === 29) {
          try {
            const parsedValue = JSON.parse(value);
            if (_.isArray(parsedValue) && !_.isEmpty(parsedValue) && parsedValue[0].sourcevalue) {
              value = JSON.stringify(parsedValue.map(v => _.omit(v, 'sourcevalue')));
            }
          } catch (err) {}
        }
        return (
          control && {
            ..._.pick(control, ['controlId', 'type', 'controlName', 'dot']),
            editType,
            value,
          }
        );
      })
      .filter(_.identity);
    if (_.isEmpty(newOldControl)) {
      return;
    }
    worksheetAjax
      .updateWorksheetRow({
        appId,
        viewId,
        worksheetId,
        rowId: recordId,
        newOldControl,
      })
      .then(res => {
        if (res.resultCode === 1) {
          dispatch(updateNavGroup());
          if (_.isFunction(options.callback)) {
            options.callback(res.data);
          }
          // dispatch(updateRows([recordId], _.omit(res.data, ['allowedit', 'allowdelete'])));
          if (_.isFunction(options.updateSuccessCb)) {
            options.updateSuccessCb(res.data);
          } else {
            dispatch({
              type: 'WORKSHEET_SHEETVIEW_UPDATE_ROW_CACHE',
              recordId,
              controlId,
              value: res.data[controlId],
            });
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

export function updateRows(rowIds, value) {
  return {
    type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS_BY_ROWIDS',
    rowIds,
    rowUpdatedValue: value,
  };
}

export function refresh({ resetPageIndex, changeFilters, noLoading, noClearSelected, updateWorksheetControls } = {}) {
  return (dispatch, getState) => {
    const {
      filters,
      quickFilter,
      navGroupFilters,
      views,
      base: { chartId, viewId },
    } = getState().sheet;
    const view = _.find(views, { viewId });
    const needClickToSearch = !chartId && _.get(view, 'advancedSetting.clicksearch') === '1';
    //设置了筛选列表，且不显示全部，需手动选择分组后展示数据
    const navGroupToSearch =
      !chartId && _.get(view, 'advancedSetting.showallitem') === '1' && _.get(view, 'navGroup').length > 0;
    if (filters.keyWords || resetPageIndex || changeFilters) {
      dispatch(changePageIndex(1));
    }
    if ((needClickToSearch && _.isEmpty(quickFilter)) || (navGroupToSearch && _.isEmpty(navGroupFilters))) {
      dispatch(setRowsEmpty());
    } else {
      dispatch(fetchRows({ noLoading, noClearSelected, updateWorksheetControls }));
    }
    dispatch({ type: 'WORKSHEET_SHEETVIEW_REFRESH' });
  };
}

export const clearHighLight = tableId => {
  return () => {
    $(`.sheetViewTable.id-${tableId}-id .cell`).removeClass('highlight');
    delete window[`sheetTableHighlightRow${tableId}`];
  };
};

export const setHighLight = (tableId, rowIndex) => {
  return dispatch => {
    dispatch(clearHighLight(tableId));
    $(`.sheetViewTable.id-${tableId}-id .cell.row-${rowIndex}`).addClass('highlight');
    window[`sheetTableHighlightRow${tableId}`] = rowIndex;
  };
};

export const setHighLightOfRows = (rowIds, tableId) => {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { rows } = sheetview.sheetViewData;
    dispatch(clearHighLight(tableId));
    rowIds.forEach(rowId => {
      let rowIndex = _.findIndex(rows, row => row.rowid === rowId);
      if (_.isUndefined(rowIndex)) {
        return;
      }
      setTimeout(() => {
        $(`${tableId ? `.sheetViewTable.id-${tableId}-id` : '.sheetViewTable'} .cell.row-${rowIndex}`).addClass(
          'highlight',
        );
      }, 100);
      window[`sheetTableHighlightRow${tableId}`] = rowIndex;
    });
  };
};

export const clearSelect = () => ({
  type: 'WORKSHEET_SHEETVIEW_CLEAR_SELECT',
});

export function hideRows(rowIds) {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { rows } = sheetview.sheetViewData;
    rowIds = rowIds.filter(rowId => _.find(rows, r => rowId === r.rowid));
    if (rowIds.length) {
      dispatch(clearSelect());
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_HIDE_ROWS',
        rowIds,
      });
    }
    dispatch(updateNavGroup());
  };
}

export function selectRows({ rows = [], selectAll }) {
  if (selectAll) {
    return {
      type: 'WORKSHEET_SHEETVIEW_SELECT_ALL',
      value: true,
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
          .filter(
            c =>
              /^\w{24}$/.test(c.controlId) || _.includes(safeParse(view.advancedSetting.sysids, 'array'), c.controlId),
          )
          .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
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
    worksheetAjax
      .saveWorksheetView(updates)
      .then(() => {})
      .fail(err => {
        alert(_l('保存表格外观失败！'), 3);
        console.log(err);
      });
  };
}
export function resetSheetLayout() {
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
export function changePageSize(pageSize, pageIndex) {
  return function (dispatch, getState) {
    const { base } = getState().sheet;
    saveLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', base.viewId, pageSize);
    dispatch({ type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE', pageSize, pageIndex });
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

export function setViewLayout(viewId) {
  return (dispatch, getState) => {
    const { views } = getState().sheet;
    const view = _.find(views, { viewId });
    if (!view || view.viewType !== 0) {
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
          sheetColumnWidths = { ...sheetColumnWidths, ...JSON.parse(advancedSetting.sheetcolumnwidths) };
          saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId, JSON.stringify(sheetColumnWidths));
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
    const { base, sheetview, filters, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId, chartId } = base;
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
    worksheetAjax
      .getFilterRowsReport({
        appId,
        viewId,
        worksheetId,
        reportId: chartId || undefined,
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
        navGroupFilters,
      })
      .then(data => {
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

export function addRecord(records, afterRowId) {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { rows, count } = sheetview.sheetViewData;
    if (!_.isArray(records)) {
      records = [records];
    }
    dispatch(updateNavGroup());
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
      count: count + records.length,
    });
    if (afterRowId) {
      const afterRowIndex = _.findIndex(rows, row => row.rowid === afterRowId);
      const newRows = _.isUndefined(afterRowId)
        ? [...records, ...rows]
        : [...rows.slice(0, afterRowIndex + 1), ...records, ...rows.slice(afterRowIndex + 1)];
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS',
        rows: newRows,
        count: count + 1,
      });
    } else {
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS',
        rows: [...records, ...rows],
        count: count + 1,
      });
    }
  };
}
