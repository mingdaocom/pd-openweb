import _ from 'lodash';
/* 可以作为文本拼接的控件 */
export const CAN_AS_TEXT_DYNAMIC_FIELD = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 25, 26, 27, 28, 31, 32, 33, 46, 50,
];

/* 可以作为嵌入的控件 */
export const CAN_AS_EMBED_DYNAMIC_FIELD = [2, 3, 4, 5, 6, 7, 8, 15, 16, 28];

// 可以作为邮箱默认值的控件
export const CAN_AS_EMAIL_DYNAMIC_FIELD = [5];
// 可以作为部门默认值的控件
export const CAN_AS_DEPARTMENT_DYNAMIC_FIELD = [26, 27];

// 可以作为数值动态值的控件
export const CAN_AS_NUMBER_DYNAMIC_FIELD = [6, 8, 28];

// 可以作为日期|时间动态值的控件
export const CAN_AS_DATE_TIME_DYNAMIC_FIELD = [15, 16];

// 可以作为时间动态值的控件
export const CAN_AS_TIME_DYNAMIC_FIELD = [15, 16, 46];

// 可以作为地区动态值的控件
export const CAN_AS_AREA_DYNAMIC_FIELD = [19, 23, 24];

// 可以作为成员动态值的控件
export const CAN_AS_USER_DYNAMIC_FIELD = [26, 27, 48];

// 可以作为等级动态值的控件
export const CAN_AS_SCORE_DYNAMIC_FIELD = [6, 8, 28];

// 可以作为检查框动态值的控件
export const CAN_AS_SWITCH_DYNAMIC_FIELD = [36];

// 可以作为组织角色的控件
export const CAN_AS_ORG_ROLE_DYNAMIC_FIELD = [48, 26];

// 有其他动态值的控件
export const CAN_AS_OTHER_DYNAMIC_FIELD = [15, 16, 26, 27, 46, 48];

// 有函数动态值的控件
export const CAN_AS_FX_DYNAMIC_FIELD = [2, 3, 4, 5, 6, 8, 15, 16, 36];

// 没有动态字段值的控件
export const CAN_NOT_AS_FIELD_DYNAMIC_FIELD = [34];

//日期
export const CAN_SHOW_CLEAR_FIELD = [15, 16, 46];

// 普通数组
export const CAN_AS_ARRAY_DYNAMIC_FIELD = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 28, 46];

// 对象数组
export const CAN_AS_ARRAY_OBJECT_DYNAMIC_FIELD = [29, 34];

export const SYSTEM_TIME = [
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
];

export const SYSTEM_USER = [{ controlId: 'caid', controlName: _l('创建人'), type: 26 }];

export const SYSTEM_FIELD_TO_TEXT = {
  ctime: _l('创建时间'),
  caid: _l('创建人'),
  utime: _l('最近修改时间'),
  ownerid: _l('拥有者'),
  rowid: _l('记录ID'),
  uaid: _l('最近修改人'),
  wfname: _l('流程名称'),
  wfcuaids: _l('节点负责人'),
  wfcaid: _l('发起人'),
  wfctime: _l('发起时间'),
  wfrtime: _l('节点开始时间'),
  wfftime: _l('剩余时间'),
  wfstatus: _l('状态'),
};

// 控件规则匹配规则 未保存的控件正则 匹配uuid 已保存的控件正则 形如 $5e047c2ab2bfdd0001e9b8f9$
export const FIELD_REG_EXP =
  /\$((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid)?)(~((\w{8}(-\w{4}){3}-\w{12})|(\w{24}|caid|ownerid|utime|ctime|userId|phone|email|projectId|appId|groupId|worksheetId|viewId|recordId|ua|timestamp|search-keyword|ocr-file|ocr-file-url|wfname|wfcuaids|wfcaid|wfctime|wfrtime|wfftime|wfstatus|rowid|uaid)?))?\$/g;

export const TIME_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('此刻'),
    key: 'date',
    icon: 'icon-event',
  },
];
export const DATE_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('此刻'),
    key: 'date',
    icon: 'icon-event',
  },
];
export const CUR_TIME_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('此刻'),
    key: 'time',
    icon: 'icon-access_time',
  },
];

