import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getFilledRequestParams } from 'src/utils/platform/navigation/query';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

export function refreshRecord({
  updateControls,
  appId,
  viewId,
  worksheetId,
  hasAuthRowIds,
  allWorksheetIsSelected,
  selectedRows,
  // 筛选条件
  searchArgs,
  quickFilter,
  navGroupFilters,
  cb = () => {},
}) {
  const args = {
    appId,
    viewId,
    worksheetId,
    rowIds: hasAuthRowIds,
    controls: updateControls,
  };

  if (allWorksheetIsSelected) {
    delete args.rowIds;
    args.isAll = true;
    args.excludeRowIds = selectedRows.map(row => row.rowid);
    args.filterControls = searchArgs.filterControls;
    args.fastFilters = (_.isArray(quickFilter) ? quickFilter : []).map(f =>
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
    );
    args.navGroupFilters = navGroupFilters;
    args.keyWords = searchArgs.keyWords;
    args.searchType = searchArgs.searchType;
  }

  worksheetAjax
    .refreshWorksheetRows(getFilledRequestParams(args, _.get(searchArgs, 'requestParams')))
    .then(cb)
    .catch(_requestError => {
      alertIfNotUnauthorized(_requestError, _l('修改失败'), 2);
    });
}
