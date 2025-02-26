import _, { assign, get, includes } from 'lodash';
import moment from 'moment';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import {
  checkIsTextControl,
  getFormData,
  getSelectedOptions,
  isRelateRecordTableControl,
  checkCellIsEmpty
} from 'src/pages/worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ROW_ID_CONTROL, SYSTEM_DATE_CONTROL, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { validate } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils';
import {
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  FILTER_RELATION_TYPE,
  getFilterTypeLabel,
  API_ENUM_TO_TYPE,
  getControlSelectType,
  DATE_RANGE_TYPE,
} from './enum';
import { browserIsMobile } from 'src/util';

export function getConditionType(condition) {
  return (condition.controlType === 28 || condition.dataType === 28) &&
    _.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], condition.type)
    ? CONTROL_FILTER_WHITELIST.OPTIONS.value
    : condition.conditionGroupType;
}

export function formatConditionForSave(condition, relationType, options = {}) {
  let { controlId, values, controlType } = condition;
  const { returnFullValues } = options;
  if (_.get(condition, 'control') && controlType === 25) {
    controlType = 8;
    controlId = condition.control.dataSource.slice(1, -1);
  }
  if (
    condition.value &&
    condition.conditionGroupType === CONTROL_FILTER_WHITELIST.DATE.value &&
    condition.dateRange === 18 &&
    condition.dateRangeType
  ) {
    condition.value = moment(condition.value).format(
      {
        [DATE_RANGE_TYPE.YEAR]: 'YYYY',
        [DATE_RANGE_TYPE.MONTH]: 'YYYY-MM',
        [DATE_RANGE_TYPE.DAY]: 'YYYY-MM-DD',
        [DATE_RANGE_TYPE.HOUR]: 'YYYY-MM-DD HH',
        [DATE_RANGE_TYPE.MINUTE]: 'YYYY-MM-DD HH:mm',
      }[condition.dateRangeType] || 'YYYY-MM-DD HH:mm:ss',
    );
  }
  return {
    controlId: controlId,
    dataType: controlType,
    spliceType: relationType,
    filterType: condition.type,
    dateRange: condition.dateRange,
    dateRangeType: condition.dateRangeType,
    maxValue: condition.maxValue,
    minValue: condition.minValue,
    isDynamicsource: condition.isDynamicsource,
    dynamicSource: condition.dynamicSource || [],
    value: condition.value,
    values:
      returnFullValues && _.includes([26, 27, 29, 19, 23, 24, 35, 48], controlType) && !_.isEmpty(values)
        ? condition.fullValues
        : values,
  };
}

export function formatValues(controlType, filterType, values = []) {
  function safeParse(str) {
    try {
      return JSON.parse(str);
    } catch (err) {
      console.error(err);
      return {};
    }
  }
  try {
    // 为空，不为空, 常规用户, 外部门户用户
    if (
      _.includes(
        [
          FILTER_CONDITION_TYPE.ISNULL,
          FILTER_CONDITION_TYPE.HASVALUE,
          FILTER_CONDITION_TYPE.NORMALUSER,
          FILTER_CONDITION_TYPE.PORTALUSER,
        ],
        filterType,
      )
    ) {
      return values;
    }
    if (_.includes([26, 27, 19, 23, 24, 29, 35, 48], controlType)) {
      return values.map(value => safeParse(value).id).filter(_.identity);
    }
  } catch (err) {}
  return values;
}

export function formatValuesOfCondition(condition) {
  return condition.isGroup && condition.groupFilters
    ? {
        ...condition,
        groupFilters: condition.groupFilters.map(c => ({
          ...c,
          values: formatValues(c.dataType, c.filterType, c.values),
        })),
      }
    : {
        ...condition,
        values: formatValues(condition.dataType, condition.filterType, condition.values),
      };
}

export function getTypeKey(type) {
  const whiteListKeys = Object.keys(CONTROL_FILTER_WHITELIST);
  const typeKey = _.find(whiteListKeys, key => _.includes(CONTROL_FILTER_WHITELIST[key].keys, type));
  return typeKey;
}

// TODO
export function formatValuesOfOriginConditions(conditions) {
  return conditions.map(condition =>
    condition.isGroup && condition.groupFilters
      ? {
          ...condition,
          groupFilters: condition.groupFilters.map(c => ({
            ...c,
            values: formatValues(c.dataType, c.filterType, c.values),
          })),
        }
      : {
          ...condition,
          values: formatValues(condition.dataType, condition.filterType, condition.values),
        },
  );
}

function formatConditions(items) {
  return items.map(condition => {
    const conditionGroupType = getConditionType(
      assign({}, condition, {
        conditionGroupType: (CONTROL_FILTER_WHITELIST[getTypeKey(condition.dataType)] || {}).value,
      }),
    );
    return {
      controlId: condition.controlId,
      controlType: condition.dataType,
      conditionGroupType,
      keyStr: condition.controlId + Math.random().toString(16).slice(2),
      type: condition.filterType,
      dateRange: condition.dateRange,
      dateRangeType: condition.dateRangeType,
      spliceType: condition.spliceType,
      maxValue: condition.maxValue,
      minValue: condition.minValue,
      value: condition.value,
      fullValues: condition.values,
      values: formatValues(condition.dataType, condition.filterType, condition.values),
      folded: condition.folded,
      dynamicSource: condition.dynamicSource || [],
      isDynamicsource: condition.isDynamicsource,
    };
  });
}

export function formatOriginFilterValue(item) {
  item = typeof item === 'string' ? JSON.parse(item) : item;
  const items = item.items || [];
  const result = {
    id: item.filterId,
    name: item.name,
    type: item.type,
    createAccountId: item.createAccountId,
    relationType: items[0] ? items[0].spliceType : FILTER_RELATION_TYPE.AND,
    conditions: formatConditions(items),
  };
  return result;
}

