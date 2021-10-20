/* 可以作为文本拼接的控件 */
export const CAN_AS_TEXT_DYNAMIC_FIELD = [2, 3, 4, 5, 6, 7, 8, 15, 16, 25, 28, 31, 32];

// 可以作为邮箱默认值的控件
export const CAN_AS_EMAIL_DYNAMIC_FIELD = [5];
// 可以作为部门默认值的控件
export const CAN_AS_DEPARTMENT_DYNAMIC_FIELD = [26, 27];

// 可以作为数值动态值的控件
export const CAN_AS_NUMBER_DYNAMIC_FIELD = [6, 8];

// 可以作为时间动态值的控件
export const CAN_AS_TIME_DYNAMIC_FIELD = [15, 16];

// 可以作为成员动态值的控件
export const CAN_AS_USER_DYNAMIC_FIELD = [26];

export const SYSTEM_TIME = [
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
];

export const SYSTEM_USER = [{ controlId: 'caid', controlName: _l('创建者'), type: 26 }];

export const SYSTEM_FIELD_TO_TEXT = {
  ctime: _l('创建时间'),
  caid: _l('创建者'),
  utime: _l('最近修改时间'),
  ownerid: _l('拥有者'),
};

// 已保存的控件正则 形如 $5e047c2ab2bfdd0001e9b8f9$
export const FIELD_REG_EXP = /\$((\w{24}|caid|owner|utime|ctime)(~\w{24}|caid|owner|utime|ctime)?)\$/g;

// 未保存的控件正则 匹配uuid
export const UUID_REGEXP = /\$\w{8}(-\w{4}){3}-\w{12}\$/g;

export const TIME_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('当前时间'),
  },
  { value: '4', id: 'assignTime', text: _l('指定时间') },
];
export const DATE_TYPES = [
  {
    value: '2',
    id: 'current',
    text: _l('当前日期'),
  },
  { value: '4', id: 'assignTime', text: _l('指定日期') },
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
  15: 'date',
  16: 'date',
  26: 'user',
  27: 'department',
  28: 'score',
  29: 'relateSheet',
};

export const VALIDATE_REG = {
  number: /^-?\d*(\.\d*)?/,
};
export const DEFAULT_VALUE_VALIDATOR = {
  number: value => _.head(VALIDATE_REG.number.exec(value)),
};
