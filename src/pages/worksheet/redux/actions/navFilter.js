import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getFilledRequestParams } from 'src/utils/common';

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

let getNavGroupRequest = null;
let preWorksheetIds = [];
// 获取分组筛选的count
export function getNavGroupCount() {
  return (dispatch, getState) => {
    const sheet = getState().sheet;
    const { filters = {}, base = {}, quickFilter = {} } = sheet;
    const { appId, worksheetId, viewId } = base;
    const { filterControls, filtersGroup, keyWords, searchType } = filters;
    if (getNavGroupRequest && getNavGroupRequest.abort && preWorksheetIds.includes(`${worksheetId}-${viewId}`)) {
      getNavGroupRequest.abort();
    }
    if (!worksheetId && !viewId) {
      return;
    }
    preWorksheetIds.push(`${worksheetId}-${viewId}`);
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
      preWorksheetIds = (preWorksheetIds || []).filter(o => o !== `${worksheetId}-${viewId}`);
      dispatch({
        type: 'WORKSHEET_NAVGROUP_COUNT',
        data,
      });
    });
  };
}
