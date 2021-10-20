import { getFilterRows, updateWorksheetRow } from 'src/api/worksheet';
import { getAdvanceSetting } from 'src/util';
import { getNavGroupCount } from './index';
import { wrapAjax } from './util';
const wrappedGetFilterRows = wrapAjax(getFilterRows);
export const fetch = index => {
  return (dispatch, getState) => {
    const { base, filters, galleryview, quickFilter, navGroupFilters } = getState().sheet;
    const { appId, viewId, worksheetId } = base;
    let { galleryIndex, gallery } = galleryview;
    if (index <= 1) {
      dispatch({ type: 'CHANGE_GALLERY_VIEW_LOADING', loading: true });
    } else {
      dispatch({ type: 'CHANGE_GALLERY_LOADING', loading: true });
    }
    wrappedGetFilterRows({
      worksheetId,
      pageSize: 50,
      pageIndex: index,
      status: 1,
      appId,
      viewId,
      ...filters,
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
      navGroupFilters,
    }).then(res => {
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
            return data;
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
