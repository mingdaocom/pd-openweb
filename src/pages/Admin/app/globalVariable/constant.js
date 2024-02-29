export const ALLOW_UPDATE_RADIOS = [
  { text: _l('允许'), value: 1 },
  { text: _l('不允许'), value: 0 },
];

export const AUTH_SCOPE_RADIOS = [
  { text: _l('组织下所有应用'), value: 1 },
  { text: _l('指定应用'), value: 2 },
];

export const CONTROL_NAME = {
  2: _l('文本'),
  6: _l('数值'),
};

export const REFRESH_TYPE = {
  ADD: 'add',
  UPDATE: 'update',
  DELETE: 'delete',
  WHOLE_LIST: 'whole_list',
};
