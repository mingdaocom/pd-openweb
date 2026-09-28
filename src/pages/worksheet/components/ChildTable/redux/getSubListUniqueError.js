import _, { findLastIndex, get } from 'lodash';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/Form/core/config';
import { filterEmptyChildTableRows } from 'src/utils/core/childTable';
import { getSheetViewRows } from 'src/utils/domain/worksheet/tree';

export function getSubListUniqueError({ store, control, badData = [] } = {}) {
  if (badData[0]) {
    const [childTableControlId, controlId, value = ''] = badData[0].split(':');
    const state = store.getState();
    let rows = state.rows;

    if (get(state, 'base.isTreeTableView')) {
      rows = getSheetViewRows(
        { rows: _.filter(rows, r => !/^empty-/.test(r.rowid)) },
        { treeMap: get(state, 'treeTableViewData.treeMap', {}) },
      );
    }

    const badRowIds = filterEmptyChildTableRows(rows)
      .filter(r =>
        value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
      )
      .map(r => r.rowid);
    const lastRowBaIndex = findLastIndex(filterEmptyChildTableRows(rows), r =>
      value.indexOf('-') > -1 ? (r[controlId] || '').indexOf(value) > -1 : (r[controlId] || '') === value,
    );
    if (!badRowIds.length) return {};
    const controlName = _.find(control.relationControls, c => c.controlId === controlId).controlName;
    alert(
      _l('记录提交失败：%0中第%1行记录的%2与已有记录重复', control.controlName, lastRowBaIndex + 1, controlName),
      2,
    );
    return {
      controlId: childTableControlId,
      error: badRowIds
        .map(rowId => ({
          [`${rowId}-${controlId}`]: FORM_ERROR_TYPE_TEXT.UNIQUE(),
        }))
        .reduce((a, b) => ({ ...a, ...b })),
    };
  }
}
