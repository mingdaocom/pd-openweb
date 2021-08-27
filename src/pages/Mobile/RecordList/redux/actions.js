import sheetAjax from 'src/api/worksheet';
import { WORKSHEET_TABLE_PAGESIZE } from 'src/pages/worksheet/constants/enum';

export const getSheet = ({ worksheetId, appId, viewId }) => (dispatch, getState) => {
  const params = {
    worksheetId,
    appId,
  };

  Promise.all([
    sheetAjax
      .getFilterRows({
        ...params,
        searchType: 1,
        pageSize: WORKSHEET_TABLE_PAGESIZE,
        pageIndex: 1,
        status: 1,
        viewId,
      })
      .then(),
    sheetAjax
      .getWorksheetInfo({
        ...params,
        getTemplate: true,
        getViews: true,
      })
      .then(),
  ]).then(result => {
    const [sheetRowsAndTem, workSheetInfo] = result;
    const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
    const { views } = workSheetInfo;
    const firstView = _.isEmpty(views) ? {} : views[0];
    if (_.isEmpty(views)) {
      workSheetInfo.resultCode = 4;
    }
    dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data: currentSheetRows });
    dispatch({ type: 'MOBILE_CHANGE_SHEET_INFO', data: workSheetInfo });
    dispatch(changeSheetControls(viewId || firstView.viewId, sheetRowsAndTem.resultCode));
  });
};

export const changeSheetRows = ({ worksheetId, appId, viewId, keyWords }) => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_FETCH_SHEETROW_START' });

  sheetAjax
    .getFilterRows({
      worksheetId,
      appId,
      searchType: 1,
      pageSize: WORKSHEET_TABLE_PAGESIZE,
      pageIndex: 1,
      status: 1,
      viewId,
      keyWords,
    })
    .then(sheetRowsAndTem => {
      const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
      dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data: currentSheetRows });
      dispatch(changeSheetControls(viewId, sheetRowsAndTem.resultCode));
      dispatch({ type: 'MOBILE_FETCH_SHEETROW_SUCCESS' });
    });
};

export const emptySheetRows = () => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data: [] });
  dispatch({ type: 'MOBILE_CHANGE_SHEET_INFO', data: {} });
};

export const emptyWorksheetControls = () => {
  return {
    type: 'MOBILE_CHANGE_SHEET_CONTROLS',
    value: [],
  };
};

export const addSheetRows = ({ worksheetId, appId, viewId, pageIndex }, callback) => (dispatch, getState) => {
  sheetAjax
    .getFilterRows({
      worksheetId,
      appId,
      searchType: 1,
      pageSize: WORKSHEET_TABLE_PAGESIZE,
      pageIndex,
      status: 1,
      viewId,
    })
    .then(sheetRowsAndTem => {
      const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
      const type = pageIndex === 1 ? 'MOBILE_CHANGE_SHEET_ROWS' : 'MOBILE_ADD_SHEET_ROWS';
      dispatch({ type, data: currentSheetRows });
      callback && callback(currentSheetRows.length === WORKSHEET_TABLE_PAGESIZE);
    });
};

export const changeSheetControls = (viewId, resultCode) => (dispatch, getState) => {
  const { currentSheetInfo } = getState().mobile;
  const { views, template } = currentSheetInfo;
  const firstView = _.isEmpty(views) ? _.object() : views[0];
  const view = viewId ? _.find(views, { viewId }) || _.object() : firstView;
  const newControls = template.controls.filter(item => {
    if (item.attribute === 1) {
      return true;
    }
    return _.isEmpty(view) ? true : !view.controls.includes(item.controlId);
  });
  currentSheetInfo.currentView = {
    ...view,
    resultCode,
  };
  navigator.share && dispatch(updateWorksheetShareUrl(view.viewId));
  dispatch({
    type: 'MOBILE_CHANGE_SHEET_CONTROLS',
    value: newControls.concat([
      {
        controlId: 'ownerid',
        controlName: _l('拥有者'),
        controlPermissions: '100',
        type: 26,
      },
      {
        controlId: 'caid',
        controlName: _l('创建人'),
        controlPermissions: '100',
        type: 26,
      },
      {
        controlId: 'ctime',
        controlName: _l('创建时间'),
        controlPermissions: '100',
        type: 16,
      },
      {
        controlId: 'utime',
        controlName: _l('最近修改时间'),
        controlPermissions: '100',
        type: 16,
      },
    ]),
  });
};

export const updateCurrentView = ({ currentView, sortCid, sortType }) => (dispatch, getState) => {
  const { currentSheetInfo } = getState().mobile;
  const { views } = currentSheetInfo;
  const base = {
    appId: currentSheetInfo.appId,
    viewId: currentView.viewId,
    worksheetId: currentView.worksheetId,
  };
  sheetAjax
    .saveWorksheetView({
      ...base,
      name: currentView.name,
      filters: currentView.filters,
      controls: currentView.controls,
      sortCid,
      sortType,
    })
    .then(result => {
      currentSheetInfo.views = views.map(item => {
        if (item.viewId === currentView.viewId) {
          return result;
        }
        return item;
      });
      dispatch(changeSheetRows(base));
    });
};

const updateWorksheetShareUrl = viewId => (dispatch, getState) => {
  const { currentSheetInfo } = getState().mobile;
  sheetAjax
    .getWorksheetShareUrl({
      objectType: 1,
      appId: currentSheetInfo.appId,
      viewId,
      worksheetId: currentSheetInfo.worksheetId,
    })
    .then(shareUrl => {
      currentSheetInfo.shareUrl = shareUrl;
    });
};
