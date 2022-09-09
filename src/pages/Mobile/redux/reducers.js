import { combineReducers } from 'redux';
import * as AppHome from 'mobile/AppHome/redux/reducers';
import * as AppReducers from 'mobile/App/redux/reducers';
import * as MemberReducers from 'mobile/Members/redux/reducers';
import * as MemberListReducers from 'mobile/Members/List/redux/reducers';
import * as RoleListReducers from 'mobile/Members/ChangeRole/redux/reducers';
import * as ApplyListReducers from 'mobile/Members/Apply/redux/reducers';
import * as RecordListReducers from 'mobile/RecordList/redux/reducers';
import * as SearchRecordReducers from 'mobile/SearchRecord/redux/reducers';
import * as DiscussReducers from 'mobile/Discuss/redux/reducers';
import * as RelationRowReducers from 'mobile/RelationRow/redux/reducers';
import * as CustomPageReducers from 'mobile/CustomPage/redux/reducers';


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
  ...CustomPageReducers
});
