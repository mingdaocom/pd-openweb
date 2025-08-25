import update from 'immutability-helper';
import _ from 'lodash';
import { addRecord, delRecord, updateMultiSelectBoard, updateRecord } from 'worksheet/redux/reducers/boardView';

export const base = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_BASE':
      return { ...state, ...action.base };
    default:
      return state;
  }
};

export const workSheetLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_UPDATE_LOADING':
      return action.loading;
    default:
      return state;
  }
};

export const currentSheetRows = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_CHANGE_SHEET_ROWS':
      return Object.assign([], action.data);
    case 'MOBILE_UNSHIFT_SHEET_ROWS':
      state.unshift(action.data);
      return Object.assign([], state);
    case 'MOBILE_UPDATE_SHEET_ROW_BY_ROWID':
      const newState = state.map(row => {
        if (action.rowId === row.rowid) {
          return action.isViewData ? { ...row, ...action.rowUpdatedValue } : null;
        }
        return row;
      });
      return newState.filter(Boolean);
    default:
      return state;
  }
};

export const worksheetInfo = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_INFO':
      return action.data;
    default:
      return state;
  }
};

export const savedFilters = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_SAVED_FILTERS':
      return action.filters;
    default:
      return state;
  }
};

export const activeSavedFilter = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_ACTIVE_SAVED_FILTERS':
      return action.filter;
    default:
      return state;
  }
};

export const filters = (state = { keyWords: '', quickFilterKeyWords: '', visible: false }, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_FILTERS':
      return { ...state, ...action.filters };
    default:
      return state;
  }
};

export const quickFilter = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_QUICK_FILTER':
      return [...action.filter];
    default:
      return state;
  }
};

export function quickFilterWithDefault(state = [], action) {
  switch (action.type) {
    case 'UPDATE_QUICK_FILTER_WITH_DEFAULT':
      return [...action.filter];
    default:
      return state;
  }
}

export const sheetFiltersGroup = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_FILTERS_GROUP':
      return [...action.filter];
    default:
      return state;
  }
};

export const sheetView = (
  state = {
    pageIndex: 1,
    isMore: true,
    count: 0,
  },
  action,
) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_SHEET_VIEW':
      return { ...state, ...action.sheetView };
    default:
      return state;
  }
};

export const viewResultCode = (state = 1, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_VIEW_CODE':
      return action.value;
    default:
      return state;
  }
};

export const isCharge = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_IS_CHARGE':
      return action.value;
    default:
      return state;
  }
};

export const appColor = (state = '#1677ff', action) => {
  switch (action.type) {
    case 'MOBILE_APP_COLOR':
      return action.value;
    default:
      return state;
  }
};

export const sheetSwitchPermit = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_SHEET_PERMISSION_INIT':
      return action.value;
    default:
      return state;
  }
};

export const worksheetControls = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_WORK_SHEET_CONTROLS':
      return action.value;
    default:
      return state;
  }
};

export const sheetRowLoading = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_FETCH_SHEETROW_START':
      return true;
    case 'MOBILE_FETCH_SHEETROW_SUCCESS':
      return false;
    default:
      return state;
  }
};

export const mobileNavGroupFilters = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_MOBILE_GROUPFILTERS':
      return action.data;
    default:
      return state;
  }
};
export const batchOptVisible = (state = false, action) => {
  switch (action.type) {
    case 'CHABGE_MOBILE_BATCHOPT_VISIBLE':
      return action.flag;
    default:
      return state;
  }
};

export const batchCheckAll = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_BATCH_CHECK_ALL':
      return action.data;
    default:
      return state;
  }
};

export const batchOptCheckedData = (state = [], action) => {
  switch (action.type) {
    case 'CAHNGE_BATCHOPT_CHECKED':
      return action.data;
    default:
      return state;
  }
};

export const isClickChart = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_CLICK_CHART':
      return action.flag;
    default:
      return state;
  }
};

export const filterControls = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_FILTER_CONTROLS':
      const { filterControls } = action;

      return _.isArray(filterControls) ? [...filterControls] : [filterControls];
    default:
      return state;
  }
};

export const isPullRefreshing = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_IS_PULL_REFRESHING':
      return action.flag;
    default:
      return state;
  }
};

export const groupListLoading = (state = false, action) => {
  switch (action.type) {
    case 'GROUP_FILTER_LIST_LOADING':
      return action.data;
    default:
      return state;
  }
};

export const previewRecordId = (state = '', action) => {
  switch (action.type) {
    case 'UPDATE_PREVIEW_RECORD':
      return action.data;
    default:
      return state;
  }
};

export const groupDataInfo = (
  state = { groupData: [], groupKey: '', currentKeyPageIndex: 1, isGroupLoading: false, unfoldedKeys: [] },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_GROUP_DATA_INFO':
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const boardView = (
  state = {
    boardData: [],
    boardViewRecordCount: {},
    boardViewState: {
      kanbanIndex: 1,
      hasMoreData: true,
    },
  },
  action,
) => {
  const { type, data } = action;
  const { boardData, boardViewRecordCount, boardViewState } = state;

  switch (type) {
    case 'MOBILE_CHANGE_BOARD_VIEW_DATA':
      return {
        ...state,
        boardData: data,
      };
    case 'MOBILE_UPDATE_BOARD_VIEW_RECORD':
      return { ...state, boardData: updateRecord(boardData, data) };
    case 'MOBILE_ADD_BOARD_VIEW_RECORD':
      return { ...state, boardData: addRecord(boardData, data) };
    case 'MOBILE_DEL_BOARD_VIEW_RECORD_COUNT':
      return { ...state, boardData: delRecord(boardData, data) };
    case 'MOBILE_CHANGE_BOARD_VIEW_STATE':
      return {
        ...state,
        boardViewState: { ...boardViewState, ...data },
      };
    case 'MOBILE_INIT_BOARD_VIEW_RECORD_COUNT':
      return {
        ...state,
        boardViewRecordCount: {
          ...boardViewRecordCount,
          ...data,
        },
      };
    case 'MOBILE_UPDATE_BOARD_VIEW_RECORD_COUNT':
      return {
        ...state,
        boardViewRecordCount: update(boardViewRecordCount, {
          [data[0]]: { $apply: item => Math.max(0, item + data[1]) },
        }),
      };
    case 'MOBILE_UPDATE_MULTI_SELECT_BOARD':
      return { ...state, boardData: updateMultiSelectBoard(boardData, data) };
    default:
      return state;
  }
};

export const viewCard = (state = { needUpdate: true, height: 0 }, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_VIEW_CARD':
      return { ...state, ...action.data };
    default:
      return state;
  }
};
