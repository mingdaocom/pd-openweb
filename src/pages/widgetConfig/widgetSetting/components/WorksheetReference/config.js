export const SUB_MODULE_TYPES = {
  WIDGET: 101,
  VIEW: 102,
  RULES: 103,
  WORKFLOW: 201,
};

export const MODULE_TYPES = {
  WIDGET: 1,
  WORKFLOW: 2,
};

export const SIDEBAR_LIST_BY_WORKSHEET = [
  { text: _l('工作表'), value: SUB_MODULE_TYPES.WIDGET },
  { text: _l('工作流'), value: SUB_MODULE_TYPES.WORKFLOW },
];

export const SIDEBAR_LIST = [
  { text: _l('字段'), value: SUB_MODULE_TYPES.WIDGET },
  { text: _l('工作流'), value: SUB_MODULE_TYPES.WORKFLOW },
  { text: _l('业务规则'), value: SUB_MODULE_TYPES.RULES },
  { text: _l('视图'), value: SUB_MODULE_TYPES.VIEW },
];

export const SUBNAV_LIST = [
  { text: _l('本应用'), value: 'sub' },
  { text: _l('其他应用'), value: 'total' },
  { text: _l('空白子表'), value: 'subList' },
];

export const REFERENCE_TYPE = {
  10101: _l('筛选'),
  10102: _l('默认值'),
  10103: _l('其他'),
  10201: _l('筛选'),
  10202: _l('专属配置'),
  10203: _l('筛选列表'),
  10301: _l('其他'),
};
