import { getWorksheetInfo, getSwitchPermit, saveWorksheetView, getWorksheetBtns } from 'src/api/worksheet';
import appManagementAjax from 'src/api/appManagement';
import update from 'immutability-helper';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { formatValues } from 'worksheet/common/WorkSheetFilter/util';
import { refresh as sheetViewRefresh, addRecord as sheetViewAddRecord } from './sheetview';
import { refresh as galleryViewRefresh } from './galleryview';
import { refresh as calendarViewRefresh } from './calendarview';
import { initBoardViewData } from './boardView';
import { getDefaultHierarchyData } from './hierarchy';
import { wrapAjax } from './util';
import _ from 'lodash';

const wrappedGetWorksheetInfo = wrapAjax(getWorksheetInfo);
const wrappedGetSwitchPermit = wrapAjax(getSwitchPermit);

export const updateBase = base => {
  return (dispatch, getState) => {
    dispatch(loadCustomButtons({ worksheetId: base.worksheetId }));
    dispatch({
      type: 'WORKSHEET_UPDATE_BASE',
      base,
    });
  };
};

export const updateWorksheetLoading = loading => ({ type: 'WORKSHEET_UPDATE_LOADING', loading });

export function loadWorksheet(worksheetId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_FETCH_START',
    });
    wrappedGetWorksheetInfo({ worksheetId, getViews: true, getTemplate: true }).then(res => {
      dispatch({
        type: 'WORKSHEET_INIT',
        value: res,
      });
    });
    wrappedGetSwitchPermit({ worksheetId }).then(res => {
      dispatch({
        type: 'WORKSHEET_PERMISSION_INIT',
        value: res,
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
    if (!worksheetId) {
      return;
    }
    getWorksheetBtns({
      appId,
      viewId,
      rowId,
      worksheetId,
    }).then(buttons => {
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
    const refreshData = data => {
      if (isAdd) {
        data.push(btns);
        return data;
      }
      return data.map(o => {
        if (o.btnId === btns.btnId) {
          return btns;
        } else {
          return o;
        }
      });
    };
    dispatch({
      type: 'WORKSHEET_UPDATE_SHEETBUTTONS',
      buttons: refreshData(sheetButtons),
    });
    dispatch({
      type: 'WORKSHEET_UPDATE_BUTTONS',
      buttons: refreshData(buttons),
    });
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
    const updateAfterSave = _.some(['filters', 'moreSort', 'viewControl'].map(k => editAttrs.includes(k)));
    if (!updateAfterSave) {
      dispatch({
        type: 'WORKSHEET_UPDATE_VIEW',
        view: { ...view, ...newConfig },
      });
    }
    if (saveParams.filters) {
      saveParams.filters = saveParams.filters.map(f => ({
        ...f,
        values: formatValues(f.dataType, f.filterType, f.values),
      }));
    }
    saveWorksheetView({
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
export function refreshSheet(view) {
  return dispatch => {
    if (String(view.viewType) === VIEW_DISPLAY_TYPE.sheet) {
      dispatch(sheetViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.board) {
      dispatch(initBoardViewData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.structure) {
      dispatch(getDefaultHierarchyData());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.calendar) {
      dispatch(calendarViewRefresh());
    } else if (String(view.viewType) === VIEW_DISPLAY_TYPE.gallery) {
      dispatch(galleryViewRefresh());
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

// 更新筛选条件
export function updateFilters(filters, view) {
  return dispatch => {
    dispatch({
      type: 'WORKSHEET_UPDATE_FILTERS',
      filters,
    });
    dispatch(refreshSheet(view));
  };
}

// 更新快速筛选条件
export function updateQuickFilter(filter = [], view) {
  return (dispatch, getState) => {
    dispatch({
      type: 'WORKSHEET_UPDATE_QUICK_FILTER',
      filter: filter.map(c => {
        let result = { ...c };
        if (c.values) {
          result.values = result.values.filter(_.identity);
        }
        if (c.dataType === 29) {
          result.values = result.values.map(v => v.rowid);
        }
        return result;
      }),
    });
    dispatch(refreshSheet(view));
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
          icon: para.icon || 'hr_workbench',
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
