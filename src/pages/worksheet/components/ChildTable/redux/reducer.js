import _ from 'lodash';
import { combineReducers } from 'redux';

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

function rows(state = [], action) {
  let insertIndex;
  let newState = [...state];
  switch (action.type) {
    case 'INIT_ROWS':
    case 'CLEAR_AND_SET_ROWS':
      return action.rows.map(row => ({ ...row }));
    case 'ADD_ROW':
      insertIndex = action.insertRowId ? _.findIndex(state, r => r.rowid === action.insertRowId) : -1;
      if (insertIndex >= 0) {
        newState.splice(insertIndex + 1, 0, action.row);
        return newState;
      } else {
        return state.concat(action.row);
      }
    case 'ADD_ROWS':
      return state.concat(action.rows);
    case 'UPDATE_ROW':
      return state.map(row => (row.rowid === action.rowid ? { ...row, ...action.value } : row));
    case 'DELETE_ROW':
      return state.filter(row => row.rowid !== action.rowid);
    default:
      return state;
  }
}

export default combineReducers({
  originRows,
  lastAction,
  rows,
});
