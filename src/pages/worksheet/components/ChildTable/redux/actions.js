import { saveAs } from 'file-saver';
import _, { find, get, includes, isFunction, isString, omit, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import { handleUpdateTreeNodeExpansion, treeDataUpdater } from 'worksheet/common/TreeTableHelper';
import { postWithToken } from 'src/utils/common';
import { filterEmptyChildTableRows, handleSortRows } from 'src/utils/record';

const PAGE_SIZE = 200;

export function updateTreeNodeExpansion(
  row = {},
  { expandAll, forceUpdate, getNewRows, updateRows, worksheetId, recordId } = {},
) {
  return (dispatch, getState) => {
    const { base = {}, rows = [], treeTableViewData } = getState();
    const { control, instanceId, workId } = base;
    const { treeMap, maxLevel } = treeTableViewData;
    const getNewRowsFn =
      getNewRows ||
      (() =>
        worksheetAjax
          .getRowRelationRows({
            worksheetId,
            rowId: recordId,
            controlId: control.controlId,
            pageIndex: 1,
            pageSize: 200,
            fastFilters: [
              {
                controlId: 'rowid',
                value: row.rowid,
              },
            ],
            instanceId,
            workId,
          })
          .then(res => {
            const newRows = res.data.map(r => ({
              ...r,
              isAddByTree: true,
            }));
            dispatch(addRows(newRows));
            return newRows;
          }));
    dispatch(
      handleUpdateTreeNodeExpansion(row, {
        expandAll,
        forceUpdate,
        treeMap,
        maxLevel,
        rows,
        getNewRows: getNewRowsFn,
        isAddsSubTree: true,
        updateRows,
      }),
    );
  };
}

export function updateBase(changes = {}) {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch({
      type: 'UPDATE_BASE',
      value: { ...base, ...changes },
    });
  };
}

export const initRows = rows => ({ type: 'INIT_ROWS', rows });

export const updateTreeTableViewData = () => (dispatch, getState) => {
  const { base, rows } = getState();
  if (!base.isTreeTableView) {
    return;
  }
  const { treeMap, maxLevel } = treeDataUpdater({}, { rootRows: rows.filter(r => !r.pid), rows: rows, levelLimit: 20 });
  dispatch({
    type: 'UPDATE_TREE_TABLE_VIEW_DATA',
    value: { maxLevel, treeMap },
  });
};

export const resetRows = () => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch(initRows(getState().originRows));
    if (base.reset && !base.loaded) {
      dispatch({ type: 'RESET' });
    } else {
      dispatch({ type: 'RESET_TREE' });
    }
    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

export const clearRows = () => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch(initRows([]));
    if (base.reset && !base.loaded) {
      dispatch({ type: 'RESET' });
    }
    return Promise.resolve();
  };
};

export const updateCellErrors = errors => {
  return {
    type: 'UPDATE_CELL_ERRORS',
    value: errors || {},
  };
};

function getChangesControlIds(oldRow, newRow, controls) {
  if (!oldRow || !newRow) {
    return [];
  }
  const ids = oldRow.updatedControlIds || [];
  controls
    .map(c => c.controlId)
    .forEach(key => {
      if (key.length === 24) {
        if (oldRow[key] !== newRow[key]) {
          ids.push(key);
        }
      }
    });
  return ids;
}

export const clearAndSetRows = (
  rows,
  { isSetValueFromEvent = false, isSetValueFromRule = false, controls = [] } = {},
) => {
  return (dispatch, getState) => {
    const oldRows = getState().rows;
    let newRows = rows;
    let deleted = oldRows.map(r => r.rowid);
    if (isSetValueFromEvent) {
      deleted = oldRows.filter(oldRow => !find(rows, r => r.rowid === oldRow.rowid)).map(r => r.rowid);
      newRows = newRows.map(row => ({
        ...row,
        updatedControlIds: getChangesControlIds(
          find(oldRows, r => r.rowid === row.rowid),
          row,
          controls,
        ),
      }));
    }
    dispatch({ type: 'CLEAR_AND_SET_ROWS', isSetValueFromEvent, isSetValueFromRule, rows: newRows, deleted });
  };
};

