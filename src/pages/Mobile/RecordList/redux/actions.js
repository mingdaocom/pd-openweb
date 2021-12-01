import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
// import { WORKSHEET_TABLE_PAGESIZE } from 'src/pages/worksheet/constants/enum';

const WORKSHEET_TABLE_PAGESIZE = 20;

export const updateBase = base => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_BASE',
    base,
  });
  dispatch({
    type: 'WORKSHEET_UPDATE_BASE',
    base,
  });
}

export const loadWorksheet = () => (dispatch, getState) => {
  const { base } = getState().mobile;
  dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: true });
  sheetAjax.getWorksheetInfo({
    appId: base.appId,
    worksheetId: base.worksheetId,
    getTemplate: true,
    getViews: true,
  }).then(workSheetInfo => {
    dispatch({ type: 'WORKSHEET_INIT', value: workSheetInfo });
    dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: workSheetInfo });
    dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: false });
  });
  sheetAjax.getSwitchPermit({
    appId: base.appId,
    worksheetId: base.worksheetId,
  }).then(res => {
    dispatch({
      type: 'MOBILE_SHEET_PERMISSION_INIT',
      value: res,
    });
  });
  homeAppAjax.getAppDetail({
    appId: base.appId
  }).then(data => {
    const isCharge = isHaveCharge(data.permissionType, data.isLock);
    dispatch({
      type: 'MOBILE_UPDATE_IS_CHARGE',
      value: isCharge
    });
  });
}

export const fetchSheetRows = (params) => (dispatch, getState) => {
  const { base, filters, sheetView, quickFilter, mobileNavGroupFilters } = getState().mobile;
  const { appId, worksheetId, viewId } = base;
  const { keyWords } = filters;
  const { pageIndex } = sheetView;
  let extraParams = params ? { ...params } : {};
  dispatch({ type: 'MOBILE_FETCH_SHEETROW_START' });
  sheetAjax.getFilterRows({
    worksheetId,
    appId,
    searchType: 1,
    pageSize: WORKSHEET_TABLE_PAGESIZE,
    pageIndex,
    status: 1,
    viewId,
    keyWords,
    filterControls: [],
    sortControls: [],
    fastFilters: quickFilter.map(f =>
      _.pick(f, [
        'controlId',
        'dataType',
        'spliceType',
        'filterType',
        'dateRange',
        'value',
        'values',
        'minValue',
        'maxValue',
      ]),
    ),
    navGroupFilters: mobileNavGroupFilters,
    ...extraParams,
  }).then(sheetRowsAndTem => {
    const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
    const type = pageIndex === 1 ? 'MOBILE_CHANGE_SHEET_ROWS' : 'MOBILE_ADD_SHEET_ROWS';
    const isMore = currentSheetRows.length === WORKSHEET_TABLE_PAGESIZE;
    dispatch({
      type,
      data: currentSheetRows
    });
    dispatch({
      type: 'CHANGE_GALLERY_VIEW_DATA',
      list: currentSheetRows
    });
    dispatch(changeSheetControls());
    dispatch({
      type: 'MOBILE_UPDATE_VIEW_CODE',
      value: sheetRowsAndTem.resultCode
    });
    dispatch({
      type: 'MOBILE_UPDATE_SHEET_VIEW',
      sheetView: {
        isMore,
        count: sheetRowsAndTem.count
      },
    });
    dispatch({ type: 'MOBILE_FETCH_SHEETROW_SUCCESS' });
  });
};

export const changePageIndex = (pageIndex) => (dispatch, getState) => {
  const { sheetView } = getState().mobile;
  const index = pageIndex || sheetView.pageIndex + 1;
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: index },
  });
  dispatch(fetchSheetRows());
}

export const updateQuickFilter = (filter = []) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_QUICK_FILTER',
    filter: filter,
  });
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: 1 },
  });
  dispatch(fetchSheetRows());
}

export const updateFilters = (filters) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_FILTERS',
    filters,
  });
}

export const resetSheetView = () => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: 1 },
  });
  dispatch({
    type: 'MOBILE_UPDATE_FILTERS',
    filters: { keyWords: '', quickFilterKeyWords: '' },
  });
  dispatch({
    type: 'MOBILE_UPDATE_QUICK_FILTER',
    filter: [],
  });
  dispatch(fetchSheetRows());
}

export const emptySheetRows = () => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data: [] });
  dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: {} });
};

export const emptySheetControls = () => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_CHANGE_SHEET_CONTROLS', value: [] });
  dispatch({ type: 'MOBILE_UPDATE_QUICK_FILTER', filter: [] });
  dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: true });
};

export const changeSheetControls = () => (dispatch, getState) => {
  const { base, worksheetInfo } = getState().mobile;
  const { views, template } = worksheetInfo;
  const { viewId } = base;
  const firstView = _.isEmpty(views) ? {} : views[0];
  const view = viewId ? _.find(views, { viewId }) || {} : firstView;
  const newControls = (template && template.controls || []).filter(item => {
    if (item.attribute === 1) {
      return true;
    }
    return _.isEmpty(view) ? true : !view.controls.includes(item.controlId);
  });
  dispatch({
    type: 'MOBILE_WORK_SHEET_CONTROLS',
    value: newControls,
  });
  navigator.share && dispatch(updateWorksheetShareUrl(view.viewId));
};

export const updateCurrentView = ({ currentView, sortCid, sortType }) => (dispatch, getState) => {
  const { worksheetInfo } = getState().mobile;
  const { views } = worksheetInfo;
  const base = {
    appId: worksheetInfo.appId,
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
      worksheetInfo.views = views.map(item => {
        if (item.viewId === currentView.viewId) {
          return result;
        }
        return item;
      });
      dispatch(fetchSheetRows(base));
    });
};

const updateWorksheetShareUrl = viewId => (dispatch, getState) => {
  const { worksheetInfo } = getState().mobile;
  sheetAjax
    .getWorksheetShareUrl({
      objectType: 1,
      appId: worksheetInfo.appId,
      viewId,
      worksheetId: worksheetInfo.worksheetId,
    })
    .then(shareUrl => {
      worksheetInfo.shareUrl = shareUrl;
    });
};

export const changeMobileGroupFilters = data => (dispatch, getState) => {
  dispatch({ type: 'CHANGE_MOBILE_GROUPFILTERS', data })
}

export const changeMobielSheetLoading  = loading => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading })
}