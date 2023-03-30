import worksheetAjax from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import update from 'immutability-helper';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { formatValuesOfCondition } from 'worksheet/common/WorkSheetFilter/util';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { refresh as sheetViewRefresh, addRecord as sheetViewAddRecord, setViewLayout } from './sheetview';
import { refresh as galleryViewRefresh } from './galleryview';
import { refresh as calendarViewRefresh } from './calendarview';
import { resetLoadGunterView, addNewRecord as addGunterNewRecord } from './gunterview';
import { initBoardViewData } from './boardView';
import { getDefaultHierarchyData, updateHierarchySearchRecord } from './hierarchy';
import { updateGunterSearchRecord } from './gunterview';
import { refreshBtnData } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

export const updateBase = base => {
  return (dispatch, getState) => {
    dispatch(loadCustomButtons({ worksheetId: base.worksheetId }));
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

export const updateIsCharge = isCharge => ({ type: 'WORKSHEET_UPDATE_IS_CHARGE', isCharge });

export const updateWorksheetLoading = loading => ({ type: 'WORKSHEET_UPDATE_LOADING', loading });

let worksheetRequest = null;

export function loadWorksheet(worksheetId) {
  return (dispatch, getState) => {
    const { base = {} } = getState().sheet;
    const { viewId, chartId } = base;

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

    worksheetRequest = worksheetAjax.getWorksheetInfo({
      worksheetId,
      reportId: chartId || undefined,
      getViews: true,
      getTemplate: true,
      getRules: true,
      getSwitchPermit: true,
    });

    worksheetRequest
      .then(async res => {
        if (_.get(window, 'shareState.isPublicView')) {
          res.allowAdd = false;
        }
        let queryRes;
        if (res.isWorksheetQuery) {
          queryRes = await worksheetAjax.getQueryBySheetId({ worksheetId }, { silent: true });
        }

        if (!res.isWorksheetQuery || queryRes) {
          dispatch({
            type: 'WORKSHEET_INIT',
            value: !chartId ? res : { ...res, views: res.views.map(v => ({ ...v, viewType: 0 })) },
          });
          dispatch(setViewLayout(viewId));
          dispatch({
            type: 'WORKSHEET_SEARCH_CONFIG_INIT',
            value: formatSearchConfigs(_.get(queryRes, 'searchConfig') || []),
          });
        }
        if (worksheetId && !_.get(window, 'shareState.isPublicView')) {
          dispatch({
            type: 'WORKSHEET_PERMISSION_INIT',
            value: res.switches,
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
    if (!worksheetId || _.get(window, 'shareState.isPublicView')) {
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
    const { base, views } = sheet;
    const view = _.find(views, v => v.viewId === viewId);
    const saveParams = { ...newConfig };
    const editAttrs = Object.keys(saveParams);
    if (!view) {
      console.error('can not find view');
      return;
    }
    // 筛选需要在保存成功后再触发界面更新
    const updateAfterSave =
      _.some(['filters', 'moreSort', 'viewControl'].map(k => editAttrs.includes(k))) ||
      (editAttrs.includes('advancedSetting') && !!_.get(saveParams, ['advancedSetting', 'navfilters']));
    if (!updateAfterSave) {
      dispatch({
        type: 'WORKSHEET_UPDATE_VIEW',
        view: { ...view, ...newConfig },
      });
    }
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
        if (editAttrs.includes('navGroup')) {
          dispatch(updateGroupFilter([], nextView));
          dispatch(getNavGroupCount());
        }
        if (updateAfterSave) {
          dispatch({
            type: 'WORKSHEET_UPDATE_VIEW',
            view: nextView,
          });
          if (_.includes(editAttrs, 'filters') && !_.isEqual(view.filters, nextView.filters)) {
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

// 刷新视图
export function refreshSheet(view, options) {
  return dispatch => {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.sheet) {
      dispatch(sheetViewRefresh(options));
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.calendar) {
      dispatch(calendarViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gallery) {
      dispatch(galleryViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gunter) {
      dispatch(resetLoadGunterView());
    }
  };
}

// 添加记录
export function addNewRecord(data, view) {
  return dispatch => {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.sheet) {
      dispatch(sheetViewAddRecord(data));
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.calendar) {
      dispatch(calendarViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gallery) {
      dispatch(galleryViewRefresh());
      dispatch(getNavGroupCount());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gunter) {
      dispatch(addGunterNewRecord(data));
    }
  };
}

// 打开创建记录弹层
export function openNewRecord() {
  return (dispatch, getState) => {
    const { base, views, worksheetInfo, navGroupFilters, sheetSwitchPermit, isCharge, draftDataCount } =
      getState().sheet;
    const { appId, viewId, worksheetId } = base;
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
        projectId: worksheetInfo.projectId,
        needCache: true,
        addType: 1,
        showShare: isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId),
        isCharge: isCharge,
        entityName: worksheetInfo.entityName,
        onAdd: data => {
          if (!_.isEmpty(data)) {
            dispatch(addNewRecord(data, view));
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

// 更新个别字段
export const updateWorksheetSomeControls = controls => ({
  type: 'WORKSHEET_UPDATE_SOME_CONTROLS',
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
  };
}

// 获取分组筛选的count
export function getNavGroupCount() {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const { filters = {}, base = {}, quickFilter = {} } = sheet;
    const { worksheetId, viewId } = base;
    const { filterControls, filtersGroup, keyWords, searchType } = filters;
    if (!worksheetId && !viewId) {
      return;
    }
    worksheetAjax
      .getNavGroup({
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
      })
      .then(data => {
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
    if (_.get(window, 'shareState.isPublicView')) {
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
