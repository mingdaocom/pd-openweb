import _ from 'lodash';

export const FILTER_TYPE = {
  PERSONAL: 1,
  PUBLIC: 2,
  TEMP: 3,
};

export const FILTER_RELATION_TYPE = {
  AND: 1,
  OR: 2,
};

export const FILTER_CONDITION_TYPE = {
  DEFAULT: 0,
  LIKE: 1, // 包含
  EQ: 2, // 是（等于）
  START: 3, // 开头是
  END: 4, // 结尾是
  N_START: 9, // 开头不是
  N_END: 10, // 结尾不是
  NCONTAIN: 5, // 不包含
  NE: 6, // 不是（不等于）
  ISNULL: 7, // 为空
  HASVALUE: 8, // 不为空
  BETWEEN: 11, // 在范围内
  NBETWEEN: 12, // 不在范围内
  GT: 13, // >
  GTE: 14, // >=
  LT: 15, // <
  LTE: 16, // <=
  DATEENUM: 17, // 日期是
  NDATEENUM: 18, // 日期不是
  SELF: 21, // 本人
  SELFANDSUB: 22, // 本人和下属
  SUB: 23, // 下属
  RCEQ: 24, // 关联表 是
  RCNE: 25, // 关联表 不是
  ARREQ: 26, // 数组等于
  ARRNE: 27, // 数组不等于
  ALLCONTAIN: 28, // 同时包含
  TEXT_ALLCONTAIN: 29, // 文本同时包含
  DATE_BETWEEN: 31, // DateBetween | 在范围内
  DATE_NBETWEEN: 32, // DateNBetween | 不在范围内
  DATE_GT: 33, // DateGt | >
  DATE_GTE: 34, // DateGte | >=
  DATE_LT: 35, // DateLt | <
  DATE_LTE: 36, // DateLte | <=
  DATE_EQ: 37, //  | 日期是(到秒)
  DATE_NE: 38, //  | 日期不是（到秒）
  NORMALUSER: 41, // NORMALUSER | 是常规用户
  PORTALUSER: 42, // PORTALUSER | 是外部门户用户
  EQ_FOR_SINGLE: 51, // 是（单选专用）
  NE_FOR_SINGLE: 52, // 不是（单选专用）
};

export const CONTROL_FILTER_WHITELIST = {
  TEXT: {
    value: 1,
    keys: [
      2, // 文本框
      3, // 电话号码
      4, // 座机
      5, // 邮件地址
      7, // 证件
      32, // 文本组合
      33, // 自动编号
    ],
  },
  NUMBER: {
    value: 2,
    keys: [
      6, // 数值
      8, // 金额
      25, // 大写金额
      31, // 公式
      53, // 函数公式
      37, // 汇总
      28, // 等级
    ],
  },
  BOOL: {
    value: 3,
    keys: [
      14, // 附件
      21, // 自由连接
      36, // 检查框
      40, // 定位
      41, // 富文本
      42, // 签名
    ],
  },
  DATE: {
    value: 4,
    keys: [
      15, // 日期
      16, // 日期时间
    ],
  },
  OPTIONS: {
    value: 5,
    keys: [
      11, // 选项
      10, // 多选
      9, // 单选 平铺
      27, // 部门
      48, // 角色权限
      11, // 单选下拉菜单
      19, // 地区选择
      23, // 地区选择
      24, // 地区选择
      27, // 部门选择
    ],
  },
  USERS: {
    value: 6,
    keys: [
      26, // 人员选择
    ],
  },
  RELATE_RECORD: {
    value: 7,
    keys: [
      29, // 关联表
    ],
  },
  CASCADER: {
    value: 8,
    keys: [
      35, // 级联选择
    ],
  },
  SUBLIST: {
    value: 9,
    keys: [
      34, // 子表
    ],
  },
  TIME: {
    value: 10,
    keys: [
      46, // 时间字段
    ],
  },
  RICH_TEXT: {
    value: 11,
    keys: [
      41, // 富文本
    ],
  },
};

