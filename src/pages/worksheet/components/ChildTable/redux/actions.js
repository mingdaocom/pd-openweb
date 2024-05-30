import { v4 as uuidv4 } from 'uuid';
import { handleSortRows, postWithToken, download } from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import _, { get, includes, pick } from 'lodash';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { createRequestPool } from 'worksheet/api/standard';

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

export const addRow = (row, insertRowId) => ({ type: 'ADD_ROW', row, rowid: row.rowid, insertRowId });

export const deleteRow = rowid => ({ type: 'DELETE_ROW', rowid });
export const deleteRows = rowIds => ({ type: 'DELETE_ROWS', rowIds });

export const updateRow = ({ rowid, value }, { asyncUpdate } = {}) => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_ROW',
      asyncUpdate,
      rowid,
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
    rows = rows.concat(res.data || []).map((row, i) => ({ ...row, allowedit: true, addTime: i }));
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
        dispatch(initRows(rows));
        callback(res);
      })
      .catch(err => {
        callback(null);
      });
  };
};

export const addRows = (rows, options = {}) => ({ type: 'ADD_ROWS', rows, ...options });

export const sortRows = ({ control, isAsc }) => {
  return (dispatch, getState) => {
    const { rows } = getState();
    dispatch({ type: 'INIT_ROWS', rows: handleSortRows(rows, control, isAsc) });
  };
};

export const exportSheet = ({ worksheetId, rowId, controlId, fileName, onDownload = () => {} } = {}) => {
  return async () => {
    try {
      const res = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/ExportExcel/DetailTable`,
        { worksheetId, tokenType: 8 },
        {
          worksheetId,
          rowId,
          controlId,
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
      const tempRowId = !isDefaultValue ? `temp-${uuidv4()}` : `default-${uuidv4()}`;
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
      return rowData.getRow();
    });
    if (type === 'append') {
      dispatch(addRows(rows));
      triggerSubListControlValueChange({ action: 'append', isDefault: true, rows: getState().rows });
    } else {
      dispatch(clearAndSetRows(rows));
      triggerSubListControlValueChange({ action: 'clearAndSet', isDefault: true, rows: getState().rows });
    }
  };
}