export const CUR_SEARCH_TYPES = [
  {
    icon: 'icon-search',
    key: 'keyword',
    id: 'search-keyword',
    text: _l('搜索内容'),
  },
];

export const CUR_OCR_TYPES = [
  {
    key: 'ocr',
    id: 'ocr-file',
    text: _l('识别文件'),
  },
];

export const CUR_OCR_URL_TYPES = [
  {
    key: 'ocr',
    id: 'ocr-file-url',
    text: _l('识别文件(url)'),
  },
];

export const CHECKBOX_TYPES = [
  { id: '0', text: _l('不选中') },
  { id: '1', text: _l('选中') },
];

export const CONTROL_TYPE = {
  1: 'text',
  2: 'text',
  3: 'phone',
  4: 'phone',
  5: 'email',
  6: 'number',
  8: 'number',
  9: 'option',
  10: 'option',
  11: 'option',
  14: 'attachment',
  15: 'date',
  16: 'date',
  19: 'area',
  23: 'area',
  24: 'area',
  26: 'user',
  27: 'department',
  28: 'score',
  29: 'relateSheet',
  34: 'subList',
  36: 'switch',
  46: 'time',
  48: 'role',

  // 来自api查询的特殊类型
  10000007: 'array',
  10000008: 'array_object',
};

export const VALIDATE_REG = {
  number: /^-?\d*(\.\d*)?/,
};
export const DEFAULT_VALUE_VALIDATOR = {
  number: value => _.head(VALIDATE_REG.number.exec(value)),
};

// 动态默认值选择类型
export const OTHER_FIELD_LIST = [
  { icon: 'icon-workflow_other', text: _l('其他字段值'), key: 1 },
  { icon: 'icon-lookup', text: _l('查询工作表'), key: 2 },
  { icon: 'icon-formula', text: _l('函数计算'), key: 3 },
];

export const OTHER_FIELD_TYPE = {
  FIELD: 1,
  SEARCH: 2,
  FX: 3,
  DEPT: 'dept',
  USER: 'user',
  DATE: 'date',
  TIME: 'time',
  ROLE: 'role',
  KEYWORD: 'keyword',
  OCR: 'ocr',
};

export const CURRENT_TYPES = {
  15: DATE_TYPES,
  16: TIME_TYPES,
  26: [{ icon: 'icon-account_circle', key: 'user', id: 'user-self', text: _l('当前用户') }],
  27: [{ icon: 'icon-department', key: 'dept', id: 'user-departments', text: _l('当前用户所在部门') }],
  46: CUR_TIME_TYPES,
  48: [{ icon: 'icon-group', key: 'role', id: 'user-role', text: _l('当前用户的组织角色') }],
  2: CUR_SEARCH_TYPES,
  6: CUR_SEARCH_TYPES,
};

export const DEFAULT_TYPES = {
  0: 'dynamiccustom',
  1: 'defaultfunc',
  2: 'dynamicsrc',
};

export const USER_LIST = [
  {
    text: _l('用户ID'),
    id: 'userId',
  },
  {
    text: _l('手机号'),
    id: 'phone',
  },

  {
    text: _l('邮箱'),
    id: 'email',
  },
];

export const SYSTEM_LIST = [
  {
    text: _l('组织门牌号'),
    id: 'projectId',
  },
  {
    text: _l('应用ID'),
    id: 'appId',
  },
  {
    text: _l('分组ID'),
    id: 'groupId',
  },
  {
    text: _l('工作表ID'),
    id: 'worksheetId',
  },
  {
    text: _l('视图ID'),
    id: 'viewId',
  },
  {
    text: _l('记录ID'),
    id: 'recordId',
  },
  {
    text: _l('UserAgent'),
    id: 'ua',
  },
  {
    text: _l('时间戳'),
    id: 'timestamp',
  },
];

export const EMEBD_FIELDS = [
  {
    name: _l('当前用户信息'),
    list: USER_LIST,
  },
  {
    name: _l('系统信息'),
    list: SYSTEM_LIST,
  },
];

export const DYNAMIC_FROM_MODE = {
  CREATE_CUSTOM: 1, // 自定义
  SEARCH_PARAMS: 2, // 查询输入参数
  OCR_PARAMS: 3, // OCR集成参数
};
