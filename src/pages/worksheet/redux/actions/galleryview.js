import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getFilledRequestParams } from 'src/utils/common';
import { formatQuickFilter } from 'src/utils/filter';
import { getGroupControlId } from 'src/utils/worksheet';
import { getNavGroupCount } from './navFilter';
import { sortDataByGroupItems } from './util';

let getGalleryRequest = null;
let preWorksheetIds = [];
const pageSizeForGroup = 20;
const pageSizeForGroupKan = 50;
const pageSize = 100;
export const fetch = index => {
  return (dispatch, getState) => {
    const { base, filters, galleryview, quickFilter, navGroupFilters, controls, views = [] } = getState().sheet;
    const { appId, viewId, worksheetId, chartId, maxCount } = base;
    let { gallery } = galleryview;
    const currentView = views.find(o => viewId === o.viewId);

    if (index <= 1) {
      dispatch({ type: 'CHANGE_GALLERY_VIEW_LOADING', loading: true });
    } else {
      dispatch({ type: 'CHANGE_GALLERY_LOADING', loading: true });
    }
    const groupControlId = getGroupControlId(currentView);
    const groupControl = _.find(controls, { controlId: groupControlId });
    const args = {
      worksheetId,
      pageSize: _.get(currentView, 'advancedSetting.groupsetting') ? pageSizeForGroup : pageSize,
      pageIndex: index,
      status: 1,
      appId,
      viewId,
      reportId: chartId || undefined,
      ...filters,
      fastFilters: formatQuickFilter(quickFilter),
      navGroupFilters: navGroupFilters,
      relationWorksheetId: _.get(currentView, 'advancedSetting.groupsetting') ? groupControl?.dataSource : '',
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
    };
    if (groupControl) {
      args.kanbanIndex = 1;
      args.kanbanSize = pageSizeForGroupKan;
    }
    if (maxCount) {
      args.pageIndex = 1;
      args.pageSize = maxCount;
    }

    if (
      getGalleryRequest &&
      getGalleryRequest.abort &&
      preWorksheetIds.includes(`${base.worksheetId}-${base.viewId}`)
    ) {
      getGalleryRequest.abort();
    }
    preWorksheetIds.push(`${base.worksheetId}-${base.viewId}`);
    getGalleryRequest = worksheetAjax.getFilterRows(getFilledRequestParams(args));
    getGalleryRequest.then(res => {
      getGalleryRequest = null;
      preWorksheetIds = (preWorksheetIds || []).filter(o => o !== `${base.worksheetId}-${base.viewId}`);
      const list = index > 1 ? gallery.concat(res.data) : res.data;
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: _.get(currentView, 'advancedSetting.groupsetting')
          ? sortDataByGroupItems(list, currentView, controls)
          : list,
        resultCode: res.resultCode,
      });
      dispatch({ type: 'CHANGE_GALLERY_VIEW_INDEX', pageIndex: index });
      dispatch({ type: 'GALLERY_VIEW_RECORD_COUNT', count: res.count });
      dispatch({ type: 'CHANGE_GALLERY_VIEW_LOADING', loading: false });
      dispatch({ type: 'CHANGE_GALLERY_LOADING', loading: false });
    });
  };
};

export const fetchMoreByGroup = (index, kanbanKey) => {
  return (dispatch, getState) => {
    const { base, filters, galleryview, quickFilter, navGroupFilters, controls, views = [] } = getState().sheet;
    const { appId, viewId, worksheetId, chartId } = base;
    let { gallery } = galleryview;
    const currentView = views.find(o => viewId === o.viewId);
    dispatch({ type: 'CHANGE_GALLERY_VIEW_GROUP_LOADING', loading: true });
    const groupControlId = getGroupControlId(currentView);
    const groupControl = _.find(controls, { controlId: groupControlId });
    const args = {
      worksheetId,
      pageSize: pageSizeForGroup,
      pageIndex: index,
      kanbanKey,
      status: 1,
      appId,
      viewId,
      reportId: chartId || undefined,
      ...filters,
      fastFilters: formatQuickFilter(quickFilter),
      navGroupFilters,
      relationWorksheetId: groupControl?.dataSource,
    };
    worksheetAjax.getFilterRows(getFilledRequestParams(args)).then(res => {
      const keyData = (res?.data || []).find(it => it?.key === kanbanKey) || {};
      const data = _.get(keyData, 'rows') || [];
      const list = gallery.map(o => {
        if (o.key === kanbanKey) {
          return {
            ...keyData,
            rows: o.rows.concat(data),
          };
        } else {
          return o;
        }
      });
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: sortDataByGroupItems(list, currentView, controls),
      });
      dispatch({ type: 'CHANGE_GALLERY_VIEW_GROUP_LOADING', loading: false });
    });
  };
};

export const changeIndex = index => {
  return dispatch => {
    dispatch({ type: 'CHANGE_GALLERY_VIEW_INDEX', pageIndex: index });
  };
};

export const refresh = () => {
  return dispatch => {
    dispatch(fetch(1));
  };
};

export const getCurrentView = () => {
  return (dispatch, getState) => {
    const { base = {}, views = [] } = getState().sheet;
    const { viewId = '' } = base;
    dispatch({ type: 'CHANGE_GALLERY_VIEW', data: views.find(o => o.viewId === viewId) || {} });
  };
};

//new | add
export const updateRow = (data, groupId) => {
  return (dispatch, getState) => {
    const { galleryview } = getState().sheet;
    let { gallery } = galleryview;
    if (groupId) {
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: gallery.map(o => {
          if (o.key === groupId) {
            const { rows = [] } = o;
            const rowData = rows.find(it => safeParse(it).rowid === data.rowid);
            return {
              ...o,
              rows: rowData
                ? rows.map(it => {
                    if (safeParse(it).rowid === data.rowid) {
                      return JSON.stringify({ ..._.pick(safeParse(it), ['allowedit', 'allowdelete']), ...data });
                    }
                    return it;
                  })
                : o.rows.concat(JSON.stringify(data)),
              totalNum: rowData ? o.totalNum : o.totalNum + 1,
            };
          } else {
            return o;
          }
        }),
      });
      return;
    }
    const l = gallery.find(o => o.rowid === data.rowid);
    if (!l) {
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: [data].concat(gallery),
      });
    } else {
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: gallery.map(o => {
          if (o.rowid === data.rowid) {
            return { ..._.pick(o, ['allowedit', 'allowdelete']), ...data }; //接口返回'allowedit', 'allowdelete' 不对，沿用更改前
          } else {
            return o;
          }
        }),
      });
    }
    dispatch(getNavGroupCount());
  };
};

//删除
export const deleteRow = (id, groupId) => {
  return (dispatch, getState) => {
    const { galleryview } = getState().sheet;
    let { gallery } = galleryview;
    if (groupId) {
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: gallery.map(o => {
          if (o.key === groupId) {
            return { ...o, rows: o.rows.filter(a => safeParse(a)?.rowid !== id), totalNum: o.totalNum - 1 };
          } else {
            return o;
          }
        }),
      });
      return;
    }
    const l = gallery.filter(o => o.rowid !== id);
    dispatch({
      type: 'CHANGE_GALLERY_VIEW_DATA',
      list: l,
    });
    dispatch(getNavGroupCount());
  };
};

export const updateGalleryViewCard = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_GALLERY_VIEW_CARD', data });
  };
};
