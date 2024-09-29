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
import * as detailView from './detailView';
import * as customWidgetView from './customWidgetView';
import mapView from './mapView';
import * as resourceView from './resourceview';

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
        const showViews = action.value.views.filter(view => {
          const showhide = _.get(view, 'advancedSetting.showhide') || '';
          return !showhide.includes('hpc') && !showhide.includes('hide');
        });
        return {
          ...state,
          viewId: _.get((showViews.length ? showViews : action.value.views)[0], 'viewId'),
        };
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

function appPkgData(state = false, action) {
  switch (action.type) {
    case 'WORKSHEET_UPDATE_APPPKGDATA':
      return action.appPkgData;
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

function fieldShowCount(state = 0, action) {
  switch (action.type) {
    case 'VIEW_UPDATE_SHOW_COUNT':
      return action.showcount || 0;
    default:
      return state;
  }
}

export default combineReducers({
  base,
  isCharge,
  appPkgData,
  activeViewStatus,
  fieldShowCount,
  ...worksheet,
  boardView,
  hierarchyView: combineReducers(hierarchyView),
  sheetview: combineReducers(sheetview),
  galleryview: combineReducers(galleryview),
  calendarview: combineReducers(calendarview),
  gunterView: combineReducers(gunterView),
  excelCreateAppAndSheet: combineReducers(excelCreateAppAndSheet),
  detailView: combineReducers(detailView),
  customWidgetView: combineReducers(customWidgetView),
  mapView,
  resourceview: combineReducers(resourceView),
});
