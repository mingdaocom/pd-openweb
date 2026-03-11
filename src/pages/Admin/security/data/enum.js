export const ACCESS_CONDITION_ENUM = [
  { text: 'IP', value: 0 },
  { text: _l('请求头'), value: 1 },
  { text: _l('域名'), value: 2 },
  { text: _l('客户端'), value: 3 },
];

export const DEVICE_ENUM = [
  { label: _l('PC端'), value: 0 },
  { label: _l('Web移动端'), value: 1 },
  { label: _l('App'), value: 2 },
];

export const POLICY_ACTION_ENUM = [
  { text: _l('禁止访问应用'), value: 1 },
  { text: _l('允许访问应用'), value: 0 },
];

export const ADVANCED_SETTING_ENUM = [
  {
    text: _l('禁止公开访问'),
    value: 'isAllowPublicAccess',
    description: _l('对受限访问应用，同时失效其公开分享、表单及查询链接及工作流中获取链接的对外分享链接'),
  },
  {
    text: _l('禁止跨应用关联数据'),
    value: 'isAllowCrossApp',
    description: _l('对受限应用，同时拦截其跨应用的数据引用'),
  },
];

export const YES_NO_ENUM = [
  { text: _l('是'), value: 1 },
  { text: _l('不是'), value: 0 },
];

export const LIMIT_FILE_DOWNLOAD_USE_TYPE_ENUM = [
  { text: _l('是'), value: 0 },
  { text: _l('不是'), value: 1 },
];
