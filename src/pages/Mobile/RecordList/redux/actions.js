import sheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { refreshSheet } from 'src/pages/worksheet/redux/actions/index.js';
import { getRequest, getTranslateInfo } from 'src/util';
import { getFilledRequestParams, replaceControlsTranslateInfo } from 'worksheet/util';
import _ from 'lodash';

export const updateBase = base => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_BASE',
    base,
  });
  dispatch({
    type: 'WORKSHEET_UPDATE_BASE',
    base,
  });
};

export const loadWorksheet = noNeedGetApp => (dispatch, getState) => {
  const { base, appDetail, filterControls = [] } = getState().mobile;
  const { filters } = getState().sheet;
  const { appSection } = appDetail;
  const { appNaviStyle } = appDetail.detail || {};
  let currentNavWorksheetId = localStorage.getItem('currentNavWorksheetId');
  let currentNavWorksheetInfo =
    currentNavWorksheetId &&
    localStorage.getItem(`currentNavWorksheetInfo-${currentNavWorksheetId}`) &&
    JSON.parse(localStorage.getItem(`currentNavWorksheetInfo-${currentNavWorksheetId}`));
  if (appNaviStyle === 2 && currentNavWorksheetInfo) {
    dispatch({ type: 'WORKSHEET_INIT', value: currentNavWorksheetInfo });
    dispatch({ type: 'WORKSHEET_PERMISSION_INIT', value: currentNavWorksheetInfo.switches || [] });
    dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: currentNavWorksheetInfo });
    dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: false });
  } else {
    dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: true });
  }
  sheetAjax
    .getWorksheetInfo({
      appId: base.appId,
      worksheetId: base.worksheetId,
      getTemplate: true,
      getViews: true,
      getRules: true,
      getSwitchPermit: true,
    })
    .then(workSheetInfo => {
      if (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
        workSheetInfo.allowAdd = false;
      }
      if (appNaviStyle === 2) {
        let navSheetList = _.flatten(
          appSection.map(item => {
            item.workSheetInfo.forEach(sheet => {
              sheet.appSectionId = item.appSectionId;
            });
            return item.workSheetInfo;
          }),
        )
          .filter(item => [1, 3].includes(item.status) && !item.navigateHide) //左侧列表状态为1 且 角色权限没有设置隐藏
          .slice(0, 4);
        navSheetList.forEach(item => {
          if (item.workSheetId === workSheetInfo.worksheetId) {
            safeLocalStorageSetItem(`currentNavWorksheetInfo-${item.workSheetId}`, JSON.stringify(workSheetInfo));
          }
        });
      }
      const sheetTranslateInfo = getTranslateInfo(base.appId, null, base.worksheetId);
      const { advancedSetting = {}, template = {}, switches = [], views = [] } = workSheetInfo;
      workSheetInfo.name = sheetTranslateInfo.name || workSheetInfo.name;
      workSheetInfo.entityName = sheetTranslateInfo.recordName || workSheetInfo.entityName;
      workSheetInfo.advancedSetting = {
        ...advancedSetting,
        title: sheetTranslateInfo.formTitle || advancedSetting.title,
        sub: sheetTranslateInfo.formSub || advancedSetting.sub,
        continue: sheetTranslateInfo.formContinue || advancedSetting.continue,
      };
      workSheetInfo.views = views.map(item => {
        return {
          ...item,
          name: getTranslateInfo(base.appId, null, item.viewId).name || item.name,
        };
      });
      if (workSheetInfo.template) {
        workSheetInfo.template.controls = replaceControlsTranslateInfo(
          base.appId,
          workSheetInfo.workSheetId,
          template.controls || [],
        );
      }
      dispatch({ type: 'WORKSHEET_INIT', value: workSheetInfo });
      dispatch({ type: 'WORKSHEET_PERMISSION_INIT', value: switches });
      dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: workSheetInfo });
      dispatch({
        type: 'MOBILE_SHEET_PERMISSION_INIT',
        value: switches,
      });
      dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: false });
      dispatch({ type: 'WORKSHEET_UPDATE_FILTERS', filters: { ...filters, filterControls } });
    });
  if (noNeedGetApp) return;
  homeAppAjax
    .getApp({
      appId: base.appId,
    })
    .then(data => {
      dispatch({
        type: 'UPDATE_APP_DETAIL',
        data: {
          ...appDetail,
          appName: data.name,
          detail: {
            ...appDetail.detail,
            webMobileDisplay: data.webMobileDisplay,
          },
        },
      });
      const isCharge = canEditApp(data.permissionType, data.isLock);
      dispatch({
        type: 'MOBILE_UPDATE_IS_CHARGE',
        value: isCharge,
      });
      dispatch({
        type: 'MOBILE_APP_COLOR',
        value: data.iconColor,
      });
    });
};

const promiseRequests = {};