export const API_ENUM_TO_TYPE = {
  TEXTAREA_INPUT_1: 1, // 文本
  TEXTAREA_INPUT_2: 2, // 文本
  PHONE_NUMBER_3: 3, // 电话
  PHONE_NUMBER_4: 4, // 电话
  EMAIL_INPUT: 5, // 邮箱
  NUMBER_INPUT: 6, // 数值
  CRED_INPUT: 7, // 证件
  MONEY_AMOUNT_8: 8, // 金额
  OPTIONS_9: 9, // 9单选
  OPTIONS_10: 10, // 多选10
  OPTIONS_11: 11, // 11单选
  ATTACHMENT: 14, // 附件
  DATE_INPUT_15: 15, // 日期
  DATE_INPUT_16: 16, // 日期
  DATE_TIME_RANGE_17: 17, // 时间段 日期17 日期时间18
  DATE_TIME_RANGE_18: 18, // 时间段 日期17 日期时间18
  AREA_INPUT_19: 19, // 地区 19'省23'省-市'24'省-市-县'
  AREA_INPUT_23: 23, // 地区 19'省23'省-市'24'省-市-县'
  AREA_INPUT_24: 24, // 地区 19'省23'省-市'24'省-市-县'
  RELATION: 21, // 自由连接
  SPLIT_LINE: 22, // 分割线
  MONEY_CN: 25, // 大写金额
  USER_PICKER: 26, // 成员
  GROUP_PICKER: 27, // 部门
  SCORE: 28, // 等级
  RELATESHEET: 29, // 关联表
  SHEETFIELD: 30, // 他表字段
  NEW_FORMULA_31: 31, // 公式  31数值计算 38日期计算
  NEW_FORMULA_38: 38, // 公式  31数值计算 38日期计算
  CONCATENATE: 32, // 文本组合
  AUTOID: 33, // 自动编号
  SWITCH: 36, // 检查框
  SUBTOTAL: 37, // 汇总
  LOCATION: 40, // 定位
  RICH_TEXT: 41, // _l('富文本'),
  SIGNATURE: 42, // _l('签名'),
  REMARK: 10010, // 备注
  CASCADER: 35, // 级联选择
  SUBLIST: 34, // 子表
  EMBED: 45, // 嵌入
  TIME: 46, // 时间
  BARCODE: 47, // 条码
  ORG_ROLE: 48, // 组织角色
  API_SEARCH: 50, // API查询
  RELATESEARCH: 51, // 查询记录
  SECTION: 52, // 标签页
};

export const DATE_RANGE_TYPE = {
  MINUTE: 1,
  HOUR: 2,
  DAY: 3,
  MONTH: 4,
  YEAR: 5,
  SECOND: 6,
  QUARTER: 11,
};

export function getControlSelectType(control) {
  const isOptionsSingle = control && (control.type === 9 || control.type === 11);
  const isOptionsMultiple = control && control.type === 10;
  // 人员
  const isUserSingleSingle =
    control && ((control.type === 26 && control.enumDefault === 0) || control.controlId === 'daid');
  const isUserMultiple = control && control.type === 26 && control.enumDefault === 1;
  // 部门
  const isDepartment = control && control.type === 27;
  const isDepartmentSingle = isDepartment && control.enumDefault === 0;
  const isDepartmentMultiple = isDepartment && control.enumDefault === 1;
  // 组织角色
  const isOrgRoleSingle = control && control.type === 48 && control.enumDefault === 0;
  const isOrgRoleMultiple = control && control.type === 48 && control.enumDefault === 1;
  // 关联
  const isRelateRecordSingle = control && control.type === 29 && control.enumDefault === 1;
  const isRelateRecordMultiple = control && control.type === 29 && control.enumDefault === 2;
  const isMultiple =
    isOptionsMultiple || isUserMultiple || isDepartmentMultiple || isOrgRoleMultiple || isRelateRecordMultiple;
  const isSingle =
    isOptionsSingle || isUserSingleSingle || isDepartmentSingle || isOrgRoleSingle || isRelateRecordSingle;
  return { isMultiple, isSingle };
}

