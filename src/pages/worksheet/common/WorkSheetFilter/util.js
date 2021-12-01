import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import { getFormData, getSelectedOptions } from 'src/pages/worksheet/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import {
  CONTROL_FILTER_WHITELIST,
  FILTER_CONDITION_TYPE,
  FILTER_RELATION_TYPE,
  getFilterTypeLabel,
  API_ENUM_TO_TYPE,
} from './enum';

export function formatConditionForSave(condition, relationType) {
  let { values, controlType } = condition;
  return {
    controlId: condition.controlId,
    dataType: controlType,
    spliceType: relationType,
    filterType: condition.type,
    dateRange: condition.dateRange,
    dateRangeType: condition.dateRangeType,
    maxValue: condition.maxValue,
    minValue: condition.minValue,
    value: condition.value,
    values,
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
    // 为空，不为空,
    if (filterType === FILTER_CONDITION_TYPE.ISNULL || filterType === FILTER_CONDITION_TYPE.HASVALUE) {
      return values;
    }
    if (_.includes([26, 27, 19, 23, 24, 29, 35], controlType)) {
      return values.map(value => safeParse(value).id).filter(_.identity);
    }
  } catch (err) {}
  return values;
}

export function getTypeKey(type) {
  const whiteListKeys = Object.keys(CONTROL_FILTER_WHITELIST);
  const typeKey = _.find(whiteListKeys, key => _.includes(CONTROL_FILTER_WHITELIST[key].keys, type));
  return typeKey;
}

export function formatValuesOfOriginConditions(conditions) {
  return conditions.map(condition =>
    Object.assign({}, condition, {
      values: formatValues(condition.dataType, condition.filterType, condition.values),
    }),
  );
}

export function formatOriginFilterValue(item) {
  item = typeof item === 'string' ? JSON.parse(item) : item;
  const items = item.items || [];
  return {
    id: item.filterId,
    name: item.name,
    type: item.type,
    createAccountId: item.createAccountId,
    relationType: items[0] ? items[0].spliceType : FILTER_RELATION_TYPE.AND,
    conditions: items.map(condition => {
      const conditionGroupType = (CONTROL_FILTER_WHITELIST[getTypeKey(condition.dataType)] || {}).value;
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
        originValues: condition.values,
        fullValues: condition.values,
        values: formatValues(condition.dataType, condition.filterType, condition.values),
        folded: condition.folded,
        dynamicSource: condition.dynamicSource || [],
        isDynamicsource: condition.isDynamicsource,
      };
    }),
  };
}

export function checkFilterConditionsAvailable(filter) {
  const { conditions } = filter;
  return conditions && conditions.length && _.every(conditions, condition => checkConditionAvailable(condition));
}

