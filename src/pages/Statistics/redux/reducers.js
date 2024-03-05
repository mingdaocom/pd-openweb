import { combineReducers } from 'redux';

const currentReport = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_CURRENT_REPORT':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return {};
    default:
      return state;
  }
}

const axisControls = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_AXIS_CONTROLS':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return [];
    default:
      return state;
  }
}

const worksheetInfo = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_WORKSHEET_INFO':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return {};
    default:
      return state;
  }
}

const reportData = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_REPORT_DATA':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return {};
    default:
      return state;
  }
}

const tableData = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_TABLE_DATA':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return {};
    default:
      return state;
  }
}

const filterItem = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_FILTER_ITEM':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return [];
    default:
      return state;
  }
}

const detailLoading = (state = true, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_DETAIL_LOADING':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return true;
    default:
      return state;
  }
}

const loading = (state = true, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_LOADING':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return true;
    default:
      return state;
  }
}

const reportSingleCacheLoading = (state = true, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_REPORTSINGLECACHE_LOADING':
      return action.data;
    case 'CHANGE_STATISTICS_RESET':
      return true;
    default:
      return state;
  }
}

const direction = (state = (sessionStorage.getItem('chartSheetDirection') || 'horizontal'), action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_DIRECTION':
      return action.data;
    default:
      return state;
  }
}

const base = (state = {}, action) => {
  switch (action.type) {
    case 'CHANGE_STATISTICS_BASE':
      return { ...state, ...action.data };
    case 'CHANGE_STATISTICS_RESET':
      return {};
    default:
      return state;
  }
}

export default combineReducers({
  currentReport,
  axisControls,
  worksheetInfo,
  reportData,
  tableData,
  filterItem,
  detailLoading,
  loading,
  reportSingleCacheLoading,
  direction,
  base
});

