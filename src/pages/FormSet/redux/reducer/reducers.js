import { combineReducers } from 'redux';
import * as columnRules from './columnRules';
import * as print from './print';

// worksheetId
export function noRight(state = false, action) {
  switch (action.type) {
    case 'NORIGHT':
      return true;
    default:
      return state;
  }
}

// worksheetId
export function worksheetId(state = '', action) {
  switch (action.type) {
    case 'COLUMNRULES_WORKSHEETID':
      return action.data;
    default:
      return state;
  }
}

// worksheetName
export function worksheetName(state = '', action) {
  switch (action.type) {
    case 'WORKSHEET_NAME':
      return action.data;
    default:
      return state;
  }
}

// 当前表信息
export function worksheetInfo(state = [], action) {
  switch (action.type) {
    case 'WORKSHEET_INFO':
      return action.data;
    default:
      return state;
  }
}
export default combineReducers({
  ...columnRules,
  ...print,
  worksheetId: worksheetId,
  worksheetName: worksheetName,
  worksheetInfo: worksheetInfo,
  noRight,
});
