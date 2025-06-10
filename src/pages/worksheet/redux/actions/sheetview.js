import _, {
  assign,
  concat,
  difference,
  find,
  findKey,
  forEach,
  get,
  identity,
  includes,
  isEmpty,
  isUndefined,
  mapValues,
  pickBy,
  set,
  uniq,
} from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';
import { treeDataUpdater } from 'worksheet/common/TreeTableHelper';
import { handleUpdateTreeNodeExpansion } from 'worksheet/common/TreeTableHelper/index.js';
import { getRuleErrorInfo } from 'src/components/newCustomFields/tools/formUtils';
import {
  SYSTEM_CONTROL,
  WIDGETS_TO_API_TYPE_ENUM,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';
import { getFilledRequestParams } from 'src/utils/common';
import { clearLRUWorksheetConfig, getLRUWorksheetConfig, saveLRUWorksheetConfig } from 'src/utils/common';
import { formatQuickFilter } from 'src/utils/filter';
import { handleRecordError } from 'src/utils/record';
import { getListStyle, getSheetColumnWidthsMap } from 'src/utils/worksheet';
import { updateNavGroup } from './navFilter.js';

const DEFAULT_PAGESIZE = 50;

function checkIsTreeTableView(state = {}) {
  const { base, views } = state.sheet;
  const view = find(views, { viewId: base.viewId });
  return view && view.viewType === 2 && get(view, 'advancedSetting.hierarchyViewType') === '3';
}

export function updateTreeNodeExpansion(row = {}, { expandAll, forceUpdate } = {}) {
  return (dispatch, getState) => {
    const { base = {}, sheetview = {}, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    const { treeMap, maxLevel } = sheetview.treeTableViewData || {};
    const { rows = [] } = sheetview.sheetViewData || {};
    dispatch(
      handleUpdateTreeNodeExpansion(row, {
        expandAll,
        forceUpdate,
        navGroupFilters,
        appId,
        viewId,
        worksheetId,
        treeMap,
        maxLevel,
        rows,
        updateRows: (...args) => dispatch(updateRows(...args)),
        updateTreeNodeExpansion,
        getNewRows: () =>
          worksheetAjax
            .getFilterRows({
              appId,
              worksheetId,
              viewId,
              searchType: 1,
              filterControls: [],
              kanbanKey: row.rowid,
              navGroupFilters,
            })
            .then(res => res.data),
      }),
    );
  };
}

export const fetchRows = ({
  levelCount,
  isFirst,
  changeView,
  noLoading,
  noClearSelected,
  updateWorksheetControls,
} = {}) => {
  return (dispatch, getState) => {
    const { base, filters, views, sheetview, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId, forcePageSize, maxCount, chartId, showAsSheetView } = base;
    const abortController = sheetview.abortController;
    let savedPageSize = parseInt(getLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', worksheetId), 10);
    if (_.isNaN(savedPageSize)) {
      savedPageSize = undefined;
    }
    let { pageIndex, sortControls } = sheetview.sheetFetchParams;
    if (changeView) {
      pageIndex = 1;
      dispatch(resetView());
    }
    const isTreeTableView = checkIsTreeTableView(getState()) && !filters.keyWords;
    if (isTreeTableView && !levelCount) {
      const { level } = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
      if (level) {
        levelCount = Number(level);
      }
      if (isNaN(levelCount)) {
        levelCount = 1;
      }
      dispatch({
        type: 'UPDATE_TREE_TABLE_VIEW_ITEM',
        value: {
          levelCount,
        },
      });
    }
    const args = {
      worksheetId,
      pageSize: isTreeTableView ? 1000 : savedPageSize || DEFAULT_PAGESIZE,
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
    if (isTreeTableView) {
      args.layer = levelCount;
    }
    if (maxCount) {
      args.pageIndex = 1;
      args.pageSize = maxCount;
    }
    if (forcePageSize) {
      savedPageSize = undefined;
      args.pageSize = forcePageSize;
      dispatch({ type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE', pageSize: forcePageSize, pageIndex: args.pageIndex });
    }
    if (changeView || isFirst) {
      dispatch(setViewLayout(viewId));
    }
    if (savedPageSize && savedPageSize !== DEFAULT_PAGESIZE) {
      dispatch(changePageSize(savedPageSize, args.pageIndex, { refetch: false }));
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_FETCH_ROWS_START',
      value: {
        noLoading,
        noClearSelected,
      },
    });
    dispatch(getWorksheetSheetViewSummary());
    const fetchRowsAjax = worksheetAjax.getFilterRows(getFilledRequestParams(args, filters.requestParams), {
      abortController,
    });
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
      if (isTreeTableView) {
        const { treeMap, maxLevel } = treeDataUpdater(
          {},
          { rootRows: res.data.filter(r => !r.pid), rows: res.data, levelLimit: Number(args.layer) },
        );
        dispatch({
          type: 'UPDATE_TREE_TABLE_VIEW_DATA',
          value: { maxLevel, treeMap },
        });
      }
      if (chartId) {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
          count: res.count,
        });
      }
    });
    if (pageIndex === 1 && !chartId) {
      const fetchRowsNumAjax = worksheetAjax.getFilterRowsTotalNum(getFilledRequestParams(args), { abortController });
      fetchRowsNumAjax.then(data => {
        if (!data || data === '-1') {
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

export function updateViewPermission(param) {
  return (dispatch, getState) => {
    const { base } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    worksheetAjax
      .getViewPermission(
        !_.isEmpty(param)
          ? param
          : {
              appId,
              worksheetId,
              viewId,
            },
      )
      .then(data => {
        if (data.view) {
          dispatch({
            type: 'WORKSHEET_SHEETVIEW_UPDATE_PERMISSION',
            viewId: _.get(param, 'viewId') || viewId,
            value: data.view,
          });
        }
      });
  };
}

export function updateControlOfRow({ cell = {}, cells = [], recordId, rules }, options = {}) {
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
          dispatch(updateRows([recordId], _.omit(res.data, ['allowedit', 'allowdelete'])));
          if (_.isFunction(options.updateSuccessCb)) {
            options.updateSuccessCb(res.data);
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
          if (options.row) {
            dispatch(updateRows([recordId], { [controlId]: value }));
            dispatch(updateRows([recordId], _.omit(options.row, ['allowedit', 'allowdelete'])));
          }
          handleRecordError(res.resultCode, options.cell);
        } else if (res.resultCode === 32) {
          const errorResult = getRuleErrorInfo(rules, res.badData);
          if (_.get(errorResult, '0.errorInfo.0')) {
            alert('编辑失败，' + _.get(errorResult, '0.errorInfo.0.errorMessage'), 2);
          }
        } else {
          handleRecordError(res.resultCode);
        }
      })
      .catch(err => {
        alert(_l('编辑失败！'), 3);
      });
  };
}

export function updateRows(rowIds, value) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS_BY_ROWIDS',
      rowIds,
      rowUpdatedValue: value,
    });
    dispatch(updateNavGroup());
  };
}

