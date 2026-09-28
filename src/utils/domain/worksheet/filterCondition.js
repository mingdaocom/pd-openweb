import _, { assign, get, includes } from 'lodash';
import moment from 'moment';
import { SYSTEM_DATE_CONTROL } from 'src/utils/domain/control/widget';
import { isPortalAccount } from 'src/utils/platform/runtime/config';
import {
  CONTROL_FILTER_WHITELIST,
  DATE_COMPARE_FILTER_TYPES,
  DATE_RANGE_TYPE,
  FILTER_CONDITION_TYPE,
  FILTER_RELATION_TYPE,
  getControlSelectType,
  getDateCompareRangeValues,
  getFilterTypeLabel,
} from './filterConstants';
import { formatValues } from './filterValue';

/** 获取筛选条件的统一分组类型。 */
export function getConditionType(condition) {
  return (condition.controlType === 28 || condition.dataType === 28) &&
    _.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], condition.type)
    ? CONTROL_FILTER_WHITELIST.OPTIONS.value
    : condition.conditionGroupType;
}

/** 将编辑态筛选条件转换为服务端保存结构。 */
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
    advancedSetting: condition.advancedSetting,
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

/** 获取控件类型所属的筛选分组键。 */
export function getTypeKey(type) {
  const whiteListKeys = Object.keys(CONTROL_FILTER_WHITELIST);
  const typeKey = _.find(whiteListKeys, key => _.includes(CONTROL_FILTER_WHITELIST[key].keys, type));
  return typeKey;
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
      advancedSetting: condition.advancedSetting,
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

/** 将服务端单层筛选转换为编辑态数据。 */
export function formatOriginFilterValue(item) {
  item = typeof item === 'string' ? safeParse(item) : item;
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

/** 将服务端分组筛选转换为编辑态数据。 */
export function formatOriginFilterGroupValue(filter) {
  filter = typeof filter === 'string' ? safeParse(filter) : filter;
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
        isGroup: true,
        groupFilters: items,
      },
    ];
  }

  return result;
}

/** 移除筛选条件列表中的无效条件。 */
export function filterUnavailableConditions(conditions, key = 'groupFilters') {
  let newConditions = [...conditions];
  newConditions = newConditions.map(condition => {
    if (condition.isGroup && condition[key]) {
      condition[key] = condition[key].filter(checkConditionAvailable);
    }

    return condition;
  });
  return newConditions.filter(condition => {
    if (condition.isGroup) {
      return !!condition[key].length;
    } else {
      return checkConditionAvailable(condition);
    }
  });
}

/** 判断单条筛选条件是否已配置完整。 */
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

/** 切换筛选操作符时生成兼容的新条件值。 */
export function getConditionOverrideValue(type, condition, valueType, from) {
  const { value, values, dateRange, dateRangeType, fullValues } = condition;
  let newDateRangeType = dateRangeType;
  const conditionGroupType = getConditionType(condition);
  const isDateCompareType = includes(DATE_COMPARE_FILTER_TYPES, type);
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
      return Object.assign({}, base, { values, advancedSetting: condition.advancedSetting });
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
        newDateRangeType = isDateCompareType ? newDateRangeType || DATE_RANGE_TYPE.DAY : DATE_RANGE_TYPE.DAY;
      } else if (!includes([FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE], type)) {
        let showType = get(condition, 'control.advancedSetting.showtype');

        if (SYSTEM_DATE_CONTROL.map(c => c.controlId).includes(condition.controlId)) {
          showType = DATE_RANGE_TYPE.SECOND;
        }

        newDateRangeType = showType ? Number(showType) : DATE_RANGE_TYPE.DAY;
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
      } else if (includes(DATE_COMPARE_FILTER_TYPES, type)) {
        const allowedDateRange = getDateCompareRangeValues(type);
        // 切换比较规则时只保留同方向的动态时间点，避免出现“早于 7天后”这类歧义组合。
        const currentDateRange = _.includes(allowedDateRange, dateRange) ? dateRange : 18;

        return Object.assign({}, base, {
          dateRange: currentDateRange,
          value: _.includes([101, 102], currentDateRange) ? value || 1 : undefined,
          dateRangeType: newDateRangeType || DATE_RANGE_TYPE.DAY,
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

/** 获取控件支持的筛选操作符。 */
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
      if (from === 'apiV3') {
        typeEnums = [FILTER_CONDITION_TYPE.DATE_BETWEEN, FILTER_CONDITION_TYPE.DATE_NBETWEEN];
      } else {
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
      }

      break;
    case 19:
    case 23:
    case 24:
      if (from === 'apiV3') {
        typeEnums = [
          FILTER_CONDITION_TYPE.EQ,
          FILTER_CONDITION_TYPE.NE,
          FILTER_CONDITION_TYPE.BETWEEN,
          FILTER_CONDITION_TYPE.NBETWEEN,
          FILTER_CONDITION_TYPE.EQ_FOR_SINGLE,
          FILTER_CONDITION_TYPE.ISNULL,
          FILTER_CONDITION_TYPE.HASVALUE,
        ];
      } else {
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
      }

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
        _.includes(['caid', 'ownerid'], control.controlId) && from !== 'rule' && !isPortalAccount()
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
        ...(from === 'rule' || from === 'apiV3' ? [] : [FILTER_CONDITION_TYPE.LIKE, FILTER_CONDITION_TYPE.NCONTAIN]),
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
      if (from === 'apiV3') {
        typeEnums = [FILTER_CONDITION_TYPE.DATE_BETWEEN, FILTER_CONDITION_TYPE.DATE_NBETWEEN];
      } else {
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
      }

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
    if (from === 'apiV3') return FILTER_CONDITION_TYPE.DATE_BETWEEN;
    return FILTER_CONDITION_TYPE.DATEENUM;
  }

  if (control.type === 16) {
    if (from === 'apiV3') return FILTER_CONDITION_TYPE.DATE_BETWEEN;
    return FILTER_CONDITION_TYPE.DATE_EQ;
  }

  if (_.includes([15, 46], control.type)) {
    return FILTER_CONDITION_TYPE.DATEENUM;
  }

  // 29 关联、35 级联、9 10 11 选项、26 人员、27 部门、48 角色
  if (control.type === 29 && isMultiple && from !== 'rule') {
    return FILTER_CONDITION_TYPE.RCEQ;
  }

  if (from === 'apiV3' && _.includes([19, 23, 24], control.type)) {
    return FILTER_CONDITION_TYPE.EQ;
  }

  if (_.includes([29, 35, 9, 10, 11, 19, 23, 24, 26, 27, 48], control.type)) {
    if (isMultiple) {
      return FILTER_CONDITION_TYPE.EQ;
    }

    return FILTER_CONDITION_TYPE.EQ_FOR_SINGLE;
  }
}

/** 创建控件的默认筛选条件。 */
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

function formatDateValue({ type, value }) {
  if (type === FILTER_CONDITION_TYPE.DATE_GT) {
    // 晚于
    return moment(value || undefined)
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
  } else if (type === FILTER_CONDITION_TYPE.DATE_LT) {
    // 早于
    return moment(value || undefined)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
  } else if (type === FILTER_CONDITION_TYPE.DATE_LTE) {
    // 早于等于
    return moment(value || undefined)
      .endOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
  } else if (type === FILTER_CONDITION_TYPE.DATE_GTE) {
    // 晚于等于
    return moment(value || undefined)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
  } else {
    return value;
  }
}
