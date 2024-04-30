import sheetAjax from 'src/api/worksheet';
import { WORKSHEET_TABLE_PAGESIZE } from 'src/pages/worksheet/constants/enum';

let request = null;

export const changeSearchSheetRows = ({ worksheetId, appId, viewId, keyWords, pageIndex }, callback) => (
  dispatch,
  getState,
) => {
  if (request) {
    request.abort();
  }
  if (!keyWords) {
    dispatch({ type: 'MOBILE_CHANGE_SEARCH_SHEET_ROWS', data: [] });
    callback && callback(true);
    return;
  }
  request = sheetAjax.getFilterRows({
    worksheetId,
    appId,
    searchType: 1,
    pageSize: WORKSHEET_TABLE_PAGESIZE,
    pageIndex,
    status: 1,
    viewId,
    keyWords,
  });
  request.then(sheetRowsAndTem => {
    const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
    const type = pageIndex === 1 ? 'MOBILE_CHANGE_SEARCH_SHEET_ROWS' : 'MOBILE_ADD_SEARCH_SHEET_ROWS';
    dispatch({ type, data: currentSheetRows });
    callback && callback(currentSheetRows.length === WORKSHEET_TABLE_PAGESIZE);
  });
};

export const emptySearchSheetRows = () => {
  return {
    type: 'MOBILE_CHANGE_SEARCH_SHEET_ROWS',
    data: [],
  };
};