export function refresh({
  resetPageIndex,
  changeFilters,
  noLoading,
  isAutoRefresh,
  noClearSelected,
  updateWorksheetControls,
} = {}) {
  return (dispatch, getState) => {
    const {
      sheetview,
      filters,
      quickFilter,
      navGroupFilters,
      views,
      base: { chartId, viewId },
    } = getState().sheet;
    const { allWorksheetIsSelected, sheetSelectedRows = [] } = sheetview.sheetViewConfig;
    if (isAutoRefresh && (allWorksheetIsSelected || sheetSelectedRows.length)) return;
    const view = _.find(views, { viewId });
    const needClickToSearch = !chartId && _.get(view, 'advancedSetting.clicksearch') === '1';
    //设置了筛选列表，且不显示全部，需手动选择分组后展示数据
    const navGroupToSearch =
      !chartId &&
      _.get(view, 'advancedSetting.showallitem') === '1' &&
      !_.get(view, 'navGroup[0].viewId') &&
      _.get(view, 'navGroup').length > 0;
    if (filters.keyWords || resetPageIndex || changeFilters) {
      dispatch(changePageIndex(1));
    }
    if ((needClickToSearch && _.isEmpty(quickFilter)) || (navGroupToSearch && _.isEmpty(navGroupFilters))) {
      dispatch(setRowsEmpty());
    } else {
      dispatch(abortRequest());
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
        $(`${tableId ? `.sheetViewTable.id-${tableId}-id` : '.sheetViewTable'} .cell.row-id-${rowId}`).addClass(
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
      if (checkIsTreeTableView(getState())) {
        rowIds.forEach(rowId => {
          rows.forEach(row => {
            if (row.pid === rowId || includes(row.childrenids, rowId)) {
              const changes = {};
              if (row.pid === rowId) {
                changes.pid = undefined;
              }
              if (includes(row.childrenids, rowId)) {
                changes.childrenids = JSON.stringify(safeParse(row.childrenids, 'array').filter(id => id !== rowId));
              }
              dispatch(updateRows([row.rowid], changes));
            }
          });
        });
        dispatch(refreshTreeOfTreeTableView());
      }
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

export function saveSheetLayout({ isApplyAll, closePopup = () => {} }) {
  return function (dispatch, getState) {
    const { base, controls, views, sheetview, worksheetInfo } = getState().sheet;
    const { appId, worksheetId, viewId } = base;
    const { fixedColumnCount, sheetHiddenColumns, columnStyles, sheetColumnWidths } = sheetview.sheetViewConfig;
    const view = _.find(views, v => v.viewId === viewId);
    if (!view) {
      return;
    }
    const hadNewConfig = get(worksheetInfo, 'advancedSetting.liststyle') || get(view, 'advancedSetting.liststyle');
    const updates = {
      appId,
      worksheetId,
      viewId,
      editAttrs: ['AdvancedSetting'],
    };
    const listStyleStr = JSON.stringify({
      time: Date.now(),
      styles: uniq(Object.keys(columnStyles).concat(!hadNewConfig ? Object.keys(sheetColumnWidths) : [])).map(cid => ({
        cid,
        ...(!hadNewConfig ? { width: sheetColumnWidths[cid] } : {}),
        ...(columnStyles[cid] || {}),
      })),
    });
    updates.advancedSetting = {
      fixedcolumncount: fixedColumnCount,
      layoutupdatetime: new Date().getTime(),
    };
    if (!isApplyAll) {
      updates.advancedSetting.liststyle = listStyleStr;
    }
    if (sheetHiddenColumns.length) {
      updates.editAttrs = updates.editAttrs.concat('ShowControls');
      if (view.advancedSetting.customdisplay === '1' && view.showControls.length) {
        updates.showControls = view.showControls.filter(cid => !_.find(sheetHiddenColumns, hcid => hcid === cid));
      } else {
        updates.advancedSetting.customdisplay = '1';
        updates.showControls = controls
          .filter(
            c =>
              /^\w{24}$/.test(c.controlId) || _.includes(safeParse(view.advancedSetting.sysids, 'array'), c.controlId),
          )
          .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
          .filter(c => (isEmpty(view.showControls) ? true : includes(view.showControls, c.controlId)))
          .filter(c => !_.find(sheetHiddenColumns, hcid => hcid === c.controlId))
          .map(c => c.controlId);
      }
    }
    updates.editAdKeys = Object.keys(updates.advancedSetting);
    dispatch(clearHiddenColumn());
    dispatch({
      type: 'WORKSHEET_UPDATE_VIEW',
      view: {
        ...view,
        ...updates,
        advancedSetting: {
          ...view.advancedSetting,
          ...updates.advancedSetting,
        },
      },
    });
    closePopup();
    worksheetAjax
      .saveWorksheetView(updates)
      .then(() => {})
      .catch(err => {
        alert(_l('保存表格外观失败！'), 3);
        console.log(err);
      });
    if (isApplyAll) {
      worksheetAjax
        .editWorksheetSetting({
          appId,
          worksheetId,
          editAdKeys: ['liststyle'],
          advancedSetting: {
            liststyle: listStyleStr,
          },
        })
        .then(() => {
          dispatch({
            type: 'WORKSHEET_UPDATE_WORKSHEETINFO',
            info: {
              advancedSetting: {
                ...worksheetInfo.advancedSetting,
                liststyle: listStyleStr,
              },
            },
          });
          clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', viewId);
        });
    }
  };
}

export function resetSheetLayout() {
  return function (dispatch, getState) {
    const { base, views, worksheetInfo } = getState().sheet;
    const { viewId } = base;
    const view = _.find(views, v => v.viewId === viewId);
    if (!view) {
      return;
    }
    const { advancedSetting = {} } = view;
    dispatch(clearHiddenColumn());
    dispatch(frozenColumn(Number(advancedSetting.fixedcolumncount || 0)));
    saveLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId, advancedSetting.fixedcolumncount || 0);
    clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId);
    clearLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    const { map: sheetColumnWidthsMap } = getSheetColumnWidthsMap(view, worksheetInfo);
    dispatch({ type: 'WORKSHEET_SHEETVIEW_INIT_COLUMN_WIDTH', value: sheetColumnWidthsMap });
    clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', viewId);
    dispatch(setColumnStyles(view, worksheetInfo));
  };
}

export const updateDefaultScrollLeft = value => ({
  type: 'WORKSHEET_SHEETVIEW_UPDATE_SCROLL_LEFT',
  value,
});

// 更新每页数量
export function changePageSize(pageSize, pageIndex, { refetch = true } = {}) {
  return function (dispatch, getState) {
    const { base } = getState().sheet;
    saveLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', base.worksheetId, pageSize);
    dispatch({ type: 'WORKSHEET_SHEETVIEW_CHANGE_PAGESIZE', pageSize, pageIndex });
    if (refetch) {
      dispatch(fetchRows());
    }
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

/**
 * 整理逻辑，重写这里
 * 列冻结，列隐藏，列宽，对齐方式
 * 老配置-本地：列冻结 fixedcolumncount，列宽 sheetcolumnwidths，更新时间 layoutupdatetime
 * 新配置-本地：列宽(和对齐方式) - liststyle，列冻结 fixedcolumncount，更新时间 layoutupdatetime
 */

export function setViewLayout(viewId) {
  // pageSize 更新逻辑
  return (dispatch, getState) => {
    const { views, worksheetInfo } = getState().sheet;
    const view = _.find(views, { viewId });
    if ((!view || view.viewType !== 0) && !checkIsTreeTableView(getState())) {
      return;
    }
    dispatch(setColumnStyles(view, worksheetInfo, { updateWidths: false }));
    const { advancedSetting = {} } = view || {};
    let sheetColumnWidths = {};
    const localLayoutUpdateTime = getLRUWorksheetConfig('SHEET_LAYOUT_UPDATE_TIME', viewId);
    const pageSize = parseInt(getLRUWorksheetConfig('WORKSHEET_VIEW_PAGESIZE', worksheetInfo.worksheetId), 10);
    let frozonIndex = getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId);
    /**
     * sheetColumnWidths 逻辑
     * 1. 老表，取本地 width
     * 2. 新表本地新，取本地 styles
     * 3. 新表配置新，取配置 styles
     */
    try {
      // 默认给了旧配置本地
      sheetColumnWidths = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_WIDTH', viewId));
    } catch (err) {}
    // advancedSetting 内属性名需为全小写 兼容老数据
    if (advancedSetting.layoutUpdateTime) advancedSetting.layoutupdatetime = advancedSetting.layoutUpdateTime;
    if (advancedSetting.fixedColumnCount) advancedSetting.fixedcolumncount = advancedSetting.fixedColumnCount;
    if (advancedSetting.sheetColumnWidths) advancedSetting.sheetcolumnwidths = advancedSetting.sheetColumnWidths;

    const { time: listStyleUpdateTime, map: sheetColumnWidthsMap } = getSheetColumnWidthsMap(view, worksheetInfo);
    const localColumnStyles = JSON.parse(
      (view && getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', view.viewId)) || '{}',
    );
    // sheetColumnWidthsMap 是配置的数据，view 和 worksheet 取最新的那个
    if (sheetColumnWidthsMap) {
      if (localColumnStyles && localColumnStyles.time > listStyleUpdateTime) {
        // 本地样式配置时间比配置里的新
        sheetColumnWidths = mapValues(localColumnStyles.styles, 'width');
      } else {
        sheetColumnWidths = sheetColumnWidthsMap;
      }
    }
    if (localColumnStyles.time && listStyleUpdateTime && listStyleUpdateTime > localColumnStyles.time) {
      clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', view.viewId);
    }
    // 兼容老数据
    if (
      advancedSetting.layoutupdatetime &&
      (!localLayoutUpdateTime || Number(advancedSetting.layoutupdatetime) > Number(localLayoutUpdateTime))
    ) {
      if (advancedSetting.fixedcolumncount) {
        frozonIndex = Number(advancedSetting.fixedcolumncount);
        clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_FROZON', viewId);
      }
      if (!sheetColumnWidthsMap && advancedSetting.sheetcolumnwidths) {
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

function columnStylesMergeChanges(columnStyles = {}, changes = {}) {
  const newChanges = { ...changes };
  Object.keys(changes).forEach(cid => {
    if (columnStyles[cid]) {
      newChanges[cid] = assign({}, columnStyles[cid], changes[cid]);
    }
  });
  return assign({}, columnStyles, newChanges);
}

export function setColumnStyles(view, worksheetInfo, { updateWidths = true } = {}) {
  return (dispatch, getState) => {
    const listStyleStrOfWorksheet = get(worksheetInfo, 'advancedSetting.liststyle');
    const listStyleStrOfView = get(view, 'advancedSetting.liststyle');
    if (!listStyleStrOfView && !listStyleStrOfWorksheet) return;
    const { time, styles } = getListStyle(listStyleStrOfView, listStyleStrOfWorksheet);
    let columnStyles = styles.reduce((a, b) => Object.assign({}, a, { [b.cid]: b }), {});
    const localColumnStyles = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', view.viewId) || '{}');
    if (localColumnStyles.time && localColumnStyles.time > time) {
      columnStyles = assign({}, columnStyles, localColumnStyles.styles);
    } else if (time > localColumnStyles.time) {
      clearLRUWorksheetConfig('WORKSHEET_VIEW_COLUMN_STYLES', view.viewId);
    }
    if (updateWidths) {
      const sheetColumnWidths = _.mapValues(columnStyles, item => item.width);
      dispatch({ type: 'WORKSHEET_SHEETVIEW_INIT_COLUMN_WIDTH', value: sheetColumnWidths });
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_UPDATE_COLUMN_STYLES',
      value: columnStyles,
    });
  };
}

export function updateColumnStyles(changes) {
  return (dispatch, getState) => {
    const { sheetview } = getState().sheet;
    const { columnStyles } = sheetview.sheetViewConfig;
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_UPDATE_COLUMN_STYLES',
      value: columnStylesMergeChanges(columnStyles, changes),
    });
  };
}

export function saveColumnStylesToLocal(changes) {
  return (dispatch, getState) => {
    const { sheetview, base } = getState().sheet;
    const viewId = get(base, 'viewId');
    if (viewId) {
      const columnStyles = get(sheetview, 'sheetViewConfig.columnStyles');
      const newColumnStyles = columnStylesMergeChanges(columnStyles, changes);
      saveLRUWorksheetConfig(
        'WORKSHEET_VIEW_COLUMN_STYLES',
        viewId,
        JSON.stringify({
          time: Date.now(),
          styles: newColumnStyles,
        }),
      );
    }
  };
}

export function getWorksheetSheetViewSummary({ reset = false } = {}) {
  return (dispatch, getState) => {
    const { base, sheetview, filters, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId, chartId } = base;
    const { rowsSummary } = sheetview.sheetViewData;
    const configData = mapValues(sheetview.sheetViewConfig.columnStyles, 'report');
    let savedData = {};
    try {
      savedData = JSON.parse(getLRUWorksheetConfig('WORKSHEET_VIEW_SUMMARY_TYPES', viewId));
    } catch (err) {}
    let types = Object.assign(
      savedData,
      reset ? configData : pickBy(configData, identity),
      reset ? {} : rowsSummary.types,
    );
    if (reset) {
      types = mapValues(types, v => v || 0);
    }
    const columnRpts = Object.keys(types).map(controlId => ({
      controlId,
      rptType: parseInt(types[controlId], 10),
    }));
    if (!columnRpts.length) {
      return;
    }
    worksheetAjax
      .getFilterRowsReport(
        getFilledRequestParams({
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
        }),
      )
      .then(data => {
        dispatch({
          type: 'WORKSHEET_SHEETVIEW_FETCH_REPORT_SUCCESS',
          types: types,
          values:
            data && data.length ? [{}, ...data].reduce((a, b) => Object.assign({}, a, { [b.controlId]: b.value })) : {},
        });
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
    const state = getState();
    const { sheetview, base = {}, views = [], controls = [] } = state.sheet;
    const { worksheetId, viewId } = base;
    const { rows, count } = sheetview.sheetViewData;
    if (!_.isArray(records)) {
      records = [records];
    }
    dispatch({
      type: 'WORKSHEET_SHEETVIEW_UPDATE_COUNT',
      count: count + records.length,
    });
    dispatch(getWorksheetSheetViewSummary());
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
    const view = find(views, { viewId });
    const viewControl = view.viewControl;
    function expand() {
      const childrenControl = find(controls, c => c.sourceControlId === viewControl);
      dispatch(
        refreshTreeOfTreeTableView(({ treeMap = {} } = {}) => {
          const keyOfRow = findKey(treeMap, value => _.get(value, 'rowid') === get(records, '0.rowid'));
          if (get(records, '0.' + childrenControl.controlId)) {
            dispatch(updateTreeNodeExpansion(Object.assign(records[0], { key: keyOfRow }), { forceUpdate: true }));
          }
        }),
      );
    }
    if (checkIsTreeTableView(getState())) {
      try {
        const parentRecordId = get(safeParse(get(records, '0.' + viewControl)), '0.sid');
        if (parentRecordId && !find(rows, { rowid: parentRecordId })) {
          getRowDetail({
            worksheetId,
            getType: 1,
            rowId: parentRecordId,
          }).then(data => {
            dispatch({
              type: 'WORKSHEET_SHEETVIEW_UPDATE_ROWS',
              rows: [safeParse(data.rowData), ...records, ...rows],
              count: count + 2,
            });
            expand();
          });
        } else {
          expand();
        }
      } catch (err) {}
    }
  };
}

/**
 * 修改树形表格展开层级
 * @param {number} levelCount
 * @returns
 */
export function changeTreeTableViewLevelCount(levelCount) {
  return dispatch => {
    dispatch(fetchRows({ levelCount }));
    dispatch({
      type: 'UPDATE_TREE_TABLE_VIEW_ITEM',
      value: {
        levelCount,
      },
    });
  };
}

/**
 * 展开所有节点
 */
export function expandAllTreeTableViewNode() {
  return (dispatch, getState) => {
    const { sheetview = {} } = getState().sheet;
    const { rows = [] } = sheetview.sheetViewData || {};
    const { treeMap } = sheetview.treeTableViewData || {};
    const needLoadNodes = Object.keys(treeMap)
      .filter(key => treeMap[key].folded)
      .map(key => treeMap[key]);
    needLoadNodes.forEach(needLoadNode => {
      const row = find(rows, { rowid: needLoadNode.rowid });
      if (row) {
        dispatch(updateTreeNodeExpansion({ ...row, key: needLoadNode.key }, { expandAll: true }));
      }
    });
  };
}

/**
 * 收起所有节点
 */
export function collapseAllTreeTableViewNode() {
  return (dispatch, getState) => {
    const { sheetview = {} } = getState().sheet;
    const { treeMap } = sheetview.treeTableViewData || {};
    dispatch({
      type: 'UPDATE_TREE_TABLE_VIEW_ITEM',
      value: {
        treeMap: _.mapValues(treeMap, function (value) {
          return { ...value, folded: true };
        }),
      },
    });
  };
}

/**
 * 重新渲染树
 */
export function refreshTreeOfTreeTableView(cb = () => {}) {
  return (dispatch, getState) => {
    const { sheetview = {} } = getState().sheet;
    const oldTreeMap = get(sheetview, 'treeTableViewData.treeMap');
    const { rows = [] } = sheetview.sheetViewData || {};
    const { treeMap, maxLevel } = treeDataUpdater({}, { rootRows: rows.filter(r => !r.pid), rows });
    dispatch({
      type: 'UPDATE_TREE_TABLE_VIEW_DATA',
      value: {
        maxLevel,
        treeMap: forEach(treeMap, (value, key) => {
          try {
            treeMap[key].folded = get(oldTreeMap, key + '.folded');
          } catch (err) {
            console.log(err);
          }
        }),
      },
    });
    cb({ treeMap });
  };
}

export function updateTreeByRowChange({ recordId, changedValue = {} } = {}) {
  return (dispatch, getState) => {
    const { base, views, sheetview = {} } = getState().sheet;
    const { rows = [] } = sheetview.sheetViewData || {};
    const { treeMap } = sheetview.treeTableViewData || {};
    const { viewId } = base;
    const view = find(views, v => v.viewId === viewId) || {};
    const treeBaseControl = view.viewControl;
    if (!treeBaseControl) {
      return;
    }
    const row = find(rows, { rowid: recordId });
    const oldParentRecordId = get(safeParse(get(row, view.viewControl)), '0.sid');
    const newParentRecordId = get(safeParse(get(changedValue, view.viewControl)), '0.sid');
    const oldParentRow = find(rows, { rowid: oldParentRecordId });
    const newParentRow = find(rows, { rowid: newParentRecordId });
    dispatch(
      updateRows([recordId], {
        pid: newParentRecordId,
      }),
    );
    if (oldParentRow) {
      Object.keys(treeMap)
        .filter(key => new RegExp(oldParentRecordId + '$').test(key))
        .forEach(key => {
          dispatch(updateTreeNodeExpansion({ ...oldParentRow, key }, { forceUpdate: true }));
        });
    }
    if (newParentRow) {
      Object.keys(treeMap)
        .filter(key => new RegExp(newParentRecordId + '$').test(key))
        .forEach(key => {
          dispatch(updateTreeNodeExpansion({ ...newParentRow, key }, { forceUpdate: true }));
        });
    }
  };
}

export const initAbortController = () => ({
  type: 'WORKSHEET_SHEETVIEW_INIT_ABORT_CONTROLLER',
});

export function abortRequest(cb = () => {}) {
  return (dispatch, getState) => {
    const abortController = get(getState(), 'sheet.sheetview.abortController');
    if (abortController) {
      abortController.abort();
      dispatch(initAbortController());
    }
  };
}