export function formatOriginFilterGroupValue(filter) {
  filter = typeof item === 'string' ? JSON.parse(filter) : filter;
  const items = _.get(filter, 'items') || [];
  const isGroup = items[0] && items[0].isGroup;
  const result = {
    id: filter.filterId || '',
    name: filter.name,
    type: filter.type,
    createAccountId: filter.createAccountId,
    isGroup,
  };
  if (isGroup) {
    result.conditionsGroups = items.map(conditionsGroup => ({
      ...conditionsGroup,
      conditionSpliceType: _.get(conditionsGroup, 'groupFilters.0.spliceType') || FILTER_RELATION_TYPE.AND,
      conditions: formatConditions(conditionsGroup.groupFilters),
    }));
  } else {
    result.conditionsGroups = [
      {
        spliceType: FILTER_RELATION_TYPE.AND,
        conditionSpliceType: _.get(items, '0.spliceType') || FILTER_RELATION_TYPE.AND,
        conditions: formatConditions(items),
      },
    ];
  }
  return result;
}

export function checkFilterConditionsAvailable(filter) {
  const { conditions } = filter;
  return conditions && conditions.length && _.every(conditions, condition => checkConditionAvailable(condition));
}

export function filterUnavailableConditions(conditions) {
  let newConditions = [...conditions];
  newConditions = newConditions.map(condition => {
    if (condition.isGroup && condition.groupFilters) {
      condition.groupFilters = condition.groupFilters.filter(checkConditionAvailable);
    }
    return condition;
  });
  return newConditions.filter(condition => {
    if (condition.isGroup) {
      return !!condition.groupFilters.length;
    } else {
      return checkConditionAvailable(condition);
    }
  });
}

export function checkConditionAvailable(condition) {
  const { type, value, values, minValue, maxValue, dateRange, dynamicSource = [], isDynamicsource = false } = condition;
  const conditionGroupType = getConditionType(condition);
  if (dynamicSource.length > 0 && isDynamicsource) {
    if (_.get(dynamicSource[0], 'rcid') === 'url' && !_.get(dynamicSource[0], 'cid')) {
      return false;
    }
    return true;
  }
  if (
    _.includes(
      [
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
        FILTER_CONDITION_TYPE.NORMALUSER,
        FILTER_CONDITION_TYPE.PORTALUSER,
      ],
      type,
    )
  ) {
    return true;
  }
  switch (conditionGroupType) {
    case CONTROL_FILTER_WHITELIST.TEXT.value:
      return values && values.length;
    case CONTROL_FILTER_WHITELIST.NUMBER.value:
      if (type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN) {
        return minValue && maxValue;
      } else {
        return !_.isUndefined(value);
      }
    case CONTROL_FILTER_WHITELIST.BOOL.value:
      return true;
    case CONTROL_FILTER_WHITELIST.DATE.value:
    case CONTROL_FILTER_WHITELIST.TIME.value:
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN) {
        return !_.isUndefined(minValue) && !_.isUndefined(maxValue);
      } else {
        return _.includes([10, 11, 18, 101, 102], dateRange)
          ? !_.isUndefined(value) && value !== ''
          : !_.isUndefined(dateRange);
      }
    case CONTROL_FILTER_WHITELIST.OPTIONS.value:
    case CONTROL_FILTER_WHITELIST.USERS.value:
    case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
    case CONTROL_FILTER_WHITELIST.CASCADER.value:
      return values && values.length;
    default:
      return false;
  }
}

export function getConditionOverrideValue(type, condition, valueType, from) {
  const { value, values, dateRange, dateRangeType, fullValues } = condition;
  let newDateRangeType = dateRangeType;
  const conditionGroupType = getConditionType(condition);
  const base = {
    type,
    values: [],
    maxValue: undefined,
    minValue: undefined,
    value: undefined,
    dateRange: 0,
    dateRangeType: DATE_RANGE_TYPE.DAY,
    dynamicSource:
      valueType === 2
        ? [
            {
              cid: '',
              rcid: 'url',
              staticValue: '',
            },
          ]
        : [],
    isDynamicsource: false,
    // 兼容values清空，fullValues值还存在的问题
    ...(_.isUndefined(fullValues) ? {} : { fullValues: _.isEmpty(values) ? [] : fullValues }),
  };
  if (type === FILTER_CONDITION_TYPE.ISNULL || type === FILTER_CONDITION_TYPE.HASVALUE) {
    return base;
  }
  switch (conditionGroupType) {
    case CONTROL_FILTER_WHITELIST.TEXT.value:
      return Object.assign({}, base, { values });
    case CONTROL_FILTER_WHITELIST.NUMBER.value:
      if (type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN) {
        return Object.assign({}, base, { minValue: value });
      } else {
        return Object.assign({}, base, { value });
      }
    case CONTROL_FILTER_WHITELIST.BOOL.value:
      return base;
    case CONTROL_FILTER_WHITELIST.DATE.value:
      if (_.includes([101, 102], dateRange)) {
        newDateRangeType = DATE_RANGE_TYPE.DAY;
      } else if (!includes([FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE], type)) {
        newDateRangeType = get(condition, 'control.advancedSetting.showtype')
          ? Number(get(condition, 'control.advancedSetting.showtype'))
          : DATE_RANGE_TYPE.DAY;
      } else if (!includes([DATE_RANGE_TYPE.HOUR, DATE_RANGE_TYPE.MINUTE], newDateRangeType)) {
        newDateRangeType = DATE_RANGE_TYPE.DAY;
      }
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN) {
        return Object.assign({}, base, {
          minValue:
            from === 'relateSheet' ? undefined : moment().add(-1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          maxValue: from === 'relateSheet' ? undefined : moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          dateRange,
          dateRangeType: newDateRangeType,
        });
      } else {
        return Object.assign({}, base, {
          dateRange: dateRange,
          value:
            _.includes([101, 102, 10, 11], dateRange) ||
            (_.get(condition, 'control.type') === 16 && _.get(condition, 'control.advancedSetting.showtype') === '6') ||
            from === 'relateSheet'
              ? value
              : formatDateValue({ type, value }),
          dateRangeType: newDateRangeType || DATE_RANGE_TYPE.DAY,
        });
      }
    case CONTROL_FILTER_WHITELIST.OPTIONS.value:
    case CONTROL_FILTER_WHITELIST.USERS.value:
    case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
    case CONTROL_FILTER_WHITELIST.CASCADER.value:
      if (type === FILTER_CONDITION_TYPE.NORMALUSER || type === FILTER_CONDITION_TYPE.PORTALUSER) {
        return Object.assign({}, base, { values: [] });
      }
      return Object.assign({}, base, { values });
    default:
      return base;
  }
}