export function getFilterTypeLabel(typeKey, type, control) {
  const isNumber = typeKey === 'NUMBER';
  const isDate = typeKey === 'DATE';
  const isCascader = control && control.type === 35;
  const isDepartment = control && control.type === 27;
  const isLevel = control && control.type === 28;
  const isArea = control && _.includes([19, 23, 24], control.type);
  const isRelateRecordMultiple = control && control.type === 29 && control.enumDefault === 2;
  const { isSingle, isMultiple } = getControlSelectType(control);
  switch (type) {
    case FILTER_CONDITION_TYPE.LIKE:
      if (isDepartment || isArea) return _l('下级包含%25024');
      return _l('包含%25003');
    case FILTER_CONDITION_TYPE.EQ_FOR_SINGLE:
      return _l('是');
    case FILTER_CONDITION_TYPE.EQ:
      if (isNumber && !isLevel) return '=';
      if (isSingle || isArea || isLevel) {
        return _l('是其中一个%25017');
      }
      if (isMultiple) {
        return _l('包含其中一个%25021');
      }
      return _l('等于%25001');
    case FILTER_CONDITION_TYPE.START:
      return _l('开头是%25005');
    case FILTER_CONDITION_TYPE.END:
      return _l('结尾是%25007');
    case FILTER_CONDITION_TYPE.N_START:
      return _l('开头不是%25006');
    case FILTER_CONDITION_TYPE.N_END:
      return _l('结尾不是%25008');
    case FILTER_CONDITION_TYPE.NCONTAIN:
      if (isDepartment || isArea) return _l('下级不包含%25025');
      return _l('不包含%25004');
    case FILTER_CONDITION_TYPE.NE:
      if (isNumber && !isLevel) return '≠';
      if (isSingle || isArea || isLevel) {
        return _l('不是任何一个%25018');
      }
      if (isMultiple) {
        return _l('不包含任何一个%25022');
      }
      return _l('不等于%25002');
    case FILTER_CONDITION_TYPE.ISNULL:
      return _l('为空%25009');
    case FILTER_CONDITION_TYPE.HASVALUE:
      return _l('不为空%25010');
    case FILTER_CONDITION_TYPE.BETWEEN:
      if (isCascader || isDepartment || isArea) return _l('属于%25019');
      return _l('在范围内%25011');
    case FILTER_CONDITION_TYPE.NBETWEEN:
      if (isCascader || isDepartment || isArea) return _l('不属于%25020');
      return _l('不在范围内%25012');
    case FILTER_CONDITION_TYPE.GT:
      if (isDate) return _l('晚于%25014');
      return '>';
    case FILTER_CONDITION_TYPE.GTE:
      return '≥';
    case FILTER_CONDITION_TYPE.LT:
      if (isDate) return _l('早于%25013');
      return '<';
    case FILTER_CONDITION_TYPE.LTE:
      return '≤';
    case FILTER_CONDITION_TYPE.DATE_LTE:
      return _l('早于等于%25015');
    case FILTER_CONDITION_TYPE.DATE_GTE:
      return _l('晚于等于%25016');
    case FILTER_CONDITION_TYPE.DATEENUM:
    case FILTER_CONDITION_TYPE.DATE_EQ:
      return _l('等于%25001'); // TIME日期时间
    case FILTER_CONDITION_TYPE.NDATEENUM:
    case FILTER_CONDITION_TYPE.DATE_NE:
      return _l('不等于%25002'); // TIME日期时间
    case FILTER_CONDITION_TYPE.SELF:
      return _l('本人');
    case FILTER_CONDITION_TYPE.SELFANDSUB:
      return _l('本人和下属');
    case FILTER_CONDITION_TYPE.SUB:
      return _l('下属');
    case FILTER_CONDITION_TYPE.RCEQ:
      if (isRelateRecordMultiple) return _l('包含其中一个%25021');
      return _l('是其中一个%25017');
    case FILTER_CONDITION_TYPE.RCNE:
      if (isRelateRecordMultiple) return _l('不包含任何一个%25022');
      return _l('不是任何一个%25018');
    case FILTER_CONDITION_TYPE.DATE_BETWEEN:
      return _l('在范围内%25011');
    case FILTER_CONDITION_TYPE.DATE_NBETWEEN:
      return _l('不在范围内%25012');
    case FILTER_CONDITION_TYPE.DATE_GT:
      return _l('晚于%25014');
    case FILTER_CONDITION_TYPE.DATE_LT:
      return _l('早于%25013');
    case FILTER_CONDITION_TYPE.NORMALUSER:
      return _l('是常规用户');
    case FILTER_CONDITION_TYPE.PORTALUSER:
      return _l('是外部门户用户');
    case FILTER_CONDITION_TYPE.ARREQ: // 数组等于
      return _l('等于%25001');
    case FILTER_CONDITION_TYPE.ARRNE: // 数组不等于
      return _l('不等于%25002');
    case FILTER_CONDITION_TYPE.ALLCONTAIN: // 数组同时包含
      return _l('同时包含%25023');
    case FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN: // 文本同时包含
      return _l('同时包含');
    default:
      return '';
  }
}

