const SINGLE_TEMPLATE_PRINT_TYPES = [2, 5];
const APP_DETAIL_CACHE_FIELDS = ['id', 'projectId', 'permissionType', 'isLock', 'timeZone', 'langInfo'];
const WORKSHEET_INFO_CACHE_FIELDS = [
  'appId',
  'worksheetId',
  'projectId',
  'name',
  'entityName',
  'downLoadUrl',
  'switches',
  'roleType',
];

const pickDefined = (source = {}, fields = []) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

export const getPrintCacheAppDetail = (appDetail = {}) =>
  pickDefined(appDetail?.detail || appDetail || {}, APP_DETAIL_CACHE_FIELDS);

export const getPrintCacheWorksheetInfo = (worksheetInfo = {}, viewId) => {
  const source = worksheetInfo || {};

  if (!Object.keys(source).length) return {};

  return {
    ...pickDefined(source, WORKSHEET_INFO_CACHE_FIELDS),
    views: Array.isArray(source.views) ? source.views.filter(view => view.viewId === viewId) : [],
  };
};

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