export function compareControlType(widget, type) {
  if (widget.data && widget.data.type === type) {
    return true;
  }
  if (widget.typeArr && widget.typeArr.map(t => t.type).indexOf(type) > -1) {
    return true;
  }
  return false;
}

export function getFilterTypes(control = {}, conditionType, from) {
  let typeEnums = [];
  const { type, advancedSetting = {} } = control;
  const typeKey = getTypeKey(type);
  switch (type) {
    // 文本类型
    case 2: // 文本框
    case 3: // 电话号码
    case 4: // 座机
    case 5: // 邮件地址
    case 7: // 证件
    case 32: // 文本组合
    case 33: // 自动编号
      typeEnums = [
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        FILTER_CONDITION_TYPE.LIKE,
        FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN,
        FILTER_CONDITION_TYPE.NCONTAIN,
        FILTER_CONDITION_TYPE.START,
        FILTER_CONDITION_TYPE.N_START,
        FILTER_CONDITION_TYPE.END,
        FILTER_CONDITION_TYPE.N_END,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 6: // 数值
    case 8: // 金额
    case 25: // 大写金额
    case 31: // 公式
    case 37: // 汇总
      typeEnums = [
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        FILTER_CONDITION_TYPE.GT,
        FILTER_CONDITION_TYPE.LT,
        FILTER_CONDITION_TYPE.GTE,
        FILTER_CONDITION_TYPE.LTE,
        FILTER_CONDITION_TYPE.BETWEEN,
        FILTER_CONDITION_TYPE.NBETWEEN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 14: // 附件
    case 21: // 自由连接
    case 36: // 检查框
    case 40: // 定位
    case 41: // 富文本
    case 42: // 签名
      typeEnums = [FILTER_CONDITION_TYPE.HASVALUE, FILTER_CONDITION_TYPE.ISNULL];
      break;
    case 28: // 等级
      typeEnums = [
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        FILTER_CONDITION_TYPE.GT,
        FILTER_CONDITION_TYPE.LT,
        FILTER_CONDITION_TYPE.GTE,
        FILTER_CONDITION_TYPE.LTE,
        FILTER_CONDITION_TYPE.BETWEEN,
        FILTER_CONDITION_TYPE.NBETWEEN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 48: // 角色权限
      typeEnums = [
        FILTER_CONDITION_TYPE.ARREQ,
        FILTER_CONDITION_TYPE.ARRNE,
        ...(control.enumDefault === 1 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        ...(control.enumDefault === 1 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 11: // 选项
    case 10: // 多选
    case 9: // 单选 平铺
      typeEnums = [
        FILTER_CONDITION_TYPE.ARREQ,
        FILTER_CONDITION_TYPE.ARRNE,
        ...(type === 10 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        ...(type === 10 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 15: // 日期
    case 16: //  日期时间
      typeEnums = [
        ...(type === 15
          ? [FILTER_CONDITION_TYPE.DATEENUM, FILTER_CONDITION_TYPE.NDATEENUM]
          : [FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE]),
        FILTER_CONDITION_TYPE.DATE_LT,
        FILTER_CONDITION_TYPE.DATE_GT,
        FILTER_CONDITION_TYPE.DATE_LTE,
        FILTER_CONDITION_TYPE.DATE_GTE,
        FILTER_CONDITION_TYPE.DATE_BETWEEN,
        FILTER_CONDITION_TYPE.DATE_NBETWEEN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 19:
    case 23:
    case 24:
      typeEnums = [
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        ...(from === 'rule'
          ? []
          : [
              FILTER_CONDITION_TYPE.BETWEEN,
              FILTER_CONDITION_TYPE.NBETWEEN,
              FILTER_CONDITION_TYPE.LIKE,
              FILTER_CONDITION_TYPE.NCONTAIN,
            ]),
        FILTER_CONDITION_TYPE.EQ_FOR_SINGLE,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 26: // 人员
      typeEnums = [
        FILTER_CONDITION_TYPE.ARREQ,
        FILTER_CONDITION_TYPE.ARRNE,
        ...(control.enumDefault === 1 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        ...(control.enumDefault === 1 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ].concat(
        _.includes(['caid', 'ownerid'], control.controlId) &&
          from !== 'rule' &&
          !_.get(window, 'md.global.Account.isPortal')
          ? [FILTER_CONDITION_TYPE.NORMALUSER, FILTER_CONDITION_TYPE.PORTALUSER]
          : [],
      );
      break;
    case 27: // 部门
      typeEnums = [
        FILTER_CONDITION_TYPE.ARREQ,
        FILTER_CONDITION_TYPE.ARRNE,
        ...(control.enumDefault === 1 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
        FILTER_CONDITION_TYPE.EQ,
        FILTER_CONDITION_TYPE.NE,
        FILTER_CONDITION_TYPE.BETWEEN,
        FILTER_CONDITION_TYPE.NBETWEEN,
        ...(from === 'rule' ? [] : [FILTER_CONDITION_TYPE.LIKE, FILTER_CONDITION_TYPE.NCONTAIN]),
        ...(control.enumDefault === 1 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 35: // 级联
      typeEnums = [
        FILTER_CONDITION_TYPE.RCEQ,
        FILTER_CONDITION_TYPE.RCNE,
        FILTER_CONDITION_TYPE.EQ_FOR_SINGLE,
        FILTER_CONDITION_TYPE.BETWEEN,
        FILTER_CONDITION_TYPE.NBETWEEN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    case 29: // 关联
      typeEnums =
        _.includes(['2', '5', '6'], advancedSetting.showtype) && from === 'rule'
          ? [FILTER_CONDITION_TYPE.ISNULL, FILTER_CONDITION_TYPE.HASVALUE]
          : conditionType &&
            (conditionType === FILTER_CONDITION_TYPE.LIKE || conditionType === FILTER_CONDITION_TYPE.NCONTAIN) // 兼容老数据
          ? [
              FILTER_CONDITION_TYPE.ARREQ,
              FILTER_CONDITION_TYPE.ARRNE,
              ...(control.enumDefault === 2 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
              FILTER_CONDITION_TYPE.LIKE,
              FILTER_CONDITION_TYPE.NCONTAIN,
              FILTER_CONDITION_TYPE.RCEQ,
              FILTER_CONDITION_TYPE.RCNE,
              ...(control.enumDefault === 2 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
              FILTER_CONDITION_TYPE.ISNULL,
              FILTER_CONDITION_TYPE.HASVALUE,
            ]
          : [
              FILTER_CONDITION_TYPE.ARREQ,
              FILTER_CONDITION_TYPE.ARRNE,
              ...(control.enumDefault === 2 ? [] : [FILTER_CONDITION_TYPE.EQ_FOR_SINGLE]),
              FILTER_CONDITION_TYPE.RCEQ,
              FILTER_CONDITION_TYPE.RCNE,
              ...(control.enumDefault === 2 ? [FILTER_CONDITION_TYPE.ALLCONTAIN] : []),
              FILTER_CONDITION_TYPE.ISNULL,
              FILTER_CONDITION_TYPE.HASVALUE,
            ];
      break;
    case 34: // 子表
      typeEnums = [FILTER_CONDITION_TYPE.ISNULL, FILTER_CONDITION_TYPE.HASVALUE];
      break;
    case 46: // 时间字段
      typeEnums = [
        FILTER_CONDITION_TYPE.DATEENUM,
        FILTER_CONDITION_TYPE.NDATEENUM,
        FILTER_CONDITION_TYPE.DATE_LT,
        FILTER_CONDITION_TYPE.DATE_GT,
        FILTER_CONDITION_TYPE.DATE_LTE,
        FILTER_CONDITION_TYPE.DATE_GTE,
        FILTER_CONDITION_TYPE.DATE_BETWEEN,
        FILTER_CONDITION_TYPE.DATE_NBETWEEN,
        FILTER_CONDITION_TYPE.ISNULL,
        FILTER_CONDITION_TYPE.HASVALUE,
      ];
      break;
    default:
      typeEnums = [];
  }
  if (from === 'subTotal') {
    typeEnums = typeEnums.filter(type => type !== FILTER_CONDITION_TYPE.ALLCONTAIN);
  }
  if (control.encryId) {
    typeEnums = [
      FILTER_CONDITION_TYPE.EQ,
      FILTER_CONDITION_TYPE.NE,
      FILTER_CONDITION_TYPE.ISNULL,
      FILTER_CONDITION_TYPE.HASVALUE,
    ];
  }
  return typeEnums.map(filterType => ({
    value: filterType,
    text: getFilterTypeLabel(typeKey, filterType, control),
  }));
}

function getDefaultFilterType(control, from) {
  const { isMultiple } = getControlSelectType(control);
  // 文本类
  if (_.includes([2, 3, 4, 5, 7, 32, 33], control.type)) {
    return FILTER_CONDITION_TYPE.EQ;
  }
  // 数值类
  if (_.includes([6, 8, 25, 31, 37], control.type)) {
    return FILTER_CONDITION_TYPE.BETWEEN;
  }
  if (_.includes([15, 46], control.type)) {
    return FILTER_CONDITION_TYPE.DATEENUM;
  }
  if (control.type === 16) {
    return FILTER_CONDITION_TYPE.DATE_EQ;
  }
  if (_.includes([15, 46], control.type)) {
    return FILTER_CONDITION_TYPE.DATEENUM;
  }
  // 29 关联、35 级联、9 10 11 选项、26 人员、27 部门、48 角色
  if (control.type === 29 && isMultiple && from !== 'rule') {
    return FILTER_CONDITION_TYPE.RCEQ;
  }
  if (_.includes([29, 35, 9, 10, 11, 19, 23, 24, 26, 27, 48], control.type)) {
    if (isMultiple) {
      return FILTER_CONDITION_TYPE.EQ;
    }
    return FILTER_CONDITION_TYPE.EQ_FOR_SINGLE;
  }
}

export function getDefaultCondition(control, from) {
  const conditionGroupKey = getTypeKey(control.type);
  const conditionGroupType =
    CONTROL_FILTER_WHITELIST[conditionGroupKey] && CONTROL_FILTER_WHITELIST[conditionGroupKey].value;
  const filterTypesOfControl = getFilterTypes(control);
  let defaultFilterType =
    getDefaultFilterType(control, from) || FILTER_CONDITION_TYPE.EQ || filterTypesOfControl[0].value;
  if (
    (_.isUndefined(defaultFilterType) || !_.find(filterTypesOfControl, c => c.value === defaultFilterType)) &&
    filterTypesOfControl &&
    filterTypesOfControl[0]
  ) {
    defaultFilterType = filterTypesOfControl[0].value;
  }
  const baseCondition = {
    controlId: control.controlId,
    controlType: control.type,
    keyStr: control.controlId + Math.random().toString(16).slice(2),
    control,
    conditionGroupType,
    type:
      conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value ? FILTER_CONDITION_TYPE.HASVALUE : defaultFilterType,
  };
  if (conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value && control.type === 36) {
    baseCondition.type = FILTER_CONDITION_TYPE.EQ;
    baseCondition.value = 1;
  }
  return baseCondition;
}

/**
 * 处理汇总、他表字段、公式等复杂复合控件的 type
 * @param {*} control 控件
 *  */
export function redefineComplexControl(control) {
  if (control.type === 37) {
    return { ...control, ...{ type: control.enumDefault2 || 6, originType: control.type } };
  }
  if (control.type === 30) {
    let controlType = control.sourceControlType;
    if (_.includes([37, 53], controlType)) {
      controlType = control.enumDefault2;
    }
    if (controlType === 31) {
      controlType = 6;
    }
    if (controlType === 32) {
      controlType = 2;
    }
    if (controlType === 38) {
      controlType = 6;
    }
    return {
      ...control,
      ...{
        type: controlType,
        originType: control.type,
        // 他表选项处理
        ...(_.includes([9, 10, 11], controlType) ? { options: _.get(control, 'sourceControl.options') } : {}),
      },
    };
  }
  if (control.type === 31) {
    return { ...control, ...{ type: 6, originType: control.type } };
  }
  if (control.type === 32) {
    return { ...control, ...{ type: 2, originType: control.type } };
  }
  if (control.type === 38) {
    return {
      ...control,
      ...{
        type:
          control.enumDefault === 2 ? (_.includes(['8', '9'], control.unit) ? 46 : control.unit === '3' ? 15 : 16) : 6,
        originType: control.type,
      },
    };
  }
  if (control.type === 50) {
    return { ...control, ...{ type: 2, originType: control.type } };
  }
  // 公式函数
  if (control.type === 53) {
    return { ...control, ...{ type: control.enumDefault2, originType: control.type } };
  }
  return { ...control };
}

// export const API_ENUM_TO_TYPE = {
//   TEXTAREA_INPUT_1: 1, // 文本
//   TEXTAREA_INPUT_2: 2, // 文本
//   PHONE_NUMBER_3: 3, // 电话
//   PHONE_NUMBER_4: 4, // 电话
//   EMAIL_INPUT: 5, // 邮箱
//   NUMBER_INPUT: 6, // 数值
//   CRED_INPUT: 7, // 证件
//   MONEY_AMOUNT_8: 8, // 金额
//   OPTIONS_9: 9, // 9单选
//   OPTIONS_10: 10, // 11单选 //多选10
//   OPTIONS_11: 11, // 11单选 //多选10
//   ATTACHMENT: 14, // 附件
//   DATE_INPUT_15: 15, // 日期
//   DATE_INPUT_16: 16, // 日期
//   DATE_TIME_RANGE_17: 17, // 时间段 日期17 日期时间18
//   DATE_TIME_RANGE_18: 18, // 时间段 日期17 日期时间18
//   AREA_INPUT_24: 24, // 地区 19'省23'省-市'24'省-市-县'
//   AREA_INPUT_19: 19, // 地区 19'省23'省-市'24'省-市-县'
//   AREA_INPUT_23: 23, // 地区 19'省23'省-市'24'省-市-县'
//   RELATION: 21, // 自由连接
//   SPLIT_LINE: 22, // 分割线
//   MONEY_CN: 25, // 大写金额
//   USER_PICKER: 26, // 成员
//   GROUP_PICKER: 27, // 部门
//   SCORE: 28, // 等级
//   RELATESHEET: 29, // 关联表
//   SHEETFIELD: 30, // 他表字段
//   NEW_FORMULA_31: 31, // 公式  31数值计算 38日期计算
//   NEW_FORMULA_38: 38, // 公式  31数值计算 38日期计算
//   CONCATENATE: 32, // 文本组合
//   AUTOID: 33, // 自动编号
//   SWITCH: 36, // 检查框
//   SUBTOTAL: 37, // 汇总
//   RICH_TEXT: 41, // _l('富文本'),
//   SIGNATURE: 42, // _l('签名'),
//   REMARK: 10010, // 备注
// };

/**
 * 动态筛选值规则
 *  */
export function relateDy(conditionType, controls, control, defaultValue) {
  if (
    defaultValue === FILTER_CONDITION_TYPE.ISNULL || // 为空
    defaultValue === FILTER_CONDITION_TYPE.HASVALUE || // 不为空
    // 在范围内 不在范围内(部门、地区支持属于不属于)
    ((defaultValue === FILTER_CONDITION_TYPE.BETWEEN || defaultValue === FILTER_CONDITION_TYPE.NBETWEEN) &&
      !_.includes(
        [
          API_ENUM_TO_TYPE.GROUP_PICKER,
          API_ENUM_TO_TYPE.AREA_INPUT_19,
          API_ENUM_TO_TYPE.AREA_INPUT_23,
          API_ENUM_TO_TYPE.AREA_INPUT_24,
        ],
        conditionType,
      ))
  ) {
    return [];
  }
  let typeList = [];
  switch (conditionType) {
    // 文本框、文本组合、自动编号
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_1:
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_2:
    case API_ENUM_TO_TYPE.CONCATENATE:
    case API_ENUM_TO_TYPE.AUTOID:
      // 除了检查框、自由连接、等级、他表字段以外所有能取到文本值的字段类型
      // 除分割线、备注、富文本、单选项、多选项、地区、人员、部门、检查框、附件、自由连接、签名、表关联、他表字段、汇总、子表、标签页外
      typeList = [
        API_ENUM_TO_TYPE.SWITCH,
        API_ENUM_TO_TYPE.RELATION,
        API_ENUM_TO_TYPE.SCORE,
        API_ENUM_TO_TYPE.SHEETFIELD,
        API_ENUM_TO_TYPE.SPLIT_LINE,
        API_ENUM_TO_TYPE.REMARK,
        API_ENUM_TO_TYPE.RICH_TEXT,
        API_ENUM_TO_TYPE.OPTIONS_9,
        API_ENUM_TO_TYPE.OPTIONS_10,
        API_ENUM_TO_TYPE.OPTIONS_11,
        API_ENUM_TO_TYPE.AREA_INPUT_24,
        API_ENUM_TO_TYPE.AREA_INPUT_19,
        API_ENUM_TO_TYPE.AREA_INPUT_23,
        API_ENUM_TO_TYPE.USER_PICKER,
        API_ENUM_TO_TYPE.GROUP_PICKER,
        API_ENUM_TO_TYPE.ATTACHMENT,
        API_ENUM_TO_TYPE.SIGNATURE,
        API_ENUM_TO_TYPE.RELATESHEET,
        API_ENUM_TO_TYPE.SUBTOTAL,
        API_ENUM_TO_TYPE.SUBLIST,
        API_ENUM_TO_TYPE.EMBED,
        API_ENUM_TO_TYPE.BARCODE,
        API_ENUM_TO_TYPE.CASCADER,
        API_ENUM_TO_TYPE.RELATESEARCH,
        API_ENUM_TO_TYPE.SECTION,
      ];
      return _.filter(controls, items => !_.includes(typeList, items.type));
    // 电话、证件、邮件
    case API_ENUM_TO_TYPE.PHONE_NUMBER_3:
    case API_ENUM_TO_TYPE.PHONE_NUMBER_4:
      typeList = [
        API_ENUM_TO_TYPE.PHONE_NUMBER_3,
        API_ENUM_TO_TYPE.PHONE_NUMBER_4,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
      ];
      return _.filter(controls, items => _.includes(typeList, items.type));
    case API_ENUM_TO_TYPE.CRED_INPUT:
      typeList = [API_ENUM_TO_TYPE.CRED_INPUT, API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2];
      return _.filter(controls, items => _.includes(typeList, items.type));
    case API_ENUM_TO_TYPE.EMAIL_INPUT:
      typeList = [API_ENUM_TO_TYPE.TEXTAREA_INPUT_1, API_ENUM_TO_TYPE.TEXTAREA_INPUT_2, API_ENUM_TO_TYPE.EMAIL_INPUT];
      return _.filter(controls, items => _.includes(typeList, items.type));
    // 数值、金额、公式
    case API_ENUM_TO_TYPE.NUMBER_INPUT:
    case API_ENUM_TO_TYPE.MONEY_AMOUNT_8:
    case API_ENUM_TO_TYPE.MONEY_CN:
    case API_ENUM_TO_TYPE.NEW_FORMULA_31:
      // 数值、金额、公式和汇总（数值类型）、自动编号
      typeList = [
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.MONEY_CN,
        API_ENUM_TO_TYPE.NEW_FORMULA_31,
        API_ENUM_TO_TYPE.SUBTOTAL,
        API_ENUM_TO_TYPE.AUTOID,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
        API_ENUM_TO_TYPE.SCORE,
      ];
      return _.filter(
        _.filter(controls, items => _.includes(typeList, items.type)),
        it =>
          !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
          (it.type === API_ENUM_TO_TYPE.SUBTOTAL && 6 === it.enumDefault2), //汇总（数值类型
      );
    // 汇总
    case API_ENUM_TO_TYPE.SUBTOTAL:
      // 数值型
      if (control.enumDefault2 === 6) {
        typeList = [
          API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
          API_ENUM_TO_TYPE.MONEY_CN,
          API_ENUM_TO_TYPE.NEW_FORMULA_31,
          API_ENUM_TO_TYPE.SUBTOTAL,
          API_ENUM_TO_TYPE.AUTOID,
        ];
        return _.filter(
          _.filter(controls, items => _.includes(typeList, items.type)),
          it =>
            !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
            (it.type === API_ENUM_TO_TYPE.SUBTOTAL && control.enumDefault2 === it.enumDefault2),
        );
      } else {
        // 时间类型
        typeList = [
          API_ENUM_TO_TYPE.DATE_INPUT_15,
          API_ENUM_TO_TYPE.DATE_INPUT_16,
          API_ENUM_TO_TYPE.NEW_FORMULA_38,
          API_ENUM_TO_TYPE.SUBTOTAL,
        ];
        return _.filter(
          _.filter(controls, items => _.includes(typeList, items.type)),
          it =>
            !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
            (it.type === API_ENUM_TO_TYPE.SUBTOTAL && control.enumDefault2 === it.enumDefault2),
        );
      }

    // 日期、公式
    case API_ENUM_TO_TYPE.DATE_INPUT_15:
    case API_ENUM_TO_TYPE.DATE_INPUT_16:
    case API_ENUM_TO_TYPE.NEW_FORMULA_38:
      // 日期、系统日期、公式和汇总（日期类型）
      typeList = [
        API_ENUM_TO_TYPE.DATE_INPUT_15,
        API_ENUM_TO_TYPE.DATE_INPUT_16,
        API_ENUM_TO_TYPE.NEW_FORMULA_38,
        API_ENUM_TO_TYPE.SUBTOTAL,
      ];
      return _.filter(
        _.filter(controls, items => _.includes(typeList, items.type)),
        it =>
          !_.includes([API_ENUM_TO_TYPE.SUBTOTAL], it.type) ||
          (it.type === API_ENUM_TO_TYPE.SUBTOTAL && 6 !== it.enumDefault2), //汇总（日期类型）
      );
    // 单选项(选项集)
    // 多选项(选项集)
    case API_ENUM_TO_TYPE.OPTIONS_9:
    case API_ENUM_TO_TYPE.OPTIONS_10:
    case API_ENUM_TO_TYPE.OPTIONS_11:
      // 单选项、多选项(相同选项集的其他字段)
      typeList = [API_ENUM_TO_TYPE.OPTIONS_9, API_ENUM_TO_TYPE.OPTIONS_10, API_ENUM_TO_TYPE.OPTIONS_11];
      return _.filter(controls, items => _.includes(typeList, items.type) && items.dataSource === control.dataSource);
    // 关联单条、级联选择
    case API_ENUM_TO_TYPE.RELATESHEET:
    case API_ENUM_TO_TYPE.CASCADER:
      typeList = [API_ENUM_TO_TYPE.RELATESHEET, API_ENUM_TO_TYPE.CASCADER];
      return _.filter(
        controls,
        items =>
          _.includes(typeList, items.type) &&
          items.dataSource === control.dataSource &&
          !(items.type === 29 && _.includes(['2', '5', '6'], _.get(items, 'advancedSetting.showtype'))),
      );
    // 人员单选 人员多选
    case API_ENUM_TO_TYPE.USER_PICKER:
      // 人员单选、人员多选
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.USER_PICKER);
    // 部门单选
    case API_ENUM_TO_TYPE.GROUP_PICKER:
      // 部门
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.GROUP_PICKER);
    // 组织角色
    case API_ENUM_TO_TYPE.ORG_ROLE:
      return _.filter(controls, items => items.type === API_ENUM_TO_TYPE.ORG_ROLE);
    // 地区，检查框，附件
    case API_ENUM_TO_TYPE.AREA_INPUT_24:
    case API_ENUM_TO_TYPE.AREA_INPUT_19:
    case API_ENUM_TO_TYPE.AREA_INPUT_23:
    case API_ENUM_TO_TYPE.SWITCH:
    case API_ENUM_TO_TYPE.ATTACHMENT:
      return [];

    // 等级
    case API_ENUM_TO_TYPE.SCORE:
      typeList = [
        API_ENUM_TO_TYPE.SCORE,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.NEW_FORMULA_31,
      ];
      return _.filter(controls, items => _.includes(typeList, items.type));
    // 时间
    case API_ENUM_TO_TYPE.TIME:
      return _.filter(controls, items =>
        _.includes([API_ENUM_TO_TYPE.TIME, API_ENUM_TO_TYPE.DATE_INPUT_16], items.type),
      );
    default:
      return controls;
  }
}

export function getFilter({ control, formData = [], filterKey = 'filters', ignoreEmptyRule = false }) {
  if (
    !control ||
    _.isEmpty(control.advancedSetting) ||
    _.isEmpty(control.advancedSetting[filterKey]) ||
    control.advancedSetting[filterKey] === '[]'
  ) {
    return [];
  }
  let conditions;
  try {
    conditions = JSON.parse(control.advancedSetting[filterKey]);
  } catch (err) {
    return [];
  }
  const abortFilterWhenEmpty =
    (get(conditions, '0.emptyRule') === 3 || get(conditions, '0.groupFilters.0.emptyRule') === 3) && !ignoreEmptyRule;
  function handleFormatCondition(condition) {
    if (_.isEmpty(condition.dynamicSource)) {
      return Object.assign({}, condition, {
        values: formatValues(condition.dataType, condition.filterType, condition.values),
      });
    } else {
      if (
        _.includes(
          [WIDGETS_TO_API_TYPE_ENUM.DATE, WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, WIDGETS_TO_API_TYPE_ENUM.TIME],
          condition.dataType,
        )
      ) {
        condition.dateRange = 18;
      } else {
        condition.dateRange = 0;
      }
      return fillConditionValue({
        condition,
        formData,
        relateControl: control,
        ignoreFilterControl: control.ignoreFilterControl,
        abortFilterWhenEmpty,
      });
    }
  }
  conditions = conditions.map(condition => {
    if (!(condition.isGroup && condition.groupFilters)) {
      return handleFormatCondition(condition);
    } else {
      const formattedGroupFilters = condition.groupFilters.map(handleFormatCondition);
      if (_.get(condition, 'groupFilters.0.spliceType') === 1 && abortFilterWhenEmpty) {
        // 且 条件
        return !formattedGroupFilters.filter(f => !f).length
          ? {
              ...condition,
              groupFilters: formattedGroupFilters,
            }
          : false;
      } else {
        // 或 条件
        return {
          ...condition,
          groupFilters: formattedGroupFilters.filter(_.identity),
        };
      }
    }
  });
  const filteredConditions = conditions.filter(_.identity);
  if (!abortFilterWhenEmpty) return filteredConditions;
  if (filteredConditions.length) {
    if (filteredConditions[0].spliceType === 1) {
      // 且 条件
      return filteredConditions.length === conditions.length ? filteredConditions : false;
    } else {
      // 或 条件
      return filteredConditions;
    }
  } else {
    return false;
  }
}

export function fillConditionValue({
  condition,
  formData,
  relateControl,
  ignoreFilterControl = false,
  abortFilterWhenEmpty = false,
}) {
  const { dataType, controlId } = condition;
  const dynamicSource = condition.dynamicSource[0];
  const filterControl = _.find(
    (relateControl.relationControls || []).concat([...SYSTEM_DATE_CONTROL, ...ROW_ID_CONTROL]),
    item => item.controlId === controlId,
  );
  if (!dynamicSource || (!filterControl && !ignoreFilterControl)) {
    return;
  }
  const { rcid, cid } = dynamicSource;
  if (!cid) {
    return;
  }
  if ((cid === 'current-rowid' || cid === 'rowid') && !_.includes(['fastFilter', 'navGroup'], rcid)) {
    if (!relateControl.recordId) {
      return;
    }
    condition.values = [relateControl.recordId];
    return condition;
  }
  if (cid === 'currenttime') {
    let formatFilterControl = { ...filterControl };
    if (!filterControl && ignoreFilterControl) {
      if (dataType === 46) {
        formatFilterControl = { unit: '9', type: dataType };
      } else {
        formatFilterControl = { type: dataType, advancedSetting: { showtype: dataType === 15 ? '6' : '3' } };
      }
    }
    if (formatFilterControl.type === 46) {
      condition.value = moment(new Date()).format(
        formatFilterControl.unit === '6' || formatFilterControl.unit === '9' ? 'HH:mm:ss' : 'HH:mm',
      );
    } else {
      condition.value = moment(new Date()).format(getDatePickerConfigs(formatFilterControl).formatMode);
    }
    return condition;
  }
  let dynamicControl;
  dynamicControl = _.find(
    formData,
    c => c && c.controlId === (_.includes(['fastFilter', 'navGroup'], rcid) ? rcid + '_' : '') + cid,
  );
  if (!dynamicControl) {
    return;
  }
  // 快速筛选配置的其他字段的值
  if (dynamicControl.filterValue) {
    const newCondition = {
      ...condition,
      ...(dynamicControl.filterValue || {}),
    };
    return validate(newCondition) || newCondition.filterType === 7 ? newCondition : false;
  }
  const { type } = dynamicControl;
  const value = getFormData({
    cid: (_.includes(['fastFilter', 'navGroup'], rcid) ? rcid + '_' : '') + cid,
    data: formData,
  });
  if (checkCellIsEmpty(value)) {
    return abortFilterWhenEmpty ? undefined : condition;
  }
  // // 强制异化，rowid取关联记录的值
  if (controlId === 'rowid' && dynamicControl.type === 29) {
    try {
      if (isRelateRecordTableControl(dynamicControl) && !browserIsMobile()) {
        condition.values = relateControl.recordId
          ? [`cid|${dynamicControl.controlId}`].concat(
              get(dynamicControl.store && dynamicControl.store.getState(), 'changes.addedRecordIds'),
              [],
            )
          : dynamicControl.store
              .getState()
              .records.map(r => r.rowid)
              .filter(_.identity);
      } else {
        if (isRelateRecordTableControl(dynamicControl) && browserIsMobile() && relateControl.recordId) {
          condition.values = [`cid|${dynamicControl.controlId}`];
        } else {
          condition.values = (_.isObject(value) ? value.records : JSON.parse(value))
            .map(r => r.sid || r.rowid)
            .filter(_.identity);
        }
      }
    } catch (err) {
      condition.values = [];
    }
    if (_.isEmpty(condition.values)) {
      return;
    }
    return condition;
  }
  if (dataType === 2 || dataType === 32 || dataType === 3 || dataType === 7 || dataType === 5) {
    condition.values = [
      renderCellText(
        {
          ...dynamicControl,
          value,
        },
        { noMask: true },
      ),
    ];
  } else if (
    dataType === 6 ||
    dataType === 8 ||
    dataType === 31 ||
    dataType === 46
    // TODO 汇总数值类
  ) {
    condition.value = value;
  } else if (
    dataType === 15 ||
    dataType === 16
    // || dataType === 38 // 公式日期
    // TODO 汇总日期类
  ) {
    try {
      condition.value = moment(value).format(
        getDatePickerConfigs({
          ...dynamicControl,
          value,
        }).formatMode,
      );
    } catch (err) {
      condition.value = value;
      console.error(err);
    }
  } else if (dataType === 9 || dataType === 11 || dataType === 10) {
    if (type === 9 || type === 11) {
      // 单选
      const selectedOption = getSelectedOptions(dynamicControl.options, value, dynamicControl)[0];
      if (!selectedOption) {
        condition.values = [];
      } else {
        const matchedOptions = (_.get(filterControl, 'options') || []).filter(
          option => option.key === selectedOption.key,
        );
        if (matchedOptions.length) {
          condition.values = matchedOptions.map(option => option.key);
        } else {
          condition.values = ['999999']; // 瞎传的值 保证筛选不出结果
        }
      }
    } else if (type === 10) {
      // 多选
      const selectedOptions = getSelectedOptions(dynamicControl.options, value, dynamicControl);
      if (!selectedOptions.length) {
        condition.values = [];
      } else {
        const matchedOptions = (_.get(filterControl, 'options') || []).filter(option =>
          _.find(
            selectedOptions.map(o => o.value),
            ov => ov === option.value,
          ),
        );
        if (matchedOptions.length) {
          condition.values = matchedOptions.map(option => option.key);
        } else {
          condition.values = ['999999']; // 瞎传的值 保证筛选不出结果
        }
      }
    } else {
      // 文字
      condition.values = (_.get(filterControl, 'options') || [])
        .filter(option => option.value.indexOf(value) > -1)
        .map(option => option.key);
    }
  } else if (dataType === 29 || dataType === 35) {
    try {
      condition.values = (_.isObject(value) ? value.records : JSON.parse(value))
        .map(r => r.sid || r.rowid)
        .filter(_.identity);
    } catch (err) {
      condition.values = [];
    }
    if (_.isEmpty(condition.values)) {
      return;
    }
  } else if (dataType === 26) {
    try {
      const users = JSON.parse(value);
      condition.values = users.map(user => user.accountId).filter(_.identity);
    } catch (err) {
      condition.values = [];
    }
    if (_.isEmpty(condition.values)) {
      return;
    }
  } else if (dataType === 27) {
    try {
      const groups = JSON.parse(value);
      condition.values = groups.map(group => group.departmentId);
    } catch (err) {
      condition.values = [];
    }
  } else if (dataType === 48) {
    try {
      const groups = JSON.parse(value);
      condition.values = groups.map(group => group.organizeId);
    } catch (err) {
      condition.values = [];
    }
  } else if (
    _.includes(
      [API_ENUM_TO_TYPE.AREA_INPUT_24, API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23],
      dataType,
    )
  ) {
    condition.values = [value];
  } else if (dataType === 28 || dataType === 33) {
    if (_.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], condition.filterType)) {
      condition.values = [value];
    } else {
      condition.value = value;
    }
  }
  return condition;
}

export function formatDateValue({ type, value }) {
  if (type === FILTER_CONDITION_TYPE.DATE_GT) {
    // 晚于
    return moment(value).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  } else if (type === FILTER_CONDITION_TYPE.DATE_LT) {
    // 早于
    return moment(value).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  } else {
    return value;
  }
}

export const getTabTypeBySelectUser = (control = {}) => {
  const { advancedSetting = {}, sourceControl = {}, controlId } = control;
  return _.includes(['caid', 'ownerid', 'daid'], controlId)
    ? 3
    : (advancedSetting.usertype || _.get(sourceControl.advancedSetting || {}, 'usertype')) === '2'
    ? 2
    : 1;
};

export function formatQuickFilterValueToControlValue(type, condition) {
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
        WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
        WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
        WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
        WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
        WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
        WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
        WIDGETS_TO_API_TYPE_ENUM.SEARCH, // API查询
      ],
      type,
    )
  ) {
    return (_.get(condition, 'values') || [])[0];
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
        WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
        WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
        WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
      ],
      type,
    )
  ) {
    return _.get(condition, 'value');
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
        WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联
      ],
      type,
    )
  ) {
    return JSON.stringify(
      (_.get(condition, 'values') || []).map(row => ({
        sid: row.rowid,
      })),
    );
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色
        WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 地区 省
        WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 地区 省-市
        WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 地区 省-市-县
      ],
      type,
    )
  ) {
    return JSON.stringify(_.get(condition, 'values') || []);
  }
  if (
    _.includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期  * 类型无法转换成控件值
        WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间 * 类型无法转换成控件值
        WIDGETS_TO_API_TYPE_ENUM.TIME, //  时间 * 类型无法转换成控件值
      ],
      type,
    )
  ) {
    return;
  }
  return;
}
