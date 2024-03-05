import { combineReducers } from 'redux';
import position from './position/reducer';
import roleManage from './roleManage/reducer';

export default combineReducers({
  position,
  roleManage,
});
