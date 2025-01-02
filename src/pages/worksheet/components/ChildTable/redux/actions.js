import { v4 as uuidv4 } from 'uuid';
import {
  handleSortRows,
  postWithToken,
  download,
  filterEmptyChildTableRows,
  getRelateRecordCountOfControlFromRow,
} from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import _, { find, get, includes, isString, pick } from 'lodash';
import { treeDataUpdater, handleUpdateTreeNodeExpansion } from 'worksheet/common/TreeTableHelper';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { createRequestPool } from 'worksheet/api/standard';

const PAGE_SIZE = 200;

export function updateTreeNodeExpansion(
  row = {},
  { expandAll, forceUpdate, getNewRows, updateRows, worksheetId, recordId } = {},
) {
  return (dispatch, getState) => {
    const { base = {}, rows = [], treeTableViewData } = getState();
    const { control } = base;
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
  const { treeMap, maxLevel } = treeDataUpdater({}, { rootRows: rows.filter(r => !r.pid), rows: rows, levelLimit: 10 });
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

export const clearAndSetRows = rows => {
  return (dispatch, getState) => {
    dispatch({ type: 'CLEAR_AND_SET_ROWS', rows, deleted: getState().rows.map(r => r.rowid) });
  };
};

export const setOriginRows = rows => ({ type: 'LOAD_ROWS', rows });

export const addRow = (row, insertRowId) => (dispatch, getState) => {
  dispatch({ type: 'ADD_ROW', row, rowid: row.rowid, insertRowId });
  dispatch(updateTreeTableViewData());
};

export const deleteRow = rowid => (dispatch, getState) => {
  const { cellErrors = {} } = getState();
  dispatch({ type: 'UPDATE_CELL_ERRORS', value: _.omitBy(cellErrors, (value, key) => key.includes(rowid)) });
  dispatch({ type: 'DELETE_ROW', rowid });
  dispatch(updateTreeTableViewData());
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

async function batchLoadRows(args) {
  let rows = [];
  let total, res;
  while (_.isUndefined(total) || rows.length < total) {
    res = await worksheetAjax.getRowRelationRows(args);
    rows = rows.concat(res.data || []).map((row, i) => ({ ...row, addTime: i }));
    if (!total) {
      total = res.count;
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
  isCustomButtonFillRecord,
  controlId,
  pageIndex = 1,
  getWorksheet,
  from,
  isTreeTableView,
  callback = () => {},
}) => {
  return (dispatch, getState) => {
    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: PAGE_SIZE,
      getType: from === 21 ? from : undefined,
    };
    batchLoadRows(args)
      .then(batchRes => {
        const { res, rows } = batchRes;
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
        callback(res);
      })
      .catch(err => {
        callback(null);
      });
  };
};

export const addRows =
  (rows, options = {}) =>
  dispatch => {
    dispatch({ type: 'ADD_ROWS', rows, ...options });
    dispatch(updateTreeTableViewData());
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
  fileName,
  filterControls = [],
  onDownload = () => {},
} = {}) => {
  return async () => {
    try {
      const res = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/ExportExcel/DetailTable`,
        { worksheetId, tokenType: 8 },
        {
          worksheetId,
          rowId,
          controlId,
          filterControls,
          pageIndex: 1,
          pageSize: 10000,
        },
        {
          responseType: 'blob',
        },
      );
      onDownload();
      download(res.data, fileName);
    } catch (err) {
      onDownload(err);
      alert(_l('导出失败！请稍候重试'), 2);
    }
  };
};

class RowData {
  constructor(args = {}, options = {}) {
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
  isCreate,
  isDefaultValue = true,
  isQueryWorksheetFill = true,
  triggerSubListControlValueChange = () => {},
} = {}) {
  return (getState, dispatch) => {
    const { base = {} } = getState();
    const { controls, projectId, searchConfig, initRowIsCreate, max } = base;
    const requestPool = createRequestPool({
      abortController: abortController || (typeof AbortController !== 'undefined' && new AbortController()),
      maxConcurrentRequests: 6,
    });
    const rows = (!max ? staticRows : staticRows.slice(0, max)).map(staticRow => {
      const tempRowId = !isDefaultValue
        ? `temp-${uuidv4()}`
        : includes(staticRow.rowid, 'temp-')
        ? staticRow.rowid.replace('temp-', 'default-')
        : /^default-/.test(staticRow.rowid)
        ? staticRow.rowid
        : `default-${uuidv4()}`;
      Object.keys(staticRow).forEach(key => {
        if (isString(staticRow[key]) && includes(staticRow[key], '"sid":"temp-')) {
          staticRow[key] = staticRow[key].replace('"sid":"temp-', `\"sid\":\"default-`);
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
          !!recordId ||
          (!_.isUndefined(staticRow.initRowIsCreate)
            ? staticRow.initRowIsCreate
            : !_.isUndefined(initRowIsCreate)
            ? initRowIsCreate
            : true),
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
      dispatch(clearAndSetRows(rows));
      triggerSubListControlValueChange({
        action: 'clearAndSet',
        isDefault: true,
        rows: filterEmptyChildTableRows(getState().rows),
      });
      dispatch(updateTreeTableViewData());
    }
  };
}
