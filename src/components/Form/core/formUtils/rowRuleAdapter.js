import _ from 'lodash';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT } from '../config';
import { updateRulesDataByRule } from './ruleDataCore';
import { checkValueAvailable, updateDataPermission } from './ruleEvaluationCore';
import { getAvailableFilters } from './ruleUtils';

const checkRequired = item => {
  if (
    item.required &&
    ((item.type !== 34 && (!_.includes([6, 8], item.type) ? !item.value : isNaN(parseFloat(item.value)))) ||
      (item.type !== 34 && _.isString(item.value) && !item.value.trim()) ||
      (_.includes([9, 10, 11], item.type) && !safeParse(item.value).length) ||
      (item.type === 14 &&
        ((_.isArray(safeParse(item.value)) && !safeParse(item.value).length) ||
          (!_.isArray(safeParse(item.value)) &&
            !safeParse(item.value)?.attachments?.length &&
            !safeParse(item.value)?.knowledgeAtts?.length &&
            !safeParse(item.value)?.attachmentData?.length))) ||
      (_.includes([21, 26, 27, 29, 35, 48], item.type) &&
        _.isArray(safeParse(item.value)) &&
        !safeParse(item.value).length) ||
      (item.type === 29 &&
        typeof item.value === 'string' &&
        (item.value.startsWith('deleteRowIds') || item.value === '0')) ||
      (item.type === 36 && item.value === '0') ||
      (item.type === 28 && parseFloat(item.value) === 0))
  ) {
    return FORM_ERROR_TYPE.REQUIRED;
  }

  return '';
};

const getRequiredErrorText = item => {
  const errorType = checkRequired(item);
  if (!errorType) return '';
  return typeof FORM_ERROR_TYPE_TEXT[errorType] === 'string'
    ? FORM_ERROR_TYPE_TEXT[errorType]
    : FORM_ERROR_TYPE_TEXT[errorType](item);
};

const updateRowDataPermission = props =>
  updateDataPermission(props, {
    getRequiredError: ({ it, required, fieldPermission }) => getRequiredErrorText({ ...it, required, fieldPermission }),
  });

export const updateRulesDataOfRow = props =>
  updateRulesDataByRule(props, {
    getAvailableFilters,
    checkValueAvailable,
    updateDataPermission: updateRowDataPermission,
    parseStyleSetting: value => safeParse(value || '{}'),
  });
