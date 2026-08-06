const SINGLE_TEMPLATE_PRINT_TYPES = [2, 5];

export const buildAppPrintParams = ({
  instanceId,
  workId,
  projectId,
  appId,
  worksheetId,
  viewId,
  rowId,
  currentRowIds,
  isBatchOperate,
  template,
  printUrl,
}) => {
  const params = {
    type: instanceId || workId ? 'workflow' : 'row',
    projectId,
    appId,
    sheetId: worksheetId,
    viewId,
    rowId: isBatchOperate ? currentRowIds.join(',') : rowId,
    workId,
    instanceId,
    templateId: template.id,
    printURL: printUrl,
  };

  if (!(SINGLE_TEMPLATE_PRINT_TYPES.includes(template.type) && !isBatchOperate)) {
    params.rowIds = currentRowIds;
  }

  return params;
};
