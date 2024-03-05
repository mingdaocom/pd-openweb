import worksheetAjax from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import update from 'immutability-helper';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { formatValuesOfCondition } from 'worksheet/common/WorkSheetFilter/util';
import addRecord from 'worksheet/common/newRecord/addRecord';
import {
  refresh as sheetViewRefresh,
  addRecord as sheetViewAddRecord,
  setViewLayout,
  setHighLightOfRows,
} from './sheetview';
import { refresh as galleryViewRefresh } from './galleryview';
import { refresh as calendarViewRefresh } from './calendarview';
import { refresh as resourceViewRefresh } from './resourceview';
import { resetLoadGunterView, addNewRecord as addGunterNewRecord } from './gunterview';
import { initBoardViewData } from './boardView';
import { getDefaultHierarchyData, updateHierarchySearchRecord } from './hierarchy';
import { updateGunterSearchRecord } from './gunterview';
import { refresh as detailViewRefresh } from './detailView';
import { refresh as customWidgetViewRefresh } from './customWidgetView';
import { refreshBtnData } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import { getFilledRequestParams, replaceControlsTranslateInfo } from 'src/pages/worksheet/util';
import _ from 'lodash';
import { emitter, getTranslateInfo } from 'src/util';
import { initMapViewData, mapNavGroupFiltersUpdate } from './mapView';

export const updateBase = base => {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base: Object.assign({}, base, {
        chartId: base.chartId || undefined,
      }),
    });
  };
};

export const clearChartId = base => {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base: { chartId: undefined },
    });
  };
};

// 更新个别字段
export const updateWorksheetSomeControls = controls => ({
  type: 'WORKSHEET_UPDATE_SOME_CONTROLS',
  controls,
});

export const updateIsCharge = isCharge => ({ type: 'WORKSHEET_UPDATE_IS_CHARGE', isCharge });
export const updateAppPkgData = appPkgData => ({ type: 'WORKSHEET_UPDATE_APPPKGDATA', appPkgData });

export const updateWorksheetLoading = loading => ({ type: 'WORKSHEET_UPDATE_LOADING', loading });

let worksheetRequest = null;

export function loadWorksheet(worksheetId, setRequest) {
  return (dispatch, getState) => {
    const { base = {} } = getState().sheet;
    const { appId, viewId, chartId } = base;

    if (
      worksheetRequest &&
      worksheetRequest.state() === 'pending' &&
      worksheetRequest.abort &&
      base.type !== 'single'
    ) {
      worksheetRequest.abort();
    }

    dispatch({
      type: 'WORKSHEET_FETCH_START',
    });

    const args = {
      worksheetId,
      reportId: chartId || undefined,
      getViews: true,
      getTemplate: true,
      getRules: true,
      getSwitchPermit: true,
      resultType: 2,
    };

    worksheetRequest = worksheetAjax.getWorksheetInfo(args);
    if (_.isFunction(setRequest)) {
      setRequest(worksheetRequest);
    }
    worksheetRequest
      .then(async res => {
        const translateInfo = getTranslateInfo(appId, worksheetId);
        res.entityName = translateInfo.recordName || res.entityName;
        if (res.advancedSetting) {
          res.advancedSetting.title = translateInfo.formTitle || res.advancedSetting.title;
          res.advancedSetting.sub = translateInfo.formSub || res.advancedSetting.sub;
          res.advancedSetting.continue = translateInfo.formContinue || res.advancedSetting.continue;
        }
        if (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
          res.allowAdd = false;
        }
        let queryRes;
        if (res.isWorksheetQuery) {
          queryRes = await worksheetAjax.getQueryBySheetId({ worksheetId }, { silent: true });
        }

        if (![1, 4].includes(res.resultCode)) {
          dispatch({
            type: 'WORKSHEET_INIT_FAIL',
          });
          return;
        }
        if (_.get(res, 'template.controls')) {
          res.template.controls = replaceControlsTranslateInfo(appId, res.template.controls);
        }
        if (!res.isWorksheetQuery || queryRes) {
          dispatch({
            type: 'WORKSHEET_INIT',
            value: Object.assign(
              !chartId
                ? res
                : {
                    ...res,
                    views: res.views.map(v => ({ ...v, viewType: 0 })),
                  },
              {
                isRequestingRelationControls: res.requestAgain,
              },
            ),
          });
          dispatch(setViewLayout(viewId));
          dispatch({
            type: 'WORKSHEET_SEARCH_CONFIG_INIT',
            value: formatSearchConfigs(_.get(queryRes, 'searchConfig') || []),
          });
        }
        if (worksheetId) {
          dispatch({
            type: 'WORKSHEET_PERMISSION_INIT',
            value: res.switches,
          });
        }
        if (res.requestAgain) {
          worksheetRequest = worksheetAjax.getWorksheetInfo({ ...args, resultType: undefined });
          worksheetRequest.then(infoRes => {
            const newControls = replaceControlsTranslateInfo(appId, _.get(infoRes, 'template.controls'));
            if (_.isEmpty(newControls)) {
              return;
            }
            dispatch(updateWorksheetSomeControls(newControls));
            dispatch({
              type: 'WORKSHEET_UPDATE_IS_REQUESTING_RELATION_CONTROLS',
              value: false,
            });
          });
        }
      })
      .fail(err => {
        dispatch({
          type: 'WORKSHEET_INIT_FAIL',
        });
      });
  };
}

