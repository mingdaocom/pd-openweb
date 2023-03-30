import { combineReducers } from 'redux';
import { isEmpty } from 'lodash';
import * as worksheet from './worksheet';
import boardView from './boardView';
import * as hierarchyView from './hierarchyView';
import * as sheetview from './sheetview';
import * as galleryview from './galleryview';
import * as calendarview from './calendarview';
import * as gunterView from './gunterview';
import * as excelCreateAppAndSheet from './excelCreateAppAndSheet';

function base(state = {}, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_BASE':
      return { ...state, ...action.base };
    case 'WORKSHEET_UPDATE_FILTERS':
      return { ...state, ...(location.search.indexOf('chartId=') > -1 ? { chartId: undefined } : {}) };
    case 'WORKSHEET_INIT':
      if ((state.viewId && /^[0-9a-z]{24}$/.test(state.viewId)) || state.chartId) {
        return state;
      }
      // 自定义页面没有视图
      if (isEmpty(action.value.views)) return state;
      if (state.worksheetId === action.value.worksheetId) {
        return { ...state, viewId: action.value.views[0].viewId };
      }
      return state;
    default:
      return state;
  }
}

function isCharge(state = false, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_IS_CHARGE':
      return action.isCharge;
    default:
      return state;
  }
}

function activeViewStatus(state = 1, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_ACTIVE_VIEW_STATUS':
    case 'WORKSHEET_SHEETVIEW_FETCH_ROWS':
    case 'CHANGE_CALENDARLIST':
    case 'CHANGE_GALLERY_VIEW_DATA':
      return action.resultCode || state;
    case 'WORKSHEET_FETCH_START':
    case 'WORKSHEET_UPDATE_BASE':
      return 1;
    default:
      return state;
  }
}

export default combineReducers({
  base,
  isCharge,
  activeViewStatus,
  ...worksheet,
  boardView,
  hierarchyView: combineReducers(hierarchyView),
  sheetview: combineReducers(sheetview),
  galleryview: combineReducers(galleryview),
  calendarview: combineReducers(calendarview),
  gunterView: combineReducers(gunterView),
  excelCreateAppAndSheet: combineReducers(excelCreateAppAndSheet),
});
