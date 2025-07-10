import _, { assign, find, get, includes, isEmpty } from 'lodash';
import moment from 'moment';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import { DATE_RANGE_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import { getType, redefineComplexControl, validate } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getRequest } from 'src/utils/common';

export { getType, validate };

export function formatFilterValues(controlType, values = []) {
  function parse(str = '') {
    if (str.startsWith('{')) {
      return safeParse(str);
    } else {
      return { id: str };
    }
  }
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(value => parse(value)).map(c => ({ accountId: c.id, fullname: c.name, avatar: c.avatar }));
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(value => parse(value)).map(c => ({ organizeId: c.id, organizeName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(value => parse(value)).map(c => ({ departmentId: c.id, departmentName: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(value => parse(value)).map(c => ({ id: c.id, name: c.name }));
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(value => parse(value)).map(c => ({ rowid: c.id, name: c.name }));
    default:
      return values;
  }
}

export function formatFilterValuesToServer(controlType, values = []) {
  values = values.filter(_.identity);
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER: // 人员
      return values.map(v => v.accountId);
    case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE: // 角色
      return values.map(v => v.organizeId);
    case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT: // 部门
      return values.map(v => v.departmentId);
    case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY: // 地区
    case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY: // 地区
      return values.map(v => v.id);
    case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET: // 关联
    case WIDGETS_TO_API_TYPE_ENUM.CASCADER: // 级联
      return values.map(v => v.rowid);
    default:
      return values.filter(_.isString);
  }
}

function parseUrlValue({ value, control, filterType, dateRangeType } = {}) {
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
      value: moment(value, 'YYYY-MM-DD HH:mm:ss').format(
        {
          [DATE_RANGE_TYPE.MINUTE]: 'YYYY-MM-DD HH:mm',
          [DATE_RANGE_TYPE.HOUR]: 'YYYY-MM-DD HH',
        }[dateRangeType] || 'YYYY-MM-DD',
      ),
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

function parseDynamicSource({ dynamicSource, control, filterType, dateRangeType } = {}) {
  const urlParams = getRequest();
  return dynamicSource.map(item => {
    if (item.rcid !== 'url' || !item.cid || !urlParams[item.cid]) return;
    const changes = parseUrlValue({
      value: urlParams[item.cid],
      control: redefineComplexControl(control),
      filterType,
      dateRangeType,
    });
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
    if (control.type === WIDGETS_TO_API_TYPE_ENUM.SWITCH) {
      condition.value = 1;
    }
    return condition;
  });
}
