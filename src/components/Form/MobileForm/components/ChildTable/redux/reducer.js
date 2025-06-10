import { combineReducers } from 'redux';
import _, { includes, uniq } from 'lodash';

function dataLoading(state = true, action) {
  switch (action.type) {
    case 'UPDATE_DATA_LOADING':
      return action.value;
    default:
      return state;
  }
}
function baseLoading(state = true, action) {
  switch (action.type) {
    case 'UPDATE_BASE_LOADING':
      return action.value;
    default:
      return state;
  }
}

function base(state = {}, action) {
  // controls, searchConfig, rules, projectId, workflowChildTableSwitch, entityName, appId
  // masterData, recordId
  // TODO 属性排查
  switch (action.type) {
    case 'UPDATE_BASE':
      return {
        loaded: false,
        reset: false,
        ...action.value,
      };
    case 'LOAD_ROWS':
      return {
        ...state,
        loaded: true,
      };
    case 'CLEAR_AND_SET_ROWS':
      return {
        ...state,
        reset: true,
      };
    case 'RESET':
      return {
        ...state,
        loaded: false,
        reset: false,
      };
    default:
      return state;
  }
}

function changes(state = {}, action) {
  switch (action.type) {
    case 'DELETE_ALL':
      return { ...state, isDeleteAll: true };
    case 'RESET_CHANGES':
    case 'RESET':
      return {};
    default:
      return state;
  }
}

function cellErrors(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_CELL_ERRORS':
      return action.value;
    default:
      return state;
  }
}

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
    case 'FORCE_SET_OUT_ROWS':
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

    case 'UPDATE_STATE':
      newState = action.state;
  }
  return newState;
}

function pagination(state = { pageIndex: 1, pageSize: 20, count: 0 }, action) {
  switch (action.type) {
    case 'UPDATE_PAGINATION':
      return { ...state, ...action.pagination };
    default:
      return state;
  }
}

export default combineReducers({
  cellErrors,
  baseLoading,
  dataLoading,
  base,
  originRows,
  lastAction,
  rows,
  changes,
  pagination,
});