export function checkConditionAvailable(condition) {
  const {
    conditionGroupType,
    type,
    value,
    values,
    minValue,
    maxValue,
    dateRange,
    dynamicSource = [],
    isDynamicsource = false,
  } = condition;
  if (dynamicSource.length > 0 && isDynamicsource) {
    return true;
  }
  if (type === FILTER_CONDITION_TYPE.ISNULL || type === FILTER_CONDITION_TYPE.HASVALUE) {
    return true;
  }
  switch (conditionGroupType) {
    case CONTROL_FILTER_WHITELIST.TEXT.value:
      return values && values.length;
    case CONTROL_FILTER_WHITELIST.NUMBER.value:
      if (type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN) {
        return !_.isUndefined(minValue) || !_.isUndefined(maxValue);
      } else {
        return !_.isUndefined(value);
      }
    case CONTROL_FILTER_WHITELIST.BOOL.value:
      return true;
    case CONTROL_FILTER_WHITELIST.DATE.value:
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN) {
        return !_.isUndefined(minValue) && !_.isUndefined(maxValue);
      } else {
        return dateRange === 10 || dateRange === 11 || dateRange === 18
          ? !_.isUndefined(value) && !_.isUndefined(value)
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

export function getConditionOverrideValue(type, condition) {
  const { conditionGroupType, value, values, dateRange, dateRangeType } = condition;
  const base = {
    type,
    values: [],
    maxValue: undefined,
    minValue: undefined,
    value: undefined,
    dateRange: 0,
    dateRangeType: 1,
    dynamicSource: [],
    isDynamicsource: false,
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
      if (type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN) {
        return Object.assign({}, base, {
          minValue: moment().add(-1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          maxValue: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          dateRange,
          dateRangeType,
        });
      } else {
        return Object.assign({}, base, {
          dateRange: dateRange || 1,
          value: formatDateValue({ type, value }),
          dateRangeType: dateRangeType || 1,
        });
      }
    case CONTROL_FILTER_WHITELIST.OPTIONS.value:
    case CONTROL_FILTER_WHITELIST.USERS.value:
    case CONTROL_FILTER_WHITELIST.RELATE_RECORD.value:
    case CONTROL_FILTER_WHITELIST.CASCADER.value:
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

export function getFilterTypes(type, control = {}, conditionType, from) {
  let types = [];
  const typeKey = getTypeKey(type);
  if (_.includes([19, 23, 24], type)) {
    return [
      FILTER_CONDITION_TYPE.EQ,
      FILTER_CONDITION_TYPE.NE,
      FILTER_CONDITION_TYPE.ISNULL,
      FILTER_CONDITION_TYPE.HASVALUE,
      FILTER_CONDITION_TYPE.BETWEEN,
      FILTER_CONDITION_TYPE.NBETWEEN,
      ...(from === 'rule' ? [] : [FILTER_CONDITION_TYPE.LIKE, FILTER_CONDITION_TYPE.NCONTAIN]),
    ].map(filterType => ({
      value: filterType,
      text: getFilterTypeLabel(typeKey, filterType, control),
    }));
  }
  if (type === 27) {
    return [
      FILTER_CONDITION_TYPE.EQ,
      FILTER_CONDITION_TYPE.NE,
      FILTER_CONDITION_TYPE.BETWEEN,
      FILTER_CONDITION_TYPE.NBETWEEN,
      FILTER_CONDITION_TYPE.ISNULL,
      FILTER_CONDITION_TYPE.HASVALUE,
    ].map(filterType => ({
      value: filterType,
      text: getFilterTypeLabel(typeKey, filterType, control),
    }));
  }
  if (type === 29) {
    const typeEnums =
      conditionType &&
      (conditionType === FILTER_CONDITION_TYPE.LIKE || conditionType === FILTER_CONDITION_TYPE.NCONTAIN)
        ? [
            FILTER_CONDITION_TYPE.LIKE,
            FILTER_CONDITION_TYPE.NCONTAIN,
            FILTER_CONDITION_TYPE.RCEQ,
            FILTER_CONDITION_TYPE.RCNE,
            FILTER_CONDITION_TYPE.ISNULL,
            FILTER_CONDITION_TYPE.HASVALUE,
          ]
        : [
            FILTER_CONDITION_TYPE.RCEQ,
            FILTER_CONDITION_TYPE.RCNE,
            FILTER_CONDITION_TYPE.ISNULL,
            FILTER_CONDITION_TYPE.HASVALUE,
          ];
    types = typeEnums.map(filterType => ({
      value: filterType,
      text: getFilterTypeLabel(typeKey, filterType, control),
    }));
    return types;
  }
  if (typeKey) {
    types = CONTROL_FILTER_WHITELIST[typeKey].types.map(filterType => ({
      value: filterType,
      text: getFilterTypeLabel(typeKey, filterType, control, type),
    }));
  }
  return types;
}

export function getDefaultCondition(control) {
  const conditionGroupKey = getTypeKey(control.type);
  const conditionGroupType = CONTROL_FILTER_WHITELIST[conditionGroupKey].value;
  const baseCondition = {
    controlId: control.controlId,
    controlType: control.type,
    keyStr: control.controlId + Math.random().toString(16).slice(2),
    control,
    conditionGroupType,
    type:
      conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value
        ? FILTER_CONDITION_TYPE.HASVALUE
        : getFilterTypes(control.type)[0].value,
  };
  if (conditionGroupType === CONTROL_FILTER_WHITELIST.BOOL.value && control.type === 36) {
    baseCondition.type = FILTER_CONDITION_TYPE.EQ;
    baseCondition.value = 1;
  }
  if (conditionGroupType === CONTROL_FILTER_WHITELIST.DATE.value) {
    baseCondition.dateRange = 1;
  }
  return baseCondition;
}

/**
 * 处理汇总、他表字段、公式等复杂复合控件的 type
 * @param {*} contorl 控件
 *  */
export function redefineComplexControl(contorl) {
  if (contorl.type === 37) {
    return { ...contorl, ...{ type: contorl.enumDefault2 || 6 } };
  }
  if (contorl.type === 30) {
    return {
      ...contorl,
      ...{
        type: contorl.sourceControltype === 37 ? contorl.enumDefault2 : contorl.sourceControlType,
      },
    };
  }
  if (contorl.type === 38) {
    return { ...contorl, ...{ type: contorl.enumDefault === 2 ? 15 : 6 } };
  }
  return { ...contorl };
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
//   SPLIT_LINE: 22, // 分段
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
export function relateDy(conditionType, contorls, control, defaultValue) {
  if (
    defaultValue === FILTER_CONDITION_TYPE.ISNULL || // 为空
    defaultValue === FILTER_CONDITION_TYPE.HASVALUE || // 不为空
    defaultValue === FILTER_CONDITION_TYPE.BETWEEN || // 在范围内
    defaultValue === FILTER_CONDITION_TYPE.NBETWEEN // 不在范围内
  ) {
    return [];
  }
  let typeList = [];
  switch (conditionType) {
    // 文本框、文本组合
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_1:
    case API_ENUM_TO_TYPE.TEXTAREA_INPUT_2:
    case API_ENUM_TO_TYPE.CONCATENATE:
      // 除了检查框、自由连接、等级、他表字段以外所有能取到文本值的字段类型
      // 除分段、备注、富文本、单选项、多选项、地区、人员、部门、检查框、附件、自由连接、签名、表关联、他表字段、汇总、子表外
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
      ];
      return _.filter(contorls, items => !_.includes(typeList, items.type));
    // 电话、证件、邮件
    case API_ENUM_TO_TYPE.PHONE_NUMBER_3:
    case API_ENUM_TO_TYPE.PHONE_NUMBER_4:
    case API_ENUM_TO_TYPE.CRED_INPUT:
    case API_ENUM_TO_TYPE.EMAIL_INPUT:
      // 文本框和自身类型（电话、证件或邮件）
      typeList = [
        API_ENUM_TO_TYPE.PHONE_NUMBER_3,
        API_ENUM_TO_TYPE.PHONE_NUMBER_4,
        API_ENUM_TO_TYPE.CRED_INPUT,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_1,
        API_ENUM_TO_TYPE.TEXTAREA_INPUT_2,
        API_ENUM_TO_TYPE.EMAIL_INPUT, // 邮件
      ];
      return _.filter(contorls, items => _.includes(typeList, items.type));
    // 数值、金额、公式、自动编号
    case API_ENUM_TO_TYPE.NUMBER_INPUT:
    case API_ENUM_TO_TYPE.MONEY_AMOUNT_8:
    case API_ENUM_TO_TYPE.MONEY_CN:
    case API_ENUM_TO_TYPE.NEW_FORMULA_31:
    case API_ENUM_TO_TYPE.AUTOID:
      // 数值、金额、公式和汇总（数值类型）、自动编号
      typeList = [
        API_ENUM_TO_TYPE.MONEY_AMOUNT_8,
        API_ENUM_TO_TYPE.MONEY_CN,
        API_ENUM_TO_TYPE.NEW_FORMULA_31,
        API_ENUM_TO_TYPE.SUBTOTAL,
        API_ENUM_TO_TYPE.AUTOID,
        API_ENUM_TO_TYPE.NUMBER_INPUT,
      ];
      return _.filter(
        _.filter(contorls, items => _.includes(typeList, items.type)),
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
          _.filter(contorls, items => _.includes(typeList, items.type)),
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
          _.filter(contorls, items => _.includes(typeList, items.type)),
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
        _.filter(contorls, items => _.includes(typeList, items.type)),
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
      return _.filter(
        contorls,
        items =>
          _.includes(typeList, items.type) &&
          items.dataSource === control.dataSource &&
          items.controlId !== control.controlId,
      );
    // 关联单条
    case API_ENUM_TO_TYPE.RELATESHEET:
      return _.filter(
        contorls,
        items => items.type === API_ENUM_TO_TYPE.RELATESHEET && items.dataSource === control.dataSource,
      );
    // 人员单选 人员多选
    case API_ENUM_TO_TYPE.USER_PICKER:
      // 人员单选、人员多选
      return _.filter(contorls, items => items.type === API_ENUM_TO_TYPE.USER_PICKER);
    // 部门单选
    case API_ENUM_TO_TYPE.GROUP_PICKER:
      // 部门
      return _.filter(contorls, items => items.type === API_ENUM_TO_TYPE.GROUP_PICKER);
    // 地区，检查框，附件
    case API_ENUM_TO_TYPE.AREA_INPUT_24:
    case API_ENUM_TO_TYPE.AREA_INPUT_19:
    case API_ENUM_TO_TYPE.AREA_INPUT_23:
    case API_ENUM_TO_TYPE.SWITCH:
    case API_ENUM_TO_TYPE.ATTACHMENT:
      return [];

    // 等级
    case API_ENUM_TO_TYPE.SCORE:
      // 部门
      return _.filter(contorls, items => items.type === API_ENUM_TO_TYPE.SCORE);
    default:
      return contorls;
  }
}

export function getFilter({ control, formData = [] }) {
  if (
    !control ||
    _.isEmpty(control.advancedSetting) ||
    _.isEmpty(control.advancedSetting.filters) ||
    control.advancedSetting.filters === '[]'
  ) {
    return [];
  }
  let conditions;
  try {
    conditions = JSON.parse(control.advancedSetting.filters);
  } catch (err) {
    return [];
  }
  conditions = conditions.map(condition => {
    if (_.isEmpty(condition.dynamicSource)) {
      return Object.assign({}, condition, {
        values: formatValues(condition.dataType, condition.filterType, condition.values),
      });
    } else {
      condition.dateRange = 0;
      return fillConditionValue({ condition, formData, relateControl: control });
    }
  });
  const filteredConditions = conditions.filter(_.identity);
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

export function fillConditionValue({ condition, formData, relateControl }) {
  const { dataType, controlId } = condition;
  const dynamicSource = condition.dynamicSource[0];
  const systemControls = [
    {
      controlId: 'ownerid',
      controlName: _l('拥有者'),
      type: 26,
    },
    {
      controlId: 'caid',
      controlName: _l('创建人'),
      type: 26,
    },
    {
      controlId: 'ctime',
      controlName: _l('创建时间'),
      type: 16,
    },
    {
      controlId: 'utime',
      controlName: _l('最近修改时间'),
      type: 16,
    },
  ];
  const filterControl = _.find(
    relateControl.relationControls.concat(systemControls),
    item => item.controlId === controlId,
  );
  if (!dynamicSource || !filterControl) {
    return;
  }
  const { cid } = dynamicSource;
  if (!cid) {
    return;
  }
  let dynamicControl;
  dynamicControl = _.find(formData, c => c && c.controlId === cid);
  if (!dynamicControl) {
    return;
  }
  const { type } = dynamicControl;
  const value = getFormData({
    cid,
    data: formData,
  });
  if (!value) {
    return;
  }
  if (dataType === 2 || dataType === 32 || dataType === 3 || dataType === 7 || dataType === 5) {
    condition.values = [
      renderCellText({
        ...dynamicControl,
        value,
      }),
    ];
  } else if (
    dataType === 6 ||
    dataType === 8 ||
    dataType === 31
    // TODO 汇总数值类
  ) {
    condition.value = value;
  } else if (
    dataType === 15 ||
    dataType === 16
    // || dataType === 38 // 公式日期
    // TODO 汇总日期类
  ) {
    condition.value = value;
  } else if (dataType === 9 || dataType === 11 || dataType === 10) {
    if (type === 9 || type === 11) {
      // 单选
      const selectedOption = getSelectedOptions(dynamicControl.options, value)[0];
      if (!selectedOption) {
        condition.values = [];
      } else {
        const matchedOptions = filterControl.options.filter(option => option.value === selectedOption.value);
        if (matchedOptions.length) {
          condition.values = matchedOptions.map(option => option.key);
        } else {
          condition.values = ['999999']; // 瞎传的值 保证筛选不出结果
        }
      }
    } else if (type === 10) {
      // 多选
      const selectedOptions = getSelectedOptions(dynamicControl.options, value);
      if (!selectedOptions.length) {
        condition.values = [];
      } else {
        const matchedOptions = filterControl.options.filter(option =>
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
      condition.values = filterControl.options
        .filter(option => option.value.indexOf(value) > -1)
        .map(option => option.key);
    }
  } else if (dataType === 29 || dataType === 35) {
    try {
      condition.values = JSON.parse(value)
        .map(r => r.sid)
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
  } else if (
    _.includes(
      [API_ENUM_TO_TYPE.AREA_INPUT_24, API_ENUM_TO_TYPE.AREA_INPUT_19, API_ENUM_TO_TYPE.AREA_INPUT_23],
      dataType,
    )
  ) {
    condition.values = [value];
  } else if (dataType === 28 || dataType === 33) {
    condition.values = [value];
  }
  return condition;
}

export function formatDateValue({ type, value }) {
  if (type === FILTER_CONDITION_TYPE.DATE_GT) {
    // 晚于
    return moment(value).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  } else if (type === FILTER_CONDITION_TYPE.DATE_GT) {
    // 早于
    return moment(value).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  } else {
    return value;
  }
}
