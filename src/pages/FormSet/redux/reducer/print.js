import { combineReducers } from 'redux';
// 当前表打印模板
export function printData(state = [], action) {
  switch (action.type) {
    case 'PRINT_LIST':
      return action.data;
    default:
      return state;
  }
}
export default combineReducers({
  printData,
});
