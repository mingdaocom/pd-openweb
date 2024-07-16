import { formatQuickFilter, getFilledRequestParams } from 'worksheet/util';
import worksheetAjax from 'src/api/worksheet';
import { getCurrentView } from '../util';
import _ from 'lodash';

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

function getMapViewData({ para, dispatch }, sheet) {
  worksheetAjax.getFilterRows(para).then(({ data, resultCode }) => {
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

export function initMapViewData(view, refreshMap = false) {
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

    getMapViewData({ para, dispatch }, sheet);
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
