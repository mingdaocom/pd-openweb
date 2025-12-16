import update from 'immutability-helper';
import _, { find, flatten, get, some } from 'lodash';
import homeAppAjax from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import { sortDataByCustomItems } from 'worksheet/redux/actions/util';
import { getBoardItemKey } from 'worksheet/redux/util';
import {
  getCalendartypeData,
  getCalendarViewType,
  getTimeControls,
  isTimeStyle,
  setDataFormat,
} from 'worksheet/views/CalendarView/util';
import { handleConditionsDefault, validate } from 'src/pages/Mobile/RecordList/QuickFilter/utils.js';
import { formatFilterValues, formatFilterValuesToServer } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils.js';
import { formatForSave } from 'src/pages/worksheet/common/WorkSheetFilter/model';
import { formatOriginFilterGroupValue } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { fireWhenViewLoaded as PcFireWhenViewLoaded, refreshSheet } from 'src/pages/worksheet/redux/actions/index.js';
import { canEditApp, sortDataByGroupItems } from 'src/pages/worksheet/redux/actions/util';
import { getTranslateInfo } from 'src/utils/app';
import { getFilledRequestParams, getRequest } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { formatQuickFilter, needHideViewFilters } from 'src/utils/filter';
import { addBehaviorLog, compatibleMDJS, dateConvertToUserZone } from 'src/utils/project';
import {
  replaceAdvancedSettingTranslateInfo,
  replaceControlsTranslateInfo,
  replaceRulesTranslateInfo,
} from 'src/utils/translate';
import { getGroupControlId } from 'src/utils/worksheet';
import { getFlatSheetRows } from '../util';

const dealBoardViewRecordCount = data => {
  if (!data || !_.isArray(data)) return {};
  return data.map(item => ({ [item.key]: item.totalNum })).reduce((p, c) => ({ ...p, ...c }), {});
};

export function changeBoardViewData(data) {
  return {
    type: 'MOBILE_CHANGE_BOARD_VIEW_DATA',
    data,
  };
}

export function initBoardViewRecordCount(data) {
  return { type: 'MOBILE_INIT_BOARD_VIEW_RECORD_COUNT', data };
}

export function updateBoardViewRecordCount(data) {
  return { type: 'MOBILE_UPDATE_BOARD_VIEW_RECORD_COUNT', data };
}

export function changeBoardViewState(data) {
  return { type: 'MOBILE_CHANGE_BOARD_VIEW_STATE', data };
}

function fireWhenViewLoaded(view, { controls = [] } = {}) {
  return dispatch => {
    if (_.includes([1, 7, 21], view.viewType)) {
      dispatch(PcFireWhenViewLoaded(view, controls));
    }

    if (!get(view, 'fastFilters')) return;
    const newFastFilters = handleConditionsDefault(view.fastFilters || [], controls);
    const fastFiltersHasDefaultValue = some(newFastFilters, validate);
    if (fastFiltersHasDefaultValue) {
      if (get(view, 'advancedSetting.enablebtn') !== '1') {
        dispatch(
          updateQuickFilter(
            newFastFilters.filter(validate).map(condition => ({
              ...condition,
              filterType: condition.dataType === 29 ? 24 : condition.filterType || 2,
              spliceType: condition.spliceType || 1,
              values: formatFilterValuesToServer(
                condition.dataType,
                formatFilterValues(condition.dataType, condition.values),
              ),
              ...(condition.dataType === 36 ? { value: 1 } : {}),
            })),
            view,
            { noLoad: true },
          ),
        );
      }
      dispatch(updateQuickFilterWithDefault(newFastFilters));
    } else {
      dispatch(updateQuickFilterWithDefault(view.fastFilters));
    }
  };
}

// 处理分组数据
function getGroupData({ data = [], view = {}, controls = [], groupKey, moreRows = [], currentKeyPageIndex = 1 }) {
  let result = data;
  const index = _.findIndex(result, v => v.key === groupKey);
  if (index > -1) {
    result[index] = {
      ...result[index],
      rows: _.get(result, `[${index}].rows`, []).concat(moreRows),
      pageIndex: currentKeyPageIndex,
    };
  }
  const viewControls = _.find(controls, c => c.controlId === getGroupControlId(view));
  return viewControls ? sortDataByGroupItems(result, view, controls) : result;
}

