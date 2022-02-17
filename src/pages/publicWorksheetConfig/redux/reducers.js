import { combineReducers } from 'redux';

export function loading(state = true, action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return false;
    case 'PUBLICWORKSHEET_CLEAR':
      return true;
    default:
      return state;
  }
}

export function shareUrl(state = '', action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return action.url || '';
    case 'PUBLICWORKSHEET_UPDATE_URL':
      return action.url || '';
    case 'PUBLICWORKSHEET_CLEAR':
      return '';
    default:
      return state;
  }
}

export function worksheetSettings(state = {}, action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return action.worksheetSettings;
    case 'PUBLICWORKSHEET_UPDATE_SETTINGS':
      return _.assign({}, state, action.value);
    case 'PUBLICWORKSHEET_CLEAR':
      return {};
    default:
      return state;
  }
}

export function worksheetInfo(state = {}, action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return action.worksheetInfo;
    case 'PUBLICWORKSHEET_UPDATE_INFO':
      return _.assign({}, state, action.value);
    case 'PUBLICWORKSHEET_CLEAR':
      return {};
    default:
      return state;
  }
}

export function originalControls(state = [], action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return action.originalControls;
    case 'PUBLICWORKSHEET_ADD_CONTROL':
      return state.concat(action.control);
    case 'PUBLICWORKSHEET_CLEAR':
      return [];
    default:
      return state;
  }
}

export function controls(state = [], action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
    case 'PUBLICWORKSHEET_UPDATE_CONTROLS':
      return action.controls;
    case 'WORKSHEET_SHOW_CONTROL':
      return state.concat(action.control);
    case 'PUBLICWORKSHEET_CLEAR':
      return [];
    default:
      return state;
  }
}

export function hidedControlIds(state = [], action) {
  switch (action.type) {
    case 'PUBLICWORKSHEET_LOAD_SUCCESS':
      return action.hidedControlIds;
    case 'WORKSHEET_HIDE_CONTROL':
      return _.uniqBy(state.concat(action.controlId));
    case 'WORKSHEET_SHOW_CONTROL':
      return state.filter(controlId => controlId !== action.controlId);
    case 'PUBLICWORKSHEET_CLEAR':
      return [];
    default:
      return state;
  }
}

export default combineReducers({
  loading,
  shareUrl,
  worksheetInfo,
  worksheetSettings,
  originalControls,
  controls,
  hidedControlIds,
});
