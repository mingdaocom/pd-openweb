import _, { get, isEmpty, isNull, isUndefined } from 'lodash';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from 'src/components/Form/core/config';
import DataFormat from 'src/components/Form/core/DataFormat';
import { checkRequired, checkRuleLocked, checkValueByFilterRegex } from 'src/components/Form/core/formUtils';
import { browserIsMobile } from 'src/utils/common';
import { controlState } from 'src/utils/control';
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

export function getSubListError(
  { rows, rules },
  controls = [],
  showControls = [],
  from = 3,
  masterData,
  { workflowRequiredCheck = false } = {},
) {
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
        ignoreHiddenRequired: true,
        data: controldata.map(c => ({ ...c, isSubList: true })),
        from: FROM.NEWRECORD,
        masterData,
      });
      let errorItems = formdata.getErrorControls();

      if (workflowRequiredCheck) {
        // 工作流可动态把子表字段设为必填；DataFormat 可能因子表字段状态跳过，保存时补一次必填校验。
        const requiredErrorItems = controldata
          .map(c => ({ control: c, errorType: checkRequired(c) }))
          .filter(({ errorType }) => errorType)
          .map(({ control, errorType }) => ({
            controlId: control.controlId,
            errorType,
          }));

        requiredErrorItems.forEach(errorItem => {
          if (!_.find(errorItems, { controlId: errorItem.controlId, errorType: errorItem.errorType })) {
            errorItems.push(errorItem);
          }
        });
      }

      rulesErrors.forEach(errorItem => {
        if (_.includes(showControls, errorItem.controlId) && !errorItem.ignoreErrorMessage) {
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
          !isUndefined(row[c.controlId]) &&
          !isNull(row[c.controlId]) &&
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

function filterPendingCellErrors(errors = {}, rows = [], showControls = []) {
  const validRows = filterEmptyChildTableRows(rows);

  return _.pickBy(errors, (error, key) => {
    if (!error) return false;

    const row = validRows.find(r => key.startsWith(`${r.rowid}-`));

    if (!row) return false;

    const controlId = key.slice(row.rowid.length + 1);

    if (!_.some(showControls, id => id === controlId)) return false;

    // 保存时对失焦持久化的残留错误重新校验：仅当该单元格当前行数据仍为空时才保留
    //（对应非法格式值被清洗、未落库，row 端校验发现不了的情况）。
    // 若行数据已是非空有效值（如必填单选/多选清空被拒绝又回滚回旧值），旧错误已过期需丢弃，
    // 否则会出现「单元格显示有值、保存却报必填」的不一致。
    return checkCellIsEmpty(row[controlId]);
  });
}

function mergeRequiredState(controls = [], control = {}) {
  const resetControls = control.relationControls || [];

  if (_.isEmpty(resetControls)) return controls;

  return controls.map(item => {
    const resetControl = _.find(resetControls, { controlId: item.controlId });

    return resetControl
      ? {
          ...item,
          required: resetControl.required,
        }
      : item;
  });
}

export function getSubListErrorOfStore(store, currentControl) {
  const state = store.getState();
  const { rows, base = {}, cellErrors: pendingCellErrors = {} } = state;
  const { recordId, control = {} } = base;
  const isWorkflow =
    ((base.instanceId && base.workId) || _.get(window, 'shareState.isPublicWorkflowRecord')) &&
    _.get(base, 'worksheetInfo.workflowChildTableSwitch') !== false;
  const mergedControl = isWorkflow && currentControl ? currentControl : control;
  // 只同步工作流审批规则改写后的必填状态，避免影响普通记录子表的权限判断。
  const controls = isWorkflow ? mergeRequiredState(base.controls, mergedControl) : base.controls;
  const error = getSubListError(
    {
      rows,
      rules: get(base, 'worksheetInfo.rules'),
    },
    controls,
    mergedControl.showControls,
    recordId ? 3 : 2,
    base.masterData,
    { workflowRequiredCheck: isWorkflow },
  );
  // 合并失焦时本地保留的校验错误（这些非法值未落入 row 数据，row 端校验无法发现）。
  // row 端结果优先：同一格若两边都报错以 row 计算结果为准。
  const merged = { ...filterPendingCellErrors(pendingCellErrors, rows, mergedControl.showControls), ...error };

  if (!isEmpty(merged)) {
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: merged,
    });
  } else if (browserIsMobile()) {
    store.clearSubListErrors();
  }

  return merged;
}
