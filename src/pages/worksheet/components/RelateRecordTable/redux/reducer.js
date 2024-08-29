import { combineReducers } from 'redux';
import { cloneDeep, findIndex, get, includes, uniq, uniqBy } from 'lodash';

function loading(state = true, action) {
  switch (action.type) {
    case 'UPDATE_LOADING':
      return action.value;
    default:
      return state;
  }
}

function base(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_BASE':
      return Object.assign({}, state, action.value);
    default:
      return state;
  }
}

const initialTableState = {
  pageIndex: 1,
  pageSize: localStorage.getItem('relateRecordTablePageSize')
    ? Number(localStorage.getItem('relateRecordTablePageSize'))
    : 20,
  count: 0,
};

function tableState(
  state = {
    ...initialTableState,
  },
  action,
) {
  if (includes(['APPEND_RECORDS', 'DELETE_RECORDS'], action.type) && !action.saveSync) {
    const newCount = typeof state.countForShow === 'undefined' ? state.count : state.countForShow;
    if (action.type === 'APPEND_RECORDS') {
      return { ...state, countForShow: newCount + action.records.length };
    } else if (action.type === 'DELETE_RECORDS') {
      return { ...state, countForShow: newCount - action.recordIds.length };
    }
    return { ...state };
  }
  switch (action.type) {
    case 'UPDATE_RECORDS':
      return { ...state, count: action.records.length };
    case 'UPDATE_TABLE_STATE':
      return Object.assign({}, state, action.value);
    case 'APPEND_RECORDS':
      return { ...state, count: state.count + action.records.length };
    case 'DELETE_RECORDS':
      return { ...state, count: state.count - action.recordIds.length };
    case 'RESET':
      return {
        ...initialTableState,
        sheetColumnWidths: state.sheetColumnWidths,
        ...(action.doNotClearKeywords ? { keywords: state.keywords } : {}),
      };
    case 'DELETE_ALL':
      return {
        ...initialTableState,
      };
    default:
      return state;
  }
}

function controls(state = [], action) {
  switch (action.type) {
    case 'UPDATE_CONTROLS':
      return action.controls;
    default:
      return state;
  }
}

export const initialChanges = {
  addedRecordIds: [],
  deletedRecordIds: [],
  addedRecords: [],
};

function changes(state = cloneDeep(initialChanges), action) {
  if (action.saveSync) {
    if (includes(['APPEND_RECORDS', 'DELETE_RECORDS'], action.type)) {
      return { ...state, changed: true };
    }
  }
  const newRecords = (action.records || []).map(record => ({ ...record, isNew: true }));
  switch (action.type) {
    case 'APPEND_RECORDS':
      return {
        ...state,
        addedRecordIds: uniq(state.addedRecordIds.concat(newRecords.map(r => r.rowid))),
        addedRecords: uniqBy(state.addedRecords.concat(newRecords), 'rowid'),
      };
    case 'DELETE_RECORDS':
      return {
        ...state,
        addedRecordIds: state.addedRecordIds.filter(recordId => !includes(action.recordIds, recordId)),
        addedRecords: state.addedRecords.filter(record => !includes(action.recordIds, record.rowid)),
        deletedRecordIds: uniq(
          state.deletedRecordIds.concat(action.recordIds.filter(recordId => !includes(state.addedRecordIds, recordId))),
        ),
      };
    case 'DELETE_ALL':
      return {
        ...initialChanges,
        isDeleteAll: true,
      };
    case 'RESET':
      return cloneDeep(initialChanges);
    default:
      return state;
  }
}

function records(state = [], action) {
  let newRecords;
  switch (action.type) {
    case 'UPDATE_RECORDS':
      return action.records;
    case 'UPDATE_RECORD':
      return state.map(r => (r.rowid === get(action, 'newRecord.rowid') ? action.newRecord : r));
    case 'APPEND_RECORDS':
      newRecords = action.records;
      if (!action.saveSync && !!action.recordId) {
        return state;
      } else if (action.afterRecordId) {
        const afterRowIndex = findIndex(state, r => r.rowid === action.afterRecordId);
        if (afterRowIndex < 0) {
          return state;
        }
        return [...state.slice(0, afterRowIndex + 1), ...newRecords, ...state.slice(afterRowIndex + 1)];
      } else {
        return newRecords.concat(state);
      }
    case 'DELETE_RECORDS':
      return state.filter(record => !includes(action.recordIds, record.rowid));
    case 'CLEAR_RECORDS':
    case 'DELETE_ALL':
      return [];
    default:
      return state;
  }
}

export function initialized(state = false, action) {
  switch (action.type) {
    case 'UPDATE_INIT_STATE':
      return action.value;
    default:
      return state;
  }
}

export default combineReducers({
  initialized,
  loading,
  base,
  controls,
  records,
  tableState,
  changes,
});