export const setOriginRows = rows => ({ type: 'LOAD_ROWS', rows });

export const addRow = (row, insertRowId) => (dispatch, getState) => {
  dispatch({ type: 'ADD_ROW', row: omit(row, 'needShowLoading'), rowid: row.rowid, insertRowId });
  dispatch(updateTreeTableViewData());
  dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') + 1 }));
};

export const deleteRow = rowid => (dispatch, getState) => {
  const { cellErrors = {} } = getState();
  dispatch({ type: 'UPDATE_CELL_ERRORS', value: _.omitBy(cellErrors, (value, key) => key.includes(rowid)) });
  dispatch({ type: 'DELETE_ROW', rowid });
  dispatch(updateTreeTableViewData());
  dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') - 1 }));
};

export const deleteRows =
  (rowIds, { useUserPermission } = {}) =>
  (dispatch, getState) => {
    const { rows } = getState();
    const filteredRowIds = rowIds.filter(rowId => {
      const row = find(rows, r => r.rowid === rowId);
      return row && (useUserPermission ? row.allowdelete : true);
    });
    if (filteredRowIds.length === 0) {
      return;
    }
    dispatch({ type: 'DELETE_ROWS', rowIds: filteredRowIds });
    dispatch(updateTreeTableViewData());
  };

export const updateRow = ({ rowid, value }, { asyncUpdate, noRealUpdate } = {}) => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ROW',
      asyncUpdate,
      rowid,
      noRealUpdate,
      value: { ...value, empty: false },
    });
    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

export const updateRows = ({ rowIds, value }, { asyncUpdate, noRealUpdate } = {}) => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ROWS',
      asyncUpdate,
      rowIds,
      noRealUpdate,
      value: { ...value, empty: false },
    });
    dispatch(updateTreeTableViewData());
    return Promise.resolve();
  };
};

async function batchLoadRows(args) {
  let rows = [];
  let total;
  let res;
  let noMore = false;
  while ((_.isUndefined(total) || rows.length < total) && !noMore) {
    res = await worksheetAjax.getRowRelationRows(args);
    rows = rows.concat(res.data || []).map((row, i) => ({ ...row, addTime: i }));
    if (!total) {
      total = res.count;
    }
    if (res.data.length === 0) {
      noMore = true;
    }
    args.pageIndex += 1;
  }
  return {
    res,
    rows: rows.slice(0, 1000),
  };
}

export const loadRows = ({
  worksheetId,
  recordId,
  controlId,
  pageIndex = 1,
  getWorksheet,
  from,
  isTreeTableView,
  setLoadingInfo,
  callback = () => {},
}) => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    const { instanceId, workId, control } = base;

    const isWorkflow = (instanceId && workId) || get(window, 'shareState.isPublicWorkflowRecord');
    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: PAGE_SIZE,
      getType: from === 21 ? from : undefined,
      instanceId,
      workId,
      discussId: control.discussId,
    };
    batchLoadRows(args)
      .then(batchRes => {
        const { res, rows } = batchRes;
        dispatch(updatePagination({ count: res.count }));
        dispatch({ type: 'LOAD_ROWS', rows });
        dispatch({ type: 'UPDATE_DATA_LOADING', value: false });
        dispatch(initRows(rows));
        if (isTreeTableView) {
          const { treeMap, maxLevel } = treeDataUpdater(
            {},
            { rootRows: rows.filter(r => typeof r.pid !== 'undefined' && !r.pid), rows: rows, levelLimit: 5 },
          );
          dispatch({
            type: 'UPDATE_TREE_TABLE_VIEW_DATA',
            value: { maxLevel, treeMap },
          });
        }
        dispatch({ type: 'LOAD_ROWS_COMPLETE' });
        if (isWorkflow && isFunction(setLoadingInfo)) {
          setLoadingInfo('loadRows_' + controlId, false);
        }
        callback(res);
      })
      .catch(() => {
        callback(null);
      });
  };
};