export const updateWorksheetInfo = info => ({
  type: 'WORKSHEET_UPDATE_WORKSHEETINFO',
  info,
});

export function loadCustomButtons({ appId, viewId, rowId, worksheetId }) {
  return dispatch => {
    if (!worksheetId || _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
      return;
    }
    worksheetAjax
      .getWorksheetBtns({
        appId,
        viewId,
        rowId,
        worksheetId,
      })
      .then(buttons => {
        if (!viewId) {
          dispatch({
            type: 'WORKSHEET_UPDATE_SHEETBUTTONS',
            buttons,
          });
        } else {
          dispatch({
            type: 'WORKSHEET_UPDATE_BUTTONS',
            buttons,
          });
        }
      });
  };
}

export function updateCustomButtons(btns, isAdd) {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    let { buttons = [], sheetButtons = [] } = sheet;
    if (isAdd) {
      const sheet = getState().sheet;
      const { base } = sheet;
      const { worksheetId, appId, viewId } = base;
      dispatch({
        type: 'WORKSHEET_UPDATE_SHEETBUTTONS',
        buttons: refreshBtnData(_.cloneDeep(sheetButtons), btns, isAdd),
      }); //更新本表的按钮
      dispatch(loadCustomButtons({ worksheetId, appId, viewId })); //因为按钮有排序 需要通过接口获取
    } else {
      dispatch({
        type: 'WORKSHEET_UPDATE_SHEETBUTTONS',
        buttons: refreshBtnData(_.cloneDeep(sheetButtons), btns, isAdd),
      });
      dispatch({
        type: 'WORKSHEET_UPDATE_BUTTONS',
        buttons: refreshBtnData(_.cloneDeep(buttons), btns, isAdd),
      });
    }
  };
}

// 更新所有视图
export const updateViews = views => ({
  type: 'WORKSHEET_UPDATE_VIEWS',
  views,
});

// 更新单个视图
export const updateView = view => ({
  type: 'WORKSHEET_UPDATE_VIEW',
  view,
});

