import _ from 'lodash';

export const updateExcelDetailData = data => dispatch => {
  const excelDetailData = data.map(item => ({
    ...item,
    selectCells: _.isUndefined(item.selectCells)
      ? item.rows.length
        ? item.rows[0].cells.map(it => it.columnNumber)
        : []
      : item.selectCells,
  }));
  dispatch({ type: 'UPDATE_EXCEL_DETAIL_DATA', data: excelDetailData });
};

export const updateCurrentSheetInfo = data => (dispatch, getState) => {
  const { excelDetailData = {} } = getState().sheet.excelCreateAppAndSheet || {};

  dispatch({ type: 'UPDATE_CURRENT_SHEET_INFO', data });
  if (!_.isEmpty(excelDetailData)) {
    const newData = excelDetailData.map(item => {
      if (item.sheetId === data.sheetId) {
        return data;
      }
      return item;
    });
    dispatch(updateExcelDetailData(newData));
  }
};

export const updateAppInfo = data => dispatch => {
  dispatch({ type: 'UPDATE_APP_INFO', data });
};

export const updateSelectedImportSheetIds = data => dispatch => {
  dispatch({ type: 'UPDATE_SELECTED_IMPORT_SHEET_IDS', data });
};

export const changeDialogUploadVisible = data => dispatch => {
  dispatch({ type: 'UPDATE_UPLOAD_VISIBLE', data });
};

export const changeSetDataDialogVisible = data => dispatch => {
  dispatch({ type: 'UPDATE_SETDATA_VISIBLE', data });
};

export const changeDialogCreateAppVisible = data => dispatch => {
  dispatch({ type: 'UPDATE_CREATE_APP_VISIBLE', data });
};

export const changeCreateAppLoading = data => dispatch => {
  dispatch({ type: 'UPDATE_CREATE_APP_LOADING', data });
};
