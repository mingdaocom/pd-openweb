import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getFilledRequestParams } from 'src/utils/common';
import { formatQuickFilter } from 'src/utils/filter';
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
    pageSize: 1000,
    ...sheet.filters,
    fastFilters: formatQuickFilter(quickFilter),
    langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
  });
};

function getMapViewData({ para, dispatch, mapViewRequestKey }) {
  if (mapViewRequestKey && !!mapViewRequest[mapViewRequestKey] && !!mapViewRequest[mapViewRequestKey].abort) {
    mapViewRequest[mapViewRequestKey].abort();
  }

  const mapRequest = worksheetAjax.getFilterRows(para);
  mapViewRequestKey && (mapViewRequest[mapViewRequestKey] = mapRequest);

  mapRequest.then(({ data }) => {
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
    const { sheet } = getState();
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

    getMapViewData({ para, dispatch, mapViewRequestKey });
  };
}

export function mapNavGroupFiltersUpdate(navGroupFilters, view) {
  return (dispatch, getState) => {
    const { sheet } = getState();
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