// 更新单个视图
export function saveView(viewId, newConfig, cb) {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const { base, views, navGroupFilters } = sheet;
    const view = _.find(views, v => v.viewId === viewId);
    const saveParams = { ...newConfig };
    const editAttrs = Object.keys(saveParams).filter(o => 'editAdKeys' !== o);
    if (!view) {
      console.error('can not find view');
      return;
    }
    // 筛选需要在保存成功后再触发界面更新
    const updateAfterSave =
      _.some(['filters', 'moreSort', 'viewControl', 'fastFilters'].map(k => editAttrs.includes(k))) ||
      (editAttrs.includes('advancedSetting') &&
        (!!_.get(saveParams, ['advancedSetting', 'navfilters']) ||
          !!_.get(saveParams, ['advancedSetting', 'colorid'])));
    if (saveParams.filters) {
      saveParams.filters = saveParams.filters.map(formatValuesOfCondition);
    }
    worksheetAjax
      .saveWorksheetView({
        ..._.pick(base, ['appId', 'worksheetId']),
        viewId,
        editAttrs,
        ...saveParams,
      })
      .then(data => {
        // 使用后端返回的编辑后的值 更新当前视图
        const nextView = editAttrs.reduce(
          (p, c) => {
            return { ...p, [c]: data[c] };
          },
          { ...view, ...newConfig },
        );
        if (
          _.get(newConfig, 'advancedSetting.shownullitem') !== _.get(view, 'advancedSetting.shownullitem') &&
          _.get(newConfig, 'advancedSetting.shownullitem') === '' &&
          navGroupFilters &&
          navGroupFilters.length > 0
        ) {
          if (navGroupFilters[0].values.length <= 0) {
            dispatch(updateGroupFilter([]));
          }
        }
        if (editAttrs.includes('navGroup')) {
          dispatch(updateGroupFilter([], nextView));
          dispatch(getNavGroupCount());
        }
        dispatch({
          type: 'WORKSHEET_UPDATE_VIEW',
          view: data,
        });
        if (updateAfterSave) {
          if (
            (_.includes(editAttrs, 'filters') && !_.isEqual(view.filters, nextView.filters)) ||
            _.get(view, 'advancedSetting.colorid') !== _.get(nextView, 'advancedSetting.colorid')
          ) {
            dispatch(refreshSheet(nextView));
          }
        }
        if (typeof cb === 'function') {
          cb(nextView);
        }
      })
      .fail(err => {
        alert(_l('视图配置保存失败'), 3);
      });
  };
}

// 更新分组筛选
export const updateNavGroup = () => {
  return (dispatch, getState) => {
    const { views, base } = getState().sheet;
    const { viewId = '' } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const navGroup = view.navGroup && view.navGroup.length > 0 ? view.navGroup[0] : {};
    navGroup.controlId && window.localStorage.getItem('navGroupIsOpen') !== 'false' && dispatch(getNavGroupCount());
  };
};

