

export const currentSheetRows = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_CHANGE_SHEET_ROWS':
      return Object.assign([], action.data);
    case 'MOBILE_ADD_SHEET_ROWS':
      return Object.assign([], state.concat(action.data));
    default:
      return state;
  }
}

export const currentSheetInfo = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_CHANGE_SHEET_INFO':
      return action.data;
    default:
      return state;
  }
}

export const worksheetControls = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_CHANGE_SHEET_CONTROLS':
      return action.value;
    default:
      return state;
  }
}

export const sheetRowLoading = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_FETCH_SHEETROW_START':
      return true;
    case 'MOBILE_FETCH_SHEETROW_SUCCESS':
      return false;
    default:
      return state;
  }
}