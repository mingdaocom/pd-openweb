import _ from 'lodash';
import { combineReducers } from 'redux';
import { browserIsMobile } from 'src/util';

function lastAction(state = null, action) {
  return action;
}

function originRows(state = [], action) {
  switch (action.type) {
    case 'LOAD_ROWS':
      return action.rows.map(row => ({ ...row }));
    default:
      return state;
  }
}

function fillEmptyRows(rows, emptyCount = 0) {
  if (rows.length < emptyCount) {
    return rows.concat(
      new Array(emptyCount - rows.length).fill().map(() => ({
        rowid: 'empty-' + Math.random().toString(32),
      })),
    );
  } else {
    return rows;
  }
}

function rows(state = [], action) {
  const emptyCount = action.emptyCount || 0;
  let insertIndex;
  let newState = [...state];
  let lastNotEmptyIndex = _.findLastIndex(
    state,
    row => !(row.rowid && _.isFunction(row.rowid.startsWith) && row.rowid.startsWith('empty')),
  );
  if (!_.isUndefined(lastNotEmptyIndex) && newState.length <= emptyCount) {
    newState = state.slice(0, lastNotEmptyIndex + 1);
  }
  switch (action.type) {
    case 'INIT_ROWS':
    case 'CLEAR_AND_SET_ROWS':
      newState = action.rows.map(row => ({ ...row }));
      break;
    case 'ADD_ROW':
      insertIndex = action.insertRowId ? _.findIndex(newState, r => r.rowid === action.insertRowId) : -1;
      if (insertIndex >= 0) {
        newState.splice(insertIndex + 1, 0, action.row);
      } else {
        if (newState.length > 5) {
          newState = newState.concat(action.row);
        } else {
          newState = newState.concat(action.row);
        }
      }
      break;
    case 'ADD_ROWS':
      newState = newState.concat(action.rows);
      break;
    case 'UPDATE_ROW':
      newState = state.map(row => (row.rowid === action.rowid ? { ...row, ...action.value } : row));
      break;
    case 'DELETE_ROW':
      newState = newState.filter(row => row.rowid !== action.rowid);
      break;
    case 'DELETE_ROWS':
      newState = newState.filter(row => !_.includes(action.rowIds, row.rowid));
      break;
    case 'UPDATE_STATE':
      newState = action.state;
  }
  return newState.length < emptyCount && !browserIsMobile() ? fillEmptyRows(newState, emptyCount) : newState;
}

export default combineReducers({
  originRows,
  lastAction,
  rows,
});
