import { combineReducers } from 'redux';
import update from 'immutability-helper';

function data(state = [], action) {
  switch (action.type) {
    case 'SHEET_LIST':
      return action.data;
    case 'ADD_LEFT_ITEM':
      return state.concat(action.data);
    default:
      return state;
  }
}

function loading(state = true, action) {
  switch (action.type) {
    case 'SHEET_LIST_UPDATE_LOADING':
      return action.loading;
    default:
      return state;
  }
}

function isCharge(state = false, action) {
  switch (action.type) {
    case 'SHEET_LIST_UPDATE_IS_CHARGE':
      return action.isCharge;
    default:
      return state;
  }
}

function isUnfold(state = !(localStorage.getItem('sheetListIsUnfold') === 'false'), action) {
  switch (action.type) {
    case 'SHEET_LIST_UPDATE_IS_UNFOLD':
      return action.isUnfold;
    default:
      return state;
  }
}

function guidanceVisible(state = false, action) {
  switch (action.type) {
    case 'GUIDANCE_VISIBLE':
      return action.value;
    default:
      return state;
  }
}

function isValidAppSectionId(state = true, action) {
  switch (action.type) {
    case 'WORKSHEET_APP_SECTION_VALID':
      return true;
    case 'WORKSHEET_APP_SECTION_FAILURE':
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  data,
  loading,
  isCharge,
  isUnfold,
  guidanceVisible,
  isValidAppSectionId,
});
