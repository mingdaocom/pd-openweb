import _, { assign, find, get, includes, isEmpty } from 'lodash';
import moment from 'moment';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import { getRequest } from 'src/utils/platform/browser/device';
import { formatFilterValuesToServer } from 'src/utils/services/worksheet/quickFilter';

export const formatQuickFilter = filter => {
  return filter.map(c => {
    return {
      ...c,
      values: formatFilterValuesToServer(c.dataType, c.values),
    };
  });
};

export function conditionAdapter(condition) {
  delete condition.control;
  if (condition.dataType === 29 && condition.filterType === 2) {
    condition.filterType = 24;
  }

  return condition;
}

export function turnControl(control) {
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD) {
    control.type = control.sourceControlType;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE) {
    control.type = control.enumDefault === 2 ? (control.unit === '3' ? 15 : 16) : 6;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE) {
    control.type = control.enumDefault === 2 ? 15 : 6;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC) {
    control.type = control.enumDefault2;
  }

  return control;
}

export function getType(control) {
  let { type } = control;

  if (type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && control) {
    type = control.sourceControlType || -10000;
  }

  if (type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL && control) {
    type = control.enumDefault2 || 6;
  }

  if (type === WIDGETS_TO_API_TYPE_ENUM.SEARCH) {
    type = WIDGETS_TO_API_TYPE_ENUM.TEXT;
  }

  return type;
}

function parseUrlValue({ value, control, filterType } = {}) {
  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT,
        WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
        WIDGETS_TO_API_TYPE_ENUM.EMAIL,
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
        WIDGETS_TO_API_TYPE_ENUM.CRED,
      ],

      control.type,
    )
  ) {
    return { values: [value] };
  } else if (includes([WIDGETS_TO_API_TYPE_ENUM.NUMBER, WIDGETS_TO_API_TYPE_ENUM.MONEY], control.type)) {
    if (filterType === FILTER_CONDITION_TYPE.BETWEEN) {
      const [min, max] = value.split('-');
      return {
        minValue: !isNaN(Number(min)) ? Number(min) : min,
        maxValue: !isNaN(Number(max)) ? Number(max) : max,
      };
    } else {
      return !isNaN(Number(value)) ? { value: Number(value) } : {};
    }
  } else if (
    includes(
      [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN],
      control.type,
    )
  ) {
    return {
      values: value
        .split(',')
        .map(splittedValue => get(find(control.options, { value: splittedValue }), 'key'))
        .filter(_.identity),
    };
  } else if (includes([WIDGETS_TO_API_TYPE_ENUM.DATE, WIDGETS_TO_API_TYPE_ENUM.DATE_TIME], control.type)) {
    return {
      dateType: 15,
      dateRange: 18,
      value: moment(value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'),
    };
  } else if (includes([WIDGETS_TO_API_TYPE_ENUM.TIME], control.type)) {
    const [min, max] = value.split('-');
    return {
      dateRange: 18,
      filterType: 31,
      minValue: moment(min, 'HH:mm:ss').format('HH:mm:ss'),
      maxValue: moment(max, 'HH:mm:ss').format('HH:mm:ss'),
    };
  } else if (includes([WIDGETS_TO_API_TYPE_ENUM.SWITCH], control.type)) {
    return {
      filterType: includes(['1', 'true'], value) ? 2 : includes(['0', 'false'], value) ? 6 : 0,
      value: 1,
    };
  }
}

function parseDynamicSource({ dynamicSource, control, filterType } = {}) {
  const urlParams = getRequest();
  return dynamicSource.map(item => {
    if (item.rcid !== 'url' || !item.cid || !urlParams[item.cid]) return;
    const changes = parseUrlValue({ value: urlParams[item.cid], control, filterType });
    return changes;
  });
}

export function handleConditionsDefault(conditions, controls) {
  return conditions.map(condition => {
    condition = { ...condition };
    if (
      condition.filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN &&
      condition.dateRange !== 18 &&
      get(condition, 'advancedSetting.daterange') !== '[]'
    ) {
      condition.originalFilterType = condition.filterType;
      condition.filterType = FILTER_CONDITION_TYPE.DATEENUM;
    }

    const control = find(controls, { controlId: condition.controlId });
    if (!control) return condition;
    if (!isEmpty(condition.dynamicSource)) {
      const dynamicResult = parseDynamicSource({
        dynamicSource: condition.dynamicSource,
        control,
        filterType: condition.filterType,
        dateRangeType: condition.dateRangeType,
      });

      if (dynamicResult && dynamicResult[0]) {
        condition = assign(condition, dynamicResult[0]);
      }
    }

    const values = condition.values;

    if (values[0] === 'isEmpty') {
      condition.filterType = 7;
    }

    return condition;
  });
}
