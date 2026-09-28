import _ from 'lodash';
import { controlState } from 'src/utils/domain/control/state';
import { isSheetDisplay } from 'src/utils/domain/control/style';
import { FORM_ERROR_TYPE } from '../config';
import filterFn from './filterFn';
import { flattenArr, getResult, isRelateMoreList, replaceStr } from './ruleUtils';

const HIDDEN_SYSTEM_RULE_CONTROL_IDS = ['ctime', 'utime'];

const getFieldIds = (filter = {}) => {
  const isDynamic = filter.dynamicSource && filter.dynamicSource.length > 0;
  return isDynamic
    ? [filter.controlId, ...(filter.dynamicSource || []).map(dynamic => dynamic.cid)]
    : [filter.controlId];
};

export const getFilterGroupControlIds = (filterGroup = {}) => {
  return (filterGroup.groupFilters || []).reduce((controlIds, filter) => {
    return controlIds.concat(getFieldIds(filter));
  }, []);
};

const getVisibleGroupFilters = (filterGroup = {}, data = [], recordId, from) => {
  const isOrCondition = (filterGroup.groupFilters || []).some(filter => filter.spliceType === 2);
  let groupFilters = [filterGroup.groupFilters || []];

  if (isOrCondition) {
    groupFilters = (filterGroup.groupFilters || []).map(filter => [filter]);
  }

  groupFilters = groupFilters.filter(filters => {
    const controlIds = getFilterGroupControlIds({ groupFilters: filters });
    return _.some(controlIds, controlId => {
      const control = _.find(data, item => item.controlId === controlId);
      return (
        (recordId && controlId === 'rowid') ||
        _.includes(['currenttime', 'user-self'], controlId) ||
        _.includes(HIDDEN_SYSTEM_RULE_CONTROL_IDS, controlId) ||
        (control && controlState(control, from).visible && !control.hidden)
      );
    });
  });

  return { ...filterGroup, groupFilters: _.flatten(groupFilters) };
};

export const checkValueAvailable = (rule = {}, data = [], recordId, from) => {
  let isAvailable = false;
  let filterControlIds = {};
  let availableControlIds = {};
  let transFilters = rule.filters || [[]];

  if (from) {
    transFilters = transFilters
      .map(filterGroup => getVisibleGroupFilters(filterGroup, data, recordId, from))
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

          const controlIds = getFieldIds(filter);

          if (!result) {
            filterControlIds[groupIndex][filterIndex] = controlIds;
            availableControlIds[groupIndex][filterIndex] = [];
          } else {
            filterControlIds[groupIndex][filterIndex] = [];
            availableControlIds[groupIndex][filterIndex] = controlIds;
          }
        }
      });
      isAvailable = getResult(transFilters, groupIndex, childItemAvailable, isAvailable);
    }
  });

  const controlIds = transFilters.map(getFilterGroupControlIds);

  if (isAvailable) {
    availableControlIds = controlIds;
    filterControlIds = [];
  } else {
    availableControlIds = [];
    filterControlIds = controlIds;
  }

  return {
    isAvailable,
    filterControlIds: flattenArr(filterControlIds),
    availableControlIds: flattenArr(availableControlIds),
  };
};

export const updateDataPermission = (
  { attrs = [], it, checkRuleValidator, item = {}, verifyAllControls = false },
  { getRequiredError = () => '', getEditableError = () => ({}) } = {},
) => {
  const isSubList = _.includes([29, 34], item.type);
  let fieldPermission = it.fieldPermission || '111';
  let required = it.required || false;
  let disabled = it.disabled || false;
  const eventPermissions = it.eventPermissions || '';
  const types = attrs.map(attr => attr.type);

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
    const permission = _.last(attrs.map(attr => attr.permission).filter(_.identity));

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
      const errorText = getRequiredError({ it, required, fieldPermission, verifyAllControls });
      item.type !== 34 && checkRuleValidator(it.controlId, FORM_ERROR_TYPE.RULE_REQUIRED, errorText);
    } else if (_.includes(types, 3) || eventPermissions[1] === '1') {
      fieldPermission = replaceStr(fieldPermission, 1, '1');
      const { errorType = '', errorText = '' } = getEditableError({ it, fieldPermission, verifyAllControls });
      checkRuleValidator(it.controlId, errorType, errorText);
    }
  }

  if (_.includes(types, 8)) {
    disabled = false;
  }

  it.fieldPermission = fieldPermission;
  it.required = required;
  it.disabled = disabled;
};
