import { combineReducers } from 'redux';
import * as AppHome from 'src/pages/Mobile/AppHome/redux/reducers';
import * as AppReducers from 'src/pages/Mobile/App/redux/reducers';
import * as MemberReducers from 'src/pages/Mobile/Members/redux/reducers';
import * as MemberListReducers from 'src/pages/Mobile/Members/List/redux/reducers';
import * as RoleListReducers from 'src/pages/Mobile/Members/ChangeRole/redux/reducers';
import * as ApplyListReducers from 'src/pages/Mobile/Members/Apply/redux/reducers';
import * as RecordListReducers from 'src/pages/Mobile/RecordList/redux/reducers';
import * as SearchRecordReducers from 'src/pages/Mobile/SearchRecord/redux/reducers';
import * as DiscussReducers from 'src/pages/Mobile/Discuss/redux/reducers';
import * as RelationRowReducers from 'src/pages/Mobile/RelationRow/redux/reducers';


export default combineReducers({
  ...AppHome,
  ...AppReducers,
  ...MemberReducers,
  ...MemberListReducers,
  ...RoleListReducers,
  ...ApplyListReducers,
  ...RecordListReducers,
  ...SearchRecordReducers,
  ...DiscussReducers,
  ...RelationRowReducers,
});
