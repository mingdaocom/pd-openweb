import _ from 'lodash';
import { COLORS } from 'src/pages/AppHomepage/components/SelectIcon/config';

export const excelDetailData = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_EXCEL_DETAIL_DATA':
      return action.data || {};
    default:
      return state;
  }
};

export const currentSheetInfo = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_SHEET_INFO':
      return action.data || {};
    default:
      return state;
  }
};

export const appInfo = (
  state = { appName: _l('未命名应用'), icon: '0_lego', iconColor: COLORS[_.random(0, COLORS.length - 1)] },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_APP_INFO':
      return action.data || {};
    default:
      return state;
  }
};

export const selectedImportSheetIds = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_SELECTED_IMPORT_SHEET_IDS':
      return action.data || [];
    default:
      return state;
  }
};

export const dialogUploadVisible = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_UPLOAD_VISIBLE':
      return action.data;
    default:
      return state;
  }
};

export const setDataDialogVisible = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_SETDATA_VISIBLE':
      return action.data;
    default:
      return state;
  }
};

export const dialogCreateAppVisible = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_CREATE_APP_VISIBLE':
      return action.data;
    default:
      return state;
  }
};

export const createAppLoading = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_CREATE_APP_LOADING':
      return action.data;
    default:
      return state;
  }
};