export const updateBase = base => (dispatch, getState) => {
  const {
    worksheetInfo: { views, template },
  } = getState().mobile;
  const prevViewId = _.get(getState(), 'mobile.base.viewId');
  const viewChanged = prevViewId && base.viewId && prevViewId !== base.viewId;
  const view = _.find(views, v => v.viewId === base.viewId) || {};
  dispatch({ type: 'WORKSHEET_UPDATE_BASE', base });
  if ((viewChanged || _.includes([1, 7, 21], view.viewType)) && !_.isEmpty(view) && !needHideViewFilters(view)) {
    dispatch({ type: 'MOBILE_UPDATE_FILTERS' });
    dispatch({ type: 'MOBILE_UPDATE_QUICK_FILTER', filter: [] });
    dispatch(fireWhenViewLoaded(view, { controls: template.controls }));
  }
  dispatch({ type: 'MOBILE_UPDATE_BASE', base });
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
  dispatch({ type: 'MOBILE_UPDATE_SHEET_VIEW', sheetView: { pageIndex: 1, isMore: true, count: 0 } });
  const { getFilters } = getRequest();
  if (!window.isMingDaoApp || !getFilters) {
    dispatch(updateActiveSavedFilter([]));
  }
  if (appNaviStyle === 2 && currentNavWorksheetInfo && currentNavWorksheetInfo.worksheetId) {
    dispatch({ type: 'WORKSHEET_INIT', value: currentNavWorksheetInfo });
    dispatch({ type: 'WORKSHEET_PERMISSION_INIT', value: currentNavWorksheetInfo.switches || [] });
    dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: currentNavWorksheetInfo });
    dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading: false });
    currentNavWorksheetInfo.worksheetId &&
      currentNavWorksheetInfo.type === 1 &&
      dispatch(loadSavedFilters(currentNavWorksheetId));
    const views =
      base.type === 'single'
        ? currentNavWorksheetInfo.views
        : (currentNavWorksheetInfo.views || []).filter(
            v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
          );
    const view = base.viewId ? _.find(views, v => v.viewId === base.viewId) : views[0] || {};

    dispatch(fireWhenViewLoaded(view, { controls: _.get(currentNavWorksheetInfo, 'template.controls') || [] }));
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
      compatibleMDJS('workItemInfo', { item: workSheetInfo });
      const addBehaviorLogInfo = sessionStorage.getItem('addBehaviorLogInfo')
        ? JSON.parse(sessionStorage.getItem('addBehaviorLogInfo'))
        : {};

      if (addBehaviorLogInfo.entityId === base.appId || addBehaviorLogInfo.entityId === base.worksheetId) {
        sessionStorage.removeItem('addBehaviorLogInfo');
      } else if (addBehaviorLogInfo.type === 'group') {
        addBehaviorLog('worksheet', base.worksheetId, {}, true);
      } else {
        addBehaviorLog('worksheet', base.worksheetId, {}, true);
        addBehaviorLog('app', base.appId, {}, true);
      }

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
      const { advancedSetting = {}, template = {}, switches = [] } = workSheetInfo;
      workSheetInfo.name = sheetTranslateInfo.name || workSheetInfo.name;
      workSheetInfo.entityName = sheetTranslateInfo.recordName || workSheetInfo.entityName;
      workSheetInfo.advancedSetting = {
        ...advancedSetting,
        title: sheetTranslateInfo.formTitle || advancedSetting.title,
        sub: sheetTranslateInfo.formSub || advancedSetting.sub,
        continue: sheetTranslateInfo.formContinue || advancedSetting.continue,
      };
      workSheetInfo.views = (workSheetInfo.views || []).map(view => {
        return {
          ...view,
          name: getTranslateInfo(base.appId, base.worksheetId, view.viewId).name || view.name,
        };
      });
      let view =
        base.viewId &&
        base.viewId !== 'undefined' &&
        _.findIndex(
          workSheetInfo.views.map(v => v.viewId),
          v => v === base.viewId,
        ) > -1
          ? _.find(workSheetInfo.views, v => v.viewId === base.viewId)
          : workSheetInfo.views[0];
      if (_.includes(['hide', 'spc&happ'], _.get(view, 'advancedSetting.showhide')) && base.type !== 'single') {
        view = _.find(
          workSheetInfo.views,
          v => !_.includes(['hide', 'spc&happ'], _.get(v, 'advancedSetting.showhide')),
        );
      }
      if (view) {
        dispatch(updateBase({ ...base, viewId: view.viewId }));
      }
      if (workSheetInfo.template) {
        workSheetInfo.template.controls = replaceControlsTranslateInfo(
          base.appId,
          workSheetInfo.worksheetId,
          template.controls || [],
        );
      }
      if (workSheetInfo.advancedSetting) {
        workSheetInfo.advancedSetting = replaceAdvancedSettingTranslateInfo(
          base.appId,
          workSheetInfo.worksheetId,
          workSheetInfo.advancedSetting || {},
        );
      }
      if (workSheetInfo.rules && workSheetInfo.rules.length) {
        workSheetInfo.rules = replaceRulesTranslateInfo(base.appId, workSheetInfo.worksheetId, workSheetInfo.rules);
      }
      if (workSheetInfo.type === 1) {
        dispatch(loadSavedFilters(workSheetInfo.worksheetId));
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
      dispatch(fireWhenViewLoaded(view, { controls: template.controls }));
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

export const loadSavedFilters = worksheetId => dispatch => {
  if (!worksheetId) return;
  sheetAjax.getWorksheetFilters({ worksheetId }).then(data => {
    let filters = data.map(formatOriginFilterGroupValue);
    if (md.global.Account.isPortal) {
      filters = filters.filter(o => o.type !== 2); // 外部门户 排除公共筛选
    }
    dispatch({ type: 'UPDATE_SAVED_FILTERS', filters });
  });
};

const promiseRequests = {};

export const fetchSheetRows =
  (param = {}) =>
  (dispatch, getState) => {
    const {
      base,
      filters,
      sheetView,
      worksheetInfo = {},
      quickFilter,
      sheetFiltersGroup,
      mobileNavGroupFilters,
      filterControls = [],
      batchCheckAll,
      batchOptVisible,
      currentSheetRows,
      batchOptCheckedData,
    } = getState().mobile;

    const { appId, worksheetId, viewId, maxCount, type } = base;
    let { views = [], template = {} } = worksheetInfo;
    views =
      base.type === 'single'
        ? views
        : views.filter(
            v => _.get(v, 'advancedSetting.showhide') !== 'hide' && _.get(v, 'advancedSetting.showhide') !== 'spc&happ',
          );
    const view = _.find(views, v => v.viewId === viewId) || views[0];
    let hasGroupFilter = !_.isEmpty(view.navGroup) && view.navGroup.length > 0; // 是否存在分组列表
    if (hasGroupFilter && !_.includes([0, 1, 3, 4, 6], view.viewType)) return;
    const defaultViewId = _.get(views[0], 'viewId');
    const showCurrentView = _.some(views, v => v.viewId === viewId);
    const isMobileSingleView = type === 'single';
    if (!showCurrentView && !isMobileSingleView) {
      updateBase({ viewId: defaultViewId });
      safeLocalStorageSetItem(`mobileViewSheet-${worksheetId}`, defaultViewId);
    }
    const { keyWords, requestParams } = filters;
    const { chartId } = getRequest();
    // 看板
    const isKanban = view.viewType === 1;
    // 日历
    const isCalendar = view.viewType === 4;

    let pageIndex = param.pageIndex || sheetView.pageIndex || param.kanbanIndex;
    let extraParams = param;
    let pageSize = 50;

    // 分组参数
    let groupControlId = getGroupControlId(view);
    if (isKanban) groupControlId = view.viewControl;
    const groupControl = _.find(template.controls, { controlId: groupControlId });
    if (groupControl) {
      extraParams.kanbanIndex = 1;
      extraParams.kanbanSize = 50;
    }
    if (!!groupControl && groupControl.type === 29) {
      extraParams.relationWorksheetId = groupControl.dataSource;
    }
    if (groupControlId) {
      extraParams.pageSize = 10;
    }

    // 看板分页用特殊字段
    if (isKanban) {
      extraParams.kanbanIndex = param.kanbanIndex;
      extraParams.kanbanSize = param.kanbanSize;
    }

    if (!worksheetId) {
      return;
    }

    // 筛选列表分栏模式下&不显示‘全部’项初始不调用接口
    if (
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      _.get(view, 'advancedSetting.appnavtype') == '3' &&
      _.get(view, 'advancedSetting.showallitem') === '1' &&
      _.isEmpty(mobileNavGroupFilters)
    ) {
      dispatch(changeMobileSheetRows([]));
      return;
    }

    if (maxCount) {
      pageIndex = 1;
      pageSize = maxCount;
    }
    const requestId = viewId || defaultViewId;
    const promiseRequest = promiseRequests[requestId];
    if (promiseRequest && promiseRequest.abort && base.type !== 'single') {
      promiseRequest.abort();
    }

    dispatch({ type: 'MOBILE_FETCH_SHEETROW_START' });
    dispatch({ type: 'MOBILE_UPDATE_SHEET_VIEW', sheetView: { pageIndex } });
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
      fastFilters: formatQuickFilter(quickFilter),
      navGroupFilters: mobileNavGroupFilters,
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
      requestParams,
      ...extraParams,
    });
    // 看板分页用特殊字段
    if (isKanban) {
      delete params.pageSize;
      delete params.pageIndex;
    }
    promiseRequests[requestId] = sheetAjax.getFilterRows(params);
    promiseRequests[requestId].then(sheetRowsAndTem => {
      const newData = sheetRowsAndTem && sheetRowsAndTem.data ? sheetRowsAndTem.data : [];
      let listData = getGroupData({
        data: pageIndex === 1 ? newData : currentSheetRows.concat(newData),
        view,
        controls: template.controls,
      });
      if (groupControlId) {
        const groupopen = _.get(view, 'advancedSetting.groupopen') || '2';
        dispatch({
          type: 'UPDATE_GROUP_DATA_INFO',
          data: {
            groupData: listData,
            unfoldedKeys: !['3', '2'].includes(groupopen)
              ? [_.get(listData, '[0].key')]
              : groupopen === '2'
                ? listData.map(o => o.key)
                : [],
          },
        });
      }
      const isMore = listData.length < sheetRowsAndTem.count;
      listData = groupControlId
        ? _.reduce(_.cloneDeep(listData), (result, item) => result.concat(item.rows ? item.rows : []), []).map(v =>
            JSON.parse(v),
          )
        : listData;
      if (batchOptVisible) {
        if (batchCheckAll) {
          dispatch(changeBatchOptData(listData.map(item => item.rowid)));
        }
        if (batchOptCheckedData.length === sheetRowsAndTem.count) {
          dispatch({ type: 'UPDATE_BATCH_CHECK_ALL', data: true });
        }
      }
      dispatch({
        type: 'MOBILE_CHANGE_SHEET_ROWS',
        data: listData,
      });
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: listData,
      });
      // 看板逻辑
      if (isKanban) {
        const formatData = sortDataByCustomItems(sheetRowsAndTem.data, view, template.controls);
        dispatch(changeBoardViewData(formatData));
        dispatch(initBoardViewRecordCount(dealBoardViewRecordCount(formatData)));
        dispatch(
          changeBoardViewState({
            kanbanIndex: params.kanbanIndex,
            hasMoreData: !(sheetRowsAndTem.data < params.kanbanSize),
          }),
        );
      }

      if (isCalendar) {
        dispatch({
          type: 'MOBILE_CHANGE_CALENDAR_LIST',
          data: listData,
        });
        dispatch(updateFormatData(listData));
        dispatch({ type: 'MOBILE_CHANGE_CALENDAR_LOADING', data: false });
      }

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
      dispatch(updateIsPullRefreshing(false));
      promiseRequests[worksheetId] = undefined;
    });
  };

