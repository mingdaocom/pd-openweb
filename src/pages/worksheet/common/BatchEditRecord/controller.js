import worksheetApi from 'src/api/worksheet';

export function handleBatchUpdateRecords({
  appId,
  viewId,
  worksheetId,
  needUpdateControls,
  selectedRows,
  allWorksheetIsSelected,
  hasAuthRowIds,
  searchArgs,
  quickFilter,
  navGroupFilters,
  filtersGroup,
  reloadWorksheet,
  clearSelect,
  hideEditRecord,
  updateRows,
  getWorksheetSheetViewSummary,
  worksheetInfo,
  selectedControls,
  onClose = () => {},
  onUpdate = () => {},
  setIsUpdating = () => {},
}) {
  const args = {
    appId,
    viewId,
    worksheetId,
    rowIds: hasAuthRowIds,
    controls: needUpdateControls,
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
    args.filtersGroup = filtersGroup;
    args.keyWords = searchArgs.keyWords;
    args.searchType = searchArgs.searchType;
  }
  worksheetApi.updateWorksheetRows(args).then(data => {
    if (data.isSuccess) {
      clearSelect();
      hideEditRecord();
      if (data.successCount === selectedRows.length) {
        alert(_l('修改成功'));
      } else if (hasAuthRowIds.length < selectedRows.length) {
        alert(_l('修改成功，无编辑权限的%0无法修改', worksheetInfo.entityName));
      }
      if (allWorksheetIsSelected) {
        reloadWorksheet();
      } else {
        const changes = {};
        selectedControls.forEach(item => {
          changes[item.id] = item.value;
        });
        updateRows(hasAuthRowIds, changes);
      }
      getWorksheetSheetViewSummary();
      onUpdate();
      onClose();
    } else {
      alert(_l('修改失败'), 2);
    }
    setIsUpdating(false);
  });
}

export function getEditType(control) {
  if (control.type === 14 || control.unique) {
    return 'clear';
  }
  return 'modify';
}

export function getDisabledTabs(control) {
  const { type, controlId, unique, required } = control;
  if (type === 14 || unique) {
    return ['modify'];
  }
  if (required || controlId === 'ownerid') {
    return ['clear'];
  }
  return [];
}
