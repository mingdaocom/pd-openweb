import { CONTROL_FILTER_WHITELIST } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { getTypeKey, redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import _ from 'lodash';

export function formatCondition(condition, relationControls, fromCondition) {
  if ((_.get(condition, 'groupFilters') || []).length > 0) {
    return {
      ...condition,
      groupFilters: condition.groupFilters.map(it => formatCondition(it, relationControls)),
    };
  }
  const control = _.find(relationControls, column => condition.controlId === column.controlId) || {};
  // type为关联他表，type取sourceControlType的值 -1//无值, 通用方法转换redefineComplexControl

  const conditionGroupKey = getTypeKey(redefineComplexControl(control).type);
  const conditionGroupType = (CONTROL_FILTER_WHITELIST[conditionGroupKey] || {}).value;
  const dataRangeInfo = fromCondition === 'subTotal' && conditionGroupKey === 'DATE' ? { dateRange: 18 } : {};
  let initialDynamicSource = {
    ...condition,
    ...dataRangeInfo,
    conditionGroupType,
    type: condition.filterType,
    values: [],
    maxValue: undefined,
    minValue: undefined,
    value: undefined,
    fullValues: [],
    isDynamicsource: true,
  };
  let initialSource = {
    ...condition,
    ...dataRangeInfo,
    conditionGroupType,
    type: condition.filterType,
    dynamicSource: [],
    isDynamicsource: false,
  };
  if ((_.get(condition, 'dynamicSource') || []).length > 0) {
    return initialDynamicSource;
  } else {
    return initialSource;
  }
}