// 分页加载数据
export const loadPageRows =
  ({ worksheetId, recordId, controlId, getWorksheet, from, callback = () => {} }) =>
  (dispatch, getState) => {
    const { base = {}, pagination = {} } = getState();
    const { instanceId, workId } = base;
    const { pageIndex, pageSize } = pagination;

    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: pageSize || PAGE_SIZE,
      getType: from === 21 ? from : undefined,
      instanceId,
      workId,
    };

    // 表格形态手动分页加载
    worksheetAjax.getRowRelationRows(args).then(res => {
      dispatch({ type: 'LOAD_ROWS', rows: res.data || [] });
      dispatch({ type: 'UPDATE_DATA_LOADING', value: false });
      dispatch(initRows(res.data || []));
      callback(res);
    });
  };

export const addRows =
  (rows, options = {}) =>
  (dispatch, getState) => {
    dispatch({ type: 'ADD_ROWS', rows: rows.map(row => omit(row, 'needShowLoading')), ...options });
    dispatch(updateTreeTableViewData());
    dispatch(updatePagination({ count: _.get(getState(), 'pagination.count') + rows.length }));
  };

export const sortRows = ({ control, isAsc }) => {
  return (dispatch, getState) => {
    const { rows } = getState();
    dispatch({ type: 'INIT_ROWS', rows: handleSortRows(rows, control, isAsc) });
  };
};