export const fetchSheetRows =
  (params = {}) =>
  (dispatch, getState) => {
    const {
      base,
      filters,
      sheetView,
      worksheetInfo = {},
      quickFilter,
      sheetFiltersGroup,
      mobileNavGroupFilters,
      sheetRowLoading,
      filterControls = [],
    } = getState().mobile;

    const { appId, worksheetId, viewId, groupId, maxCount, type } = base;
    let { views = [] } = worksheetInfo;
    views = views.filter(
      v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
    );
    const defaultViewId = _.get(views[0], 'viewId');
    const showCurrentView = _.some(views, v => v.viewId === viewId);
    const isMobileSingleView = type === 'single';
    if (!showCurrentView && !isMobileSingleView) {
      updateBase({ viewId: defaultViewId });
      safeLocalStorageSetItem(`mobileViewSheet-${worksheetId}`, defaultViewId);
    }
    const { keyWords } = filters;
    const { chartId } = getRequest();
    let { pageIndex } = sheetView;
    let extraParams = params ? { ...params } : {};
    let pageSize = 20;
    if (!worksheetId) {
      return;
    }
    dispatch({ type: 'MOBILE_FETCH_SHEETROW_START' });
    if (maxCount) {
      pageIndex = 1;
      pageSize = maxCount;
    }
    const requestId = viewId || defaultViewId;
    const promiseRequest = promiseRequests[requestId];
    if (promiseRequest && promiseRequest.abort) {
      promiseRequest.abort();
    }
    const params = getFilledRequestParams({
      worksheetId,
      appId,
      searchType: 1,
      pageSize,
      pageIndex,
      status: 1,
      viewId: viewId && (showCurrentView || isMobileSingleView) ? viewId : defaultViewId,
      keyWords,
      filterControls: filterControls,
      sortControls: [],
      reportId: chartId ? chartId : undefined,
      filtersGroup: sheetFiltersGroup,
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
    });
    promiseRequests[requestId] = sheetAjax.getFilterRows(params);
    promiseRequests[requestId].then(sheetRowsAndTem => {
      const currentSheetRows = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
      const type = pageIndex === 1 ? 'MOBILE_CHANGE_SHEET_ROWS' : 'MOBILE_ADD_SHEET_ROWS';
      const isMore = maxCount ? false : currentSheetRows.length === pageSize;
      dispatch({
        type,
        data: currentSheetRows,
      });
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: currentSheetRows,
      });
      dispatch(changeSheetControls());
      dispatch({
        type: 'MOBILE_UPDATE_VIEW_CODE',
        value: sheetRowsAndTem.resultCode,
      });
      dispatch({
        type: 'MOBILE_UPDATE_SHEET_VIEW',
        sheetView: {
          isMore,
          count: sheetRowsAndTem.count,
        },
      });
      dispatch({ type: 'MOBILE_FETCH_SHEETROW_SUCCESS' });
      promiseRequests[worksheetId] = undefined;
    });
  };
export const changeMobileSheetRows = data => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data });
};

export const unshiftSheetRow = data => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UNSHIFT_SHEET_ROWS',
    data: data,
  });
};

export const changePageIndex = pageIndex => (dispatch, getState) => {
  const { sheetView } = getState().mobile;
  const index = pageIndex || sheetView.pageIndex + 1;
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: index },
  });
  dispatch(fetchSheetRows());
};

export const updateQuickFilter =
  (filter = []) =>
  (dispatch, getState) => {
    const { base = {}, worksheetInfo = {} } = getState().mobile;
    const view = _.find(worksheetInfo.views || [], item => base.viewId === item.viewId) || {};

    dispatch({
      type: 'MOBILE_UPDATE_QUICK_FILTER',
      filter: filter,
    });
    dispatch({
      type: 'MOBILE_UPDATE_SHEET_VIEW',
      sheetView: { pageIndex: 1 },
    });
    if (view.viewType === 7) {
      dispatch({
        type: 'WORKSHEET_UPDATE_QUICK_FILTER',
        filter: filter,
      });
      dispatch(refreshSheet(view, { resetPageIndex: true }));
    } else {
      dispatch(fetchSheetRows());
    }
  };

export const updateFilters = (filters, view) => (dispatch, getState) => {
  const { base = {}, worksheetInfo = {} } = getState().mobile;
  view = view || _.find(worksheetInfo.views || [], item => base.viewId === item.viewId) || {};

  dispatch({
    type: 'MOBILE_UPDATE_FILTERS',
    filters,
  });
  if (view.viewType === 7) {
    dispatch({
      type: 'WORKSHEET_UPDATE_FILTERS',
      filters,
    });
    dispatch(refreshSheet(view, { changeFilters: true }));
  }
};

export const updateFiltersGroup = filter => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_FILTERS_GROUP',
    filter: filter,
  });
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: 1 },
  });
  dispatch(fetchSheetRows());
};

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
};

export const emptySheetRows = () => (dispatch, getState) => {
  changeMobileSheetRows([]);
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
  const newControls = ((template && template.controls) || []).filter(item => {
    if (item.attribute === 1) {
      return true;
    }
    return _.isEmpty(view) ? true : !view.controls.includes(item.controlId);
  });
  dispatch({
    type: 'MOBILE_WORK_SHEET_CONTROLS',
    value: newControls,
  });
};

export const updateCurrentView =
  ({ currentView, sortCid, sortType }) =>
  (dispatch, getState) => {
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

export const changeMobileGroupFilters = data => (dispatch, getState) => {
  dispatch({ type: 'CHANGE_MOBILE_GROUPFILTERS', data });
};

export const changeMobielSheetLoading = loading => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading });
};

export const changeBatchOptVisible = flag => (dispatch, getState) => {
  dispatch({ type: 'CHABGE_MOBILE_BATCHOPT_VISIBLE', flag });
};

export const changeBatchOptData = data => (dispatch, getState) => {
  dispatch({ type: 'CAHNGE_BATCHOPT_CHECKED', data });
};

export const updateMobileViewPermission = params => (dispatch, getState) => {
  let { viewId, appId, worksheetId } = params;
  sheetAjax.getViewPermission({ viewId, appId, worksheetId }).then(data => {
    if (data.view) {
      dispatch({ type: 'UPDATE_MOBILEVIEW_PERMISSION', data: data.view });
    }
  });
};

export const updateClickChart = flag => (dispatch, getState) => {
  dispatch({ type: 'UPDATE_CLICK_CHART', flag });
};

export const updateFilterControls = filterControls => dispatch => {
  dispatch({ type: 'MOBILE_UPDATE_FILTER_CONTROLS', filterControls });
};
