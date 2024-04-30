import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';

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
  cb = () => { },
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
  worksheetAjax.refreshWorksheetRows(args)
    .then(cb)
    .catch(err => {
      alert(_l('修改失败'), 2);
    });
}