export const loadGroupMore = groupKey => (dispatch, getState) => {
  dispatch({ type: 'UPDATE_GROUP_DATA_INFO', data: { isGroupLoading: true } });

  const {
    base,
    filters,
    quickFilter,
    sheetFiltersGroup,
    mobileNavGroupFilters,
    groupDataInfo,
    filterControls = [],
    worksheetInfo = {},
  } = getState().mobile;
  const { appId, worksheetId, viewId } = base;
  let { views = [], template = {} } = worksheetInfo;
  const view = _.find(views, v => v.viewId === viewId) || views[0];
  const { keyWords, requestParams } = filters;
  const { groupData, currentKeyPageIndex = 1 } = groupDataInfo;
  const { chartId } = getRequest();

  const params = getFilledRequestParams({
    worksheetId,
    appId,
    searchType: 1,
    pageSize: 10,
    pageIndex: currentKeyPageIndex,
    status: 1,
    viewId,
    keyWords,
    filterControls: filterControls,
    sortControls: [],
    reportId: chartId ? chartId : undefined,
    filtersGroup: sheetFiltersGroup,
    fastFilters: formatQuickFilter(quickFilter),
    navGroupFilters: mobileNavGroupFilters,
    kanbanKey: groupKey,
    requestParams,
  });

  sheetAjax.getFilterRows(params).then(({ data = [] }) => {
    const { rows } = _.find(data, v => v.key === groupKey) || {};

    dispatch({
      type: 'UPDATE_GROUP_DATA_INFO',
      data: {
        isGroupLoading: false,
        groupData: getGroupData({
          data: groupData,
          view,
          controls: template.controls,
          groupKey,
          moreRows: rows,
          currentKeyPageIndex,
        }),
      },
    });
  });
};