// 刷新视图
export function refreshSheet(view, options) {
  return dispatch => {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.sheet) {
      dispatch(sheetViewRefresh(options));
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.calendar) {
      dispatch(calendarViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gallery) {
      dispatch(galleryViewRefresh());
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gunter) {
      dispatch(resetLoadGunterView());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.detail) {
      dispatch(detailViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.resource) {
      dispatch(resourceViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.customize && _.get(options, 'isRefreshBtn')) {
      dispatch(customWidgetViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.map) {
      dispatch(initMapViewData(undefined, true));
    }
  };
}

// 添加记录
export function addNewRecord(data, view) {
  emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
    action: 'new-record',
    value: data,
  });

  return dispatch => {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.sheet) {
      dispatch(sheetViewAddRecord(data));
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.calendar) {
      dispatch(calendarViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gallery) {
      dispatch(galleryViewRefresh());
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gunter) {
      dispatch(addGunterNewRecord(data));
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.resource) {
      dispatch(resourceViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.detail) {
      dispatch(detailViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.map) {
      dispatch(initMapViewData(undefined, true));
    }
  };
}

// 打开创建记录弹层
export function openNewRecord() {
  return (dispatch, getState) => {
    const { base, views, worksheetInfo, navGroupFilters, sheetSwitchPermit, isCharge, draftDataCount, appPkgData } =
      getState().sheet;
    const { appId, viewId, groupId, worksheetId } = base;
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { advancedSetting = {} } = view;
    let { usenav } = advancedSetting;
    const hasGroupFilter =
      usenav === '1' && //设置了创建记录时，以选中列表作为默认值
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      _.includes([VIEW_DISPLAY_TYPE.sheet, VIEW_DISPLAY_TYPE.gallery], String(view.viewType));
    function handleAdd(param = {}) {
      addRecord({
        ...param,
        showFillNext: true,
        appId,
        viewId,
        worksheetId,
        worksheetInfo,
        groupId,
        projectId: worksheetInfo.projectId,
        needCache: true,
        addType: 1,
        showShare: true,
        sheetSwitchPermit,
        hidePublicShare: !(
          isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) && !md.global.Account.isPortal
        ),
        isCharge: isCharge,
        appPkgData: appPkgData,
        entityName: worksheetInfo.entityName,
        onAdd: data => {
          if (!_.isEmpty(data)) {
            dispatch(addNewRecord(data, view));
            dispatch(setHighLightOfRows([data.rowid]));
            return;
          }
          dispatch({ type: 'UPDATE_DRAFT_DATA_COUNT', data: draftDataCount + 1 });
        },
        updateWorksheetControls: controls => {
          dispatch(updateWorksheetSomeControls(controls));
        },
        loadDraftDataCount: () => {
          dispatch(loadDraftDataCount({ appId, worksheetId }));
        },
        addNewRecord: (data, view) => {
          dispatch(addNewRecord(data, view));
        },
      });
    }
    if (hasGroupFilter && !_.isEmpty(navGroupFilters) && navGroupFilters.length > 0) {
      let defaultFormData;
      let data = navGroupFilters[0];
      if ([9, 10, 11].includes(data.dataType)) {
        defaultFormData = { [data.controlId]: JSON.stringify([data.values[0]]) };
        handleAdd({
          defaultFormData,
          defaultFormDataEditable: true,
        });
      } else if ([29, 35]) {
        const targetWorksheetId = _.find(worksheetInfo.template.controls, { controlId: data.controlId }).dataSource;
        if (!targetWorksheetId) {
          return;
        }
        worksheetAjax
          .getRowDetail({
            worksheetId: targetWorksheetId,
            rowId: data.values[0],
          })
          .then(res => {
            defaultFormData = {
              [data.controlId]: JSON.stringify([
                {
                  sid: data.values[0],
                  name: data.navNames[0] || '',
                  sourcevalue: res.rowData,
                },
              ]),
            };
            handleAdd({
              defaultFormData,
              defaultFormDataEditable: true,
            });
          });
      }
    } else {
      handleAdd();
    }
  };
}

// 更新字段
export const updateWorksheetControls = controls => ({
  type: 'WORKSHEET_UPDATE_CONTROLS',
  controls,
});

// 更新字段
export const refreshWorksheetControls = controls => {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const { worksheetId } = sheet.base;
    worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true }).then(res => {
      dispatch({
        type: 'WORKSHEET_UPDATE_SOME_CONTROLS',
        controls: res.template.controls,
      });
    });
  };
};

// 更新筛选条件
export function updateFilters(filters, view) {
  return dispatch => {
    dispatch({
      type: 'WORKSHEET_UPDATE_FILTERS',
      filters,
    });
    dispatch(refreshSheet(view, { changeFilters: true }));
  };
}

// 更新快速筛选条件
export function updateQuickFilter(filter = [], view) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_QUICK_FILTER',
      filter: filter,
    });
    dispatch(refreshSheet(view, { resetPageIndex: true }));
  };
}

// 重置快速筛选条件
export function resetQuickFilter(view) {
  return (dispatch, getState) => {
    const { quickFilter } = getState().sheet;
    if (_.isEmpty(quickFilter)) {
      return;
    }
    dispatch({
      type: 'WORKSHEET_RESET_QUICK_FILTER',
    });
    dispatch(refreshSheet(view));
  };
}

