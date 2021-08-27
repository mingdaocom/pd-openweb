import { getControlValueSortType } from 'worksheet/util';
import { getRowRelationRows } from 'src/api/worksheet';
import { renderCellText } from 'worksheet/components/CellControls';

const PAGE_SIZE = 200;

export const initRows = rows => ({ type: 'INIT_ROWS', rows });

export const resetRows = () => {
  return (dispatch, getState) => {
    dispatch(initRows(getState().originRows));
  };
};

export const clearAndSetRows = rows => {
  return (dispatch, getState) => {
    dispatch({ type: 'CLEAR_AND_SET_ROWS', rows, deleted: getState().rows.map(r => r.rowid) });
  };
};

export const setOriginRows = rows => ({ type: 'LOAD_ROWS', rows });

export const loadRows = ({ worksheetId, recordId, controlId, pageIndex = 1, getWorksheet, callback = () => {} }) => {
  const isRecordShare = /\/worksheetshare/.test(location.pathname);
  const isUpdateRecordShare = /\/recordshare/.test(location.pathname);
  const isPublicQuery = /\/public\/query/.test(location.pathname);
  return (dispatch, getState) => {
    const args = {
      worksheetId,
      rowId: recordId,
      controlId: controlId,
      getWorksheet,
      pageIndex,
      pageSize: PAGE_SIZE,
    };
    if (isRecordShare) {
      args.shareId = (location.pathname.match(/.*\/worksheetshare\/(\w{24})/) || '')[1];
    }
    if (isPublicQuery) {
      args.shareId = (location.pathname.match(/.*\/public\/query\/(\w{24})/) || '')[1];
    }
    if (isUpdateRecordShare) {
      args.linkId = (location.pathname.match(/.*\/recordshare\/(\w{24})/) || '')[1];
    }
    getRowRelationRows(args).then(res => {
      const rows = res.data.map((row, i) => ({ ...row, allowedit: true, addTime: i }));
      dispatch({ type: 'LOAD_ROWS', rows });
      dispatch(initRows(rows));
      callback(res);
    });
  };
};

export const addRow = (row, insertRowId) => ({ type: 'ADD_ROW', row, rowid: row.rowid, insertRowId });

export const deleteRow = rowid => ({ type: 'DELETE_ROW', rowid });

export const updateRow = ({ rowid, value }) => ({
  type: 'UPDATE_ROW',
  rowid,
  value: { ...value, empty: false },
});

export const sortRows = ({ control, isAsc }) => {
  return (dispatch, getState) => {
    const { rows } = getState();
    const controlValueType = getControlValueSortType(control);
    if (_.isUndefined(isAsc)) {
      dispatch({
        type: 'INIT_ROWS',
        rows: _.sortBy(rows, 'addTime'),
      });
      return;
    }
    let newRows = _.sortBy(rows, row =>
      controlValueType === 'NUMBER'
        ? parseFloat(row[control.controlId])
        : renderCellText({ ...control, value: row[control.controlId] }),
    );
    if (!isAsc) {
      newRows = newRows.reverse();
    }
    dispatch({ type: 'INIT_ROWS', rows: newRows });
  };
};