export const exportSheet = ({
  worksheetId,
  rowId,
  controlId,
  clientId,
  fileName,
  filterControls = [],
  onDownload = () => {},
} = {}) => {
  return async () => {
    try {
      const resData = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/ExportExcel/DetailTable`,
        { worksheetId, tokenType: 8 },
        {
          worksheetId,
          rowId,
          controlId,
          filterControls,
          pageIndex: 1,
          pageSize: 10000,
          clientId,
        },
        {
          responseType: 'blob',
        },
      );
      onDownload();
      saveAs(resData, fileName || resData.name || 'file');
    } catch (err) {
      onDownload(err);
      alert(_l('导出失败！请稍候重试'), 2);
    }
  };
};

export const updatePagination = pagination => dispatch => {
  dispatch({ type: 'UPDATE_PAGINATION', pagination });
};

class RowData {
  constructor(args = {}) {
    this.args = args;
    this.init();
  }
  init() {
    const {
      requestPool,
      recordId,
      projectId,
      row,
      abortController,
      masterData,
      controls = [],
      searchConfig,
      isCreate = false,
      isQueryWorksheetFill = false,
      DataFormat,
    } = this.args;
    if (get(row, 'updatedControlIds')) {
      this.updatedControlIds = get(row, 'updatedControlIds');
    }
    this.handleAsyncChange = this.handleAsyncChange.bind(this);
    this.formData = new DataFormat({
      requestPool,
      data: controls.map(c => {
        let controlValue = (row || {})[c.controlId];
        if (_.isUndefined(controlValue) && (isCreate || !row)) {
          controlValue = c.value;
        }
        return {
          ...c,
          isSubList: true,
          isQueryWorksheetFill,
          value: controlValue,
        };
      }),
      isCreate: isCreate || !row,
      from: 2,
      // rules, // 批量赋值不需要业务规则
      searchConfig,
      projectId,
      masterData,
      abortController,
      masterRecordRowId: recordId,
      onAsyncChange: this.handleAsyncChange,
    });
    this.addTime = new Date().getTime();
  }
  handleAsyncChange(changes) {
    const { controls, updateRow } = this.args;
    const { controlId, value } = changes;
    this.formData.updateDataSource({ controlId, value });
    let updatedControlIds = this.formData.controlIds.concat('rowid');
    updatedControlIds = updatedControlIds.concat(
      controls.filter(c => includes([30, 31, 32], c.type) && includes(c.dataSource, controlId)).map(c => c.controlId),
    );
    updateRow(pick(this.getRow(), updatedControlIds));
  }
  getRow() {
    const { rowId, allowEdit } = this.args;
    const rowOfFormData = [
      {
        updatedControlIds: _.uniqBy(this.updatedControlIds || []).concat(this.formData.getUpdateControlIds()),
      },
      ...this.formData.getDataSource(),
    ].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
    return {
      ...rowOfFormData,
      rowid: rowId,
      allowedit: allowEdit,
      addTime: this.addTime,
    };
  }
}

export function setRowsFromStaticRows({
  recordId,
  masterData,
  staticRows = [],
  abortController,
  type,
  allowEdit = true,
  isDefaultValue = true,
  isQueryWorksheetFill = true,
  isSetValueFromEvent = false,
  isSetValueFromRule = false,
  triggerSubListControlValueChange = () => {},
} = {}) {
  return (getState, dispatch, DataFormat) => {
    const { base = {} } = getState();
    const { controls, projectId, searchConfig, initRowIsCreate, max } = base;
    const requestPool = createRequestPool({
      abortController: abortController || (typeof AbortController !== 'undefined' && new AbortController()),
      maxConcurrentRequests: 6,
    });
    const rows = (!max ? staticRows : staticRows.slice(0, max)).map(staticRow => {
      let tempRowId;
      if (/^public-/.test(staticRow.rowid)) {
        tempRowId = staticRow.rowid.replace('public-', '');
      } else if (isSetValueFromEvent) {
        if (!staticRow.rowid) {
          tempRowId = `temp-${uuidv4()}`;
        } else {
          tempRowId = staticRow.rowid;
        }
      } else {
        tempRowId = !isDefaultValue
          ? `temp-${uuidv4()}`
          : includes(staticRow.rowid, 'temp-')
            ? staticRow.rowid.replace('temp-', 'default-')
            : /^default-/.test(staticRow.rowid)
              ? staticRow.rowid
              : `default-${uuidv4()}`;
      }
      Object.keys(staticRow).forEach(key => {
        if (isString(staticRow[key]) && includes(staticRow[key], '"sid":"temp-')) {
          staticRow[key] = staticRow[key].replace('"sid":"temp-', `"sid":"default-`);
        }
      });
      const createRowArgs = {
        requestPool,
        recordId,
        projectId,
        abortController,
        row: staticRow,
        masterData,
        rowId: tempRowId,
        controls,
        searchConfig,
        isDefaultValue,
        isQueryWorksheetFill,
        allowEdit,
        isCreate:
          (!!recordId ||
            (!_.isUndefined(staticRow.initRowIsCreate)
              ? staticRow.initRowIsCreate
              : !_.isUndefined(initRowIsCreate)
                ? initRowIsCreate
                : true)) &&
          !isSetValueFromEvent,
        updateRow: row => {
          dispatch({
            type: 'UPDATE_ROW',
            rowid: row.rowid,
            value: row,
          });
          // setTimeout(() => {
          //   triggerSubListControlValueChange();
          // }, 100);
        },
        DataFormat,
      };
      const rowData = new RowData(createRowArgs);
      return _.assign(rowData.getRow(), {
        pid: (get(staticRow, 'pid') || '').replace('temp-', 'default-'),
        childrenids: (get(staticRow, 'childrenids') || '').replace(/temp-/g, 'default-'),
      });
    });
    if (type === 'append') {
      dispatch(addRows(rows));
      triggerSubListControlValueChange({
        action: 'append',
        isDefault: true,
        rows: filterEmptyChildTableRows(getState().rows),
      });
    } else {
      dispatch(clearAndSetRows(rows, { isSetValueFromEvent, isSetValueFromRule, controls }));
      triggerSubListControlValueChange({
        action: 'clearAndSet',
        isDefault: true,
        rows: filterEmptyChildTableRows(getState().rows),
      });
      dispatch(updateTreeTableViewData());
    }
  };
}
