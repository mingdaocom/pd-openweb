import _ from 'lodash';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';

export function getRowsRelation({ control, recordId, formData }, params = {}) {
  const { pageIndex = 1, pageSize = 50, keyWords } = params;
  const filterControls = getFilter({ control: { ...control, recordId }, formData });
  let getFilterRowsPromise, args;
  args = {
    worksheetId: control.dataSource,
    viewId: control.viewId,
    searchType: 1,
    pageSize,
    pageIndex,
    status: 1,
    keyWords: _.trim(keyWords),
    isGetWorksheet: true,
    getType: 7,
    filterControls: filterControls || [],
  };
  // if (parentWorksheetId && _.get(parentWorksheetId, 'length') === 24) {
  //   args.relationWorksheetId = parentWorksheetId;
  //   args.rowId = recordId;
  //   args.controlId = control.controlId;
  // }
  if (!window.isPublicWorksheet) {
    getFilterRowsPromise = sheetAjax.getFilterRows;
  } else {
    getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
    args.shareId = window.publicWorksheetShareId;
  }
  return getFilterRowsPromise(args);
}