export const changeMobileSheetRows = data => dispatch => {
  dispatch({ type: 'MOBILE_CHANGE_SHEET_ROWS', data });
};

export const unshiftSheetRow = data => dispatch => {
  dispatch({
    type: 'MOBILE_UNSHIFT_SHEET_ROWS',
    data: data,
  });
};

export const changePageIndex = pageIndex => (dispatch, getState) => {
  const { sheetView, sheetRowLoading, isPullRefreshing } = getState().mobile;
  const index = pageIndex || sheetView.pageIndex + 1;
  if ((!sheetRowLoading && sheetView.isMore) || isPullRefreshing || pageIndex === 1) {
    dispatch(fetchSheetRows({ pageIndex: index }));
  }
};

export const updateQuickFilter =
  (filter = [], view, { noLoad } = {}) =>
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

    if (noLoad) return;

    if (_.includes([7, 21], view.viewType)) {
      dispatch({
        type: 'WORKSHEET_UPDATE_QUICK_FILTER',
        filter: filter,
      });
      dispatch(refreshSheet(view, { resetPageIndex: true }));
    } else {
      dispatch(fetchSheetRows());
    }
  };

export function updateQuickFilterWithDefault(filter = []) {
  return dispatch => {
    dispatch({
      type: 'UPDATE_QUICK_FILTER_WITH_DEFAULT',
      filter: filter.map(condition => ({
        ...condition,
        values: formatFilterValues(condition.dataType, condition.values),
      })),
    });
  };
}

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

