import _, { get, isEmpty, isNull, isUndefined } from 'lodash';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from 'src/components/Form/core/config';
import DataFormat from 'src/components/Form/core/DataFormat';
import { checkRequired, checkRuleLocked, checkValueByFilterRegex } from 'src/components/Form/core/formUtils';
import { checkRulesErrorOfRow } from 'src/components/Form/core/formUtils/checkRulesError';
import { filterEmptyChildTableRows } from 'src/utils/core/childTable';
import { controlState } from 'src/utils/domain/control/state';
import { checkCellIsEmpty, getControlCompareValue } from 'src/utils/domain/control/value';
import { browserIsMobile } from 'src/utils/platform/browser/device';

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

/**
 * 静态计算被编辑字段 changedIds 会联动影响到的下游字段（含传递依赖闭包）。
 * 判定条件对齐 DataFormat.updateDataSource 中 effectControls 的过滤逻辑：
 * 他表字段(30)/公式(31)/汇总(37) 的 dataSource、日期公式(38) 的 sourceControlId、
 * 动态默认值 defsource、默认值函数 defaultfunc 表达式引用了变更字段，即视为受影响。
 * 用于子表批量编辑分流：返回空表示这批字段无任何联动，可走轻量浅合并；非空才需逐行 DataFormat 重算。
 */
export function getEffectedControlIds(controls = [], changedIds = []) {
  const isEffectedBy = (item, ids) => {
    const dataSource = item.dataSource || '';
    const sourceControlId = item.type === 38 ? item.sourceControlId || '' : '';
    const defsource = get(item, 'advancedSetting.defsource') || '';
    const defaultfuncExp = get(safeParse(get(item, 'advancedSetting.defaultfunc') || '{}'), 'expression') || '';
    return ids.some(
      id =>
        dataSource.includes(id) ||
        (sourceControlId && sourceControlId.includes(id)) ||
        (defsource && defsource.includes(id)) ||
        (defaultfuncExp && defaultfuncExp.includes(id)),
    );
  };
  const effected = new Set();
  let frontier = (changedIds || []).filter(Boolean);
  while (frontier.length) {
    const next = [];
    (controls || []).forEach(item => {
      if (!item.controlId || effected.has(item.controlId)) return;
      if (isEffectedBy(item, frontier)) {
        effected.add(item.controlId);
        next.push(item.controlId);
      }
    });
    frontier = next;
  }
  return [...effected];
}

export function getSubListErrorOfStore(store, currentControl) {
  const state = store.getState();
  const { rows, base = {}, persistedCellErrors: pendingCellErrors = {} } = state;
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
  // 只取 persistedCellErrors：cellErrors 里还有上一次保存写回的必填/规则错误，
  // 它们能由 row 端重新算出，若一并合并会在条件字段改动后仍按旧结果拦截保存。
  // row 端结果优先：同一格若两边都报错以 row 计算结果为准。
  const merged = { ...filterPendingCellErrors(pendingCellErrors, rows, mergedControl.showControls), ...error };

  if (!isEmpty(merged)) {
    store.dispatch({
      type: 'UPDATE_CELL_ERRORS',
      value: merged,
    });
  } else if (browserIsMobile() || !isEmpty(state.cellErrors)) {
    // 本次校验已无错误：清掉上一次保存写回的过期错误（如业务规则条件字段改动后已不再必填的单元格），
    // 否则单元格红框和错误提示会一直留在表格上
    store.clearSubListErrors();
  }

  return merged;
}
