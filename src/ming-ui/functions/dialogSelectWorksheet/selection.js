/** 提取工作表 ID，用于父子选择状态计算和集合过滤。 */
const getWorksheetIds = worksheets => worksheets.map(item => item.workSheetId);

/** 未加载子工作表前允许点击触发加载；加载完成为空时禁用父级选择。 */
export const canSelectAppWorksheets = worksheets => !Array.isArray(worksheets) || !!worksheets.length;

/** 根据应用下工作表和当前已选项，派生父级复选框的全选/半选状态。 */
export const getAppSelectionState = (worksheets = [], selectedWorksheets = []) => {
  if (!worksheets.length) {
    return { checked: false, indeterminate: false };
  }

  const selectedIds = new Set(selectedWorksheets.map(item => item.workSheetId));
  const selectedCount = worksheets.filter(item => selectedIds.has(item.workSheetId)).length;

  return {
    checked: selectedCount === worksheets.length,
    indeterminate: selectedCount > 0 && selectedCount < worksheets.length,
  };
};

/** 切换应用下所有工作表；全选时取消整组，否则补齐整组选择。 */
export const toggleAppWorksheets = ({ worksheets = [], selectedWorksheets = [], app }) => {
  const worksheetIds = new Set(getWorksheetIds(worksheets));
  const { checked } = getAppSelectionState(worksheets, selectedWorksheets);
  const otherSelected = selectedWorksheets.filter(item => !worksheetIds.has(item.workSheetId));

  return checked ? otherSelected : otherSelected.concat(worksheets.map(item => ({ ...item, app })));
};

/** 切换单个工作表，并在选中数据中保留所属应用信息。 */
export const toggleWorksheet = (selectedWorksheets = [], worksheet, app) => {
  const isSelected = selectedWorksheets.some(item => item.workSheetId === worksheet.workSheetId);

  return isSelected
    ? selectedWorksheets.filter(item => item.workSheetId !== worksheet.workSheetId)
    : selectedWorksheets.concat({ ...worksheet, app });
};