export const updateActiveSavedFilter = filter => dispatch => {
  dispatch({ type: 'UPDATE_ACTIVE_SAVED_FILTERS', filter });
  dispatch({ type: 'MOBILE_UPDATE_FILTER_CONTROLS', filterControls: formatForSave(filter) });
};

export const updateFiltersGroup = (filter, view) => dispatch => {
  dispatch({
    type: 'MOBILE_UPDATE_FILTERS_GROUP',
    filter: filter,
  });
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: 1 },
  });
  dispatch(fetchSheetRows());
  if (view?.viewType === 4) {
    dispatch(getNotScheduledEventList({ onlyGetCount: true }));
  }
};

export const resetSheetView = () => dispatch => {
  dispatch({
    type: 'MOBILE_UPDATE_SHEET_VIEW',
    sheetView: { pageIndex: 1 },
  });
  dispatch({
    type: 'MOBILE_UPDATE_FILTERS',
    filters: { keyWords: '', quickFilterKeyWords: '' },
  });
  dispatch(fetchSheetRows());
};

export const emptySheetRows = () => dispatch => {
  changeMobileSheetRows([]);
  dispatch({ type: 'MOBILE_WORK_SHEET_INFO', data: {} });
};

export const emptySheetControls = () => dispatch => {
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

export const changeMobileGroupFilters = data => dispatch => {
  dispatch({ type: 'CHANGE_MOBILE_GROUPFILTERS', data });
};

export const changeMobielSheetLoading = loading => dispatch => {
  dispatch({ type: 'MOBILE_WORK_SHEET_UPDATE_LOADING', loading });
};

export const changeBatchOptVisible = flag => dispatch => {
  dispatch({ type: 'CHABGE_MOBILE_BATCHOPT_VISIBLE', flag });
  dispatch(updateBatchCheckAll(false));
  dispatch(changeBatchOptData([]));
};

export const updateBatchCheckAll = isAll => (dispatch, getState) => {
  const { currentSheetRows, groupDataInfo, base, worksheetInfo } = getState().mobile;
  const { groupData, unfoldedKeys } = groupDataInfo;
  const view = _.find(worksheetInfo.views || [], v => v.viewId === base.viewId);
  const groupControlId = getGroupControlId(view);
  const groupRows = getFlatSheetRows({ groupData, unfoldedKeys });
  dispatch({ type: 'UPDATE_BATCH_CHECK_ALL', data: isAll });
  const batchData = groupControlId
    ? groupRows.map(item => safeParse(item).rowid)
    : currentSheetRows.map(item => item.rowid);
  if (isAll) {
    dispatch(changeBatchOptData(batchData));
  } else {
    dispatch(changeBatchOptData([]));
  }
};

export const changeBatchOptData = data => dispatch => {
  dispatch({ type: 'CAHNGE_BATCHOPT_CHECKED', data });
};

export const updateMobileViewPermission = params => dispatch => {
  let { viewId, appId, worksheetId } = params;
  sheetAjax.getViewPermission({ viewId, appId, worksheetId }).then(data => {
    if (data.view) {
      dispatch({ type: 'UPDATE_MOBILEVIEW_PERMISSION', data: data.view });
    }
  });
};

export const updateClickChart = flag => dispatch => {
  dispatch({ type: 'UPDATE_CLICK_CHART', flag });
};

export const updateFilterControls = filterControls => dispatch => {
  dispatch({ type: 'MOBILE_UPDATE_FILTER_CONTROLS', filterControls });
};

export const updateIsPullRefreshing = flag => dispatch => {
  dispatch({ type: 'MOBILE_IS_PULL_REFRESHING', flag });
};

export const updatePreviewRecordId = data => dispatch => {
  safeLocalStorageSetItem('mobilePreviewRecordId', data);
  dispatch({ type: 'UPDATE_PREVIEW_RECORD', data });
};

export const updateRow =
  ({ recordId, rowData, isViewData }) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_UPDATE_SHEET_ROW_BY_ROWID',
      recordId,
      rowUpdatedValue: rowData,
      isViewData,
    });
  };

export const updateGroupDataInfo = data => (dispatch, getState) => {
  const { batchOptVisible, groupDataInfo, batchOptCheckedData } = getState().mobile;
  const { groupData } = groupDataInfo;
  dispatch({
    type: 'UPDATE_GROUP_DATA_INFO',
    data,
  });
  if (batchOptVisible) {
    const expandRows = getFlatSheetRows({ groupData, unfoldedKeys: data.unfoldedKeys || groupDataInfo.unfoldedKeys });
    dispatch({ type: 'UPDATE_BATCH_CHECK_ALL', data: batchOptCheckedData.length === expandRows.length });
  }
};

