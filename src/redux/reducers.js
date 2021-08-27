import { combineReducers } from 'redux';
import sheet from 'src/pages/worksheet/redux/reducers';
import sheetList from 'src/pages/worksheet/redux/reducers/sheetList';
import * as postReducers from 'src/pages/feed/redux/postReducers';
import * as postDetailReducers from 'src/pages/feed/detail/redux/postDetailReducers';
import chat from 'src/pages/chat/redux/reducers';
import task from 'src/pages/task/redux/reducers';
import kc from 'src/pages/kc/redux/reducers';
import workflow from 'pages/workflow/redux/reducers';
import appPkg from 'pages/PageHeader/redux/reducers';
import mobile from 'pages/Mobile/redux/reducers';
import publicWorksheet from 'pages/publicWorksheetConfig/redux/reducers';
import formSet from 'pages/FormSet/redux/reducer/reducers';
import customPage from 'src/pages/customPage/redux/reducers';

export function makeRootReducer() {
  return (state = {}, action) => {
    if (action && action.type.match('WINDOW_POPSTATE_') && action.state) {
      if (!action.type.match(/\/hr\/dossier\/Recoder/i) && !action.type.match(/\/hr\/dossier\/RelationManage/i)) {
        return action.state;
      }
    }
    return combineReducers({
      post: combineReducers(postReducers),
      postDetail: combineReducers(postDetailReducers),
      sheet,
      chat,
      kc,
      task,
      workflow,
      appPkg,
      mobile,
      publicWorksheet,
      formSet,
      customPage,
      sheetList,
    })(state, action);
  };
}
