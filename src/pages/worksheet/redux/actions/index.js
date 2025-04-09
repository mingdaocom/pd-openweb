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
import {
  getFilledRequestParams,
  needHideViewFilters,
  replaceControlsTranslateInfo,
  replaceAdvancedSettingTranslateInfo,
  replaceRulesTranslateInfo,
  getHighAuthSheetSwitchPermit,
  getHighAuthControls,
} from 'src/pages/worksheet/util';
import _, { find, get, some } from 'lodash';
import { getTranslateInfo, addBehaviorLog } from 'src/util';
import { initMapViewData, mapNavGroupFiltersUpdate } from './mapView';
import {
  formatFilterValues,
  formatFilterValuesToServer,
  handleConditionsDefault,
  validate,
} from 'worksheet/common/Sheet/QuickFilter/utils';
import { isHaveCharge } from './util';
import { updateNavGroup, getNavGroupCount } from './navFilter.js';

export function fireWhenViewLoaded(view = {}, { forceUpdate, controls } = {}) {
  return (dispatch, getState) => {
    if (!get(view, 'fastFilters')) return;
    const newFastFilters = handleConditionsDefault(
      view.fastFilters || [],
      controls || get(getState(), 'sheet.controls') || [],
    );
    const fastFiltersHasDefaultValue = some(newFastFilters, validate);
    if (fastFiltersHasDefaultValue || forceUpdate) {
      if (get(view, 'advancedSetting.enablebtn') !== '1') {
        dispatch(
          updateQuickFilter(
            newFastFilters.filter(validate).map(condition => ({
              ...condition,
              filterType: condition.dataType === 29 && condition.filterType === 2 ? 24 : condition.filterType || 2,
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

export const updateBase = base => {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const viewChanged = _.get(sheet, 'base.viewId') && base.viewId && _.get(sheet, 'base.viewId') !== base.viewId;
    if (viewChanged) {
      const view = _.find(sheet.views, v => v.viewId === base.viewId);
      if (view && needHideViewFilters(view)) {
        dispatch(clearFilters());
      }
    }
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base: Object.assign({}, base, {
        chartId: base.chartId || undefined,
      }),
    });
    if (viewChanged) {
      const view = _.find(sheet.views, v => v.viewId === base.viewId);
      dispatch({
        type: 'WORKSHEET_SHEETVIEW_CLEAR',
      });
      if (view) {
        dispatch(fireWhenViewLoaded(view, { controls: sheet.controls }));
      }
    }
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
    const { base = {}, appPkgData = {}, views = [] } = getState().sheet;
    const { appId, viewId, chartId } = base;

    if (worksheetRequest && worksheetRequest.abort && base.type !== 'single') {
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
    };

    worksheetRequest = worksheetAjax.getWorksheetBaseInfo(args);
    if (_.isFunction(setRequest)) {
      setRequest(worksheetRequest);
    }
    worksheetRequest
      .then(async res => {
        const translateInfo = getTranslateInfo(appId, null, worksheetId);
        res.entityName = translateInfo.recordName || res.entityName;
        if (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
          res.allowAdd = false;
        }

        if (![1, 4].includes(res.resultCode)) {
          dispatch({
            type: 'WORKSHEET_INIT_FAIL',
          });
          return;
        }
        const addBehaviorLogInfo = sessionStorage.getItem('addBehaviorLogInfo')
          ? JSON.parse(sessionStorage.getItem('addBehaviorLogInfo'))
          : {};

        if (addBehaviorLogInfo.entityId === appId || addBehaviorLogInfo.entityId === worksheetId) {
          sessionStorage.removeItem('addBehaviorLogInfo');
        } else if (addBehaviorLogInfo.type === 'group') {
          addBehaviorLog('worksheet', worksheetId, {}, true);
        } else {
          addBehaviorLog('worksheet', worksheetId, {}, true);
          addBehaviorLog('app', appId, {}, true);
        }

        if (_.get(res, 'template.controls')) {
          res.template.controls = replaceControlsTranslateInfo(appId, worksheetId, res.template.controls);
        }

        const manageView =
          viewId === worksheetId && appPkgData.appRoleType > 99
            ? _.find(views, l => l.viewId === worksheetId)
            : undefined;

        dispatch({
          type: 'WORKSHEET_INIT',
          value: Object.assign(
            {
              ...res,
              views: (manageView ? [manageView] : []).concat(
                res.views.map(v => ({ ...v, viewType: !chartId ? v.viewType : 0 })),
              ),
            },
            {
              isRequestingRelationControls: true,
            },
          ),
        });
        worksheetRequest = worksheetAjax.getWorksheetInfo({ ...args, resultType: undefined });
        worksheetRequest.then(async infoRes => {
          let queryRes;
          if (infoRes.isWorksheetQuery) {
            queryRes = await worksheetAjax.getQueryBySheetId({ worksheetId }, { silent: true });
          }
          if (_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')) {
            infoRes.allowAdd = false;
          }
          if (queryRes) {
            dispatch({
              type: 'WORKSHEET_SEARCH_CONFIG_INIT',
              value: formatSearchConfigs(_.get(queryRes, 'searchConfig') || []),
            });
          }
          const newControls = replaceControlsTranslateInfo(appId, worksheetId, _.get(infoRes, 'template.controls'));
          infoRes.entityName = translateInfo.recordName || infoRes.entityName;
          if (infoRes.advancedSetting) {
            infoRes.advancedSetting = replaceAdvancedSettingTranslateInfo(appId, worksheetId, res.advancedSetting);
          }
          if (infoRes.rules && infoRes.rules.length) {
            infoRes.rules = replaceRulesTranslateInfo(appId, worksheetId, res.rules);
          }
          if (_.isEmpty(newControls)) {
            return;
          }
          dispatch({
            type: 'WORKSHEET_UPDATE_VIEWS',
            views: infoRes.views,
          });

          infoRes.template.controls = newControls;
          dispatch(updateWorksheetSomeControls(newControls));
          dispatch({
            type: 'WORKSHEET_UPDATE_WORKSHEETINFO',
            info: Object.assign(
              !chartId
                ? infoRes
                : {
                    ...infoRes,
                    views: infoRes.views.map(v => ({ ...v, viewType: 0 })),
                  },
            ),
          });
          const currentView = find(infoRes.views, { viewId });
          if (currentView) {
            dispatch(fireWhenViewLoaded(currentView, { controls: infoRes.template.controls }));
          }
          dispatch(setViewLayout(viewId));
          if (worksheetId) {
            dispatch({
              type: 'WORKSHEET_PERMISSION_INIT',
              value: infoRes.switches,
            });
          }
          dispatch({
            type: 'WORKSHEET_UPDATE_IS_REQUESTING_RELATION_CONTROLS',
            value: false,
          });
        });
      })
      .catch(err => {
        if (!get(err, 'errorCode') === 1) {
          dispatch({
            type: 'WORKSHEET_INIT_FAIL',
          });
        }
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
      .catch(err => {
        alert(_l('视图配置保存失败'), 3);
      });
  };
}

// 刷新视图
export function refreshSheet(view, options) {
  return dispatch => {
    if (
      String(view.viewType) === VIEW_DISPLAY_TYPE.sheet ||
      (String(view.viewType) === VIEW_DISPLAY_TYPE.structure && get(view, 'advancedSetting.hierarchyViewType') === '3')
    ) {
      dispatch(sheetViewRefresh(options));
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData(undefined, options));
      dispatch(updateNavGroup());
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
      dispatch(updateNavGroup());
    }
  };
}

// 添加记录
export function addNewRecord(data, view) {
  return dispatch => {
    if (
      String(view.viewType) === VIEW_DISPLAY_TYPE.sheet ||
      (String(view.viewType) === VIEW_DISPLAY_TYPE.structure && get(view, 'advancedSetting.hierarchyViewType') === '3')
    ) {
      dispatch(sheetViewAddRecord(data));
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
      dispatch(updateNavGroup());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
      dispatch(updateNavGroup());
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
      dispatch(updateNavGroup());
    }
  };
}

// 打开创建记录弹层
export function openNewRecord({ isDraft } = {}) {
  return (dispatch, getState) => {
    const { base, views, worksheetInfo, navGroupFilters, sheetSwitchPermit, isCharge, appPkgData } = getState().sheet;
    const { appId, viewId, groupId, worksheetId } = base;
    const isManageView = isHaveCharge(appPkgData.appRoleType) && viewId === worksheetId;
    const lastSheetSwitchPermit = isManageView
      ? getHighAuthSheetSwitchPermit(sheetSwitchPermit, worksheetId)
      : sheetSwitchPermit;
    const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
    const { advancedSetting = {} } = view;
    let { usenav } = advancedSetting;
    const hasGroupFilter =
      usenav === '1' && //设置了创建记录时，以选中列表作为默认值
      !_.isEmpty(view.navGroup) &&
      view.navGroup.length > 0 &&
      _.includes(
        [
          VIEW_DISPLAY_TYPE.sheet,
          VIEW_DISPLAY_TYPE.gallery,
          VIEW_DISPLAY_TYPE.map,
          VIEW_DISPLAY_TYPE.structure,
          VIEW_DISPLAY_TYPE.board,
        ],
        String(view.viewType),
      );
    function handleAdd(param = {}) {
      const publicShare =
        isOpenPermit(permitList.recordShareSwitch, lastSheetSwitchPermit, viewId) && !md.global.Account.isPortal;
      const privateShare = isOpenPermit(permitList.embeddedLink, lastSheetSwitchPermit, viewId);

      if (isManageView) {
        worksheetInfo.template.controls = getHighAuthControls(_.get(worksheetInfo, 'template.controls'));
        worksheetInfo.rules = [];
      }

      return addRecord({
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
        showShare: publicShare || privateShare,
        sheetSwitchPermit: lastSheetSwitchPermit,
        hidePublicShare: !publicShare,
        privateShare: privateShare,
        isCharge: isCharge,
        appPkgData: appPkgData,
        entityName: worksheetInfo.entityName,
        isDraft,
        onAdd: data => {
          if (!_.isEmpty(data)) {
            dispatch(addNewRecord(data, view));
            dispatch(setHighLightOfRows([data.rowid]));
            return;
          }
        },
        updateWorksheetControls: controls => {
          dispatch(updateWorksheetSomeControls(controls));
        },
        addNewRecord: (data, view) => {
          dispatch(addNewRecord(data, view));
        },
      });
    }
    if (hasGroupFilter && !_.isEmpty(navGroupFilters) && navGroupFilters.length > 0) {
      let defaultFormData;
      let data = navGroupFilters[0];
      if ([9, 10, 11, 28].includes(data.dataType)) {
        defaultFormData = {
          [data.controlId]: data.dataType === 28 ? data.values[0] : JSON.stringify([data.values[0]]),
        };
        handleAdd({
          defaultFormData,
          defaultFormDataEditable: true,
        });
      } else if ([26, 27, 48].includes(data.dataType)) {
        let value = '';
        const id = _.get(data, 'values[0]');
        const name = _.get(data, 'navNames[0]');
        if (id && name) {
          value = JSON.stringify([safeParse(name)]);
        } else {
          value = '[]';
        }
        defaultFormData = { [data.controlId]: value };
        handleAdd({
          defaultFormData,
          defaultFormDataEditable: true,
        });
      } else if ([29, 35].includes(data.dataType)) {
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

// 清空筛选条件
export function clearFilters(filters, view) {
  return dispatch => {
    dispatch({
      type: 'WORKSHEET_CLEAR_FILTERS',
    });
  };
}

// 更新快速筛选条件
export function updateQuickFilter(filter = [], view, { noLoad } = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_QUICK_FILTER',
      filter: filter,
    });
    if (!noLoad) {
      dispatch(refreshSheet(view, { resetPageIndex: true }));
    }
  };
}

// 更新快速筛选条件
export function updateQuickFilterWithDefault(filter = []) {
  return dispatch => {
    dispatch({
      type: 'WORKSHEET_UPDATE_QUICK_FILTER_WITH_DEFAULT',
      filter: filter.map(condition => ({
        ...condition,
        values: formatFilterValues(condition.dataType, condition.values),
      })),
    });
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
    if (String(_.get(view, 'viewType')) === VIEW_DISPLAY_TYPE.map) {
      dispatch(mapNavGroupFiltersUpdate(navGroupFilters, view));
    }
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
export function initMobileGunter({ appId, worksheetId, viewId }) {
  return function (dispatch) {
    const base = {
      appId,
      worksheetId,
      viewId,
    };
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base,
    });
    worksheetAjax.getWorksheetInfo({ worksheetId, getViews: true, getTemplate: true, getRules: true }).then(res => {
      dispatch({
        type: 'WORKSHEET_INIT',
        value: res,
      });
    });
  };
}

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
    if (!showcount) {
      window.localStorage.removeItem('showcount_' + viewId);
    } else {
      safeLocalStorageSetItem('showcount_' + viewId, showcount);
    }
    dispatch({
      type: 'VIEW_UPDATE_SHOW_COUNT',
      showcount,
    });
  };
}

export function loadManageView(worksheetId, callback) {
  return (dispatch, getState) => {
    const { base = {}, appPkgData = {} } = getState().sheet;
    const { appId } = base;

    if (!worksheetId || appPkgData.appRoleType < 100) return;

    worksheetAjax
      .getWorksheetViewById({
        appId,
        worksheetId,
        viewId: worksheetId,
      })
      .then(res => {
        dispatch({
          type: 'WORKSHEET_ADD_MANAGE_VIEW',
          views: [{ ...res, name: _l('数据管理') }],
        });
        callback(res);
      });
  };
}
