
export const base = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_BASE':
      return { ...state, ...action.base };
    default:
      return state;
  }
}

export const workSheetLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_UPDATE_LOADING':
      return action.loading;
    default:
      return state;
  }
}

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

export const worksheetInfo = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_INFO':
      return action.data;
    default:
      return state;
  }
}

export const filters = (state = { keyWords: '', quickFilterKeyWords: '', visible: false }, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_FILTERS':
      return { ...state, ...action.filters };
    default:
      return state;
  }
}

export const quickFilter = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_QUICK_FILTER':
      return [...action.filter];
    default:
      return state;
  }
}

export const sheetView = (state = {
  pageIndex: 1,
  isMore: true,
  count: 0
}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_SHEET_VIEW':
      return { ...state, ...action.sheetView };
    default:
      return state;
  }
}

export const viewResultCode = (state = 1, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_VIEW_CODE':
      return action.value;
    default:
      return state;
  }
}

export const sheetSwitchPermit = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_SHEET_PERMISSION_INIT':
      return action.value;
    default:
      return state;
  }
}

export const worksheetControls = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_CONTROLS':
      return action.value;
    default:
      return state;
  }
}

export const sheetRowLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_FETCH_SHEETROW_START':
      return true;
    case 'MOBILE_FETCH_SHEETROW_SUCCESS':
      return false;
    default:
      return state;
  }
}