const getBoardViewPara = (sheet = {}) => {
  const { base, filters, quickFilter, sheetFiltersGroup, mobileNavGroupFilters, filterControls = [] } = sheet;
  const { appId, worksheetId, viewId } = base;
  const { keyWords, requestParams } = filters;
  const { chartId } = getRequest();
  const params = getFilledRequestParams({
    worksheetId,
    appId,
    searchType: 1,
    status: 1,
    viewId,
    keyWords,
    kanbanSize: 50,
    filterControls: filterControls,
    sortControls: [],
    reportId: chartId ? chartId : undefined,
    filtersGroup: sheetFiltersGroup,
    fastFilters: formatQuickFilter(quickFilter),
    navGroupFilters: mobileNavGroupFilters,
    requestParams,
  });

  return params;
};

// 获取看板下一页分组
export const loadBoardViewNextGroup = ({ callback = _.noop }) => {
  return (dispatch, getState) => {
    const sheet = getState().mobile;
    const { boardView } = sheet;
    const { boardViewState, boardViewRecordCount, boardData } = boardView;
    const { hasMoreData, kanbanIndex } = boardViewState;
    const params = getBoardViewPara(sheet);

    if (!hasMoreData || !params) {
      callback();
      return;
    }

    const nextKanbanIndex = kanbanIndex + 1;
    sheetAjax
      .getFilterRows({ ...params, kanbanIndex: nextKanbanIndex })
      .then(({ data = [] }) => {
        // 将已经存在的看板过滤掉
        const existedKeys = boardData.map(item => item.key);
        const filterData = data
          .filter(item => !_.includes(existedKeys, item.key))
          .map((item, index) => ({ ...item, sort: existedKeys.length + index + 1 }));
        dispatch(changeBoardViewData(boardData.concat(filterData)));
        dispatch(initBoardViewRecordCount({ ...boardViewRecordCount, ...dealBoardViewRecordCount(filterData) }));
        let nextBoardViewState = { kanbanIndex: nextKanbanIndex, hasMoreData };
        if (data.length < 50) nextBoardViewState.hasMoreData = false;
        dispatch(changeBoardViewState(nextBoardViewState));
      })
      .finally(() => {
        callback();
      });
  };
};

// 获取看板单个分组下的数据（滚动加载）
export const loadBoardViewGroupItemData =
  ({ pageIndex = 1, kanbanKey }, callback = _.noop) =>
  (dispatch, getState) => {
    const sheet = getState().mobile;
    const { boardView } = sheet;
    const params = getBoardViewPara(sheet);

    params.pageIndex = pageIndex;
    params.kanbanKey = kanbanKey;

    sheetAjax
      .getFilterRows(params)
      .then(({ data = [] }) => {
        const { boardData } = boardView;
        const boardViewIndex = _.findIndex(boardData, item => item.key === kanbanKey);
        const nextData = _.get(
          _.find(data, item => item.key === kanbanKey),
          'rows',
        );
        dispatch({
          type: 'MOBILE_CHANGE_BOARD_VIEW_DATA',
          data:
            pageIndex === 1
              ? data
              : update(boardData, {
                  [boardViewIndex]: {
                    rows: {
                      $set: [...boardData[boardViewIndex].rows, ...nextData],
                    },
                  },
                }),
        });
        dispatch(initBoardViewRecordCount(dealBoardViewRecordCount(data)));
      })
      .finally(() => {
        callback();
      });
  };

export const initBoardViewData = () => {
  return dispatch => {
    dispatch(
      fetchSheetRows({
        kanbanIndex: 1,
        kanbanSize: 50,
      }),
    );
  };
};

export const getSingleBoardGroup = ({ pageIndex = 1, kanbanKey } = {}, callback) => {
  return dispatch => {
    dispatch(
      loadBoardViewGroupItemData(
        {
          pageIndex,
          kanbanKey,
        },
        callback,
      ),
    );
  };
};

export function updateBoardViewRecord(data) {
  return dispatch => {
    dispatch({ type: 'MOBILE_UPDATE_BOARD_VIEW_RECORD', data });
    if (data.target) {
      let targetKey = getBoardItemKey(data.target);
      if (targetKey === 'user-undefined') targetKey = '-1';
      dispatch(updateBoardViewRecordCount([data.key, -1]));
      dispatch(updateBoardViewRecordCount([targetKey, 1]));
    }
  };
}

// 更新多选看板
export const updateMultiSelectBoard = data => ({ type: 'MOBILE_UPDATE_MULTI_SELECT_BOARD', data });

