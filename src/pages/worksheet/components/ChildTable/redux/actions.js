import { handleSortRows, postWithToken, download } from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import _ from 'lodash';

const PAGE_SIZE = 200;

export const initRows = rows => ({ type: 'INIT_ROWS', rows });

export const resetRows = () => {
  return (dispatch, getState) => {
    dispatch(initRows(getState().originRows));
    return Promise.resolve();
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
    batchLoadRows(args).then(batchRes => {
      const { res, rows } = batchRes;
      dispatch({ type: 'LOAD_ROWS', rows });
      dispatch(initRows(rows));
      if (isCustomButtonFillRecord && rows.length) {
        dispatch(updateRow(rows[0].rowid, rows[0]));
      }
      callback(res);
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
