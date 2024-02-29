import { combineReducers } from 'redux';
import current from './current';
import entities from './entities';
import pagination from './pagination';
import search from './search';

// root reducer
export default combineReducers({
  current,
  entities,
  pagination,
  search,
});
