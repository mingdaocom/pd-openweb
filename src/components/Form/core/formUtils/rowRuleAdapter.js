import _ from 'lodash';
import { controlState, isSheetDisplay } from 'src/utils/controlCommon';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT } from '../config';
import filterFn from './filterFn';
import { updateRulesDataByRule } from './ruleDataCore';
import { flattenArr, getAvailableFilters, getResult, isRelateMoreList, replaceStr } from './ruleUtils';

const getFieldIds = (filter = {}) => {
  const isDynamic = filter.dynamicSource && filter.dynamicSource.length > 0;
  return isDynamic ? [filter.controlId, ...(filter.dynamicSource || []).map(dy => dy.cid)] : [filter.controlId];
};

const getIds = (filterGroup = {}) => {
  return (filterGroup.groupFilters || []).reduce((total, filter) => total.concat(getFieldIds(filter)), []);
};

const getItemGroupFilters = (filterGroup = {}, data = [], recordId, from) => {
  const isOrCondition = (filterGroup.groupFilters || []).findIndex(filter => filter.spliceType === 2) > -1;
  let groupFilters = [filterGroup.groupFilters || []];

  if (isOrCondition) {
    groupFilters = (filterGroup.groupFilters || []).map(filter => [filter]);
  }

  groupFilters = groupFilters.filter(filters => {
    const ids = getIds({ groupFilters: filters });
    return _.some(ids, id => {
      const control = _.find(data, item => item.controlId === id);
      return (
        (recordId && id === 'rowid') ||
        _.includes(['currenttime', 'user-self'], id) ||
        (control && controlState(control, from).visible && !control.hidden)
      );
    });
  });

  return { ...filterGroup, groupFilters: _.flatten(groupFilters) };
};

const checkValueAvailable = (rule = {}, data = [], recordId, from) => {
  let isAvailable = false;
  let filterControlIds = {};
  let availableControlIds = {};
  let transFilters = rule.filters || [[]];

  if (from) {
    transFilters = transFilters
      .map(filterGroup => getItemGroupFilters(filterGroup, data, recordId, from))
      .filter(filterGroup => !_.isEmpty(filterGroup.groupFilters));
  }

  transFilters.forEach((filterGroup, groupIndex) => {
    if (!filterControlIds[groupIndex]) {
      filterControlIds[groupIndex] = [];
    }

    if (!availableControlIds[groupIndex]) {
      availableControlIds[groupIndex] = [];
    }

    if (filterGroup.groupFilters && filterGroup.groupFilters.length) {
      let childItemAvailable = true;
      filterGroup.groupFilters.forEach((filter, filterIndex) => {
        const filterControl = data.find(item => item.controlId === filter.controlId);

        if (filterControl && !isRelateMoreList(filterControl, filter)) {
          const result = filterFn({
            filterData: filter,
            originControl: filterControl,
            data,
            recordId,
            appTimeZone: rule.appTimeZone,
          });
          childItemAvailable = getResult(filterGroup.groupFilters, filterIndex, result, childItemAvailable);

          const ids = getFieldIds(filter);

          if (!result) {
            filterControlIds[groupIndex][filterIndex] = ids;
            availableControlIds[groupIndex][filterIndex] = [];
          } else {
            filterControlIds[groupIndex][filterIndex] = [];
            availableControlIds[groupIndex][filterIndex] = ids;
          }
        }
      });
      isAvailable = getResult(transFilters, groupIndex, childItemAvailable, isAvailable);
    }
  });

  const ids = transFilters.map(i => getIds(i));

  if (isAvailable) {
    availableControlIds = ids;
    filterControlIds = [];
  } else {
    availableControlIds = [];
    filterControlIds = ids;
  }

  return {
    isAvailable,
    filterControlIds: flattenArr(filterControlIds),
    availableControlIds: flattenArr(availableControlIds),
  };
};

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

const updateDataPermission = ({ attrs = [], it, checkRuleValidator, item = {} }) => {
  const isSubList = _.includes([29, 34], item.type);
  let fieldPermission = it.fieldPermission || '111';
  let required = it.required || false;
  let disabled = it.disabled || false;
  const eventPermissions = it.eventPermissions || '';
  const types = attrs.map(i => i.type);

  if (_.includes(types, 2) || eventPermissions[0] === '0') {
    fieldPermission = replaceStr(fieldPermission, 0, '0');
    if (isSubList && _.includes(item.showControls || [], it.controlId)) {
      item.showControls = (item.showControls || []).filter(controlId => controlId !== it.controlId);
    }
  } else if (_.includes(types, 1) || eventPermissions[0] === '1') {
    fieldPermission = replaceStr(fieldPermission, 0, '1');
  }

  if (_.includes(types, 4) || eventPermissions[1] === '0') {
    fieldPermission = replaceStr(fieldPermission, 1, '0');
  } else {
    const permission = _.last(attrs.map(i => i.permission).filter(_.identity));

    if (!_.isUndefined(permission)) {
      if (it.type === 34) {
        it.advancedSetting = {
          ...it.advancedSetting,
          allowcancel: _.includes(permission, 'delete') ? '1' : '0',
          allowedit: _.includes(permission, 'edit') ? '1' : '0',
          ...(_.includes(permission, 'add')
            ? _.get(item, 'advancedSetting.allowadd') !== '1'
              ? { allowadd: '1', allowsingle: '1' }
              : {}
            : { allowadd: '0', allowsingle: '0', batchcids: JSON.stringify([]), allowimport: '0', allowcopy: '0' }),
        };
      } else if (isSheetDisplay(it)) {
        if (_.includes(permission, 'add')) {
          if (!_.includes([0, 1], it.enumDefault2)) {
            it.enumDefault2 = it.enumDefault2 === 10 ? 0 : 1;
            it.advancedSetting = {
              ...it.advancedSetting,
              searchrange: '1',
            };
          }
        } else {
          it.enumDefault2 = it.enumDefault2 === 0 ? 10 : 11;
          it.advancedSetting = {
            ...it.advancedSetting,
            searchrange: '',
          };
        }

        it.advancedSetting = {
          ...it.advancedSetting,
          allowcancel: _.includes(permission, 'delete') ? '1' : '0',
          ...(_.get(it, 'advancedSetting.allowbatch') === '1'
            ? { batchcancel: _.includes(permission, 'delete') ? '1' : '0' }
            : {}),
        };
      }
    }

    if (_.includes(types, 5)) {
      required = true;
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      const errorText = getRequiredErrorText({ ...it, required, fieldPermission });
      item.type !== 34 && checkRuleValidator(it.controlId, FORM_ERROR_TYPE.RULE_REQUIRED, errorText);
    } else if (_.includes(types, 3) || eventPermissions[1] === '1') {
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      checkRuleValidator(it.controlId, '', '');
    }
  }

  if (_.includes(types, 8)) {
    disabled = false;
  }

  it.fieldPermission = fieldPermission;
  it.required = required;
  it.disabled = disabled;
};

export const updateRulesDataOfRow = props =>
  updateRulesDataByRule(props, {
    getAvailableFilters,
    checkValueAvailable,
    updateDataPermission,
    parseStyleSetting: value => safeParse(value || '{}'),
  });
