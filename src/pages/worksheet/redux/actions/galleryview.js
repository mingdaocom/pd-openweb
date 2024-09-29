import worksheetAjax from 'src/api/worksheet';
import { getNavGroupCount } from './index';
import { formatQuickFilter, getFilledRequestParams } from 'worksheet/util';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
let getGalleryRequest = null;
let preWorksheetIds = [];
export const fetch = index => {
  return (dispatch, getState) => {
    const { base, filters, galleryview, quickFilter, navGroupFilters } = getState().sheet;
    const { filterControls } = getState().mobile;
    const { appId, viewId, worksheetId, chartId, maxCount } = base;
    let { galleryIndex, gallery } = galleryview;
    const isMobile = browserIsMobile();

    if (index <= 1) {
      dispatch({ type: 'CHANGE_GALLERY_VIEW_LOADING', loading: true });
    } else {
      dispatch({ type: 'CHANGE_GALLERY_LOADING', loading: true });
    }
    const args = {
      worksheetId,
      pageSize: isMobile ? 20 : 100,
      pageIndex: index,
      status: 1,
      appId,
      viewId,
      reportId: chartId || undefined,
      ...filters,
      fastFilters: isMobile
        ? formatQuickFilter(_.get(getState(), 'mobile.quickFilter') || [])
        : formatQuickFilter(quickFilter),
      navGroupFilters,
    };
    if (maxCount) {
      args.pageIndex = 1;
      args.pageSize = maxCount;
    }

    if (window.isMingDaoApp) {
      args.filterControls = filterControls;
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
      dispatch({
        type: 'CHANGE_GALLERY_VIEW_DATA',
        list: index > 1 ? gallery.concat(res.data) : res.data,
        resultCode: res.resultCode,
      });
      dispatch({ type: 'CHANGE_GALLERY_VIEW_INDEX', pageIndex: index });
      dispatch({ type: 'GALLERY_VIEW_RECORD_COUNT', count: res.count });
      dispatch({ type: 'CHANGE_GALLERY_VIEW_LOADING', loading: false });
      dispatch({ type: 'CHANGE_GALLERY_LOADING', loading: false });
    });
  };
};

export const changeIndex = index => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_GALLERY_VIEW_INDEX', pageIndex: index });
  };
};

export const refresh = () => {
  return (dispatch, getState) => {
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
export const updateRow = data => {
  return (dispatch, getState) => {
    const { galleryview } = getState().sheet;
    let { gallery } = galleryview;
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
export const deleteRow = id => {
  return (dispatch, getState) => {
    const { galleryview } = getState().sheet;
    let { gallery } = galleryview;
    const l = gallery.filter(o => o.rowid !== id);
    dispatch({
      type: 'CHANGE_GALLERY_VIEW_DATA',
      list: l,
    });
    dispatch(getNavGroupCount());
  };
};