export const DATE_OPTIONS = [
  [
    { text: _l('指定日期'), value: 18 },
    { text: _l('指定日期时间（时）'), value: 18.2, dateRangeType: DATE_RANGE_TYPE.HOUR },
    { text: _l('指定日期时间（分）'), value: 18.1, dateRangeType: DATE_RANGE_TYPE.MINUTE },
  ],
  [
    { text: _l('今天'), value: 1 },
    { text: _l('昨天'), value: 2 },
    { text: _l('明天'), value: 3 },
  ],
  [
    { text: _l('本周'), value: 4 },
    { text: _l('上周'), value: 5 },
    { text: _l('下周'), value: 6 },
  ],
  [
    { text: _l('本月'), value: 7 },
    { text: _l('上个月'), value: 8 },
    { text: _l('下个月'), value: 9 },
  ],
  [
    { text: _l('本季度'), value: 12 },
    { text: _l('上季度'), value: 13 },
    { text: _l('下季度'), value: 14 },
  ],
  [
    { text: _l('今年'), value: 15 },
    { text: _l('去年'), value: 16 },
    { text: _l('明年'), value: 17 },
  ],
  [
    { text: _l('过去...(旧)'), value: 10 },
    { text: _l('将来...(旧)'), value: 11 },
    { text: _l('过去...'), value: 101 },
    { text: _l('将来...'), value: 102 },
    { text: _l('过去7天'), value: 21 },
    { text: _l('过去14天'), value: 22 },
    { text: _l('过去30天'), value: 23 },
    { text: _l('将来7天'), value: 31 },
    { text: _l('将来14天'), value: 32 },
    { text: _l('将来30天'), value: 33 },
  ],
];

export const valueTypeOptions = [
  { value: 1, text: _l('固定值') },
  { value: 2, text: _l('参数值') },
];

export const DEFAULT_COLUMNS = [
  {
    controlId: 'rowid',
    controlName: _l('记录ID'),
    type: 2,
  },
  {
    controlId: 'currenttime',
    controlName: _l('此刻'),
    type: 15,
  },
  {
    controlId: 'currenttime',
    controlName: _l('此刻'),
    type: 16,
  },
  {
    controlId: 'user-self',
    controlName: _l('当前用户'),
    type: 26,
  },
  {
    controlId: 'currenttime',
    controlName: _l('此刻'),
    type: 46,
  },
];

export const DATE_RANGE_TYPE_OPTIONS = [
  { text: _l('年'), value: DATE_RANGE_TYPE.YEAR },
  { text: _l('季度'), value: DATE_RANGE_TYPE.QUARTER },
  { text: _l('月'), value: DATE_RANGE_TYPE.MONTH },
  { text: _l('天'), value: DATE_RANGE_TYPE.DAY },
  { text: _l('小时'), value: DATE_RANGE_TYPE.HOUR },
  { text: _l('分'), value: DATE_RANGE_TYPE.MINUTE },
];

export const CONDITION_OPTIONS = [
  { value: 1, label: _l('固定值') },
  { value: 2, label: _l('动态值') },
];