export function addBoardViewRecord(data) {
  return dispatch => {
    const { item, key } = data;
    dispatch({ type: 'MOBILE_ADD_BOARD_VIEW_RECORD', data: { item, key } });
    dispatch(updateBoardViewRecordCount([key, 1]));
  };
}

export function delBoardViewRecord(data) {
  return dispatch => {
    dispatch({ type: 'MOBILE_DEL_BOARD_VIEW_RECORD_COUNT', data });
    dispatch(updateBoardViewRecordCount([data.key, -1]));
  };
}

export const updateViewCard = data => {
  return dispatch => {
    dispatch({ type: 'MOBILE_UPDATE_VIEW_CARD', data });
  };
};

export const initCalendarViewData = searchArgs => {
  return dispatch => {
    if (searchArgs.beginTime) {
      searchArgs.beginTime = dateConvertToUserZone(searchArgs.beginTime);
    }
    if (searchArgs.endTime) {
      searchArgs.endTime = dateConvertToUserZone(searchArgs.endTime);
    }
    if (!searchArgs.isSilent) {
      dispatch({ type: 'MOBILE_CHANGE_CALENDAR_LOADING', data: true });
    }
    dispatch(
      fetchSheetRows({
        beginTime: searchArgs.beginTime,
        endTime: searchArgs.endTime,
        pageSize: 10000000,
      }),
    );
  };
};

export const getCalendarData = () => {
  return (dispatch, getState) => {
    const { base, worksheetInfo } = getState().mobile;
    const { viewId = '', worksheetId } = base;
    const { views, template } = worksheetInfo;
    const view = _.find(views, { viewId }) || {};
    const controls = (template && template.controls) || [];
    let {
      calendarType = '0',
      unweekday = '',
      colorid = '',
      begindate = '',
      enddate = '',
      calendarcids = '[]',
    } = getAdvanceSetting(view);
    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
      console.log(error);
    }
    let colorList = colorid ? controls.find(it => it.controlId === colorid) || [] : [];
    let timeControls = getTimeControls(controls);
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate ? begindate : (timeControls[0] || {}).controlId, end: enddate }]; //兼容老数据
    }
    let calendarInfo = calendarcids.map(o => {
      const startData = o.begin ? timeControls.find(it => it.controlId === o.begin) || {} : {};
      const endData = o.end ? timeControls.find(it => it.controlId === o.end) || {} : {};
      return {
        ...o,
        startData,
        startFormat: isTimeStyle(startData) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
        endData,
        endFormat: isTimeStyle(endData) ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
      };
    });

    let viewType = getCalendartypeData()[`${worksheetId}-${viewId}`];
    let typeStr = '';
    if (viewType) {
      if (['dayGridWeek', 'timeGridWeek'].includes(viewType)) {
        typeStr = isTimeStyle(calendarInfo[0].startData) ? 'timeGridWeek' : 'dayGridWeek';
      } else if (['timeGridDay', 'dayGridDay'].includes(viewType)) {
        typeStr = isTimeStyle(calendarInfo[0].startData) ? 'timeGridDay' : 'dayGridDay';
      } else {
        typeStr = viewType;
      }
    }
    dispatch({
      type: 'MOBILE_CHANGE_CALENDAR_DATA',
      data: {
        calendarInfo,
        unweekday,
        colorOptions: colorList.options || [],
        initialView: typeStr ? typeStr : getCalendarViewType(calendarType, calendarInfo[0].startData),
      },
    });
  };
};

export const updateFormatData = listData => {
  return (dispatch, getState) => {
    const { calendarView = {}, base, worksheetInfo } = getState().mobile;
    const { viewId = '' } = base;
    const { views, template } = worksheetInfo;
    const controls = (template && template.controls) || [];
    const view = _.find(views, { viewId }) || {};
    const { calendarData = {} } = calendarView;
    let list = [];
    listData.map(item => {
      let data = setDataFormat({
        ...item,
        worksheetControls: controls,
        currentView: view,
        calendarData,
      });
      list.push({
        ...data[0],
        originalProps: item,
      });
    });
    dispatch({ type: 'MOBILE_CHANGE_CALENDAR_FORMAT_DATA', data: list });
  };
};

const getCalendarEventListPara = (sheet = {}) => {
  const { base } = sheet;
  const { appId, worksheetId, viewId } = base;
  const { chartId } = getRequest();
  const params = getFilledRequestParams({
    worksheetId,
    appId,
    status: 1,
    viewId,
    reportId: chartId ? chartId : undefined,
    pageSize: 20,
    beginTime: '',
    endTime: '',
  });

  return params;
};

export const formatEventList = ({ listData, controls, view, calendarData, typeEvent }) => {
  const formatList = [];
  listData.map(item => {
    let data = setDataFormat({
      ...item,
      worksheetControls: controls,
      currentView: view,
      calendarData,
      byRowId: typeEvent !== 'eventScheduled',
    });
    formatList.push(...data);
  });
  return formatList;
};

