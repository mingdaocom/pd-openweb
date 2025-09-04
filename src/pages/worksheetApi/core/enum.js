import { MENU_LIST as MENU_LIST_API_V2, SIDEBAR_LIST as SIDEBAR_LIST_API_V2 } from './apiV2Config';
import { MENU_LIST as MENU_LIST_APP, SIDEBAR_LIST as SIDEBAR_LIST_APP } from './applicationConfig';

export const TAB_TYPE = {
  APPLICATION: 1,
  API_V2: 2,
  API_V3: 3,
};

export const SIDEBAR_LIST_MAP = {
  [TAB_TYPE.APPLICATION]: SIDEBAR_LIST_APP,
  [TAB_TYPE.API_V2]: SIDEBAR_LIST_API_V2,
};

export const MENU_LIST_MAP = {
  [TAB_TYPE.APPLICATION]: MENU_LIST_APP,
  [TAB_TYPE.API_V2]: MENU_LIST_API_V2,
};

export const FILTER_LOGIC_TYPE = {
  1: 'AND',
  2: 'OR',
};

// 通用筛选条件类型
export const FILTER_CONDITION_TYPE = {
  // 单值比较
  2: 'eq', // 等于
  6: 'ne', // 不等于
  13: 'gt', // >
  14: 'ge', // >=
  15: 'lt', // <
  16: 'le', // <=
  37: 'eq', // 日期等于（到秒）
  38: 'ne', // 日期不等于（到秒）
  33: 'gt', // 日期 >
  34: 'ge', // 日期 >=
  35: 'lt', // 日期 <
  36: 'le', // 日期 <=
  52: 'ne',
  26: 'eq', // 数组等于
  27: 'ne', // 数组不等于

  // 模糊匹配
  1: 'contains', // 包含
  5: 'notcontains', // 不包含
  3: 'startswith', // 开头是
  9: 'notstartswith', // 开头不是
  4: 'endswith', // 结尾是
  10: 'notendswith', // 结尾不是
  28: 'concurrent', // 同时包含
  29: 'concurrent', // 同时包含

  // 空值判断
  7: 'isempty', // 为空
  8: 'isnotempty', // 不为空

  // 范围判断
  11: 'between', // 在范围内
  12: 'notbetween', // 不在范围内
  31: 'between', // 日期范围
  32: 'notbetween', // 日期不在范围
};

// 多值等于（数组）
export const FILTER_CONDITION_MULTI_TYPE = {
  2: 'in', // 是其中一个
  6: 'notin', // 不是任意一个
  24: 'in', // 关联记录 是其中一个
  25: 'notin', // 关联记录 不是其中一个
  51: 'in', // 是（单选专用）
};

// 归属判断（关联数据）
export const FILTER_BELONGS_TYPE = {
  11: 'belongsto', // 属于
  12: 'notbelongsto', // 不属于
};