// 更新分组筛选条件
export function updateGroupFilter(navGroupFilters = [], view) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_GROUP_FILTER',
      navGroupFilters,
    });
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.map) {
      dispatch(mapNavGroupFiltersUpdate(navGroupFilters, view));
    }
  };
}
let getNavGroupRequest = null;
let preWorksheetIds = [];
// 获取分组筛选的count
export function getNavGroupCount() {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const { filters = {}, base = {}, quickFilter = {} } = sheet;
    const { appId, worksheetId, viewId } = base;
    const { filterControls, filtersGroup, keyWords, searchType } = filters;
    if (
      getNavGroupRequest &&
      getNavGroupRequest.state() === 'pending' &&
      getNavGroupRequest.abort &&
      preWorksheetIds.includes(worksheetId)
    ) {
      getNavGroupRequest.abort();
    }
    if (!worksheetId && !viewId) {
      return;
    }
    preWorksheetIds.push(worksheetId);
    getNavGroupRequest = worksheetAjax.getNavGroup(
      getFilledRequestParams({
        appId,
        worksheetId,
        viewId,
        filterControls,
        filtersGroup,
        searchType,
        fastFilters: (_.isArray(quickFilter) ? quickFilter : []).map(f =>
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
        keyWords,
      }),
    );

    getNavGroupRequest.then(data => {
      preWorksheetIds = (preWorksheetIds || []).filter(o => o !== worksheetId);
      dispatch({
        type: 'WORKSHEET_NAVGROUP_COUNT',
        data,
      });
    });
  };
}

// 展开或收起工作表列表
export function updateSheetListVisible(visible) {
  return {
    type: visible ? 'WORKSHEET_SHOW_LIST' : 'WORKSHEET_HIDE_LIST',
  };
}

export function copyCustomPage(para) {
  return function (dispatch, getState) {
    const sheetList = getState().sheetList.data;
    appManagementAjax.copyCustomPage(para).then(data => {
      if (data) {
        alert(_l('复制成功'));
        const item = {
          workSheetId: data,
          workSheetName: para.name,
          type: 1,
          status: 1,
          icon: para.icon || '1_0_home',
          iconColor: para.iconColor || '#616161',
        };
        dispatch({
          type: 'SHEET_LIST',
          data: update(sheetList, { $push: [item] }),
        });
      } else {
        alert(_l('复制失败'), 2);
      }
    });
  };
}

// 更新viewControl搜索
export function updateSearchRecord(view = {}, record) {
  return function (dispatch) {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(updateHierarchySearchRecord(record));
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gunter) {
      dispatch(updateGunterSearchRecord(record));
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.map) {
      dispatch({
        type: 'CHANGE_MAP_VIEW_SEARCH_DATA',
        data: record,
      });
    }
  };
}

// 初始化移动端甘特图所需要的数据
export function initMobileGunter({ appId, worksheetId, viewId, access_token }) {
  return function (dispatch) {
    const headersConfig = {
      Authorization: `access_token ${access_token}`,
    };
    const base = {
      appId,
      worksheetId,
      viewId,
    };
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base,
    });
    worksheetAjax
      .getWorksheetInfo({ worksheetId, getViews: true, getTemplate: true, getRules: true }, { headersConfig })
      .then(res => {
        dispatch({
          type: 'WORKSHEET_INIT',
          value: res,
        });
      });
  };
}

// 获取草稿箱数据
export const loadDraftDataCount =
  ({ appId, worksheetId }) =>
  (dispatch, getState) => {
    if (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
      return;
    }
    worksheetAjax
      .getFilterRowsTotalNum({
        appId,
        worksheetId,
        getType: 21,
      })
      .then(res => {
        dispatch({
          type: 'UPDATE_DRAFT_DATA_COUNT',
          data: Number(res) || 0,
        });
      });
  };

export function updateCurrentViewState(updates) {
  return (dispatch, getState) => {
    const { base, views } = getState().sheet;
    const { viewId } = base;
    const view = _.find(views, v => v.viewId === viewId);
    dispatch({
      type: 'WORKSHEET_UPDATE_VIEW',
      view: { ...view, ...updates },
    });
  };
}

export function updateViewShowcount(showcount) {
  return (dispatch, getState) => {
    const { base } = getState().sheet;
    const { viewId } = base;
    safeLocalStorageSetItem('showcount_' + viewId, showcount);
    dispatch({
      type: 'VIEW_UPDATE_SHOW_COUNT',
      showcount,
    });
  };
}
