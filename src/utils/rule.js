import _ from 'lodash';
import { updateRulesData } from 'src/components/newCustomFields/tools/formUtils';

/**
 * 获取记录字段规则错误
 */
export function checkRulesErrorOfRow({ from, rules, controls, control, row }) {
  let errors = [];
  const formData = updateRulesData({
    from,
    rules,
    recordId: row.rowid,
    data: controls.map(c => ({ ...c, value: row[c.controlId] })),
    updateControlIds: control ? [control.controlId] : [],
    checkAllUpdate: !control,
    checkRuleValidator: (controlId, errorType, errorMessage, rule = {}) => {
      if (errorMessage) {
        errors.push({ controlId, errorType, errorMessage, ignoreErrorMessage: rule.checkType === 3 });
      }
    },
  });
  return { formData, errors };
}

/**
 * 获取字段字段规则错误
 */
export function checkRulesErrorOfRowControl({ from, rules, controls, control, row }) {
  const errors = checkRulesErrorOfRow({ from, rules, controls, control, row }).errors;
  return _.find(errors, e => e.controlId === control.controlId);
}