export const getNotScheduledEventList = ({
  pageIndex = 1,
  keyWords = '',
  onlyGetCount = false,
  callback = _.noop,
} = {}) => {
  return (dispatch, getState) => {
    const sheet = getState().mobile;
    const { calendarView, calenderNotScheduled, sheetFiltersGroup } = sheet;
    const { calendarData = {} } = calendarView;
    const { calendarInfo = [] } = calendarData;
    const { list = [], loading, total } = calenderNotScheduled;

    if (loading) return;
    const filterControls = calendarInfo.map(o => ({
      controlId: o.begin,
      datatype: o.startData.type,
      values: [],
      spliceType: 1, //且
      filterType: 7,
      dateRange: 0,
    }));

    let params = {
      pageIndex,
      keyWords,
      filterControls: [...sheetFiltersGroup, ...filterControls],
      ...getCalendarEventListPara(sheet),
    };
    if (!onlyGetCount) {
      dispatch({
        type: 'MOBILE_CHANGE_CALENDAR_NOT_SCHEDULED',
        data: {
          loading: true,
          ...(pageIndex === 1 ? { list: [] } : {}),
        },
      });
    }
    sheetAjax
      .getFilterRows(params)
      .then(({ data = [], count = 0 }) => {
        // 初始化时获取未排期数量
        if (onlyGetCount) {
          dispatch({
            type: 'MOBILE_CHANGE_CALENDAR_NOT_SCHEDULED_TOTAL',
            total: count,
          });
          return;
        }
        const hasMore = list.length + data.length < count;
        // 有搜索条件的时候，还是以实际数量为准
        const realTotal = keyWords ? total : count;
        const base = { total: realTotal, hasMore, loading: false };
        const newList = {
          ...base,
          list: pageIndex === 1 ? data : [...(list || []), ...(data || [])],
        };

        dispatch({
          type: 'MOBILE_CHANGE_CALENDAR_NOT_SCHEDULED',
          data: newList,
        });
      })
      .finally(() => {
        callback();
      });
  };
};

export const resetCalendarNotScheduled = () => {
  return dispatch => {
    dispatch({ type: 'MOBILE_RESET_CALENDAR_NOT_SCHEDULED' });
  };
};

export const deleteCalendarNotScheduled = rowid => {
  return dispatch => {
    dispatch({ type: 'MOBILE_DELETE_CALENDAR_NOT_SCHEDULED', rowid });
  };
};

export const updateCalendarNotScheduled = (rowid, rowData = {}) => {
  return (dispatch, getState) => {
    const sheet = getState().mobile;
    const { calendarView } = sheet;
    const { calendarData = {} } = calendarView;
    const { calendarInfo = [] } = calendarData;
    const beginControlId = calendarInfo.map(o => o.begin) || [];
    const hasScheduled = beginControlId.some(key => !!rowData[key]);
    if (hasScheduled) {
      dispatch(deleteCalendarNotScheduled(rowid));
      return;
    }
    dispatch({ type: 'MOBILE_UPDATE_CALENDAR_NOT_SCHEDULED', rowid, rowData });
  };
};

export function loadCustomButtons({ appId, worksheetId }, cb = () => {}) {
  return dispatch => {
    if (!worksheetId || _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
      return;
    }
    sheetAjax
      .getWorksheetBtns({
        appId,
        worksheetId,
      })
      .then(buttons => {
        dispatch({
          type: 'MOBILE_WORKSHEET_UPDATE_SHEET_BUTTONS',
          buttons,
        });
        cb();
      });
  };
}

export function handleLoadOperateButtons({ worksheetInfo }) {
  return dispatch => {
    const actionColumn = flatten(
      worksheetInfo.views.map(v => safeParse(get(v, 'advancedSetting.actioncolumn'), 'array')),
    );
    const needLoadCustomButtons = !get(window, 'shareState.shareId') && find(actionColumn, c => c.type === 'btn');
    const needLoadPrintList = !get(window, 'shareState.shareId') && find(actionColumn, c => c.type === 'print');

    const { appId, worksheetId } = worksheetInfo;

    if (needLoadCustomButtons) {
      dispatch(
        loadCustomButtons({
          appId,
          worksheetId,
        }),
      );
    }
    if (needLoadPrintList) {
      sheetAjax.getPrintList({ worksheetId }).then(data => {
        dispatch({
          type: 'MOBILE_WORKSHEET_UPDATE_PRINT_LIST',
          printList: data,
        });
      });
    }
  };
}

export function onDeleteSuccess({ rowId }) {
  return (dispatch, getState) => {
    const { currentSheetRows } = getState().mobile;
    dispatch(changeMobileSheetRows(currentSheetRows.filter(r => r.rowid !== rowId)));
  };
}
