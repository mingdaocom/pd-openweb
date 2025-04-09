import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { formatQuickFilter, getFilledRequestParams } from 'worksheet/util';
import { getCurrentView } from '../util';

const mapViewRequest = {};

const getMapViewPara = (sheet = {}, view) => {
  const { base, navGroupFilters = [], quickFilter = [] } = sheet;
  const { appId } = base;
  view = view || getCurrentView(sheet);
  const { worksheetId, viewId } = view;

  return getFilledRequestParams({
    appId: appId,
    viewId: viewId,
    worksheetId: worksheetId,
    navGroupFilters,
    pageIndex: 1,
    pageSize: 200,
    ...sheet.filters,
    fastFilters: formatQuickFilter(quickFilter),
  });
};

function getMapViewData({ para, dispatch, mapViewRequestKey }, sheet) {
  if (mapViewRequestKey && !!mapViewRequest[mapViewRequestKey] && !!mapViewRequest[mapViewRequestKey].abort) {
    mapViewRequest[mapViewRequestKey].abort();
  }

  const mapRequest = worksheetAjax.getFilterRows(para);
  mapViewRequestKey && (mapViewRequest[mapViewRequestKey] = mapRequest);

  mapRequest.then(({ data, resultCode }) => {
    mapViewRequestKey && (mapViewRequest[mapViewRequestKey] = null);

    dispatch({
      type: 'CHANGE_MAP_VIEW_DATA',
      data: data.reverse(),
    });
    dispatch({
      type: 'CHANGE_MAP_VIEW_LOADING',
      loading: false,
    });
    dispatch({
      type: 'REFRESH_MAP',
      refreshMap: false,
    });
  });
}

export function initMapViewData(view, refreshMap = false, mapViewRequestKey) {
  return (dispatch, getState) => {
    const { sheet, mobile } = getState();
    const para = getMapViewPara(sheet, view);

    if (!para) return;

    dispatch({
      type: 'CHANGE_MAP_VIEW_LOADING',
      loading: true,
    });

    if (refreshMap) {
      dispatch({
        type: 'REFRESH_MAP',
        refreshMap: true,
      });
    }

    getMapViewData({ para, dispatch, mapViewRequestKey }, sheet);
  };
}

export function mapNavGroupFiltersUpdate(navGroupFilters, view) {
  return (dispatch, getState) => {
    const { sheet, mobile } = getState();
    const para = getMapViewPara(sheet, view);
    const preNavGroupFilters = _.get(sheet, 'mapView.mapViewState.navGroupFilters') || [];

    if (!para) return;
    if (navGroupFilters.length === 0 && preNavGroupFilters.length === 0) return;

    dispatch({
      type: 'CHANGE_MAP_VIEW_LOADING',
      loading: true,
    });
    dispatch({
      type: 'REFRESH_MAP',
      refreshMap: true,
    });
    dispatch({
      type: 'NAV_GROUP_FILTERS',
      navGroupFilters,
    });

    getMapViewData({
      para: {
        ...para,
        navGroupFilters,
      },
      dispatch,
    });
  };
}
