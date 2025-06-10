import _, { get, isEmpty } from 'lodash';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from 'src/components/newCustomFields/tools/config';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { checkRuleLocked } from 'src/components/newCustomFields/tools/formUtils';
import { checkValueByFilterRegex } from 'src/components/newCustomFields/tools/formUtils';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { browserIsMobile } from 'src/utils/common';
import { checkCellIsEmpty } from 'src/utils/control';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { checkRulesErrorOfRow } from 'src/utils/rule';

function getControlCompareValue(c, value) {
  if (c.type === 26) {
    return safeParse(value, 'array')
      .map(u => u.accountId)
      .sort()
      .join('');
  } else if (c.type === 29) {
    return safeParse(value, 'array')
      .map(u => u.sid)
      .sort()
      .join('');
  } else if (c.type === 27) {
    return safeParse(value, 'array')
      .map(u => u.departmentId)
      .sort()
      .join('');
  } else if (c.type === 48) {
    return safeParse(value, 'array')
      .map(u => u.organizeId)
      .sort()
      .join('');
  } else {
    return value;
  }
}

/**
 * 记录数据格式化为 关联表控件数据格式
 * @param  {} controls
 * @param  {} data
 */

export function getSubListError({ rows, rules }, controls = [], showControls = [], from = 3) {
  const result = {};
  try {
    filterEmptyChildTableRows(rows).forEach(async row => {
      const rulesResult = checkRulesErrorOfRow({
        from,
        rules,
        controls: controls.filter(
          c =>
            _.find(showControls, id => id === c.controlId) ||
            _.find(rules, rule => JSON.stringify(rule.filters).indexOf(c.controlId) > -1),
        ),
        row,
      });
      const rulesErrors = rulesResult.errors;
      const controldata = rulesResult.formData.filter(
        c => _.find(showControls, id => id === c.controlId) && controlState(c).visible && controlState(c).editable,
      );
      const isLock = checkRuleLocked(
        rules,
        rulesResult.formData.filter(c => _.find(showControls, id => id === c.controlId) && controlState(c).visible),
        row.rowid,
      );
      if (isLock) {
        return;
      }
      const formdata = new DataFormat({
        data: controldata.map(c => ({ ...c, isSubList: true })),
        from: FROM.NEWRECORD,
      });
      let errorItems = formdata.getErrorControls();
      rulesErrors.forEach(errorItem => {
        if (_.includes(showControls, errorItem.controlId)) {
          result[row.rowid + '-' + errorItem.controlId] = errorItem.errorMessage;
        }
      });
      errorItems.forEach(errorItem => {
        const errorControl = _.find(controldata, c => c.controlId === errorItem.controlId);
        result[row.rowid + '-' + errorItem.controlId] =
          errorItem.errorType === FORM_ERROR_TYPE.CUSTOM
            ? checkValueByFilterRegex(errorControl, _.get(errorControl, 'value'), controldata)
            : typeof FORM_ERROR_TYPE_TEXT[errorItem.errorType] === 'string'
              ? FORM_ERROR_TYPE_TEXT[errorItem.errorType]
              : FORM_ERROR_TYPE_TEXT[errorItem.errorType](errorControl);
      });
    });
    const uniqueControls = controls.filter(
      c => _.find(showControls, id => id === c.controlId) && (c.unique || c.uniqueInRecord),
    );
    uniqueControls.forEach(c => {
      const hadValueRows = rows.filter(
        row =>
          typeof row[c.controlId] !== 'undefined' &&
          !row[c.controlId].startsWith('deleteRowIds') &&
          !checkCellIsEmpty(row[c.controlId]),
      );
      const uniqueValueRows = _.uniqBy(hadValueRows, row => getControlCompareValue(c, row[c.controlId]));
      if (hadValueRows.length !== uniqueValueRows.length) {
        const duplicateValueRows = hadValueRows.filter(vr => !_.find(uniqueValueRows, r => r.rowid === vr.rowid));
        duplicateValueRows.forEach(row => {
          const sameValueRows = hadValueRows.filter(
            r => getControlCompareValue(c, r[c.controlId]) === getControlCompareValue(c, row[c.controlId]),
          );
          if (sameValueRows.length > 1) {
            sameValueRows.forEach(r => {
              result[r.rowid + '-' + c.controlId] = FORM_ERROR_TYPE_TEXT.UNIQUE(c, true);
            });
          }
        });
      }
    });
    return result;
  } catch (err) {
    alert(_l('失败'), 3);
    console.log(err);
    throw err;
  }
}

export function getSubListErrorOfStore(store) {
  const state = store.getState();
  const { rows, base = {} } = state;
  const { recordId, control = {} } = base;
  const error = getSubListError(
    {
      rows,
      rules: get(base, 'worksheetInfo.rules'),
    },
    base.controls,
    control.showControls,
    recordId ? 3 : 2,
  );
  if (!isEmpty(error)) {
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: error,
    });
  } else if (browserIsMobile()) {
    store.clearSubListErrors();
  }
  return error;
}
