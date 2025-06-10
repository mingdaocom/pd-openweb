import { saveAs } from 'file-saver';
import _, { get, includes, isString, omit, pick } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import worksheetAjax from 'src/api/worksheet';
import { createRequestPool } from 'worksheet/api/standard';
import { postWithToken } from 'src/utils/common';
import { handleSortRows } from 'src/utils/record';
import { filterEmptyChildTableRows } from 'src/utils/record';

const PAGE_SIZE = 200;

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

export const resetRows = () => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    dispatch(initRows(getState().originRows));
    if (base.reset && !base.loaded) {
      dispatch({ type: 'RESET' });
    }
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

export const addRow = (row, insertRowId) => (dispatch, getState) => {
  const { pagination } = getState();
  dispatch({ type: 'UPDATE_PAGINATION', pagination: { count: pagination.count + 1 } });
  dispatch({ type: 'ADD_ROW', row: omit(row, 'needShowLoading'), rowid: row.rowid, insertRowId });
};

export const deleteRow = rowid => (dispatch, getState) => {
  const { cellErrors = {}, pagination } = getState();
  dispatch({ type: 'UPDATE_CELL_ERRORS', value: _.omitBy(cellErrors, (value, key) => key.includes(rowid)) });
  dispatch({ type: 'UPDATE_PAGINATION', pagination: { count: pagination.count - 1 } });
  dispatch({ type: 'DELETE_ROW', rowid });
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
  controlId,
  pageIndex = 1,
  getWorksheet,
  from,
  pageSize,
  callback = () => {},
}) => {
  return (dispatch, getState) => {
    const { base = {} } = getState();
    const { instanceId, workId } = base;

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

    batchLoadRows(args)
      .then(batchRes => {
        const { res, rows } = batchRes;
        dispatch({ type: 'UPDATE_PAGINATION', pagination: { count: res.count } });
        dispatch({ type: 'LOAD_ROWS', rows });
        dispatch({ type: 'UPDATE_DATA_LOADING', value: false });
        dispatch(initRows(rows));
        callback(res);
      })
      .catch(err => {
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

export const sortRows = ({ control, isAsc }) => {
  return (dispatch, getState) => {
    const { rows } = getState();
    dispatch({ type: 'INIT_ROWS', rows: handleSortRows(rows, control, isAsc) });
  };
};

export const addRows =
  (rows, options = {}) =>
  (dispatch, getState) => {
    const { pagination } = getState();
    dispatch({ type: 'UPDATE_PAGINATION', pagination: { count: pagination.count + rows.length } });
    dispatch({ type: 'ADD_ROWS', rows: rows.map(row => omit(row, 'needShowLoading')), ...options });
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

export const updatePagination = pagination => (dispatch, getState) => {
  dispatch({ type: 'UPDATE_PAGINATION', pagination });
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
  isCreate,
  isDefaultValue = true,
  isQueryWorksheetFill = true,
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
        DataFormat,
      };
      const rowData = new RowData(createRowArgs);
      return _.assign(rowData.getRow(), {
        pid: (get(staticRow, 'pid') || '').replace('temp-', 'default-'),
        childrenids: (get(staticRow, 'childrenids') || '').replace(/temp-/g, 'default-'),
      });
    });
    if (type === 'append') {
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
    }
  };
}
